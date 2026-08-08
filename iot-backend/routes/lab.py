from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import json

from models.database import get_db
from models.models import User, LabSubmission, Experiment, Semester
from models.schemas import LabSubmitRequest, LabSubmitResponse, LabSubmissionResponse, LabVerifyRequest, ExperimentCreate, ExperimentResponse, CodeExecuteRequest, CodeExecuteResponse
from services.lab_engine import execute_octave_script
from services.multi_lang_engine import execute_code as multi_lang_execute
from dependencies import get_current_faculty
from typing import List

router = APIRouter(prefix="/lab", tags=["Virtual Lab"])

@router.post("/experiments", response_model=ExperimentResponse)
def create_experiment(
    data: ExperimentCreate, 
    db: Session = Depends(get_db),
    current_faculty: User = Depends(get_current_faculty)
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
def get_experiments(db: Session = Depends(get_db)):
    return db.query(Experiment).all()

@router.get("/experiments/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment

@router.post("/submit", response_model=LabSubmitResponse)
def submit_lab_script(data: LabSubmitRequest, db: Session = Depends(get_db)):
    # 1. Verify user exists and is a student
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user or user.role != "student":
        raise HTTPException(status_code=403, detail="Only registered students can submit lab scripts.")
        
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
    
    # 3. Execute the script in the Docker sandbox
    result = execute_octave_script(data.script_text, expected_output)
    
    # 4. Save the submission to the database
    is_verified = (result["status"] == "verified")

    active_semester = db.query(Semester).filter(Semester.is_active == True).first()
    semester_id = active_semester.id if active_semester else None

    submission = LabSubmission(
        user_id=data.user_id,
        experiment_id=data.experiment_id,
        semester_id=semester_id,
        script_text=data.script_text,
        output=result["logs"],
        status=result["status"],
        submitted_at=datetime.utcnow()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # 5. Return the result back to the frontend
    return LabSubmitResponse(
        success=is_verified,
        status=result["status"],
        logs=result["logs"],
        plot_b64=result["plot"]
    )

@router.get("/submissions/{experiment_id}", response_model=List[LabSubmissionResponse])
def get_experiment_submissions(
    experiment_id: str, 
    db: Session = Depends(get_db),
    current_faculty: User = Depends(get_current_faculty)
):
    submissions = db.query(LabSubmission).filter(LabSubmission.experiment_id == experiment_id).order_by(LabSubmission.submitted_at.desc()).all()
    return submissions

@router.post("/submissions/{submission_id}/verify", response_model=LabSubmissionResponse)
def verify_submission(
    submission_id: int, 
    data: LabVerifyRequest, 
    db: Session = Depends(get_db),
    current_faculty: User = Depends(get_current_faculty)
):
    submission = db.query(LabSubmission).filter(LabSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
        
    submission.status = data.status
    submission.verified_by = current_faculty.id
    db.commit()
    db.refresh(submission)
    return submission



@router.post("/code/execute", response_model=CodeExecuteResponse)
async def execute_code(request: CodeExecuteRequest):
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
