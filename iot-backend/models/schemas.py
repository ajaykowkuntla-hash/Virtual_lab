from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal

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
    workspace_snapshot: Optional[str]
    circuit_data: Optional[str]
    output: Optional[str]
    status: str
    verified_by: Optional[int]
    submitted_at: datetime

    class Config:
        from_attributes = True

class LabVerifyRequest(BaseModel):
    status: Literal["verified", "rejected"]

class AccessLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
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

class ExperimentCreate(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    lab_type: str
    expected_output: Optional[str] = None
    tolerance: float = 0.01

class ExperimentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    lab_type: str
    expected_output: Optional[str]
    tolerance: float
    created_at: datetime

    class Config:
        from_attributes = True

class CodeExecuteRequest(BaseModel):
    language: str
    source_code: str
    stdin: Optional[str] = None
    filename: Optional[str] = None

class CodeExecuteResponse(BaseModel):
    stdout: Optional[str]
    stderr: Optional[str]
    compile_output: Optional[str]
    exit_status: int
    execution_time: float

class UserResponse(BaseModel):
    id: int
    name: str
    username: Optional[str]
    role: str
    rfid_tag_id: Optional[str]
    department: Optional[str]
    program: Optional[str]
    email: Optional[str]
    contact_number: Optional[str]

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    program: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None

class SemesterCreate(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime

class SemesterResponse(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime
    is_active: bool

    class Config:
        from_attributes = True

class EnrollmentCreate(BaseModel):
    student_id: int
    class_id: int

class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    class_id: int
    semester_id: int

    class Config:
        from_attributes = True

class FacultyAssignmentCreate(BaseModel):
    class_id: int
    subject: str

class FacultyAssignmentResponse(BaseModel):
    id: int
    faculty_id: int
    class_id: int
    subject: str
    semester_id: int

    class Config:
        from_attributes = True

class StudentPromotionMap(BaseModel):
    promotions: list[EnrollmentCreate]
