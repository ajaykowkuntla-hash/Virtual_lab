from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from models.database import get_db
from models.models import User, AttendanceLog, ClassSession, AccessLog
from models.schemas import AttendanceCreate, AttendanceResponse, AttendanceSuccessResponse, AccessLogResponse, AccessCreate, AccessSuccessResponse
from dependencies import get_current_faculty

router = APIRouter(prefix="/attendance", tags=["Attendance"])
access_router = APIRouter(prefix="/access", tags=["Access"])

@router.post("/", response_model=AttendanceSuccessResponse)
def log_attendance(data: AttendanceCreate, db: Session = Depends(get_db)):
    # 1. Look up the user by rfid_tag_id
    user = db.query(User).filter(User.rfid_tag_id == data.rfid_tag_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Error: RFID tag not recognized."
        )

    # 2. Verify the class exists (Optional, but good practice)
    class_session = db.query(ClassSession).filter(ClassSession.id == data.class_id).first()
    if not class_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Error: Class ID {data.class_id} not found."
        )

    # 3. Create the attendance log
    new_log = AttendanceLog(
        user_id=user.id,
        class_id=data.class_id,
        timestamp=data.timestamp or datetime.utcnow()
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return AttendanceSuccessResponse(
        success=True,
        message=f"Attendance logged successfully for {user.name}",
        log=new_log
    )

@router.get("/{class_id}", response_model=List[AttendanceResponse])
def get_class_attendance(class_id: int, db: Session = Depends(get_db)):
    # Fetch all logs for the given class_id
    logs = db.query(AttendanceLog).filter(AttendanceLog.class_id == class_id).all()
    
    if not logs:
        # Returning an empty list is also fine, but a 404 is clear if the class has no logs yet.
        # However, typically a GET returning a list should just return [] if empty.
        return []
        
    return logs

@access_router.post("/", response_model=AccessSuccessResponse)
def log_access(data: AccessCreate, db: Session = Depends(get_db)):
    # 1. Look up the user by rfid_tag_id
    user = db.query(User).filter(User.rfid_tag_id == data.rfid_tag_id).first()
    
    granted = user is not None
    user_id = user.id if user else None

    # 2. Create the access log
    new_log = AccessLog(
        user_id=user_id,
        room_id=data.room_id,
        timestamp=data.timestamp or datetime.utcnow(),
        granted=granted
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    if not granted:
        # Return 404 as requested if not found, but AFTER logging it
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Error: RFID tag not recognized."
        )

    return AccessSuccessResponse(
        success=True,
        message=f"Access granted for {user.name}",
        log=new_log
    )

@access_router.get("/{room_id}", response_model=List[AccessLogResponse])
def get_room_access_logs(
    room_id: str, 
    db: Session = Depends(get_db),
    current_faculty: User = Depends(get_current_faculty)
):
    logs = db.query(AccessLog).filter(AccessLog.room_id == room_id).order_by(AccessLog.timestamp.desc()).all()
    return logs
