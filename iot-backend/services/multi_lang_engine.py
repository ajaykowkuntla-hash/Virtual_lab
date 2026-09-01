import os
import requests
import time

def execute_code(language: str, source_code: str, stdin: str = None, filename: str = None) -> dict:
    octave_service_url = os.getenv("OCTAVE_SERVICE_URL", "http://localhost:8001/execute")
    octave_service_secret = os.getenv("OCTAVE_SERVICE_SECRET", "dev-secret-key")
    
    # Deriving the multi_lang execution endpoint from the octave service url
    execute_url = octave_service_url.replace("/execute", "/execute_code")

    try:
        headers = {"Authorization": f"Bearer {octave_service_secret}"}
        payload = {
            "language": language,
            "source_code": source_code,
            "stdin": stdin,
            "filename": filename
        }
        
        start_time = time.time()
        response = requests.post(execute_url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        
        result = response.json()
        return {
            "stdout": result.get("stdout"),
            "stderr": result.get("stderr"),
            "compile_output": result.get("compile_output"),
            "exit_status": result.get("exit_status", 1),
            "execution_time": result.get("execution_time", time.time() - start_time)
        }
        
    except requests.exceptions.Timeout:
        return {
            "stdout": None,
            "stderr": "Execution timed out.",
            "compile_output": None,
            "exit_status": 124,
            "execution_time": 15.0
        }
    except requests.exceptions.RequestException as e:
        return {
            "stdout": None,
            "stderr": f"Error: Cloud Execution Microservice is unreachable ({str(e)}). Please ensure the service is running and correctly configured.",
            "compile_output": None,
            "exit_status": 1,
            "execution_time": 0
        }
    except Exception as e:
        return {
            "stdout": None,
            "stderr": f"Execution Error: {str(e)}",
            "compile_output": None,
            "exit_status": 1,
            "execution_time": 0
        }
