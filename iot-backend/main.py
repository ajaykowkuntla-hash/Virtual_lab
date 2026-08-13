from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import hardware, lab, auth, semesters, faculty, admin, events, announcements
from models.database import Base, engine

app = FastAPI(title="IoT Framework Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(hardware.router)
app.include_router(hardware.access_router)
app.include_router(lab.router)
app.include_router(lab.courses_router)
app.include_router(semesters.router)
app.include_router(faculty.router)
app.include_router(admin.router)
app.include_router(events.router)
app.include_router(announcements.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
