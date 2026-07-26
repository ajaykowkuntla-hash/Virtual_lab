from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from models.database import get_db
from models.models import User, LabSubmission
from models.schemas import LabSubmitRequest, LabSubmitResponse, LabSubmissionResponse, LabVerifyRequest
from services.lab_engine import execute_octave_script
from dependencies import get_current_faculty
from typing import List

router = APIRouter(prefix="/lab", tags=["Virtual Lab"])

# For this demo project, we have one experiment with a numeric array as expected result
EXPECTED_RESULTS = {
    "exp_1_dsp": [0.0, 0.30902, 0.58779, 0.80902, 0.95106] # First 5 values of 50 Hz sine sampled at 1000 Hz
}

@router.post("/submit", response_model=LabSubmitResponse)
def submit_lab_script(data: LabSubmitRequest, db: Session = Depends(get_db)):
    # 1. Verify user exists and is a student
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user or user.role != "student":
        raise HTTPException(status_code=403, detail="Only registered students can submit lab scripts.")
        
    # 2. Get expected output for auto-check
    expected_output = EXPECTED_RESULTS.get(data.experiment_id, "")
    
    # 3. Execute the script in the Docker sandbox
    result = execute_octave_script(data.script_text, expected_output)
    
    # 4. Save the submission to the database
    is_verified = (result["status"] == "verified")
    submission = LabSubmission(
        user_id=data.user_id,
        experiment_id=data.experiment_id,
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
