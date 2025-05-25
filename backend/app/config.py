from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Any, Dict
import secrets
import warnings
import os

class Settings(BaseSettings):
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
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        env_ignore_empty=True
    )
    
    def __init__(self, **data):
        # Manually handle environment variables with different cases
        env_mapping = {
            'SMTP_HOST': 'smtp_host',
            'SMTP_PORT': 'smtp_port',
            'SMTP_USERNAME': 'smtp_username',
            'SMTP_PASSWORD': 'smtp_password',
            'SMTP_FROM_EMAIL': 'smtp_from_email',
            'SMTP_FROM_NAME': 'smtp_from_name',
            'SMTP_TLS': 'smtp_tls',
            'SMTP_SSL': 'smtp_ssl',
            'FRONTEND_URL': 'frontend_url',
            'PASSWORD_RESET_TOKEN_EXPIRE_HOURS': 'password_reset_token_expire_hours',
        }
        
        # Check environment variables directly
        for env_key, field_key in env_mapping.items():
            if env_key in os.environ and field_key not in data:
                value = os.environ[env_key]
                # Convert string values to appropriate types
                if field_key == 'smtp_port':
                    data[field_key] = int(value)
                elif field_key == 'password_reset_token_expire_hours':
                    data[field_key] = int(value)
                elif field_key in ['smtp_tls', 'smtp_ssl']:
                    data[field_key] = value.lower() in ['true', '1', 'yes']
                else:
                    data[field_key] = value
        
        super().__init__(**data)
    
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
