import requests
from security import create_access_token

BASE_URL = "http://127.0.0.1:8013"

# Craft a token with a non-numeric string for "sub"
bad_token = create_access_token(data={"sub": "admin_hacker", "role": "faculty"})

print("--- Testing GET /access/LAB_101 with malicious string 'sub' ---")
res = requests.get(f"{BASE_URL}/access/LAB_101", headers={"Authorization": f"Bearer {bad_token}"})
print(f"Status: {res.status_code}")
try:
    print(res.json())
except:
    print(res.text)
