from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from models.models import Semester, Enrollment, AttendanceLog, User, ClassSession
from models.schemas import SemesterCreate, SemesterResponse, StudentPromotionMap, EnrollmentResponse

router = APIRouter(prefix="/semesters", tags=["Semesters"])

@router.get("/", response_model=List[SemesterResponse])
def list_semesters(db: Session = Depends(get_db)):
    return db.query(Semester).all()

@router.post("/", response_model=SemesterResponse)
def create_semester(data: SemesterCreate, db: Session = Depends(get_db)):
    semester = Semester(
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
        is_active=False  # Must be explicitly activated
    )
    db.add(semester)
    db.commit()
    db.refresh(semester)
    return semester

@router.post("/{semester_id}/activate", response_model=SemesterResponse)
def activate_semester(semester_id: int, db: Session = Depends(get_db)):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    
    # Deactivate all others
    db.query(Semester).update({Semester.is_active: False})
    
    # Activate the target
    semester.is_active = True
    db.commit()
    db.refresh(semester)
    return semester

@router.post("/{semester_id}/promote-students", response_model=List[EnrollmentResponse])
def promote_students(semester_id: int, data: StudentPromotionMap, db: Session = Depends(get_db)):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
        
    enrollments = []
    for promo in data.promotions:
        # Check if already enrolled to avoid duplicates
        existing = db.query(Enrollment).filter(
            Enrollment.student_id == promo.student_id,
            Enrollment.class_id == promo.class_id,
            Enrollment.semester_id == semester_id
        ).first()
        
        if not existing:
            enrollment = Enrollment(
                student_id=promo.student_id,
                class_id=promo.class_id,
                semester_id=semester_id
            )
            db.add(enrollment)
            enrollments.append(enrollment)
            
    db.commit()
    for e in enrollments:
        db.refresh(e)
        
    return enrollments

@router.get("/{semester_id}/attendance-summary")
def get_attendance_summary(semester_id: int, db: Session = Depends(get_db)):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
        
    logs = db.query(AttendanceLog).filter(AttendanceLog.semester_id == semester_id).all()
    
    result = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        class_session = db.query(ClassSession).filter(ClassSession.id == log.class_id).first()
        result.append({
            "id": log.id,
            "student_name": user.name if user else "Unknown",
            "class_name": class_session.name if class_session else "Unknown",
            "timestamp": log.timestamp
        })
        
    return result
