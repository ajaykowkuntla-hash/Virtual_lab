import requests

BASE_URL = "http://127.0.0.1:8012"

# 1. Submitting to "exp_1_dsp" with a correct script
print("--- 1. POST /lab/submit with valid exp_1_dsp ---")
res1 = requests.post(f"{BASE_URL}/lab/submit", json={
    "user_id": 1,
    "experiment_id": "exp_1_dsp",
    "script_text": "disp([0.0, 0.30902, 0.58779, 0.80902, 0.95106])"
})
print(f"Status: {res1.status_code}")
try:
    print(res1.json())
except:
    print(res1.text)

# 2. Submitting to "fake_exp_999"
print("\n--- 2. POST /lab/submit with fake_exp_999 ---")
res2 = requests.post(f"{BASE_URL}/lab/submit", json={
    "user_id": 1,
    "experiment_id": "fake_exp_999",
    "script_text": "disp([0.0, 0.30902, 0.58779, 0.80902, 0.95106])"
})
print(f"Status: {res2.status_code}")
try:
    print(res2.json())
except:
    print(res2.text)
