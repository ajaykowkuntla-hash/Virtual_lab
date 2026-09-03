import requests
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

def login(username, password):
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": username, "password": password})
    if resp.status_code == 200:
        return resp.json()["access_token"]
    raise Exception(f"Failed to login {username}: {resp.status_code} {resp.text}")

def test(name, method, url, token=None, json=None, expected_status=200):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    print(f"Testing {name}...", end=" ")
    try:
        if method == "POST":
            resp = requests.post(f"{BASE_URL}{url}", headers=headers, json=json)
        elif method == "GET":
            resp = requests.get(f"{BASE_URL}{url}", headers=headers)
            
        if expected_status is not None and resp.status_code != expected_status:
            print(f"❌ FAILED (Expected {expected_status}, got {resp.status_code})")
            print(f"   Response: {resp.text}")
            return False, None
            
        print("✅ PASSED")
        return True, resp.json() if resp.status_code == 200 else None
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False, None

def main():
    print("--- DIGILAB REGRESSION TESTS ---")
    
    try:
        admin_token = login("admin", "adminpassword")
        faculty_vance_token = login("drvance", "securepassword")
        student_token = login("student1", "password123")
    except Exception as e:
        print(f"Setup Failed: {e}")
        sys.exit(1)
        
    all_passed = True
    
    # Dashboard regression
    res, _ = test("Faculty Dashboard", "GET", "/faculty/analytics", faculty_vance_token)
    if not res: all_passed = False
    
    res, _ = test("Student Dashboard", "GET", "/lab/student/dashboard", student_token)
    if not res: all_passed = False
    
    # Octave Execution
    octave_payload = {
        "user_id": 1,
        "experiment_id": "exp_1_dsp",
        "script_text": "disp('Hello Octave');",
        "is_final_submission": False,
        "stdin": ""
    }
    res, data = test("Octave Cloud Execution", "POST", "/lab/submit", student_token, octave_payload)
    if not res: all_passed = False
    elif "Hello Octave" not in data.get("stdout", "") and "Hello Octave" not in str(data):
        print(f"❌ FAILED Octave Output: {data}")
        all_passed = False
        
    # Local Judge0 Programming Execution
    judge0_payload = {
        "language": "python",
        "source_code": "print('Hello Judge0')",
        "stdin": "",
        "filename": "main.py"
    }
    res, data = test("Judge0 Local Execution", "POST", "/lab/code/execute", student_token, judge0_payload)
    if not res: all_passed = False
    elif "Hello Judge0" not in (data.get("stdout") or "") and "Hello Judge0" not in (data.get("compile_output") or ""):
        print(f"❌ FAILED Judge0 Output: {data}")
        all_passed = False

    if all_passed:
        print("\n🎉 ALL REGRESSION TESTS PASSED")
        sys.exit(0)
    else:
        print("\n⚠️ SOME REGRESSION TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
