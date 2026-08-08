from models.database import Base, engine, SessionLocal
from models.models import User, ClassSession
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
        student = User(name="Ajay", role="student", rfid_tag_id="TAG12345", username="ajay_s")
        faculty = User(
            name="Dr. Smith", 
            role="faculty", 
            rfid_tag_id="FAC999", 
            username="drsmith",
            hashed_password=get_password_hash("password123")
        )
        db.add_all([student, faculty])
        
    if db.query(ClassSession).count() == 0:
        print("Seeding Classes...")
        dsp_class = ClassSession(name="DSP Virtual Lab", room="Lab 101")
        db.add(dsp_class)
        
    db.commit()
    db.close()
    print("Seeding complete. You have a student with rfid_tag_id='TAG12345' and a class with id=1.")

if __name__ == "__main__":
    seed()
