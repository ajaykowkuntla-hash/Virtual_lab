from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional
from models.database import get_db
from models.models import User, Lab, Experiment, Course, LabSubmission, Enrollment, FacultyAssignment
from models.schemas import AdminAnalyticsResponse, FacultyAnalyticsResponse, StudentAnalyticsResponse
from dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

def calculate_grade_distribution(db: Session, base_query):
    # Bucket rules: 0-50, 51-70, 71-90, 91-100
    # 50 -> 0-50. 51 -> 51-70. 70 -> 51-70. 71 -> 71-90. 90 -> 71-90. 91 -> 91-100.
    buckets = [
        {"range": "0-50", "count": 0},
        {"range": "51-70", "count": 0},
        {"range": "71-90", "count": 0},
        {"range": "91-100", "count": 0}
    ]
    
    # Only count where grade is not null
    grades = base_query.filter(LabSubmission.numeric_grade.isnot(None)).with_entities(LabSubmission.numeric_grade).all()
    
    if not grades:
        return []
        
    for g in grades:
        val = g[0]
        if val <= 50:
            buckets[0]["count"] += 1
        elif val <= 70:
            buckets[1]["count"] += 1
        elif val <= 90:
            buckets[2]["count"] += 1
        else:
            buckets[3]["count"] += 1
            
    # Remove buckets with 0 count to keep chart clean, or keep them. Let's keep them so chart is stable.
    return buckets

def calculate_submissions_over_time(db: Session, base_query):
    # Group by DATE(submitted_at)
    # Using sqlite date() for portability, or standard cast if using postgres
    results = base_query.with_entities(
        func.date(LabSubmission.submitted_at).label("date"),
        func.count(LabSubmission.id).label("count")
    ).group_by(func.date(LabSubmission.submitted_at)).order_by(func.date(LabSubmission.submitted_at)).all()
    
    if not results:
        return []
        
    return [{"date": str(r[0]), "count": r[1]} for r in results if r[0] is not None]

@router.get("/admin", response_model=AdminAnalyticsResponse)
def get_admin_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    total_students = db.query(User).filter(User.role == "student").count()
    total_faculty = db.query(User).filter(User.role == "faculty").count()
    total_labs = db.query(Lab).count()
    total_experiments = db.query(Experiment).count()
    
    base_sub_query = db.query(LabSubmission)
    total_submissions = base_sub_query.count()
    
    pending = base_sub_query.filter(LabSubmission.status == "pending").count()
    verified = base_sub_query.filter(LabSubmission.status == "verified").count()
    failed = base_sub_query.filter(LabSubmission.status.in_(["failed", "rejected"])).count()
    
    avg_grade_result = base_sub_query.with_entities(func.avg(LabSubmission.numeric_grade)).filter(LabSubmission.numeric_grade.isnot(None)).scalar()
    avg_grade = float(round(avg_grade_result, 1)) if avg_grade_result is not None else None
    
    # Completion Rate: unique (user_id, experiment_id) of verified over total possible
    # Total possible = Total enrollments * experiments per lab?
    # Approximation: verified submissions / total enrolled students * experiments they have
    # A simple but honest completion rate:
    # We will just count distinct (user_id, experiment_id) where status=verified
    verified_completions = db.query(LabSubmission.user_id, LabSubmission.experiment_id).filter(LabSubmission.status == "verified").distinct().count()
    
    # Denominator: for each enrolled student, count how many experiments are in their enrolled lab
    # We can do this in Python since the tables aren't huge
    enrollments = db.query(Enrollment.student_id, Enrollment.lab_id).all()
    lab_exp_counts = {l[0]: l[1] for l in db.query(Experiment.lab_id, func.count(Experiment.id)).group_by(Experiment.lab_id).all()}
    
    total_expected = 0
    for e in enrollments:
        if e.lab_id and e.lab_id in lab_exp_counts:
            total_expected += lab_exp_counts[e.lab_id]
            
    completion_rate = (verified_completions / total_expected * 100.0) if total_expected > 0 else None
    if completion_rate is not None:
        completion_rate = float(round(completion_rate, 1))
        
    return {
        "summary": {
            "total_students": total_students,
            "total_faculty": total_faculty,
            "total_labs": total_labs,
            "total_experiments": total_experiments,
            "total_submissions": total_submissions
        },
        "performance": {
            "average_grade": avg_grade,
            "completion_rate": completion_rate
        },
        "submissions": {
            "pending": pending,
            "verified": verified,
            "rejected": failed
        },
        "grade_distribution": calculate_grade_distribution(db, base_sub_query),
        "submissions_over_time": calculate_submissions_over_time(db, base_sub_query)
    }

