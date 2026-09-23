import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.app.database import engine, Base, SessionLocal
from backend.app.models.candidate import CandidateModel
from backend.app.routes.candidates import router as candidates_router
from backend.app.routes.ai import router as ai_router
from backend.seed import seed_database

load_dotenv()

# Initialize tables
Base.metadata.create_all(bind=engine)


def ensure_seeded_data():
    db = SessionLocal()
    try:
        if db.query(CandidateModel).count() == 0:
            seed_database()
    finally:
        db.close()


app = FastAPI(
    title="GCCX Candidate Intelligence API",
    description="Backend REST API with SQLite persistence and Gemini LLM Candidate Triage",
    version="1.0.0",
)

ensure_seeded_data()


@app.on_event("startup")
def startup_seed():
    ensure_seeded_data()

# Configure CORS
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(candidates_router)
app.include_router(ai_router)

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "service": "GCCX Candidate Intelligence Backend",
        "database": "SQLite Connected",
        "version": "1.0.0"
    }

@app.get("/", tags=["root"])
def root():
    return {
        "message": "Welcome to the GCCX Candidate Intelligence API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "candidates": "/api/v1/candidates",
            "stats": "/api/v1/stats",
            "ai_analyze": "/api/v1/ai/candidates/{candidate_id}/analyze",
            "task_2a_skill_ranking": "/api/v1/skills/rank?skills=Python,AWS",
            "task_2b_verification": "/api/v1/skills/task2b"
        }
    }
