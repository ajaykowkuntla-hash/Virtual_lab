import requests
import json
import time
import subprocess
import sys

BASE_URL = "http://127.0.0.1:8007"

def run_tests():
    print("--- 1. POST /attendance ---")
    res1 = requests.post(f"{BASE_URL}/attendance/", json={
        "rfid_tag_id": "TAG12345",
        "class_id": 1
    })
    print(json.dumps(res1.json(), indent=2))
    
    print("\n--- 2. GET /attendance/1 ---")
    res2 = requests.get(f"{BASE_URL}/attendance/1")
    print(json.dumps(res2.json(), indent=2))
    
    print("\n--- 3. POST /lab/submit ---")
    script = """disp('First 5 values of the 50 Hz sine wave');
fs = 1000;
t = 0:1/fs:0.1;
plot(t, sin(2*pi*50*t));
print('output_plot.png', '-dpng');"""
    
    res3 = requests.post(f"{BASE_URL}/lab/submit", json={
        "user_id": 1,
        "experiment_id": "exp_1_dsp",
        "script_text": script
    })
    data3 = res3.json()
    if "plot_b64" in data3 and data3["plot_b64"]:
        data3["plot_b64"] = f"<BASE64_IMAGE_DATA_TRUNCATED_FOR_READABILITY ({len(data3['plot_b64'])} characters)>"
    print(json.dumps(data3, indent=2))
    
    print("\n--- 4. GET /lab/submissions/exp_1_dsp ---")
    res4 = requests.get(f"{BASE_URL}/lab/submissions/exp_1_dsp")
    submissions = res4.json()
    print(json.dumps(submissions, indent=2))
    
    submission_id = submissions[0]["id"] if submissions else 1
    
    print(f"\n--- 5. POST /lab/submissions/{submission_id}/verify ---")
    res5 = requests.post(f"{BASE_URL}/lab/submissions/{submission_id}/verify", json={
        "faculty_id": 2,
        "status": "verified"
    })
    print(json.dumps(res5.json(), indent=2))
    
    print("\n--- 6. GET /access/LAB_101 ---")
    res6 = requests.get(f"{BASE_URL}/access/LAB_101")
    print(json.dumps(res6.json(), indent=2))

if __name__ == "__main__":
    # Start server
    server = subprocess.Popen(["venv/bin/uvicorn", "main:app", "--port", "8007"])
    time.sleep(3) # Wait for startup
    try:
        run_tests()
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        server.terminate()