@router.get("/faculty", response_model=FacultyAnalyticsResponse)
def get_faculty_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Authorized scope: labs assigned to this faculty via FacultyAssignment OR experiments assigned directly
    assigned_labs = [r[0] for r in db.query(FacultyAssignment.lab_id).filter(FacultyAssignment.faculty_id == current_user.id).all() if r[0] is not None]
    
    # Assigned students are students enrolled in those labs
    assigned_students = db.query(Enrollment.student_id).filter(Enrollment.lab_id.in_(assigned_labs) if assigned_labs else False).distinct().count()
    
    # Submissions in scope:
    # where LabSubmission.experiment_id belongs to an assigned lab
    exp_ids_in_scope = [r[0] for r in db.query(Experiment.id).filter(Experiment.lab_id.in_(assigned_labs) if assigned_labs else False).all()]
    
    if not exp_ids_in_scope:
        base_sub_query = db.query(LabSubmission).filter(False) # Empty query
    else:
        base_sub_query = db.query(LabSubmission).filter(LabSubmission.experiment_id.in_(exp_ids_in_scope))
        
    total_submissions = base_sub_query.count()
    pending = base_sub_query.filter(LabSubmission.status == "pending").count()
    verified = base_sub_query.filter(LabSubmission.status == "verified").count()
    failed = base_sub_query.filter(LabSubmission.status.in_(["failed", "rejected"])).count()
    
    avg_grade_result = base_sub_query.with_entities(func.avg(LabSubmission.numeric_grade)).filter(LabSubmission.numeric_grade.isnot(None)).scalar()
    avg_grade = float(round(avg_grade_result, 1)) if avg_grade_result is not None else None
    
    return {
        "summary": {
            "assigned_labs": len(assigned_labs),
            "assigned_students": assigned_students,
            "total_submissions": total_submissions
        },
        "performance": {
            "average_grade": avg_grade,
            "completion_rate": None # Not strictly necessary for faculty top level, or could be computed
        },
        "submissions": {
            "pending": pending,
            "verified": verified,
            "rejected": failed
        },
        "grade_distribution": calculate_grade_distribution(db, base_sub_query),
        "submissions_over_time": calculate_submissions_over_time(db, base_sub_query)
    }

@router.get("/student", response_model=StudentAnalyticsResponse)
def get_student_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    enrolled_labs = [r[0] for r in db.query(Enrollment.lab_id).filter(Enrollment.student_id == current_user.id).all() if r[0] is not None]
    
    # Available experiments
    available_experiments = db.query(Experiment).filter(Experiment.lab_id.in_(enrolled_labs) if enrolled_labs else False).count()
    
    # Completed experiments (distinct verified submissions by this user)
    completed_experiments = db.query(LabSubmission.experiment_id).filter(
        LabSubmission.user_id == current_user.id,
        LabSubmission.status == "verified"
    ).distinct().count()
    
    pending_experiments = available_experiments - completed_experiments
    if pending_experiments < 0:
        pending_experiments = 0
        
    completion_rate = (completed_experiments / available_experiments * 100.0) if available_experiments > 0 else None
    if completion_rate is not None:
        completion_rate = float(round(completion_rate, 1))
        
    base_sub_query = db.query(LabSubmission).filter(LabSubmission.user_id == current_user.id)
    
    pending = base_sub_query.filter(LabSubmission.status == "pending").count()
    verified = base_sub_query.filter(LabSubmission.status == "verified").count()
    failed = base_sub_query.filter(LabSubmission.status.in_(["failed", "rejected"])).count()
    
    avg_grade_result = base_sub_query.with_entities(func.avg(LabSubmission.numeric_grade)).filter(LabSubmission.numeric_grade.isnot(None)).scalar()
    avg_grade = float(round(avg_grade_result, 1)) if avg_grade_result is not None else None
    
    return {
        "summary": {
            "enrolled_labs": len(enrolled_labs),
            "available_experiments": available_experiments,
            "completed_experiments": completed_experiments,
            "pending_experiments": pending_experiments
        },
        "performance": {
            "average_grade": avg_grade,
            "completion_rate": completion_rate
        },
        "submissions": {
            "pending": pending,
            "verified": verified,
            "rejected": failed
        },
        "grade_distribution": calculate_grade_distribution(db, base_sub_query)
    }
