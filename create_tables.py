from models.database import engine
from models.models import Base

print("Creating tables in PostgreSQL...")
Base.metadata.create_all(bind=engine)
print("Done!")
