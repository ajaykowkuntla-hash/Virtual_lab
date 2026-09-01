import tempfile
import os
import shutil
import base64
import re
from typing import Union, List


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
    Executes an Octave script securely via a remote microservice.
    Returns a dict with status, logs, and a base64 encoded plot if one was generated.
    """
    octave_service_url = os.getenv("OCTAVE_SERVICE_URL", "http://localhost:8000/execute")
    octave_service_secret = os.getenv("OCTAVE_SERVICE_SECRET", "dev-secret-key")

    try:
        import requests
        
        headers = {"Authorization": f"Bearer {octave_service_secret}"}
        payload = {
            "script_text": script_text
        }
        
        response = requests.post(octave_service_url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        
        result = response.json()
        
        execution_success = result.get("success", False)
        stdout = result.get("stdout", "")
        stderr = result.get("stderr", "")
        exit_code = result.get("exit_code", 1)
        figures = result.get("figures", [])
        
        logs = stdout
        if stderr:
            logs += f"\n{stderr}" if logs else stderr
        
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

        # Extract the plot if one was returned
        plot_b64 = None
        if figures:
            plot_b64 = figures[0].replace("data:image/png;base64,", "")

        return {
            "status": status,
            "logs": logs,
            "plot": plot_b64
        }
        
    except requests.exceptions.Timeout:
        return {"status": "failed", "logs": "Execution timed out (infinite loop or service slow).", "plot": None}
    except requests.exceptions.RequestException as e:
        return {"status": "failed", "logs": f"Microservice communication error: {str(e)}", "plot": None}
    except Exception as e:
        return {"status": "failed", "logs": f"System error: {str(e)}", "plot": None}
