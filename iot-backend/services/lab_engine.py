import docker
import tempfile
import os
import shutil
import base64
import re
import glob
import time
from typing import Union, List, Optional
from requests.exceptions import ReadTimeout

# Initialize Docker client
try:
    client = docker.from_env()
except Exception as e:
    print(f"Warning: Docker not available ({e})")
    client = None

def verify_numeric_output(logs: str, expected_values: list, tolerance=0.01) -> bool:
    if not expected_values:
        return True
        
    # Extract all numbers from the logs (handles ints, floats, scientific notation)
    pattern = r'[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?'
    actual_values = [float(m) for m in re.findall(pattern, logs)]
    
    n = len(expected_values)
    if len(actual_values) < n:
        return False
        
    # Slide a window of size N across the extracted numbers
    for i in range(len(actual_values) - n + 1):
        match = True
        for j in range(n):
            if abs(actual_values[i+j] - expected_values[j]) > tolerance:
                match = False
                break
        if match:
            return True
            
    return False


def parse_octave_errors(stderr_text: str) -> list:
    """
    Parse Octave stderr output into structured error objects safely.
    Each error has { "line": int|None, "message": str }.
    """
    errors = []
    if not stderr_text or not stderr_text.strip():
        return errors

    lines = stderr_text.strip().split('\n')
    current_error = None
    
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
            
        # Ignore environment warnings
        if "X11 DISPLAY environment variable not set" in line or "disabling GUI features" in line:
            continue
            
        # Ignore internal wrapper stack traces
        if "called from wrapper" in line:
            continue
            
        if line.lower().startswith("error:") or line.lower().startswith("parse error"):
            line_num = None
            line_match = re.search(r'(?:at|near) line (\d+)', line, re.IGNORECASE)
            if line_match:
                line_num = int(line_match.group(1))
                
            msg = line
            msg = re.sub(r'^(?i:error|parse error):?\s*', '', msg)
            
            # If msg is just "near line...", it's a multi-line parse error. Wait for real message.
            if msg.startswith("near line"):
                msg = "Syntax error"
            else:
                msg = re.sub(r'(?:at|near) line \d+.*$', '', msg).strip()
                
            # Filter out generic stack trace headers
            if msg.lower() == "called from":
                continue
                
            if not msg:
                msg = "Syntax or runtime error."
                
            current_error = {"line": line_num, "message": msg}
            errors.append(current_error)
            
        # Refine parse errors if Octave prints "syntax error" explicitly
        elif current_error and line.lower() == "syntax error":
            current_error["message"] = "syntax error"
            
        # Update line number if the stack trace points to student_code
        elif current_error and "student_code at line" in line:
            line_match = re.search(r'at line (\d+)', line)
            if line_match and current_error["line"] is None:
                current_error["line"] = int(line_match.group(1))

    return errors


def _build_wrapper_script(student_script_path: str) -> str:
    """
    Build a wrapper script that:
    1. Runs the student's original code UNCHANGED
    2. After execution, captures any open figures as PNGs
    
    The student's code is never modified — it is called via `source`.
    """
    return f"""
% --- DigiLab Plot Capture Wrapper ---
% Run the student's original script unchanged
source('{student_script_path}');

% --- After student code completes, capture all open figures ---
fig_handles = get(0, 'children');
if ~isempty(fig_handles)
  for i = 1:length(fig_handles)
    fig = fig_handles(i);
    set(fig, 'visible', 'off');
    
    % Force a taller aspect ratio to prevent subplot title/label overlapping
    set(fig, 'PaperPositionMode', 'manual');
    set(fig, 'PaperUnits', 'inches');
    set(fig, 'PaperPosition', [0 0 8 10]);
    
    fname = sprintf('/workspace/output_plot_%d.png', i);
    print(fig, fname, '-dpng', '-r150');
  end
end
"""


