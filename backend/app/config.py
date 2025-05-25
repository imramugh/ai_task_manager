from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import secrets
import warnings

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow"  # Allow extra fields
    )
    
    # Database
    database_url: str = Field(
        default="postgresql://taskuser:taskpass@localhost:5432/ai_task_manager"
    )
    
    # Security
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60 * 24 * 30)  # 30 days
    
    # OpenAI
    openai_api_key: Optional[str] = Field(default=None)
    
    # CORS
    allowed_origins: str = Field(default="http://localhost:3000")
    
    # Email settings
    smtp_host: str = Field(default="smtp.gmail.com")
    smtp_port: int = Field(default=587)
    smtp_username: Optional[str] = Field(default=None)
    smtp_password: Optional[str] = Field(default=None)
    smtp_from_email: Optional[str] = Field(default=None)
    smtp_from_name: str = Field(default="AI Task Manager")
    smtp_tls: bool = Field(default=True)
    smtp_ssl: bool = Field(default=False)
    
    # Frontend URL
    frontend_url: str = Field(default="http://localhost:3000")
    
    # Password reset token expiry
    password_reset_token_expire_hours: int = Field(default=24)
    
    @field_validator('secret_key')
    def validate_secret_key(cls, v):
        if v == "your-secret-key-here":
            raise ValueError("Please set a secure SECRET_KEY in your environment")
        if len(v) < 32:
            warnings.warn("SECRET_KEY should be at least 32 characters for security")
        return v
    
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

# Create settings instance
settings = Settings()

# Debug: print what we got
print(f"Settings loaded successfully!")
print(f"SMTP Host: {settings.smtp_host}")
print(f"SMTP Username: {settings.smtp_username}")
