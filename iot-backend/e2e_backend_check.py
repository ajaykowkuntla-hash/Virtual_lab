import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
results = {}
headers = {}

def report(name, status, details=""):
    results[name] = {"status": status, "details": details}
    print(f"[{status}] {name}")
    if details:
        print(f"   -> {details}")

# 1. Auth Check
try:
    auth_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "drvance", "password": "securepassword"})
    if auth_resp.status_code == 200:
        token = auth_resp.json().get("access_token")
        headers["Authorization"] = f"Bearer {token}"
        # Test protected route
        protected_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if protected_resp.status_code == 200:
            # Test without token
            fail_resp = requests.get(f"{BASE_URL}/auth/me")
            if fail_resp.status_code == 401:
                report("1. Auth", "PASS", "Valid JWT returned, protected routes work, unauthorized rejected")
            else:
                report("1. Auth", "FAIL", "Unauthorized request was not rejected with 401")
        else:
            report("1. Auth", "FAIL", f"Protected route failed with token: {protected_resp.status_code}")
    else:
        report("1. Auth", "FAIL", f"Login failed: {auth_resp.text}")
except Exception as e:
    report("1. Auth", "FAIL", str(e))

# 2. Attendance
try:
    att_post = requests.post(f"{BASE_URL}/attendance/", json={"rfid_tag_id": "TAG12345", "class_id": 1, "semester_id": 1})
    if att_post.status_code == 200:
        time.sleep(0.5)
        report("2. Attendance", "PASS", "Logged attendance via POST")
    else:
        report("2. Attendance", "FAIL", f"POST failed: {att_post.text}")
except Exception as e:
    report("2. Attendance", "FAIL", str(e))

# 3. Access Control
try:
    valid_acc = requests.post(f"{BASE_URL}/access/", json={"rfid_tag_id": "TAG12345", "room_id": "lab_a"})
    invalid_acc = requests.post(f"{BASE_URL}/access/", json={"rfid_tag_id": "INVALID_TAG", "room_id": "lab_a"})
    
    log_get = requests.get(f"{BASE_URL}/access/lab_a", headers=headers)
    if log_get.status_code == 200:
        logs = log_get.json()
        has_granted = any(l.get("granted") == True for l in logs)
        has_denied = any(l.get("granted") == False for l in logs)
        if has_granted and has_denied:
            report("3. Access Control", "PASS", "Valid tag granted, invalid tag denied, and both logged")
        else:
            report("3. Access Control", "FAIL", f"Logs missing entries. Granted: {has_granted}, Denied: {has_denied}")
    else:
        report("3. Access Control", "FAIL", f"GET /access/lab_a failed: {log_get.status_code} - {log_get.text}")
except Exception as e:
    report("3. Access Control", "FAIL", str(e))

# 4. Experiments
try:
    exp_get = requests.get(f"{BASE_URL}/lab/experiments")
    if exp_get.status_code == 200:
        exps = exp_get.json()
        if len(exps) > 0:
            exp_id = exps[0]["id"]
            single_exp = requests.get(f"{BASE_URL}/lab/experiments/{exp_id}")
            if single_exp.status_code == 200:
                report("4. Experiments", "PASS", f"Retrieved experiment list and single details for {exp_id}")
            else:
                report("4. Experiments", "FAIL", f"Failed to get single experiment details: {single_exp.status_code}")
        else:
            report("4. Experiments", "FAIL", "GET /lab/experiments returned empty list")
    else:
        report("4. Experiments", "FAIL", f"GET /lab/experiments failed: {exp_get.status_code}")
except Exception as e:
    report("4. Experiments", "FAIL", str(e))

# 5. Lab Submission
try:
    correct_script = "y = sin(2*pi*f*t);"
    correct_sub = requests.post(f"{BASE_URL}/lab/submit", json={"user_id": 1, "experiment_id": "exp_1_dsp", "script_text": correct_script})
    wrong_script = "y = 0;"
    wrong_sub = requests.post(f"{BASE_URL}/lab/submit", json={"user_id": 1, "experiment_id": "exp_1_dsp", "script_text": wrong_script})
    invalid_exp = requests.post(f"{BASE_URL}/lab/submit", json={"user_id": 1, "experiment_id": "non_existent_exp", "script_text": "y=0;"})
    
    report("5. Lab Submission", "INFO", f"Correct: {correct_sub.json().get('status') if correct_sub.status_code==200 else correct_sub.status_code}, Wrong: {wrong_sub.json().get('status') if wrong_sub.status_code==200 else wrong_sub.status_code}, Invalid Exp: {invalid_exp.status_code}")
except Exception as e:
    report("5. Lab Submission", "FAIL", str(e))

# 6. Faculty Review
try:
    sub_get = requests.get(f"{BASE_URL}/lab/submissions/exp_1_dsp", headers=headers)
    if sub_get.status_code == 200:
        subs = sub_get.json()
        if len(subs) > 0:
            sub_id = subs[0]["id"]
            verify_sub = requests.post(f"{BASE_URL}/lab/submissions/{sub_id}/verify", headers=headers, json={"status": "verified"})
            if verify_sub.status_code == 200:
                report("6. Faculty Review", "PASS", "Retrieved submissions and verified one")
            else:
                report("6. Faculty Review", "FAIL", f"Verify failed: {verify_sub.status_code}")
        else:
            report("6. Faculty Review", "FAIL", "No submissions found to review")
    else:
        report("6. Faculty Review", "FAIL", f"GET submissions failed: {sub_get.status_code}")
except Exception as e:
    report("6. Faculty Review", "FAIL", str(e))

# 7. Semester Management
try:
    sem_post = requests.post(f"{BASE_URL}/semesters/", headers=headers, json={"name": "Test Fall 2026", "start_date": "2026-09-01", "end_date": "2026-12-15"})
    if sem_post.status_code in [200, 201]:
        report("7. Semester Management", "PASS", "Created a semester")
    else:
        report("7. Semester Management", "FAIL", f"Semester POST failed: {sem_post.text}")
except Exception as e:
    report("7. Semester Management", "FAIL", str(e))

# 8. Judge0 Execution
try:
    code_post = requests.post(f"{BASE_URL}/code/execute", json={"language": "python", "code": "print('hello')", "input": ""})
    err_post = requests.post(f"{BASE_URL}/code/execute", json={"language": "python", "code": "print(1/0)", "input": ""})
    
    if code_post.status_code == 200 and err_post.status_code == 200:
        code_out = code_post.json()
        err_out = err_post.json()
        report("8. Judge0 Execution", "PASS", f"Success output: {code_out.get('stdout', '').strip()}, Error output: {err_out.get('stderr', '').strip()[:20]}")
    else:
        report("8. Judge0 Execution", "FAIL", f"Execution endpoints returned errors: {code_post.status_code}, {err_post.status_code}")
except Exception as e:
    report("8. Judge0 Execution", "FAIL", str(e))
