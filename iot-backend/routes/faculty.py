from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from models.models import Semester, FacultyAssignment, User, ClassSession, Enrollment, LabSubmission, Experiment, CalendarEvent
from models.schemas import FacultyAssignmentCreate, FacultyAssignmentResponse, UserResponse
from dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/faculty", tags=["Faculty"])

@router.post("/{faculty_id}/assignments", response_model=FacultyAssignmentResponse)
def set_faculty_assignment(
    faculty_id: int, 
    data: FacultyAssignmentCreate, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    faculty = db.query(User).filter(User.id == faculty_id, User.role == "faculty").first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    active_semester = db.query(Semester).filter(Semester.is_active == True).first()
    if not active_semester:
        raise HTTPException(status_code=400, detail="No active semester found to assign to.")

    existing = db.query(FacultyAssignment).filter(
        FacultyAssignment.faculty_id == faculty_id,
        FacultyAssignment.class_id == data.class_id,
        FacultyAssignment.semester_id == active_semester.id
    ).first()

    if existing:
        existing.course_id = data.course_id
        assignment = existing
    else:
        assignment = FacultyAssignment(
            faculty_id=faculty_id,
            class_id=data.class_id,
            course_id=data.course_id,
            semester_id=active_semester.id
        )
        db.add(assignment)

    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/students", response_model=List[UserResponse])
def list_assigned_students(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view assigned students")
    student_ids = db.query(Enrollment.student_id).filter(Enrollment.assigned_faculty_id == current_user.id).all()
    id_list = [r[0] for r in student_ids]
    return db.query(User).filter(User.id.in_(id_list)).all()

@router.get("/analytics")
def get_faculty_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view analytics")
        
    assigned_labs_count = db.query(FacultyAssignment.lab_id).filter(
        FacultyAssignment.faculty_id == current_user.id,
        FacultyAssignment.lab_id != None
    ).distinct().count()
    
    assigned_students_count = db.query(Enrollment.student_id).filter(
        Enrollment.assigned_faculty_id == current_user.id
    ).distinct().count()
    
    assigned_labs_query = db.query(FacultyAssignment.lab_id).filter(
        FacultyAssignment.faculty_id == current_user.id
    ).all()
    assigned_lab_ids = [r[0] for r in assigned_labs_query if r[0] is not None]
    
    experiments_query = db.query(Experiment.id).filter(Experiment.lab_id.in_(assigned_lab_ids)).all()
    exp_ids = [r[0] for r in experiments_query]
    
    pending_submissions = db.query(LabSubmission).filter(
        LabSubmission.experiment_id.in_(exp_ids),
        LabSubmission.status == "pending"
    ).count()
    
    upcoming_events = db.query(CalendarEvent).filter(
        (CalendarEvent.created_by == current_user.id) |
        (CalendarEvent.lab_id.in_(assigned_lab_ids))
    ).count()
    
    recent_activity_count = db.query(LabSubmission).filter(
        LabSubmission.experiment_id.in_(exp_ids)
    ).count()
    
    return {
        "assigned_labs": assigned_labs_count,
        "assigned_students": assigned_students_count,
        "pending_submissions": pending_submissions,
        "upcoming_events": upcoming_events,
        "recent_activity_count": recent_activity_count
    }
