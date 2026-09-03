import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def login(username, password):
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": username, "password": password})
    if resp.status_code == 200:
        return resp.json()["access_token"]
    raise Exception(f"Failed to login {username}: {resp.status_code} {resp.text}")

def test_endpoint(name, method, url, token=None, json=None, expected_status=None):
    headers = {}
    if token == "invalid":
        headers["Authorization"] = "Bearer invalid_token_abc123"
    elif token:
        headers["Authorization"] = f"Bearer {token}"
        
    print(f"Testing {name}...", end=" ")
    try:
        if method == "POST":
            resp = requests.post(f"{BASE_URL}{url}", headers=headers, json=json)
        elif method == "GET":
            resp = requests.get(f"{BASE_URL}{url}", headers=headers)
            
        if expected_status is not None and resp.status_code != expected_status:
            # For admin assignment, if success it might be 200 or 400 (if payload invalid/active semester issue), 
            # we just want to ensure it's NOT 401/403.
            if expected_status == "SUCCESS" and resp.status_code not in (401, 403):
                print(f"✅ PASSED (Got {resp.status_code} allowed)")
                return True
            print(f"❌ FAILED (Expected {expected_status}, got {resp.status_code})")
            print(f"   Response: {resp.text}")
            return False
            
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    print("--- DIGILAB SECURITY MATRIX TESTS ---")
    
    # 1. Obtain tokens
    try:
        admin_token = login("admin", "adminpassword")
        faculty_vance_token = login("drvance", "securepassword")
        faculty_smith_token = login("drsmith", "password123")
        student_token = login("student1", "password123")
    except Exception as e:
        print(f"Setup Failed: {e}")
        print("Is the backend running? Run 'uvicorn main:app --port 8000'")
        sys.exit(1)
        
    # We need a valid faculty_id to test assignment. Dr Vance is ID 2 typically, or we can just use 999.
    faculty_assign_payload = {"class_id": 1, "course_id": 1}
    
    all_passed = True
    
    print("\n[A] Faculty Assignment Scope")
    tests_a = [
        ("No token", "POST", "/faculty/2/assignments", None, faculty_assign_payload, 401),
        ("Invalid token", "POST", "/faculty/2/assignments", "invalid", faculty_assign_payload, 401),
        ("Student token", "POST", "/faculty/2/assignments", student_token, faculty_assign_payload, 403),
        ("Faculty token", "POST", "/faculty/2/assignments", faculty_vance_token, faculty_assign_payload, 403),
        ("Admin token", "POST", "/faculty/2/assignments", admin_token, faculty_assign_payload, "SUCCESS"),
    ]
    for t in tests_a:
        if not test_endpoint(*t): all_passed = False

    print("\n[B] Submissions & Grading Scope")
    # exp_1_dsp is assigned to drvance.
    # We need a submission ID for verify testing. Let's create one first as student.
    submit_payload = {
        "user_id": 1, # student is ID 1
        "experiment_id": "exp_1_dsp",
        "script_text": "disp('hello')",
        "is_final_submission": True,
        "stdin": ""
    }
    sub_resp = requests.post(f"{BASE_URL}/lab/submit", json=submit_payload)
    if sub_resp.status_code != 200:
        print(f"Warning: Failed to create submission for grading test: {sub_resp.text}")
        submission_id = 1 # guess
    else:
        # Actually /lab/submit is not returning submission ID directly but let's assume submission 1 exists if seeded.
        pass
        
    submission_id = 1
    verify_payload = {"status": "verified"}

    tests_b = [
        # View Submissions
        ("View No token", "GET", "/lab/submissions/exp_1_dsp", None, None, 401),
        ("View Invalid token", "GET", "/lab/submissions/exp_1_dsp", "invalid", None, 401),
        ("View Student token", "GET", "/lab/submissions/exp_1_dsp", student_token, None, 403),
        ("View Faculty (Assigned)", "GET", "/lab/submissions/exp_1_dsp", faculty_vance_token, None, 200),
        ("View Faculty (Unassigned)", "GET", "/lab/submissions/exp_1_dsp", faculty_smith_token, None, 403),
        ("View Admin", "GET", "/lab/submissions/exp_1_dsp", admin_token, None, 200),
        
        # Grading
        ("Verify No token", "POST", f"/lab/submissions/{submission_id}/verify", None, verify_payload, 401),
        ("Verify Student token", "POST", f"/lab/submissions/{submission_id}/verify", student_token, verify_payload, 403),
        ("Verify Faculty (Assigned)", "POST", f"/lab/submissions/{submission_id}/verify", faculty_vance_token, verify_payload, 200),
        ("Verify Faculty (Unassigned)", "POST", f"/lab/submissions/{submission_id}/verify", faculty_smith_token, verify_payload, 403),
        ("Verify Admin", "POST", f"/lab/submissions/{submission_id}/verify", admin_token, verify_payload, 200)
    ]
    for t in tests_b:
        if not test_endpoint(*t): all_passed = False

    print("\n[C] CORS")
    # Test localhost:3000 origin
    resp_cors = requests.options(f"{BASE_URL}/lab/courses", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    })
    if resp_cors.status_code == 200 and "access-control-allow-origin" in resp_cors.headers:
        print("Testing Approved Origin (http://localhost:3000)... ✅ PASSED")
    else:
        print("Testing Approved Origin... ❌ FAILED")
        all_passed = False
        
    resp_cors_bad = requests.options(f"{BASE_URL}/lab/courses", headers={
        "Origin": "http://evil.com",
        "Access-Control-Request-Method": "GET"
    })
    # FastAPI CORS might just not include the header or might return 400
    if resp_cors_bad.headers.get("access-control-allow-origin") == "http://evil.com":
        print("Testing Unsupported Origin (http://evil.com)... ❌ FAILED (Origin was allowed!)")
        all_passed = False
    else:
        print("Testing Unsupported Origin (http://evil.com)... ✅ PASSED (Rejected/No header)")
        
    print("\n[D] Analytics Scope")
    tests_d = [
        # Admin Analytics
        ("Admin View Admin", "GET", "/analytics/admin", admin_token, None, 200),
        ("Student View Admin", "GET", "/analytics/admin", student_token, None, 403),
        ("Faculty View Admin", "GET", "/analytics/admin", faculty_vance_token, None, 403),
        ("No Token View Admin", "GET", "/analytics/admin", None, None, 401),
        
        # Faculty Analytics
        ("Faculty View Faculty", "GET", "/analytics/faculty", faculty_vance_token, None, 200),
        ("Student View Faculty", "GET", "/analytics/faculty", student_token, None, 403),
        ("Admin View Faculty", "GET", "/analytics/faculty", admin_token, None, 403),
        ("No Token View Faculty", "GET", "/analytics/faculty", None, None, 401),
        
        # Student Analytics
        ("Student View Student", "GET", "/analytics/student", student_token, None, 200),
        ("Faculty View Student", "GET", "/analytics/student", faculty_vance_token, None, 403),
        ("Admin View Student", "GET", "/analytics/student", admin_token, None, 403),
        ("No Token View Student", "GET", "/analytics/student", None, None, 401),
    ]
    for t in tests_d:
        if not test_endpoint(*t): all_passed = False

    if all_passed:
        print("\n🎉 ALL SECURITY TESTS PASSED")
        sys.exit(0)
    else:
        print("\n⚠️ SOME SECURITY TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
