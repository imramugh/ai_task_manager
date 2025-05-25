from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.api import tasks, auth, ai_assistant
from app.database import engine, Base

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up AI Task Manager API...")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="AI Task Manager API",
    description="Backend API for AI-powered task management",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "AI Task Manager API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}