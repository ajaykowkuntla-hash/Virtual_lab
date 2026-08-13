from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from models.database import get_db
from models.models import CalendarEvent, User, Enrollment, FacultyAssignment, Lab, Semester
from models.schemas import CalendarEventCreate, CalendarEventResponse
from dependencies import get_current_user
from datetime import datetime

router = APIRouter(tags=["events"])

@router.get("/events", response_model=List[CalendarEventResponse])
@router.get("/calendar/events", response_model=List[CalendarEventResponse])
def get_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        return db.query(CalendarEvent).all()
        
    if current_user.role == "faculty":
        assigned_labs_query = db.query(FacultyAssignment.lab_id).filter(FacultyAssignment.faculty_id == current_user.id).all()
        assigned_lab_ids = [r[0] for r in assigned_labs_query if r[0] is not None]
        
        return db.query(CalendarEvent).filter(
            (CalendarEvent.created_by == current_user.id) |
            (CalendarEvent.target_role.in_(["all", "faculty"])) |
            (CalendarEvent.lab_id.in_(assigned_lab_ids))
        ).all()
        
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).first()
        if not enrollment:
            return db.query(CalendarEvent).filter(
                CalendarEvent.target_role.in_(["all", "student"]),
                CalendarEvent.course_id == None,
                CalendarEvent.lab_id == None
            ).all()
            
        return db.query(CalendarEvent).filter(
            (CalendarEvent.target_role.in_(["all", "student"])) |
            (CalendarEvent.course_id == enrollment.course_id) |
            (CalendarEvent.lab_id == enrollment.lab_id) |
            ((CalendarEvent.created_by == enrollment.assigned_faculty_id) & CalendarEvent.target_role.in_(["all", "student"]))
        ).all()

    return []

@router.post("/events", response_model=CalendarEventResponse)
@router.post("/calendar/events", response_model=CalendarEventResponse)
def create_event(
    event_in: CalendarEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Not authorized to create events")
        
    if current_user.role == "faculty":
        assigned_labs_query = db.query(FacultyAssignment.lab_id).filter(FacultyAssignment.faculty_id == current_user.id).all()
        assigned_lab_ids = [r[0] for r in assigned_labs_query if r[0] is not None]
        
        if event_in.lab_id is not None and event_in.lab_id not in assigned_lab_ids:
            raise HTTPException(status_code=400, detail="Cannot create event for a lab not assigned to you")
            
        if event_in.course_id is not None:
            assigned_courses_query = db.query(Lab.course_id).filter(Lab.id.in_(assigned_lab_ids)).all()
            assigned_course_ids = [r[0] for r in assigned_courses_query]
            if event_in.course_id not in assigned_course_ids:
                raise HTTPException(status_code=400, detail="Cannot create event for a course not assigned to you")
                
    db_event = CalendarEvent(
        title=event_in.title,
        description=event_in.description,
        start_time=event_in.start_time,
        end_time=event_in.end_time,
        date=event_in.date,
        time=event_in.time,
        location=event_in.location,
        type=event_in.type,
        created_by=current_user.id,
        target_role=event_in.target_role,
        course_id=event_in.course_id,
        lab_id=event_in.lab_id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/events/{event_id}", response_model=CalendarEventResponse)
@router.put("/calendar/events/{event_id}", response_model=CalendarEventResponse)
def update_event(
    event_id: int,
    event_in: CalendarEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and db_event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")
        
    db_event.title = event_in.title
    db_event.description = event_in.description
    db_event.start_time = event_in.start_time
    db_event.end_time = event_in.end_time
    db_event.date = event_in.date
    db_event.time = event_in.time
    db_event.location = event_in.location
    db_event.type = event_in.type
    db_event.target_role = event_in.target_role
    db_event.course_id = event_in.course_id
    db_event.lab_id = event_in.lab_id
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/events/{event_id}")
@router.delete("/calendar/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and db_event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
    db.delete(db_event)
    db.commit()
    return {"success": True, "message": "Event deleted successfully"}
