from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import hardware, lab, auth, semesters, faculty, admin, events, announcements
from models.database import Base, engine

app = FastAPI(title="IoT Framework Backend")

import os

FRONTEND_CORS_ORIGINS = os.getenv("FRONTEND_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_CORS_ORIGINS,
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
