import requests
from security import create_access_token

BASE_URL = "http://127.0.0.1:8011"

# 1. Hit POST /access/ with a bad tag
print("--- 1. POST /access/ with BAD_TAG ---")
res1 = requests.post(f"{BASE_URL}/access/", json={"rfid_tag_id": "BAD_TAG_TEST", "room_id": "LAB_101"})
print(f"Status: {res1.status_code}")
print(res1.json())

# 2. Get a JWT token manually to call the protected GET endpoint
token = create_access_token(data={"sub": "2", "role": "faculty"})

print("\n--- 2. GET /access/LAB_101 (Should return the denied entry without crashing) ---")
res2 = requests.get(f"{BASE_URL}/access/LAB_101", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {res2.status_code}")
print(res2.json())
