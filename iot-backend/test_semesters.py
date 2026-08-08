import requests

BASE_URL = "http://localhost:8000"

print("--- 1. Create Fall 2026 ---")
r_fall = requests.post(f"{BASE_URL}/semesters/", json={
    "name": "Fall 2026",
    "start_date": "2026-08-01T00:00:00Z",
    "end_date": "2026-12-15T00:00:00Z"
})
print("Create Fall:", r_fall.status_code, r_fall.json())
fall_id = r_fall.json()["id"]

print("\n--- 2. Activate Fall 2026 ---")
r_act = requests.post(f"{BASE_URL}/semesters/{fall_id}/activate")
print("Activate Fall:", r_act.status_code, r_act.json())

print("\n--- 3. Promote Student to Fall 2026 ---")
# Assume student_id=1, class_id=1 for test data
r_prom = requests.post(f"{BASE_URL}/semesters/{fall_id}/promote-students", json={
    "promotions": [{"student_id": 1, "class_id": 1}]
})
print("Promote Fall:", r_prom.status_code, r_prom.json())

print("\n--- 4. Log Attendance (should map to Fall 2026) ---")
# Using test RFID 'TAG12345' and class_id 1
r_att = requests.post(f"{BASE_URL}/attendance/", json={
    "rfid_tag_id": "TAG12345",
    "class_id": 1
})
print("Log Attendance:", r_att.status_code, r_att.json())

print("\n--- 5. Verify Fall 2026 Attendance Summary ---")
r_sum = requests.get(f"{BASE_URL}/semesters/{fall_id}/attendance-summary")
print("Summary Fall:", r_sum.status_code, r_sum.json())

print("\n--- 6. Create Spring 2027 ---")
r_spring = requests.post(f"{BASE_URL}/semesters/", json={
    "name": "Spring 2027",
    "start_date": "2027-01-10T00:00:00Z",
    "end_date": "2027-05-30T00:00:00Z"
})
print("Create Spring:", r_spring.status_code, r_spring.json())
spring_id = r_spring.json()["id"]

print("\n--- 7. Activate Spring 2027 ---")
r_act2 = requests.post(f"{BASE_URL}/semesters/{spring_id}/activate")
print("Activate Spring:", r_act2.status_code, r_act2.json())

print("\n--- 8. Log Attendance in Spring 2027 ---")
r_att2 = requests.post(f"{BASE_URL}/attendance/", json={
    "rfid_tag_id": "TAG12345",
    "class_id": 1
})
print("Log Attendance 2:", r_att2.status_code, r_att2.json())

print("\n--- 9. Verify Fall 2026 Summary Remains Unchanged ---")
r_sum2 = requests.get(f"{BASE_URL}/semesters/{fall_id}/attendance-summary")
print("Summary Fall Again:", r_sum2.status_code, r_sum2.json())

print("\n--- 10. Verify Spring 2027 Summary ---")
r_sum_sp = requests.get(f"{BASE_URL}/semesters/{spring_id}/attendance-summary")
print("Summary Spring:", r_sum_sp.status_code, r_sum_sp.json())
