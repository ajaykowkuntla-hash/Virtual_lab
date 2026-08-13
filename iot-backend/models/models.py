from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String)  # "student" or "faculty" or "admin"
    rfid_tag_id = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    program = Column(String, nullable=True)
    email = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    
    # New Fields
    employee_id = Column(String, unique=True, index=True, nullable=True)
    roll_number = Column(String, unique=True, index=True, nullable=True)
    designation = Column(String, nullable=True)
    status = Column(String, default="Active")

    # Relationships
    attendance_logs = relationship("AttendanceLog", back_populates="user")
    access_logs = relationship("AccessLog", back_populates="user")
    lab_submissions = relationship("LabSubmission", foreign_keys='LabSubmission.user_id', back_populates="student")

class ClassSession(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    room = Column(String)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)

    # Relationships
    attendance_logs = relationship("AttendanceLog", back_populates="class_session")
    course = relationship("Course")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="attendance_logs")
    class_session = relationship("ClassSession", back_populates="attendance_logs")
    semester = relationship("Semester")

class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(String) # Storing room name/id directly
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    granted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="access_logs")
    semester = relationship("Semester")

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    lab_type = Column(String)
    expected_output = Column(Text, nullable=True)
    tolerance = Column(Float, default=0.01)
    created_at = Column(DateTime, default=datetime.utcnow)
    assigned_faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=True)

    submissions = relationship("LabSubmission", back_populates="experiment_ref")
    faculty_owner = relationship("User")
    lab = relationship("Lab")

class LabSubmission(Base):
    __tablename__ = "lab_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    experiment_id = Column(String, ForeignKey("experiments.id"), index=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=True)
    script_text = Column(Text)
    workspace_snapshot = Column(Text, nullable=True)
    circuit_data = Column(Text, nullable=True)
    output = Column(Text, nullable=True)
    status = Column(String, default="pending") # pending, verified, failed
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[user_id], back_populates="lab_submissions")
    faculty_verifier = relationship("User", foreign_keys=[verified_by])
    experiment_ref = relationship("Experiment", back_populates="submissions")
    semester = relationship("Semester")

class Semester(Base):
    __tablename__ = "semesters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=False)

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"))
    
    # New Fields
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=True)
    assigned_faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    student = relationship("User", foreign_keys=[student_id])
    class_session = relationship("ClassSession")
    semester = relationship("Semester")
    course = relationship("Course")
    lab = relationship("Lab")
    assigned_faculty = relationship("User", foreign_keys=[assigned_faculty_id])

class FacultyAssignment(Base):
    __tablename__ = "faculty_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=True)
    
    # New Field
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=True)

    faculty = relationship("User")
    class_session = relationship("ClassSession")
    semester = relationship("Semester")
    course = relationship("Course")
    lab = relationship("Lab")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    date = Column(String, index=True) # YYYY-MM-DD
    time = Column(String)
    location = Column(String)
    type = Column(String) # 'blue' or 'pink'
    created_by = Column(Integer, ForeignKey("users.id"))
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=True)

    creator = relationship("User")
    semester = relationship("Semester")

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    date = Column(String, index=True) # YYYY-MM-DD for UI compatibility
    time = Column(String) # e.g. "10:00 AM" for UI compatibility
    location = Column(String)
    type = Column(String, default="blue") # 'blue' or 'pink' for UI compatibility
    created_by = Column(Integer, ForeignKey("users.id"))
    target_role = Column(String, nullable=True) # "all", "faculty", "student"
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User")
    course = relationship("Course")
    lab = relationship("Lab")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    target_role = Column(String, nullable=True) # "faculty", "student"
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    author = relationship("User")
    course = relationship("Course")
    lab = relationship("Lab")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    semester_id = Column(Integer, ForeignKey("semesters.id"))

    department = relationship("Department")
    semester = relationship("Semester")

class Lab(Base):
    __tablename__ = "labs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship("Course")
