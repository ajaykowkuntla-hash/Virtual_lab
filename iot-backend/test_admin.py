from fastapi.testclient import TestClient
from main import app
from models.database import SessionLocal
from models.models import User
from security import get_password_hash

client = TestClient(app)

def test_admin_flow():
    # 1. Login as admin
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "adminpassword"}
    )
    assert response.status_code == 200, "Admin login failed"
    admin_token = response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Test GET /admin/analytics (should work)
    res = client.get("/admin/analytics", headers=admin_headers)
    assert res.status_code == 200
    print("GET /admin/analytics SUCCESS:", res.json())
    
    # 3. Create a faculty user
    new_faculty = {
        "name": "New Professor",
        "username": "newprof",
        "password": "profpassword",
        "role": "faculty",
        "department": "Computer Science"
    }
    res = client.post("/admin/faculty", json=new_faculty, headers=admin_headers)
    assert res.status_code == 200, f"Failed to create faculty: {res.text}"
    print("POST /admin/faculty SUCCESS:", res.json())
    
    # 4. Create a student user
    new_student = {
        "name": "New Student",
        "username": "newstudent",
        "password": "studentpassword",
        "role": "student",
        "program": "BTech CS"
    }
    res = client.post("/admin/students", json=new_student, headers=admin_headers)
    assert res.status_code == 200, f"Failed to create student: {res.text}"
    print("POST /admin/students SUCCESS:", res.json())
    
    # 5. Test logging in as the new faculty
    res = client.post(
        "/auth/login",
        data={"username": "newprof", "password": "profpassword"}
    )
    assert res.status_code == 200
    faculty_token = res.json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}
    print("LOGIN new faculty SUCCESS")
    
    # 6. Test logging in as the new student
    res = client.post(
        "/auth/login",
        data={"username": "newstudent", "password": "studentpassword"}
    )
    assert res.status_code == 200
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("LOGIN new student SUCCESS")
    
    # 7. Test 403 on admin routes using faculty token
    res = client.get("/admin/analytics", headers=faculty_headers)
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print("FACULTY 403 test SUCCESS")
    
    # 8. Test 403 on admin routes using student token
    res = client.get("/admin/analytics", headers=student_headers)
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print("STUDENT 403 test SUCCESS")

if __name__ == "__main__":
    test_admin_flow()
    print("All tests passed!")
