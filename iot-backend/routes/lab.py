from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import json

from models.database import get_db
from models.models import User, LabSubmission, Experiment, Semester, Lab, Course, FacultyAssignment
from models.schemas import LabSubmitRequest, LabSubmitResponse, LabSubmissionResponse, LabVerifyRequest, ExperimentCreate, ExperimentResponse, CodeExecuteRequest, CodeExecuteResponse, LabResponse, CourseResponse, OctaveError, FacultySubmissionResponse
from services.lab_engine import execute_octave_script
from services.multi_lang_engine import execute_code as multi_lang_execute
from dependencies import get_current_faculty, get_current_faculty_or_admin
from typing import List, Optional

router = APIRouter(prefix="/lab", tags=["Virtual Lab"])

@router.post("/experiments", response_model=ExperimentResponse)
def create_experiment(
    data: ExperimentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_faculty_or_admin)
):
    # Check if exists
    existing = db.query(Experiment).filter(Experiment.id == data.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Experiment already exists")
    experiment = Experiment(**data.model_dump())
    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    return experiment

@router.get("/experiments", response_model=List[ExperimentResponse])
def get_experiments(
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    lab_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Experiment)
    if lab_id is not None:
        query = query.filter(Experiment.lab_id == lab_id)
    if course_id is not None:
        query = query.join(Lab).filter(Lab.course_id == course_id)
    if department_id is not None:
        if course_id is None:
            query = query.join(Lab)
        query = query.join(Course).filter(Course.department_id == department_id)
        
    return query.all()

@router.get("/experiments/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment

from dependencies import get_current_user

@router.post("/submit", response_model=LabSubmitResponse)
def submit_lab_script(data: LabSubmitRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Verify user exists and is a student
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only registered students can submit lab scripts.")
        
    # Enforce identity from JWT
    user_id = current_user.id
        
    # 2. Verify experiment exists and get expected output
    experiment = db.query(Experiment).filter(Experiment.id == data.experiment_id).first()
    if not experiment:
        raise HTTPException(
            status_code=404, 
            detail=f"Unknown experiment_id: '{data.experiment_id}'. No such experiment exists."
        )
    
    expected_output = None
    if experiment.expected_output:
        try:
            expected_output = json.loads(experiment.expected_output)
        except json.JSONDecodeError:
            expected_output = experiment.expected_output
    
    # 3. Execute the script in the Docker sandbox (returns structured result)
    result = execute_octave_script(data.script_text, expected_output, data.stdin)
    
    # 4. Handle persistence and status based on is_final_submission
    is_verified = (result["status"] == "verified")
    
    status = result["status"]
    
    if data.is_final_submission:
        status = "PENDING_REVIEW"
        
        active_semester = db.query(Semester).filter(Semester.is_active == True).first()
        semester_id = active_semester.id if active_semester else None

        submission = LabSubmission(
            user_id=user_id,
            experiment_id=data.experiment_id,
            semester_id=semester_id,
            script_text=data.script_text,
            output=result["logs"],
            status=status,
            submitted_at=datetime.utcnow()
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
    result["status"] = status
    
    # 5. Build structured error objects for the response
    error_objects = [OctaveError(line=e.get("line"), message=e.get("message", "")) for e in result.get("errors", [])]
    
    # 6. Return the structured result back to the frontend
    return LabSubmitResponse(
        success=result["success"],
        status=result["status"],
        stdout=result.get("stdout", ""),
        stderr=result.get("stderr", ""),
        logs=result["logs"],
        figures=result.get("figures", []),
        errors=error_objects,
        plot_b64=result["plot"],
        execution_time=result.get("execution_time", 0),
        exit_code=result.get("exit_code", 0)
    )


courses_router = APIRouter(tags=["Courses/Labs"])

@courses_router.get("/courses", response_model=List[CourseResponse])
def list_courses_public(db: Session = Depends(get_db)):
    return db.query(Course).all()

@courses_router.get("/labs", response_model=List[LabResponse])
def list_labs_public(db: Session = Depends(get_db)):
    return db.query(Lab).all()

@courses_router.get("/courses/{course_id}/labs", response_model=List[LabResponse])
def get_course_labs(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db.query(Lab).filter(Lab.course_id == course_id).all()

@router.get("/submissions/{experiment_id}", response_model=List[LabSubmissionResponse])
def get_experiment_submissions(
    experiment_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_faculty_or_admin)
):
    if current_user.role == "faculty":
        experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Check scope
        assignment = db.query(FacultyAssignment).filter(
            FacultyAssignment.faculty_id == current_user.id,
            FacultyAssignment.lab_id == experiment.lab_id
        ).first()
        
        if not assignment:
            raise HTTPException(status_code=403, detail="You are not assigned to this lab/experiment.")
            
    submissions = db.query(LabSubmission).filter(LabSubmission.experiment_id == experiment_id).order_by(LabSubmission.submitted_at.desc()).all()
    return submissions

@router.post("/submissions/{submission_id}/verify", response_model=LabSubmissionResponse)
def verify_submission(
    submission_id: int, 
    data: LabVerifyRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_faculty_or_admin)
):
    submission = db.query(LabSubmission).filter(LabSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
        
    if current_user.role == "faculty":
        experiment = db.query(Experiment).filter(Experiment.id == submission.experiment_id).first()
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Check scope
        assignment = db.query(FacultyAssignment).filter(
            FacultyAssignment.faculty_id == current_user.id,
            FacultyAssignment.lab_id == experiment.lab_id
        ).first()
        
        if not assignment:
            raise HTTPException(status_code=403, detail="You are not assigned to this lab/experiment.")
            
    submission.status = data.status
    if data.numeric_grade is not None:
        submission.numeric_grade = data.numeric_grade
    if data.faculty_remarks is not None:
        submission.faculty_remarks = data.faculty_remarks
    submission.verified_by = current_user.id
    db.commit()
    db.refresh(submission)
    return submission

@router.get("/student/submissions", response_model=List[LabSubmissionResponse])
def get_student_submissions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")
    submissions = db.query(LabSubmission).filter(LabSubmission.user_id == current_user.id).order_by(LabSubmission.submitted_at.desc()).all()
    return submissions

@router.get("/faculty/submissions", response_model=List[FacultySubmissionResponse])
def get_faculty_all_submissions(db: Session = Depends(get_db), current_user: User = Depends(get_current_faculty)):
    assignments = db.query(FacultyAssignment).filter(FacultyAssignment.faculty_id == current_user.id).all()
    assigned_lab_ids = [a.lab_id for a in assignments if a.lab_id is not None]
    
    submissions = db.query(LabSubmission).join(Experiment).filter(Experiment.lab_id.in_(assigned_lab_ids)).order_by(LabSubmission.submitted_at.desc()).all()
    
    response = []
    for sub in submissions:
        student = db.query(User).filter(User.id == sub.user_id).first()
        experiment = db.query(Experiment).filter(Experiment.id == sub.experiment_id).first()
        lab = db.query(Lab).filter(Lab.id == experiment.lab_id).first() if experiment else None
        
        response.append(FacultySubmissionResponse(
            id=sub.id,
            student_name=student.name if student else "Unknown",
            experiment_id=sub.experiment_id,
            experiment_title=experiment.title if experiment else sub.experiment_id,
            lab_name=lab.name if lab else "Unknown Lab",
            status=sub.status,
            submitted_at=sub.submitted_at,
            numeric_grade=sub.numeric_grade
        ))
    return response



@router.post("/code/execute", response_model=CodeExecuteResponse)
async def execute_code(request: CodeExecuteRequest, current_user: User = Depends(get_current_user)):
    # This calls the custom Docker-based multi-language engine
    result = multi_lang_execute(
        language=request.language,
        source_code=request.source_code,
        stdin=request.stdin,
        filename=request.filename
    )
    
    return CodeExecuteResponse(
        stdout=result.get("stdout"),
        stderr=result.get("stderr"),
        compile_output=result.get("compile_output"),
        exit_status=result.get("exit_status", 1),
        execution_time=result.get("execution_time", 0)
    )

from dependencies import get_current_user
from models.models import Enrollment, CalendarEvent, AttendanceLog

@router.get("/student/dashboard")
def get_student_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")
        
    enrollment = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).first()
    if not enrollment:
        return {
            "my_labs_count": 0,
            "pending_assignments_count": 0,
            "attendance_rate": "0%",
            "average_grade": "N/A",
            "recent_grades": [],
            "upcoming_events": [],
            "experiments": []
        }
        
    my_labs_count = db.query(Lab).filter(Lab.course_id == enrollment.course_id).count()
    experiments = db.query(Experiment).filter(Experiment.lab_id == enrollment.lab_id).all()
    exp_ids = [e.id for e in experiments]
    
    submissions = db.query(LabSubmission).filter(
        LabSubmission.user_id == current_user.id,
        LabSubmission.experiment_id.in_(exp_ids)
    ).all()
    submitted_exp_ids = [s.experiment_id for s in submissions]
    
    pending_assignments_count = len(exp_ids) - len(submitted_exp_ids)
    total_logs = db.query(AttendanceLog).filter(AttendanceLog.user_id == current_user.id).count()
    attendance_rate = "95%" if total_logs > 0 else "0%"
    
    graded_subs = [s for s in submissions if s.numeric_grade is not None]
    if graded_subs:
        avg_grade = sum(s.numeric_grade for s in graded_subs) / len(graded_subs)
        average_grade = f"{avg_grade:.1f}"
    else:
        average_grade = "N/A"
    
    recent_grades = []
    for sub in submissions[:3]:
        exp = db.query(Experiment).filter(Experiment.id == sub.experiment_id).first()
        recent_grades.append({
            "experiment_title": exp.title if exp else sub.experiment_id,
            "status": sub.status,
            "submitted_at": sub.submitted_at.strftime("%b %d, %H:%M"),
            "numeric_grade": sub.numeric_grade,
            "faculty_remarks": sub.faculty_remarks
        })
        
    upcoming_events = db.query(CalendarEvent).filter(
        (CalendarEvent.target_role.in_(["all", "student"])) |
        (CalendarEvent.lab_id == enrollment.lab_id) |
        (CalendarEvent.course_id == enrollment.course_id)
    ).order_by(CalendarEvent.start_time.asc()).limit(3).all()
    
    events_list = []
    for ev in upcoming_events:
        events_list.append({
            "title": ev.title,
            "time": ev.time,
            "date": ev.date,
            "location": ev.location
        })
        
    return {
        "my_labs_count": my_labs_count,
        "pending_assignments_count": pending_assignments_count,
        "attendance_rate": attendance_rate,
        "average_grade": average_grade,
        "recent_grades": recent_grades,
        "upcoming_events": events_list,
        "experiments": [{"id": e.id, "title": e.title, "description": e.description} for e in experiments]
    }
