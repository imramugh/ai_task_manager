from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

from app.api import tasks, auth, ai_assistant, projects, tags
from app.database import engine, Base, get_db
from app.config import settings

# Load environment variables
load_dotenv()

# Fix #5: Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fix #5: Validate environment on startup
def validate_environment():
    """Validate critical environment variables at startup"""
    warnings = []
    
    if settings.database_url.startswith("sqlite"):
        warnings.append("Using SQLite database - not recommended for production")
    
    if not settings.openai_api_key:
        warnings.append("OPENAI_API_KEY not set - AI features will be disabled")
    
    for warning in warnings:
        logger.warning(warning)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up AI Task Manager API...")
    
    # Fix #5: Validate environment
    validate_environment()
    
    # Fix #5: Better database initialization with error handling
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
        
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except SQLAlchemyError as e:
        logger.error(f"Database initialization failed: {e}")
        # Continue running but log the error
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")

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
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "AI Task Manager API", "status": "running"}

# Fix #5: Enhanced health check endpoint
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
        "dependencies": {}
    }
    
    # Check database
    try:
        # Get a database session
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        health_status["dependencies"]["database"] = "healthy"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["dependencies"]["database"] = f"unhealthy: {str(e)}"
    
    # Check OpenAI API configuration
    if settings.openai_api_key:
        health_status["dependencies"]["openai"] = "configured"
    else:
        health_status["dependencies"]["openai"] = "not configured"
    
    return health_status