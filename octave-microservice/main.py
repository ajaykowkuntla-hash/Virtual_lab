import os
import tempfile
import shutil
import base64
import glob
import time
import subprocess
import re
from typing import List, Optional, Union
from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

app = FastAPI(title="Octave Execution Microservice")

# Security configuration
OCTAVE_SERVICE_SECRET = os.environ.get("OCTAVE_SERVICE_SECRET")
if not OCTAVE_SERVICE_SECRET:
    raise RuntimeError("OCTAVE_SERVICE_SECRET environment variable is missing!")

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    if token != OCTAVE_SERVICE_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
    return token

class ExecutionRequest(BaseModel):
    script_text: str
    stdin_text: Optional[str] = None

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
            
            if msg.startswith("near line"):
                msg = "Syntax error"
            else:
                msg = re.sub(r'(?:at|near) line \d+.*$', '', msg).strip()
                
            if msg.lower() == "called from":
                continue
                
            if not msg:
                msg = "Syntax or runtime error."
                
            current_error = {"line": line_num, "message": msg}
            errors.append(current_error)
            
        elif current_error and line.lower() == "syntax error":
            current_error["message"] = "syntax error"
            
        elif current_error and "student_code at line" in line:
            line_match = re.search(r'at line (\d+)', line)
            if line_match and current_error["line"] is None:
                current_error["line"] = int(line_match.group(1))

    return errors

def _build_wrapper_script(student_script_path: str, temp_dir: str) -> str:
    return f"""
% --- DigiLab Plot Capture Wrapper ---
source('{student_script_path}');

fig_handles = get(0, 'children');
if ~isempty(fig_handles)
  for i = 1:length(fig_handles)
    fig = fig_handles(i);
    set(fig, 'visible', 'off');
    
    set(fig, 'PaperPositionMode', 'manual');
    set(fig, 'PaperUnits', 'inches');
    set(fig, 'PaperPosition', [0 0 8 10]);
    
    fname = sprintf('{temp_dir}/output_plot_%d.png', i);
    print(fig, fname, '-dpng', '-r150');
  end
end
"""

@app.post("/execute")
def execute_octave(request: ExecutionRequest, token: str = Depends(verify_token)):
    # Security: Limit code size
    if len(request.script_text) > 50000:
        raise HTTPException(status_code=400, detail="Script size exceeds maximum allowed length.")
        
    temp_dir = tempfile.mkdtemp()
    
    try:
        student_script_path = os.path.join(temp_dir, "student_code.m")
        with open(student_script_path, "w") as f:
            f.write(request.script_text)
            
        wrapper_script = _build_wrapper_script(student_script_path, temp_dir)
        wrapper_path = os.path.join(temp_dir, "wrapper.m")
        with open(wrapper_path, "w") as f:
            f.write(wrapper_script)
            
        input_redirect = ""
        if request.stdin_text is not None:
            stdin_path = os.path.join(temp_dir, "input.txt")
            with open(stdin_path, "w") as f:
                f.write(request.stdin_text)
            input_redirect = f"< {stdin_path}"

        start_time = time.time()
        
        # Run Octave directly using subprocess
        command = f"octave --no-gui --eval \"source('{wrapper_path}')\" {input_redirect}"
        
        try:
            # Increased timeout to 45 seconds for cloud instances (Render free tier is slower)
            process = subprocess.run(
                command,
                shell=True,
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=45
            )
            stdout = process.stdout
            stderr = process.stderr
            exit_code = process.returncode
            
        except subprocess.TimeoutExpired as e:
            execution_time = round(time.time() - start_time, 3)
            return {
                "success": False,
                "stdout": e.stdout.decode('utf-8') if e.stdout else "",
                "stderr": "Execution timed out. Your script may contain an infinite loop or excessive computation.",
                "figures": [],
                "errors": [{"line": None, "message": "Execution timed out. Check for infinite loops."}],
                "execution_time": execution_time,
                "exit_code": 124
            }

        execution_time = round(time.time() - start_time, 3)
        errors = parse_octave_errors(stderr)
        
        figures = []
        figure_files = sorted(glob.glob(os.path.join(temp_dir, "output_plot_*.png")))
        
        legacy_plot = os.path.join(temp_dir, "output_plot.png")
        if os.path.exists(legacy_plot) and legacy_plot not in figure_files:
            figure_files.insert(0, legacy_plot)
            
        for fig_path in figure_files:
            if os.path.getsize(fig_path) > 0:
                with open(fig_path, "rb") as img_file:
                    b64 = base64.b64encode(img_file.read()).decode('utf-8')
                    figures.append(f"data:image/png;base64,{b64}")
                    
        execution_success = (exit_code == 0 and not errors)
        
        return {
            "success": execution_success,
            "stdout": stdout,
            "stderr": stderr,
            "figures": figures,
            "errors": errors,
            "execution_time": execution_time,
            "exit_code": exit_code
        }
        
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"System error: {str(e)}",
            "figures": [],
            "errors": [{"line": None, "message": f"System error: {str(e)}"}],
            "execution_time": 0,
            "exit_code": 1
        }
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.get("/health")
def health_check():
    return {"status": "ok"}

