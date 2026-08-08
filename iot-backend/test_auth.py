import requests
import json
import time
import subprocess

BASE_URL = "http://127.0.0.1:8009"

def run_tests():
    # 1. Attempt to hit a protected route without a token
    print("\n--- 1. Testing /access/LAB_101 WITHOUT token ---")
    res1 = requests.get(f"{BASE_URL}/access/LAB_101")
    print(f"Status: {res1.status_code}")
    print(res1.json())
    
    # 2. Login as Dr. Smith to get token
    print("\n--- 2. Login as Faculty (drsmith) ---")
    login_data = {
        "username": "drsmith",
        "password": "password123"
    }
    # OAuth2 uses form data
    res2 = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"Status: {res2.status_code}")
    token_data = res2.json()
    print(token_data)
    
    token = token_data.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Use token to hit protected route
    print("\n--- 3. Testing /access/LAB_101 WITH token ---")
    res3 = requests.get(f"{BASE_URL}/access/LAB_101", headers=headers)
    print(f"Status: {res3.status_code}")
    print(res3.json())
    
    # 3.5 Submit a lab script so we have something to verify
    print("\n--- 3.5 POST /lab/submit (Creates submission ID 1) ---")
    requests.post(f"{BASE_URL}/lab/submit", json={
        "user_id": 1,
        "experiment_id": "exp_1_dsp",
        "script_text": "disp([0.0, 0.30902, 0.58779, 0.80902, 0.95106])"
    })
    
    # 4. Verify a submission (Notice we don't pass faculty_id anymore!)
    print("\n--- 4. Testing /lab/submissions/1/verify WITH token ---")
    verify_data = {
        "status": "verified"
    }
    res4 = requests.post(f"{BASE_URL}/lab/submissions/1/verify", json=verify_data, headers=headers)
    print(f"Status: {res4.status_code}")
    if res4.status_code == 200:
        print(f"Successfully verified by user_id: {res4.json().get('verified_by')}")
    else:
        print(res4.json())

if __name__ == "__main__":
    # Ensure database is seeded with new schema
    print("Running seed.py...")
    subprocess.run(["python", "seed.py"], check=True)
    
    # Start server
    server = subprocess.Popen(["venv/bin/uvicorn", "main:app", "--port", "8009"])
    time.sleep(3) # Wait for startup
    try:
        run_tests()
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        server.terminate()
