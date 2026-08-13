from models.database import Base, engine, SessionLocal
from models.models import User, ClassSession, Experiment, Semester, Department, Course, Lab, FacultyAssignment, Enrollment, CalendarEvent, Announcement
from security import get_password_hash
from datetime import datetime

def seed():
    db = SessionLocal()
    
    # Drop and recreate tables because we changed the schema
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 1. Active Semester
    print("Seeding Semester...")
    semester = Semester(
        name="Fall 2026",
        start_date=datetime(2026, 8, 1),
        end_date=datetime(2026, 12, 15),
        is_active=True
    )
    db.add(semester)
    db.commit()
    db.refresh(semester)

    # 2. Department
    print("Seeding Department...")
    dept = Department(name="ECE")
    db.add(dept)
    db.commit()
    db.refresh(dept)

    # 3. Course
    print("Seeding Course...")
    course = Course(name="DSP", department_id=dept.id, semester_id=semester.id)
    db.add(course)
    db.commit()
    db.refresh(course)

    # 4. Lab
    print("Seeding Lab...")
    lab = Lab(name="DSP Lab", course_id=course.id)
    db.add(lab)
    db.commit()
    db.refresh(lab)

    # 5. Users
    print("Seeding Users...")
    student = User(
        name="Alex", 
        role="student", 
        rfid_tag_id="TAG12345", 
        username="student1",
        hashed_password=get_password_hash("password123"),
        roll_number="STU001",
        department="ECE",
        status="Active"
    )
    faculty = User(
        name="Dr. Vance", 
        role="faculty", 
        rfid_tag_id="FAC999", 
        username="drvance",
        hashed_password=get_password_hash("securepassword"),
        employee_id="FAC001",
        designation="Professor",
        department="ECE",
        status="Active"
    )
    drsmith = User(
        name="Dr. Smith",
        role="faculty",
        rfid_tag_id="FAC888",
        username="drsmith",
        hashed_password=get_password_hash("password123"),
        employee_id="FAC002",
        designation="Assistant Professor",
        department="ECE",
        status="Active"
    )
    admin = User(
        name="Admin",
        role="admin",
        rfid_tag_id="ADM000",
        username="admin",
        hashed_password=get_password_hash("adminpassword"),
        status="Active"
    )
    db.add_all([student, faculty, drsmith, admin])
    db.commit()
    db.refresh(student)
    db.refresh(faculty)
    db.refresh(drsmith)
    db.refresh(admin)
        
    # 6. Faculty Assignment
    print("Seeding Faculty Assignment...")
    fa = FacultyAssignment(
        faculty_id=faculty.id,
        lab_id=lab.id,
        course_id=course.id,
        semester_id=semester.id
    )
    db.add(fa)
    db.commit()

    # 7. Student Enrollment
    print("Seeding Student Enrollment...")
    enrollment = Enrollment(
        student_id=student.id,
        semester_id=semester.id,
        course_id=course.id,
        lab_id=lab.id,
        assigned_faculty_id=faculty.id
    )
    db.add(enrollment)
    db.commit()

    # 8. ClassSession
    print("Seeding Classes...")
    dsp_class = ClassSession(name="DSP Virtual Lab", room="Lab 101", course_id=course.id)
    db.add(dsp_class)
    db.commit()
        
    # 9. Experiment
    print("Seeding Experiments...")
    exp1 = Experiment(
        id="exp_1_dsp",
        title="DSP Lab 1: Sine Wave",
        description="Generate and analyze a mixed signal in the time and frequency domains.",
        lab_type="matlab_execution",
        expected_output="[0.0, 0.30902, 0.58779, 0.80902, 0.95106]",
        tolerance=0.01,
        lab_id=lab.id,
        assigned_faculty_id=faculty.id
    )
    db.add(exp1)
    db.commit()
    
    # 10. Calendar Events
    print("Seeding Calendar Events...")
    event = CalendarEvent(
        title="DSP Lab Test",
        description="End semester DSP practical evaluation.",
        start_time=datetime(2026, 10, 15, 14, 0, 0),
        end_time=datetime(2026, 10, 15, 16, 0, 0),
        date="2026-10-15",
        time="02:00 PM",
        location="Virtual Lab 1",
        type="pink",
        created_by=faculty.id,
        target_role="student",
        lab_id=lab.id,
        course_id=course.id
    )
    db.add(event)
    db.commit()

    # 11. Announcements
    print("Seeding Announcements...")
    ann = Announcement(
        title="IoT Lab Schedule Updated",
        content="Tomorrow's lab starts at 2:00 PM.",
        author_id=faculty.id,
        target_role="student",
        course_id=course.id,
        lab_id=lab.id
    )
    db.add(ann)
    db.commit()
        
    db.close()
    print("Seeding complete. Hierarchy linked.")

if __name__ == "__main__":
    seed()