class MultiLangRequest(BaseModel):
    language: str
    source_code: str
    stdin: Optional[str] = None
    filename: Optional[str] = None

LANGUAGE_CONFIG = {
    "python": {
        "filename": "main.py",
        "command": "python3 main.py",
        "compile_cmd": None
    },
    "c": {
        "filename": "main.c",
        "command": "./out",
        "compile_cmd": "gcc main.c -o out -lm"
    },
    "cpp": {
        "filename": "main.cpp",
        "command": "./out",
        "compile_cmd": "g++ main.cpp -o out -lm"
    },
    "java": {
        "filename": "Main.java",
        "command": "java Main",
        "compile_cmd": "javac Main.java"
    }
}

@app.post("/execute_code")
def execute_multi_lang(request: MultiLangRequest, token: str = Depends(verify_token)):
    lang = request.language.lower()
    if lang not in LANGUAGE_CONFIG:
        return {
            "stdout": None, "stderr": f"Unsupported language: {request.language}",
            "compile_output": None, "exit_status": 1, "execution_time": 0
        }
        
    config = LANGUAGE_CONFIG[lang]
    actual_filename = request.filename if request.filename else config["filename"]
    compile_cmd = config["compile_cmd"]
    exec_cmd = config["command"]
    
    if request.filename:
        base, _ = os.path.splitext(request.filename)
        if lang == "c":
            compile_cmd = f"gcc {request.filename} -o out -lm"
        elif lang == "cpp":
            compile_cmd = f"g++ {request.filename} -o out -lm"
        elif lang == "java":
            compile_cmd = f"javac {request.filename}"
            exec_cmd = f"java {base}"
        elif lang == "python":
            exec_cmd = f"python3 {request.filename}"

    temp_dir = tempfile.mkdtemp()
    
    try:
        source_path = os.path.join(temp_dir, actual_filename)
        with open(source_path, "w") as f:
            f.write(request.source_code)
            
        input_redirect = ""
        if request.stdin is not None:
            stdin_path = os.path.join(temp_dir, "stdin.txt")
            with open(stdin_path, "w") as f:
                f.write(request.stdin)
            input_redirect = f"< {stdin_path}"
            exec_cmd += " " + input_redirect

        compile_output = None
        
        # Phase 1: Compile
        if compile_cmd:
            try:
                comp_process = subprocess.run(
                    compile_cmd, shell=True, cwd=temp_dir,
                    capture_output=True, text=True, timeout=30
                )
                compile_output = comp_process.stderr if comp_process.returncode != 0 else comp_process.stdout
                
                if comp_process.returncode != 0:
                    return {
                        "stdout": None, "stderr": None, "compile_output": compile_output,
                        "exit_status": comp_process.returncode, "execution_time": 0
                    }
            except subprocess.TimeoutExpired as e:
                return {
                    "stdout": None, "stderr": None, "compile_output": "Compilation timed out.",
                    "exit_status": 1, "execution_time": 0
                }
            except Exception as e:
                return {
                    "stdout": None, "stderr": None, "compile_output": f"Compile Error: {str(e)}",
                    "exit_status": 1, "execution_time": 0
                }
                
        # Phase 2: Execute
        start_time = time.time()
        try:
            exec_process = subprocess.run(
                exec_cmd, shell=True, cwd=temp_dir,
                capture_output=True, text=True, timeout=15
            )
            execution_time = time.time() - start_time
            
            return {
                "stdout": exec_process.stdout,
                "stderr": exec_process.stderr,
                "compile_output": compile_output,
                "exit_status": exec_process.returncode,
                "execution_time": execution_time
            }
        except subprocess.TimeoutExpired as e:
            execution_time = time.time() - start_time
            return {
                "stdout": e.stdout.decode('utf-8') if e.stdout else None,
                "stderr": "Execution timed out.",
                "compile_output": compile_output,
                "exit_status": 124,
                "execution_time": execution_time
            }
        except Exception as e:
            execution_time = time.time() - start_time
            return {
                "stdout": None,
                "stderr": f"Execution Error: {str(e)}",
                "compile_output": compile_output,
                "exit_status": 1,
                "execution_time": execution_time
            }
            
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
