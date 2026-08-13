from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from models.database import get_db
from models.models import Announcement, User, Enrollment, FacultyAssignment, Lab
from models.schemas import AnnouncementCreate, AnnouncementResponse
from dependencies import get_current_user

router = APIRouter(prefix="/announcements", tags=["announcements"])

@router.get("", response_model=List[AnnouncementResponse])
def get_announcements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        return db.query(Announcement).all()
        
    if current_user.role == "faculty":
        return db.query(Announcement).filter(
            (Announcement.author_id == current_user.id) |
            (Announcement.target_role == "faculty") |
            (Announcement.target_role == "all")
        ).all()
        
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).first()
        if not enrollment:
            return db.query(Announcement).filter(
                Announcement.target_role.in_(["all", "student"]),
                Announcement.course_id == None,
                Announcement.lab_id == None
            ).all()
            
        return db.query(Announcement).filter(
            (Announcement.target_role.in_(["all", "student"])) & (
                (Announcement.course_id == enrollment.course_id) |
                (Announcement.lab_id == enrollment.lab_id) |
                (Announcement.author_id == enrollment.assigned_faculty_id) |
                ((Announcement.course_id == None) & (Announcement.lab_id == None))
            )
        ).all()
        
    return []

@router.post("", response_model=AnnouncementResponse)
def create_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Not authorized to create announcements")
        
    if current_user.role == "faculty":
        assigned_labs_query = db.query(FacultyAssignment.lab_id).filter(FacultyAssignment.faculty_id == current_user.id).all()
        assigned_lab_ids = [r[0] for r in assigned_labs_query if r[0] is not None]
        
        if data.lab_id is not None and data.lab_id not in assigned_lab_ids:
            raise HTTPException(status_code=400, detail="Cannot post to a lab not assigned to you")
            
        if data.course_id is not None:
            assigned_courses_query = db.query(Lab.course_id).filter(Lab.id.in_(assigned_lab_ids)).all()
            assigned_course_ids = [r[0] for r in assigned_courses_query]
            if data.course_id not in assigned_course_ids:
                raise HTTPException(status_code=400, detail="Cannot post to a course not assigned to you")
                
    db_announcement = Announcement(
        title=data.title,
        content=data.content,
        author_id=current_user.id,
        target_role=data.target_role,
        course_id=data.course_id,
        lab_id=data.lab_id
    )
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    return db_announcement

@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not db_ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if current_user.role != "admin" and db_ann.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this announcement")
    db.delete(db_ann)
    db.commit()
    return {"success": True, "message": "Announcement deleted successfully"}
