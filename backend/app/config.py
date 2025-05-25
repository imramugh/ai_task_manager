from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional
import secrets
import warnings

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://taskuser:taskpass@localhost:5432/ai_task_manager"
    
    # Security - Fix #2: Generate secure default for development only
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    algorithm: str = "HS256"
    # Fix #3: Update to 30 days as documented in README
    access_token_expire_minutes: int = 60 * 24 * 30  # 30 days
    
    # OpenAI
    openai_api_key: Optional[str] = None
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    # Email settings for password reset
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    smtp_from_name: str = "AI Task Manager"
    smtp_tls: bool = True
    smtp_ssl: bool = False
    
    # Frontend URL for password reset links
    frontend_url: str = "http://localhost:3000"
    
    # Password reset token expiry (in hours)
    password_reset_token_expire_hours: int = 24
    
    # Fix #2: Add validation for secure secret key
    @field_validator('secret_key')
    def validate_secret_key(cls, v):
        if v == "your-secret-key-here":
            raise ValueError("Please set a secure SECRET_KEY in your environment")
        if len(v) < 32:
            warnings.warn("SECRET_KEY should be at least 32 characters for security")
        return v
    
    # Fix #5: Add validation for critical settings
    @field_validator('openai_api_key')
    def validate_openai_key(cls, v):
        if not v:
            warnings.warn("OPENAI_API_KEY not set - AI features will be disabled")
        return v
    
    @field_validator('smtp_username')
    def validate_smtp_settings(cls, v):
        if not v:
            warnings.warn("SMTP settings not configured - password reset emails will be disabled")
        return v
    
    class Config:
        env_file = ".env"

settings = Settings()
