from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from models.models import Semester, FacultyAssignment, User, ClassSession
from models.schemas import FacultyAssignmentCreate, FacultyAssignmentResponse

router = APIRouter(prefix="/faculty", tags=["Faculty"])

@router.post("/{faculty_id}/assignments", response_model=FacultyAssignmentResponse)
def set_faculty_assignment(faculty_id: int, data: FacultyAssignmentCreate, db: Session = Depends(get_db)):
    # 1. Verify faculty exists
    faculty = db.query(User).filter(User.id == faculty_id, User.role == "faculty").first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    # 2. Get active semester
    active_semester = db.query(Semester).filter(Semester.is_active == True).first()
    if not active_semester:
        raise HTTPException(status_code=400, detail="No active semester found to assign to.")

    # 3. Create or update assignment for this active semester
    existing = db.query(FacultyAssignment).filter(
        FacultyAssignment.faculty_id == faculty_id,
        FacultyAssignment.class_id == data.class_id,
        FacultyAssignment.semester_id == active_semester.id
    ).first()

    if existing:
        existing.subject = data.subject
        assignment = existing
    else:
        assignment = FacultyAssignment(
            faculty_id=faculty_id,
            class_id=data.class_id,
            subject=data.subject,
            semester_id=active_semester.id
        )
        db.add(assignment)

    db.commit()
    db.refresh(assignment)
    return assignment
