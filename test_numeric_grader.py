import requests
import json
import time
import subprocess

BASE_URL = "http://127.0.0.1:8008"

def test_submission(name, script_text):
    print(f"\n--- Testing {name} ---")
    res = requests.post(f"{BASE_URL}/lab/submit", json={
        "user_id": 1,
        "experiment_id": "exp_1_dsp",
        "script_text": script_text
    })
    data = res.json()
    print(f"Status: {data['status']}")
    print("Logs snippet:")
    print(data['logs'][:200] + "..." if len(data['logs']) > 200 else data['logs'])

def run_tests():
    # 1. Correct Script (Should be Verified)
    correct_script = """
fs = 1000;
t = 0:1/fs:0.1;
x = sin(2*pi*50*t);
disp(x(1:5));
"""
    test_submission("Correct Script", correct_script)
    
    # 2. Slightly Off Script (Should Fail)
    # 0.309 is off from 0.30902 by ~0.00002 which is within 0.01 tolerance
    # Let's make it off by more than 0.01. E.g. 0.3200
    off_script = """
disp([0.0, 0.3200, 0.5878, 0.8090, 0.9511]);
"""
    test_submission("Slightly Off Script (0.3200 instead of 0.309)", off_script)
    
    # 3. Messy Output Script (Should be Verified)
    # The student prints a bunch of random numbers, text, and then the correct array.
    messy_script = """
disp('Welcome to Octave version 8.4.0');
disp('Here are some random numbers: 3.14, -42, 1e10');
disp('And the final answer is:');
fs = 1000;
t = 0:1/fs:0.1;
x = sin(2*pi*50*t);
disp(x(1:5));
"""
    test_submission("Messy Output Script", messy_script)

if __name__ == "__main__":
    # Start server
    server = subprocess.Popen(["venv/bin/uvicorn", "main:app", "--port", "8008"])
    time.sleep(3) # Wait for startup
    try:
        run_tests()
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        server.terminate()