def execute_octave_script(script_text: str, expected_output: Union[str, List[float], None] = None, stdin_text: str = None) -> dict:
    """
    Executes an Octave script securely in a Docker container.
    Returns a structured dict with:
      success, status, stdout, stderr, figures[], errors[], execution_time, exit_code, logs, plot
    """
    if not client:
        return {
            "success": False,
            "status": "failed",
            "stdout": "",
            "stderr": "Docker is not running on the server.",
            "figures": [],
            "errors": [{"line": None, "message": "Docker is not running on the server."}],
            "execution_time": 0,
            "exit_code": 1,
            "logs": "Docker is not running on the server.",
            "plot": None
        }

    # Create a secure, isolated temporary directory for this specific submission
    temp_dir = tempfile.mkdtemp()
    
    # Write the student's original script (unchanged)
    student_script_path = os.path.join(temp_dir, "student_code.m")
    with open(student_script_path, "w") as f:
        f.write(script_text)
    
    # Write the wrapper script that runs student code + captures plots
    wrapper_script = _build_wrapper_script("/workspace/student_code.m")
    wrapper_path = os.path.join(temp_dir, "wrapper.m")
    with open(wrapper_path, "w") as f:
        f.write(wrapper_script)

    # Write the stdin text if provided
    input_redirect = ""
    if stdin_text is not None:
        stdin_path = os.path.join(temp_dir, "input.txt")
        with open(stdin_path, "w") as f:
            f.write(stdin_text)
        input_redirect = "< /workspace/input.txt "

    container = None
    start_time = time.time()
    
    try:
        # Run the container — separate stdout and stderr
        # The wrapper script runs the student code via source() and captures plots afterward
        container = client.containers.run(
            image="octave-lab",
            command=[
                "sh", "-c",
                f"octave --no-gui --eval wrapper {input_redirect}> /workspace/stdout.log 2> /workspace/stderr.log; echo $? > /workspace/exitcode.log"
            ],
            volumes={temp_dir: {'bind': '/workspace', 'mode': 'rw'}},
            working_dir="/workspace",
            network_mode="none",     # Security: No internet access
            mem_limit="128m",        # Security: Prevent out-of-memory crashes
            pids_limit=50,           # Security: Prevent fork bombs
            detach=True,             # Run in background to manage timeout
        )
        
        # Wait for the container to finish (10 second timeout for complex scripts)
        result = container.wait(timeout=10)
        execution_time = round(time.time() - start_time, 3)
        
        # Read stdout
        stdout_path = os.path.join(temp_dir, "stdout.log")
        stdout = ""
        if os.path.exists(stdout_path):
            with open(stdout_path, "r") as f:
                stdout = f.read()
        
        # Read stderr
        stderr_path = os.path.join(temp_dir, "stderr.log")
        stderr = ""
        if os.path.exists(stderr_path):
            with open(stderr_path, "r") as f:
                stderr = f.read()
        
        # Read exit code from the script's own exit code (not the shell wrapper)
        exitcode_path = os.path.join(temp_dir, "exitcode.log")
        exit_code = 1
        if os.path.exists(exitcode_path):
            with open(exitcode_path, "r") as f:
                try:
                    exit_code = int(f.read().strip())
                except ValueError:
                    exit_code = result.get('StatusCode', 1)
        
        # Parse errors from stderr
        errors = parse_octave_errors(stderr)
        
        # Collect all generated figure PNGs (multi-figure support)
        figures = []
        figure_files = sorted(glob.glob(os.path.join(temp_dir, "output_plot_*.png")))
        
        # Also check for legacy single output_plot.png
        legacy_plot = os.path.join(temp_dir, "output_plot.png")
        if os.path.exists(legacy_plot) and legacy_plot not in figure_files:
            figure_files.insert(0, legacy_plot)
        
        for fig_path in figure_files:
            if os.path.getsize(fig_path) > 0:  # Skip empty/invalid images
                with open(fig_path, "rb") as img_file:
                    b64 = base64.b64encode(img_file.read()).decode('utf-8')
                    figures.append(f"data:image/png;base64,{b64}")
        
        # Determine execution success (separate from verification)
        execution_success = (exit_code == 0 and not errors)
        
        # Combined logs for backward compatibility
        combined_logs = stdout
        if stderr:
            combined_logs += f"\n{stderr}" if combined_logs else stderr
        
        # Determine verification status (existing grading logic)
        if not execution_success:
            status = "failed"
            combined_logs = f"Execution Error:\n{combined_logs}"
        elif expected_output is not None:
            if isinstance(expected_output, list):
                if not verify_numeric_output(stdout, expected_output):
                    status = "failed"
                    combined_logs = f"Verification Failed. Numeric values did not match expected sequence.\nOutput:\n{stdout}"
                else:
                    status = "verified"
            else:
                if expected_output not in stdout:
                    status = "failed"
                    combined_logs = f"Verification Failed. Expected string not found.\nOutput:\n{stdout}"
                else:
                    status = "verified"
        else:
            # No auto-grader for this experiment
            status = "pending" if execution_success else "failed"
        
        # For backward compat: plot_b64 = first figure without data URI prefix
        plot_b64 = None
        if figures:
            # Strip the data:image/png;base64, prefix for legacy consumers
            plot_b64 = figures[0].replace("data:image/png;base64,", "")
        
        return {
            "success": execution_success,
            "status": status,
            "stdout": stdout,
            "stderr": stderr,
            "figures": figures,
            "errors": errors,
            "execution_time": execution_time,
            "exit_code": exit_code,
            "logs": combined_logs,
            "plot": plot_b64
        }
        
    except ReadTimeout:
        execution_time = round(time.time() - start_time, 3)
        # Security: Container took too long (infinite loop)
        if container:
            try:
                container.kill()
            except:
                pass
        return {
            "success": False,
            "status": "timeout",
            "stdout": "",
            "stderr": "Execution timed out. Your script may contain an infinite loop or excessive computation.",
            "figures": [],
            "errors": [{"line": None, "message": "Execution timed out. Check for infinite loops."}],
            "execution_time": execution_time,
            "exit_code": 124,
            "logs": "Execution timed out (infinite loop?).",
            "plot": None
        }
    except Exception as e:
        execution_time = round(time.time() - start_time, 3)
        return {
            "success": False,
            "status": "failed",
            "stdout": "",
            "stderr": f"System error: {str(e)}",
            "figures": [],
            "errors": [{"line": None, "message": f"System error: {str(e)}"}],
            "execution_time": execution_time,
            "exit_code": 1,
            "logs": f"System error: {str(e)}",
            "plot": None
        }
    finally:
        # Cleanup container
        if container:
            try:
                container.remove(force=True)
            except:
                pass
        # Cleanup temporary directory from host
        shutil.rmtree(temp_dir, ignore_errors=True)
