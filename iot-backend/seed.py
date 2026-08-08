from models.database import Base, engine, SessionLocal
from models.models import User, ClassSession, Experiment
from security import get_password_hash

def seed():
    db = SessionLocal()
    
    # Drop and recreate tables because we changed the schema (added username/password columns)
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Check if already seeded
    if db.query(User).count() == 0:
        print("Seeding Users...")
        student = User(
            name="Alex", 
            role="student", 
            rfid_tag_id="TAG12345", 
            username="student1",
            hashed_password=get_password_hash("password123")
        )
        faculty = User(
            name="Dr. Vance", 
            role="faculty", 
            rfid_tag_id="FAC999", 
            username="drvance",
            hashed_password=get_password_hash("securepassword")
        )
        db.add_all([student, faculty])
        
    if db.query(ClassSession).count() == 0:
        print("Seeding Classes...")
        dsp_class = ClassSession(name="DSP Virtual Lab", room="Lab 101")
        db.add(dsp_class)
        
    if db.query(Experiment).count() == 0:
        print("Seeding Experiments...")
        exp1 = Experiment(
            id="exp_1_dsp",
            title="DSP Lab 1: Sine Wave",
            description="Generate and analyze a mixed signal in the time and frequency domains.",
            lab_type="matlab_execution",
            expected_output="[0.0, 0.30902, 0.58779, 0.80902, 0.95106]",
            tolerance=0.01
        )
        db.add(exp1)
        
    db.commit()
    db.close()
    print("Seeding complete. You have a student with rfid_tag_id='TAG12345' and a class with id=1.")

if __name__ == "__main__":
    seed()
