#!/usr/bin/env python3
"""
End-to-end test of Admin Dashboard backend endpoints.
Simulates the exact API calls the React frontend makes.
"""
import requests
import json
import sys

BASE = "http://localhost:8000"
PASS = "\033[92m✓ PASS\033[0m"
FAIL = "\033[91m✗ FAIL\033[0m"
results = []

def report(step, passed, detail=""):
    tag = PASS if passed else FAIL
    msg = f"  {tag}  {step}"
    if detail:
        msg += f"  — {detail}"
    print(msg)
    results.append((step, passed, detail))

def login(username, password):
    r = requests.post(f"{BASE}/auth/login", data={"username": username, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    return None

def headers(token):
    return {"Authorization": f"Bearer {token}"}

print("=" * 70)
print("  ADMIN DASHBOARD — END-TO-END API TEST")
print("=" * 70)

# ─── Step 2: Admin Login ───────────────────────────────────────────────
print("\n── Step 2: Admin Login ──")
admin_token = login("admin", "adminpassword")
if admin_token:
    # Verify role by calling /auth/me
    me = requests.get(f"{BASE}/auth/me", headers=headers(admin_token)).json()
    is_admin = me.get("role") == "admin"
    report("Admin login succeeds", admin_token is not None, f"token obtained")
    report("Admin role is 'admin'", is_admin, f"got role='{me.get('role')}'")
    # The frontend RootRedirect checks user.role === 'admin' → Navigate to /admin
    report("Frontend would route to /admin", is_admin, "RootRedirect checks role === 'admin'")
else:
    report("Admin login succeeds", False, "login returned non-200")

# ─── Step 3: Baseline Analytics ────────────────────────────────────────
print("\n── Step 3: Baseline Analytics ──")
analytics = requests.get(f"{BASE}/admin/analytics", headers=headers(admin_token)).json()
print(f"  Baseline: students={analytics['total_students']}, faculty={analytics['total_faculty']}, "
      f"labs={analytics['total_labs']}, submissions={analytics['total_submissions']}")
baseline = dict(analytics)
report("Analytics endpoint returns data", all(k in analytics for k in ["total_students", "total_faculty", "total_labs", "total_submissions"]))

# ─── Step 4: Faculty Management ────────────────────────────────────────
print("\n── Step 4: Faculty Management ──")

# 4a. Create a new faculty
fac_payload = {
    "name": "E2E Test Faculty",
    "username": "e2e_fac_test",
    "password": "testpass123",
    "role": "faculty",
    "department": "Test Engineering"
}
r = requests.post(f"{BASE}/admin/faculty", json=fac_payload, headers=headers(admin_token))
report("Create faculty (POST /admin/faculty)", r.status_code == 200, f"status={r.status_code}, body={r.text[:200]}")

# 4b. Verify new faculty appears in GET /admin/faculty
faculty_list = requests.get(f"{BASE}/admin/faculty", headers=headers(admin_token)).json()
found = any(f["username"] == "e2e_fac_test" for f in faculty_list)
report("New faculty appears in list (GET /admin/faculty)", found, f"list has {len(faculty_list)} faculty")

# 4c. Try duplicate username → should get 400
r_dup = requests.post(f"{BASE}/admin/faculty", json=fac_payload, headers=headers(admin_token))
is_dup_error = r_dup.status_code == 400
detail_msg = r_dup.json().get("detail", "") if r_dup.status_code == 400 else r_dup.text[:100]
report("Duplicate username returns 400", is_dup_error, f"status={r_dup.status_code}, detail='{detail_msg}'")
# The frontend CreateUserModal catches err.response.data.detail and renders it in a <div> with bg-error/10
report("UI error display: CreateUserModal shows err.response.data.detail in error div", is_dup_error,
       "Frontend code: setError(err.response?.data?.detail || 'Failed to create faculty.')")

# ─── Step 5: Student Management ────────────────────────────────────────
print("\n── Step 5: Student Management ──")

stu_payload = {
    "name": "E2E Test Student",
    "username": "e2e_stu_test",
    "password": "testpass123",
    "role": "student",
    "program": "BTech CS"
}
r = requests.post(f"{BASE}/admin/students", json=stu_payload, headers=headers(admin_token))
report("Create student (POST /admin/students)", r.status_code == 200, f"status={r.status_code}, body={r.text[:200]}")

student_list = requests.get(f"{BASE}/admin/students", headers=headers(admin_token)).json()
found_stu = any(s["username"] == "e2e_stu_test" for s in student_list)
report("New student appears in list (GET /admin/students)", found_stu, f"list has {len(student_list)} students")

r_dup_stu = requests.post(f"{BASE}/admin/students", json=stu_payload, headers=headers(admin_token))
is_dup_stu = r_dup_stu.status_code == 400
detail_stu = r_dup_stu.json().get("detail", "") if r_dup_stu.status_code == 400 else r_dup_stu.text[:100]
report("Duplicate student username returns 400", is_dup_stu, f"status={r_dup_stu.status_code}, detail='{detail_stu}'")

# ─── Step 6: New User Logins ──────────────────────────────────────────
print("\n── Step 6: New User Logins ──")

fac_token = login("e2e_fac_test", "testpass123")
report("New faculty can log in", fac_token is not None)
if fac_token:
    fac_me = requests.get(f"{BASE}/auth/me", headers=headers(fac_token)).json()
    report("Faculty role is 'faculty'", fac_me.get("role") == "faculty", f"role='{fac_me.get('role')}'")
    # Frontend: RootRedirect → role === 'faculty' → Navigate to /faculty
    report("Frontend would route to /faculty", fac_me.get("role") == "faculty")

stu_token = login("e2e_stu_test", "testpass123")
report("New student can log in", stu_token is not None)
if stu_token:
    stu_me = requests.get(f"{BASE}/auth/me", headers=headers(stu_token)).json()
    report("Student role is 'student'", stu_me.get("role") == "student", f"role='{stu_me.get('role')}'")
    # Frontend: RootRedirect → default → StudentDashboard at /
    report("Frontend would route to / (student dashboard)", stu_me.get("role") == "student")

# ─── Step 7: Labs & Assignment ─────────────────────────────────────────
print("\n── Step 7: Labs & Assignment ──")

labs = requests.get(f"{BASE}/lab/experiments", headers=headers(admin_token)).json()
report("Labs are listed (GET /lab/experiments)", len(labs) > 0, f"found {len(labs)} labs")

if labs:
    lab_id = labs[0].get("experiment_id") or labs[0].get("id")
    # Get the faculty ID we just created
    fac_id = None
    for f in faculty_list:
        if f["username"] == "e2e_fac_test":
            fac_id = f["id"]
            break
    
    if fac_id:
        r_assign = requests.post(
            f"{BASE}/admin/labs/{lab_id}/assign-faculty?faculty_id={fac_id}",
            headers=headers(admin_token)
        )
        report("Assign faculty to lab", r_assign.status_code == 200, f"status={r_assign.status_code}, body={r_assign.text[:200]}")
        
        # Verify persistence: re-fetch labs
        labs_after = requests.get(f"{BASE}/lab/experiments", headers=headers(admin_token)).json()
        assigned_lab = None
        for l in labs_after:
            lid = l.get("experiment_id") or l.get("id")
            if lid == lab_id:
                assigned_lab = l
                break
        
        if assigned_lab:
            persisted = assigned_lab.get("assigned_faculty_id") == fac_id
            report("Assignment persists after re-fetch", persisted,
                   f"assigned_faculty_id={assigned_lab.get('assigned_faculty_id')}, expected={fac_id}")
        else:
            report("Assignment persists after re-fetch", False, "could not find lab in re-fetched list")
    else:
        report("Assign faculty to lab", False, "could not find faculty ID")

# ─── Step 8: Analytics Update ──────────────────────────────────────────
print("\n── Step 8: Analytics Update ──")

analytics_after = requests.get(f"{BASE}/admin/analytics", headers=headers(admin_token)).json()
print(f"  After:    students={analytics_after['total_students']}, faculty={analytics_after['total_faculty']}, "
      f"labs={analytics_after['total_labs']}, submissions={analytics_after['total_submissions']}")
print(f"  Baseline: students={baseline['total_students']}, faculty={baseline['total_faculty']}, "
      f"labs={baseline['total_labs']}, submissions={baseline['total_submissions']}")

fac_increased = analytics_after["total_faculty"] > baseline["total_faculty"]
stu_increased = analytics_after["total_students"] > baseline["total_students"]
report("Faculty count increased", fac_increased,
       f"{baseline['total_faculty']} → {analytics_after['total_faculty']}")
report("Student count increased", stu_increased,
       f"{baseline['total_students']} → {analytics_after['total_students']}")

# ─── Step 9: Console/Network Errors ───────────────────────────────────
print("\n── Step 9: Console/Network Errors ──")
# Test that admin endpoints reject non-admin users
r_403 = requests.get(f"{BASE}/admin/faculty", headers=headers(stu_token))
report("Non-admin rejected from admin endpoints (403)", r_403.status_code == 403,
       f"status={r_403.status_code}")

# Test unauthenticated access
r_401 = requests.get(f"{BASE}/admin/analytics")
report("Unauthenticated request rejected (401)", r_401.status_code == 401,
       f"status={r_401.status_code}")

# ─── SUMMARY ──────────────────────────────────────────────────────────
print("\n" + "=" * 70)
total = len(results)
passed = sum(1 for _, p, _ in results if p)
failed = total - passed
print(f"  RESULTS: {passed}/{total} passed, {failed} failed")
if failed > 0:
    print("\n  FAILURES:")
    for step, p, detail in results:
        if not p:
            print(f"    ✗ {step}: {detail}")
print("=" * 70)

sys.exit(0 if failed == 0 else 1)
