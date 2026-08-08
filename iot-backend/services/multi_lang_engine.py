import docker
import tempfile
import os
import shutil
import time

try:
    client = docker.from_env()
except Exception as e:
    print(f"Warning: Docker not available ({e})")
    client = None

LANGUAGE_CONFIG = {
    "python": {
        "image": "python:3.11-slim",
        "filename": "main.py",
        "command": "python3 main.py",
        "compile_cmd": None
    },
    "c": {
        "image": "gcc:latest",
        "filename": "main.c",
        "command": "./out",
        "compile_cmd": "gcc main.c -o out -lm"
    },
    "cpp": {
        "image": "gcc:latest",
        "filename": "main.cpp",
        "command": "./out",
        "compile_cmd": "g++ main.cpp -o out -lm"
    },
    "java": {
        "image": "eclipse-temurin:17-jdk",
        "filename": "Main.java",
        "command": "java Main",
        "compile_cmd": "javac Main.java"
    }
}

def execute_code(language: str, source_code: str, stdin: str = None, filename: str = None) -> dict:
    if not client:
        return {
            "stdout": None, "stderr": "Docker is not running on the server.",
            "compile_output": None, "exit_status": 1, "execution_time": 0
        }
        
    lang = language.lower()
    if lang not in LANGUAGE_CONFIG:
        return {
            "stdout": None, "stderr": f"Unsupported language: {language}",
            "compile_output": None, "exit_status": 1, "execution_time": 0
        }
        
    config = LANGUAGE_CONFIG[lang]
    actual_filename = filename if filename else config["filename"]
    compile_cmd = config["compile_cmd"]
    exec_cmd = config["command"]
    
    if filename:
        base, _ = os.path.splitext(filename)
        if lang == "c":
            compile_cmd = f"gcc {filename} -o out -lm"
        elif lang == "cpp":
            compile_cmd = f"g++ {filename} -o out -lm"
        elif lang == "java":
            compile_cmd = f"javac {filename}"
            exec_cmd = f"java {base}"
        elif lang == "python":
            exec_cmd = f"python3 {filename}"

    temp_dir = tempfile.mkdtemp()
    
    try:
        # Write source code
        with open(os.path.join(temp_dir, actual_filename), "w") as f:
            f.write(source_code)
            
        # Write stdin if provided
        if stdin is not None:
            with open(os.path.join(temp_dir, "stdin.txt"), "w") as f:
                f.write(stdin)
                
        compile_output = None
        
        # Phase 1: Compilation (if needed)
        if compile_cmd:
            try:
                compile_container = client.containers.run(
                    image=config["image"],
                    command=["sh", "-c", compile_cmd],
                    volumes={temp_dir: {'bind': '/workspace', 'mode': 'rw'}},
                    working_dir="/workspace",
                    network_mode="none",
                    mem_limit="256m",
                    detach=True
                )
                compile_res = compile_container.wait(timeout=10)
                compile_output = compile_container.logs().decode('utf-8', errors='replace')
                compile_container.remove(force=True)
                
                if compile_res.get('StatusCode', 1) != 0:
                    return {
                        "stdout": None,
                        "stderr": None,
                        "compile_output": compile_output,
                        "exit_status": compile_res.get('StatusCode', 1),
                        "execution_time": 0
                    }
            except docker.errors.ContainerError as e:
                return {
                    "stdout": None, "stderr": None, "compile_output": str(e),
                    "exit_status": 1, "execution_time": 0
                }
            except Exception as e:
                return {
                    "stdout": None, "stderr": None, "compile_output": f"Compile Error: {str(e)}",
                    "exit_status": 1, "execution_time": 0
                }
        
        # Phase 2: Execution
        if stdin is not None:
            exec_cmd += " < stdin.txt"
            
        start_time = time.time()
        container = None
        try:
            container = client.containers.run(
                image=config["image"],
                command=["sh", "-c", exec_cmd],
                volumes={temp_dir: {'bind': '/workspace', 'mode': 'rw'}},
                working_dir="/workspace",
                network_mode="none",
                mem_limit="128m",
                pids_limit=50,
                detach=True
            )
            result = container.wait(timeout=5)
            stdout = container.logs(stdout=True, stderr=False).decode('utf-8', errors='replace')
            stderr = container.logs(stdout=False, stderr=True).decode('utf-8', errors='replace')
            execution_time = time.time() - start_time
            
            return {
                "stdout": stdout,
                "stderr": stderr,
                "compile_output": compile_output,
                "exit_status": result.get('StatusCode', 1),
                "execution_time": execution_time
            }
            
        except Exception as e: # Handle timeout or other errors
            if container:
                try:
                    container.kill()
                except:
                    pass
            return {
                "stdout": None,
                "stderr": f"Execution Error: {str(e)}",
                "compile_output": compile_output,
                "exit_status": 124, # Timeout
                "execution_time": time.time() - start_time
            }
            
    finally:
        if 'container' in locals() and container:
            try:
                container.remove(force=True)
            except:
                pass
        shutil.rmtree(temp_dir, ignore_errors=True)
