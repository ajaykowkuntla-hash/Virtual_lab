from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal, List

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

class LabSubmitRequest(BaseModel):
    user_id: int
    experiment_id: str
    script_text: str
    stdin: Optional[str] = None
    is_final_submission: Optional[bool] = False

# Structured error from Octave execution
class OctaveError(BaseModel):
    line: Optional[int] = None
    message: str

# Response schema for POST /lab/submit
class LabSubmitResponse(BaseModel):
    success: bool
    status: str
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    logs: str                                # Backward compat: combined stdout+stderr
    figures: List[str] = []                  # Base64-encoded PNG data URIs
    errors: List[OctaveError] = []           # Parsed error objects
    plot_b64: Optional[str] = None           # Backward compat: first figure (raw base64)
    execution_time: float = 0
    exit_code: int = 0

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
    numeric_grade: Optional[int] = None
    faculty_remarks: Optional[str] = None

    class Config:
        from_attributes = True

class FacultySubmissionResponse(BaseModel):
    id: int
    student_name: str
    experiment_id: str
    experiment_title: str
    lab_name: str
    status: str
    submitted_at: datetime
    numeric_grade: Optional[int] = None

    class Config:
        from_attributes = True

class LabVerifyRequest(BaseModel):
    status: Literal["verified", "rejected"]
    numeric_grade: Optional[int] = None
    faculty_remarks: Optional[str] = None

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
    lab_id: Optional[int] = None
    theory: Optional[str] = None
    instructions: Optional[str] = None
    starter_code: Optional[str] = None
    language: Optional[str] = None

class ExperimentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    lab_type: str
    expected_output: Optional[str]
    tolerance: float
    created_at: datetime
    assigned_faculty_id: Optional[int]
    lab_id: Optional[int]
    theory: Optional[str] = None
    instructions: Optional[str] = None
    starter_code: Optional[str] = None
    language: Optional[str] = None

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
    
    # New Fields
    employee_id: Optional[str]
    roll_number: Optional[str]
    designation: Optional[str]
    status: Optional[str]

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    program: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None
    rfid_tag_id: Optional[str] = None
    employee_id: Optional[str] = None
    roll_number: Optional[str] = None
    designation: Optional[str] = None
    status: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    username: str
    password: str
    rfid_tag_id: Optional[str] = None
    department: Optional[str] = None
    program: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None
    employee_id: Optional[str] = None
    roll_number: Optional[str] = None
    designation: Optional[str] = None
    status: Optional[str] = "Active"

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
    class_id: Optional[int] = None
    semester_id: int
    course_id: Optional[int] = None
    lab_id: Optional[int] = None
    assigned_faculty_id: Optional[int] = None

    class Config:
        from_attributes = True

class FacultyAssignmentCreate(BaseModel):
    class_id: int
    course_id: int

class FacultyAssignmentResponse(BaseModel):
    id: int
    faculty_id: int
    class_id: Optional[int] = None
    course_id: Optional[int] = None
    semester_id: Optional[int] = None
    lab_id: Optional[int] = None

    class Config:
        from_attributes = True

class StudentPromotionMap(BaseModel):
    promotions: list[EnrollmentCreate]

class EventCreate(BaseModel):
    title: str
    date: str
    time: str
    location: str
    type: str

class EventResponse(BaseModel):
    id: int
    title: str
    date: str
    time: str
    location: str
    type: str
    created_by: int
    semester_id: Optional[int]

    class Config:
        from_attributes = True

class DepartmentCreate(BaseModel):
    name: str

class DepartmentResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    name: str
    department_id: int
    semester_id: int

class CourseResponse(BaseModel):
    id: int
    name: str
    department_id: int
    semester_id: int

    class Config:
        from_attributes = True

class LabCreate(BaseModel):
    name: str
    course_id: int

class LabResponse(BaseModel):
    id: int
    name: str
    course_id: int

    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: Optional[str] = None
    content: str
    target_role: Optional[str] = None
    course_id: Optional[int] = None
    lab_id: Optional[int] = None

class AnnouncementResponse(BaseModel):
    id: int
    title: Optional[str]
    content: str
    author_id: int
    target_role: Optional[str]
    course_id: Optional[int]
    lab_id: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    date: str
    time: str
    location: str
    type: str # 'blue' or 'pink'
    target_role: Optional[str] = None
    course_id: Optional[int] = None
    lab_id: Optional[int] = None

class CalendarEventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    date: str
    time: str
    location: str
    type: str
    created_by: int
    target_role: Optional[str]
    course_id: Optional[int]
    lab_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
