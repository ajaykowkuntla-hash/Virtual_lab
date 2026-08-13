from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from models.database import get_db
from models.models import User, Experiment, LabSubmission, Department, Course, Lab, Semester, FacultyAssignment, Enrollment
from models.schemas import UserResponse, UserCreate, UserUpdate, ExperimentCreate, ExperimentResponse, DepartmentCreate, DepartmentResponse, CourseCreate, CourseResponse, LabCreate, LabResponse
from dependencies import get_current_admin
from security import get_password_hash

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)]
)

@router.post("/faculty", response_model=UserResponse)
def create_faculty(user: UserCreate, db: Session = Depends(get_db)):
    if not user.employee_id:
        raise HTTPException(status_code=400, detail="Employee ID is required for faculty")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.employee_id == user.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already registered")
    
    db_user = User(
        name=user.name,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        role="faculty",
        rfid_tag_id=user.rfid_tag_id,
        department=user.department,
        program=user.program,
        email=user.email,
        contact_number=user.contact_number,
        employee_id=user.employee_id,
        designation=user.designation,
        status=user.status or "Active"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/faculty", response_model=List[UserResponse])
def list_faculty(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "faculty").all()

@router.put("/faculty/{user_id}", response_model=UserResponse)
def update_faculty(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id, User.role == "faculty").first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/students", response_model=UserResponse)
def create_student(user: UserCreate, db: Session = Depends(get_db)):
    if not user.roll_number:
        raise HTTPException(status_code=400, detail="Roll number is required for student")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.roll_number == user.roll_number).first():
        raise HTTPException(status_code=400, detail="Roll number already registered")
    
    db_user = User(
        name=user.name,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        role="student",
        rfid_tag_id=user.rfid_tag_id,
        department=user.department,
        program=user.program,
        email=user.email,
        contact_number=user.contact_number,
        roll_number=user.roll_number,
        status=user.status or "Active"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/students", response_model=List[UserResponse])
def list_students(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "student").all()

@router.put("/students/{user_id}", response_model=UserResponse)
def update_student(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id, User.role == "student").first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/labs", response_model=LabResponse)
def create_lab(lab: LabCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == lab.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    db_lab = Lab(
        name=lab.name,
        course_id=lab.course_id
    )
    db.add(db_lab)
    db.commit()
    db.refresh(db_lab)
    return db_lab

@router.get("/labs", response_model=List[LabResponse])
def list_labs(db: Session = Depends(get_db)):
    return db.query(Lab).all()

@router.post("/labs/{lab_id}/assign-faculty")
def assign_faculty_to_lab(lab_id: str, faculty_id: int, db: Session = Depends(get_db)):
    db_faculty = db.query(User).filter(User.id == faculty_id, User.role == "faculty").first()
    if not db_faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
        
    try:
        lab_id_int = int(lab_id)
        db_lab = db.query(Lab).filter(Lab.id == lab_id_int).first()
    except ValueError:
        db_lab = None
        
    if db_lab:
        existing = db.query(FacultyAssignment).filter(
            FacultyAssignment.faculty_id == faculty_id,
            FacultyAssignment.lab_id == db_lab.id
        ).first()
        if not existing:
            assignment = FacultyAssignment(
                faculty_id=faculty_id,
                lab_id=db_lab.id,
                course_id=db_lab.course_id,
                semester_id=db_lab.course.semester_id
            )
            db.add(assignment)
            
        db.query(Experiment).filter(Experiment.lab_id == db_lab.id).update({Experiment.assigned_faculty_id: faculty_id})
        db.commit()
        first_exp = db.query(Experiment).filter(Experiment.lab_id == db_lab.id).first()
        if first_exp:
            return first_exp
        return {"id": str(db_lab.id), "title": db_lab.name, "assigned_faculty_id": faculty_id}
        
    db_exp = db.query(Experiment).filter(Experiment.id == lab_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Lab/Experiment not found")
        
    db_exp.assigned_faculty_id = faculty_id
    
    if db_exp.lab_id is not None:
        existing = db.query(FacultyAssignment).filter(
            FacultyAssignment.faculty_id == faculty_id,
            FacultyAssignment.lab_id == db_exp.lab_id
        ).first()
        if not existing:
            assignment = FacultyAssignment(
                faculty_id=faculty_id,
                lab_id=db_exp.lab_id,
                course_id=db_exp.lab.course_id,
                semester_id=db_exp.lab.course.semester_id
            )
            db.add(assignment)
            
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_departments = db.query(Department).count()
    total_courses = db.query(Course).count()
    total_labs = db.query(Lab).count()
    total_faculty = db.query(User).filter(User.role == "faculty").count()
    total_students = db.query(User).filter(User.role == "student").count()
    active_experiments = db.query(Experiment).count()
    pending_submissions = db.query(LabSubmission).filter(LabSubmission.status == "pending").count()
    
    return {
        "total_departments": total_departments,
        "total_courses": total_courses,
        "total_labs": total_labs,
        "total_faculty": total_faculty,
        "total_students": total_students,
        "active_experiments": active_experiments,
        "pending_submissions": pending_submissions,
        "total_submissions": db.query(LabSubmission).count()
    }

@router.post("/departments", response_model=DepartmentResponse)
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db)):
    if db.query(Department).filter(Department.name == dept.name).first():
        raise HTTPException(status_code=400, detail="Department name already exists")
    db_dept = Department(name=dept.name)
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.post("/courses", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == course.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db_course = Course(
        name=course.name,
        department_id=course.department_id,
        semester_id=course.semester_id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/courses", response_model=List[CourseResponse])
def list_courses(
    department_id: Optional[int] = None,
    semester_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    if department_id is not None:
        query = query.filter(Course.department_id == department_id)
    if semester_id is not None:
        query = query.filter(Course.semester_id == semester_id)
    return query.all()

@router.get("/departments/{id}/courses", response_model=List[CourseResponse])
def list_department_courses(id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return db.query(Course).filter(Course.department_id == id).all()

from models.schemas import FacultyAssignmentResponse, EnrollmentResponse

@router.get("/assignments", response_model=List[FacultyAssignmentResponse])
def list_faculty_assignments(db: Session = Depends(get_db)):
    return db.query(FacultyAssignment).all()

@router.get("/enrollments", response_model=List[EnrollmentResponse])
def list_student_enrollments(db: Session = Depends(get_db)):
    return db.query(Enrollment).all()

class StudentAssignmentRequest(BaseModel):
    course_id: int
    lab_id: int
    assigned_faculty_id: int

@router.post("/students/{student_id}/assignments")
def assign_student(student_id: int, data: StudentAssignmentRequest, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=400, detail="Course not found")
        
    lab = db.query(Lab).filter(Lab.id == data.lab_id).first()
    if not lab:
        raise HTTPException(status_code=400, detail="Lab not found")
        
    if lab.course_id != data.course_id:
        raise HTTPException(status_code=400, detail="Lab does not belong to the selected Course")
        
    faculty = db.query(User).filter(User.id == data.assigned_faculty_id, User.role == "faculty").first()
    if not faculty:
        raise HTTPException(status_code=400, detail="Faculty not found")
        
    fa = db.query(FacultyAssignment).filter(
        FacultyAssignment.faculty_id == data.assigned_faculty_id,
        FacultyAssignment.lab_id == data.lab_id
    ).first()
    if not fa:
        raise HTTPException(status_code=400, detail="Assigned Faculty is not assigned to the selected Lab")
        
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.semester_id == course.semester_id
    ).first()
    
    if enrollment:
        enrollment.course_id = data.course_id
        enrollment.lab_id = data.lab_id
        enrollment.assigned_faculty_id = data.assigned_faculty_id
    else:
        enrollment = Enrollment(
            student_id=student_id,
            semester_id=course.semester_id,
            course_id=data.course_id,
            lab_id=data.lab_id,
            assigned_faculty_id=data.assigned_faculty_id
        )
        db.add(enrollment)
        
    db.commit()
    return {"success": True, "message": "Student assignments updated successfully"}
