from fastapi.testclient import TestClient
from main import app
from models.database import Base, engine, SessionLocal
from models.models import User
from security import get_password_hash
import pytest

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(User).filter(User.username == "admin_analytics_test").first()
    if not admin:
        admin = User(name="Admin", username="admin_analytics_test", hashed_password=get_password_hash("password"), role="admin")
        db.add(admin)
        
    fac = db.query(User).filter(User.username == "fac_analytics_test").first()
    if not fac:
        fac = User(name="Faculty", username="fac_analytics_test", hashed_password=get_password_hash("password"), role="faculty")
        db.add(fac)
        
    stu = db.query(User).filter(User.username == "stu_analytics_test").first()
    if not stu:
        stu = User(name="Student", username="stu_analytics_test", hashed_password=get_password_hash("password"), role="student")
        db.add(stu)
        
    db.commit()
    db.close()
    yield
    # We do not drop tables because tests use the same DB

def get_token(username):
    response = client.post("/auth/login", data={"username": username, "password": "password"})
    return response.json()["access_token"]

def test_admin_analytics(setup_database):
    token = get_token("admin_analytics_test")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Admin should access admin endpoint
    res = client.get("/analytics/admin", headers=headers)
    assert res.status_code == 200
    assert "summary" in res.json()
    assert "total_students" in res.json()["summary"]
    
    # Admin should NOT access faculty endpoint
    res = client.get("/analytics/faculty", headers=headers)
    assert res.status_code == 403
    
def test_faculty_analytics(setup_database):
    token = get_token("fac_analytics_test")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Faculty should access faculty endpoint
    res = client.get("/analytics/faculty", headers=headers)
    assert res.status_code == 200
    
    # Faculty should NOT access admin endpoint
    res = client.get("/analytics/admin", headers=headers)
    assert res.status_code == 403

def test_student_analytics(setup_database):
    token = get_token("stu_analytics_test")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Student should access student endpoint
    res = client.get("/analytics/student", headers=headers)
    assert res.status_code == 200
    
    # Student should NOT access admin or faculty endpoint
    res = client.get("/analytics/admin", headers=headers)
    assert res.status_code == 403
    
    res = client.get("/analytics/faculty", headers=headers)
    assert res.status_code == 403

def test_unauthenticated_analytics():
    # Unauthenticated should be rejected from all
    assert client.get("/analytics/admin").status_code == 401
    assert client.get("/analytics/faculty").status_code == 401
    assert client.get("/analytics/student").status_code == 401
