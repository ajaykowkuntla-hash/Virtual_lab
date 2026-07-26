from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String)  # "student" or "faculty"
    rfid_tag_id = Column(String, unique=True, index=True, nullable=True)

    # Relationships
    attendance_logs = relationship("AttendanceLog", back_populates="user")
    access_logs = relationship("AccessLog", back_populates="user")
    lab_submissions = relationship("LabSubmission", foreign_keys='LabSubmission.user_id', back_populates="student")

class ClassSession(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    room = Column(String)

    # Relationships
    attendance_logs = relationship("AttendanceLog", back_populates="class_session")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="attendance_logs")
    class_session = relationship("ClassSession", back_populates="attendance_logs")

class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(String) # Storing room name/id directly
    timestamp = Column(DateTime, default=datetime.utcnow)
    granted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="access_logs")

class LabSubmission(Base):
    __tablename__ = "lab_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    experiment_id = Column(String, index=True)
    script_text = Column(Text)
    output = Column(Text, nullable=True)
    status = Column(String, default="pending") # pending, verified, failed
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[user_id], back_populates="lab_submissions")
    faculty_verifier = relationship("User", foreign_keys=[verified_by])
