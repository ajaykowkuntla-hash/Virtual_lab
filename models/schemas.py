from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Request schema for POST /attendance
class AttendanceCreate(BaseModel):
    rfid_tag_id: str
    class_id: int
    timestamp: Optional[datetime] = None

# Response schema for returning an attendance log
class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    class_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Response schema for successful attendance logging
class AttendanceSuccessResponse(BaseModel):
    success: bool
    message: str
    log: AttendanceResponse

# Request schema for POST /lab/submit
class LabSubmitRequest(BaseModel):
    user_id: int
    experiment_id: str
    script_text: str

# Response schema for POST /lab/submit
class LabSubmitResponse(BaseModel):
    success: bool
    status: str
    logs: str
    plot_b64: Optional[str] = None

class LabSubmissionResponse(BaseModel):
    id: int
    user_id: int
    experiment_id: str
    script_text: str
    output: Optional[str]
    status: str
    verified_by: Optional[int]
    submitted_at: datetime

    class Config:
        from_attributes = True

class LabVerifyRequest(BaseModel):
    status: str # 'verified' or 'rejected'

class AccessLogResponse(BaseModel):
    id: int
    user_id: int
    room_id: str
    timestamp: datetime
    granted: bool

    class Config:
        from_attributes = True

class AccessCreate(BaseModel):
    rfid_tag_id: str
    room_id: str
    timestamp: Optional[datetime] = None

class AccessSuccessResponse(BaseModel):
    success: bool
    message: str
    log: AccessLogResponse
