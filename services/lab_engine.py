import docker
import tempfile
import os
import shutil
import base64
import re
from typing import Union, List
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

def execute_octave_script(script_text: str, expected_output: Union[str, List[float]]) -> dict:
    """
    Executes an Octave script securely in a Docker container.
    Returns a dict with status, logs, and a base64 encoded plot if one was generated.
    """
    if not client:
        return {"status": "failed", "logs": "Docker is not running on the server.", "plot": None}

    # Create a secure, isolated temporary directory for this specific submission
    temp_dir = tempfile.mkdtemp()
    script_path = os.path.join(temp_dir, "script.m")
    
    # Write the student's script to the temp directory
    with open(script_path, "w") as f:
        f.write(script_text)

    container = None
    try:
        # Run the container in detached mode so we can enforce our own timeout
        container = client.containers.run(
            image="octave-lab",
            command=["octave", "--no-gui", "--eval", "script"], # Evaluate script.m
            volumes={temp_dir: {'bind': '/workspace', 'mode': 'rw'}},
            working_dir="/workspace",
            network_mode="none",     # Security: No internet access
            mem_limit="128m",        # Security: Prevent out-of-memory crashes
            pids_limit=50,           # Security: Prevent fork bombs
            detach=True              # Run in background to manage timeout
        )
        
        # Wait for the container to finish (5 second timeout)
        result = container.wait(timeout=5)
        
        # Fetch the standard output and errors
        logs = container.logs().decode('utf-8')
        exit_code = result.get('StatusCode', 1)
        
        # Check if the execution succeeded and if it matches the expected output
        if exit_code != 0:
            status = "failed"
            logs = f"Execution Error:\n{logs}"
        elif expected_output:
            if isinstance(expected_output, list):
                if not verify_numeric_output(logs, expected_output):
                    status = "failed"
                    logs = f"Verification Failed. Numeric values did not match expected sequence.\nOutput:\n{logs}"
                else:
                    status = "verified"
            else:
                if expected_output not in logs:
                    status = "failed"
                    logs = f"Verification Failed. Expected string not found.\nOutput:\n{logs}"
                else:
                    status = "verified"
        else:
            status = "verified"

        # Check if a plot was generated and read it
        plot_b64 = None
        plot_path = os.path.join(temp_dir, "output_plot.png")
        if os.path.exists(plot_path):
            with open(plot_path, "rb") as img_file:
                plot_b64 = base64.b64encode(img_file.read()).decode('utf-8')

        return {
            "status": status,
            "logs": logs,
            "plot": plot_b64
        }
        
    except ReadTimeout:
        # Security: Container took too long (infinite loop)
        if container:
            container.kill()
        return {"status": "failed", "logs": "Execution timed out (infinite loop?).", "plot": None}
    except Exception as e:
        return {"status": "failed", "logs": f"System error: {str(e)}", "plot": None}
    finally:
        # Cleanup container
        if container:
            try:
                container.remove(force=True)
            except:
                pass
        # Cleanup temporary directory from host
        shutil.rmtree(temp_dir, ignore_errors=True)
