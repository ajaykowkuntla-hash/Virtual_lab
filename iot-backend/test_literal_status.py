import requests
from security import create_access_token

BASE_URL = "http://127.0.0.1:8014"

token = create_access_token(data={"sub": "2", "role": "faculty"})
headers = {"Authorization": f"Bearer {token}"}

print("--- Testing POST /lab/submissions/1/verify with valid status ---")
res1 = requests.post(f"{BASE_URL}/lab/submissions/1/verify", headers=headers, json={"status": "rejected"})
print(f"Status: {res1.status_code}")

print("\n--- Testing POST /lab/submissions/1/verify with INVALID status 'hacked' ---")
res2 = requests.post(f"{BASE_URL}/lab/submissions/1/verify", headers=headers, json={"status": "hacked"})
print(f"Status: {res2.status_code}")
try:
    print(res2.json())
except:
    print(res2.text)
