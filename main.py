from fastapi import FastAPI
from routes import hardware, lab, auth
from models.database import Base, engine

app = FastAPI(title="IoT Framework Backend")

app.include_router(auth.router)
app.include_router(hardware.router)
app.include_router(hardware.access_router)
app.include_router(lab.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
