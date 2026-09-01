import tempfile
import os
import shutil
import base64
import re
import glob
import time
from typing import Union, List, Optional


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
    Executes an Octave script securely via a remote microservice.
    Returns a structured dict with:
      success, status, stdout, stderr, figures[], errors[], execution_time, exit_code, logs, plot
    """
    octave_service_url = os.getenv("OCTAVE_SERVICE_URL", "http://localhost:8000/execute")
    octave_service_secret = os.getenv("OCTAVE_SERVICE_SECRET", "dev-secret-key")

    try:
        import requests
        start_time = time.time()
        
        headers = {"Authorization": f"Bearer {octave_service_secret}"}
        payload = {
            "script_text": script_text,
            "stdin_text": stdin_text
        }
        
        response = requests.post(octave_service_url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        
        result = response.json()
        
        execution_success = result.get("success", False)
        stdout = result.get("stdout", "")
        stderr = result.get("stderr", "")
        exit_code = result.get("exit_code", 1)
        errors = result.get("errors", [])
        figures = result.get("figures", [])
        execution_time = result.get("execution_time", round(time.time() - start_time, 3))
        
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
        
    except requests.exceptions.Timeout:
        execution_time = round(time.time() - start_time, 3)
        return {
            "success": False,
            "status": "timeout",
            "stdout": "",
            "stderr": "Execution timed out. Service took too long to respond.",
            "figures": [],
            "errors": [{"line": None, "message": "Execution timed out. Check for infinite loops."}],
            "execution_time": execution_time,
            "exit_code": 124,
            "logs": "Execution timed out (infinite loop or service slow).",
            "plot": None
        }
    except requests.exceptions.RequestException as e:
        execution_time = round(time.time() - start_time, 3)
        return {
            "success": False,
            "status": "failed",
            "stdout": "",
            "stderr": f"Microservice communication error: {str(e)}",
            "figures": [],
            "errors": [{"line": None, "message": f"Microservice communication error: {str(e)}"}],
            "execution_time": execution_time,
            "exit_code": 1,
            "logs": f"Microservice communication error: {str(e)}",
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

