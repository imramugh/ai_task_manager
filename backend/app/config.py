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
    
    # Email settings for password reset - uppercase env var names
    SMTP_HOST: str = Field(default="smtp.gmail.com", alias="smtp_host")
    SMTP_PORT: int = Field(default=587, alias="smtp_port")
    SMTP_USERNAME: Optional[str] = Field(default=None, alias="smtp_username")
    SMTP_PASSWORD: Optional[str] = Field(default=None, alias="smtp_password")
    SMTP_FROM_EMAIL: Optional[str] = Field(default=None, alias="smtp_from_email")
    SMTP_FROM_NAME: str = Field(default="AI Task Manager", alias="smtp_from_name")
    SMTP_TLS: bool = Field(default=True, alias="smtp_tls")
    SMTP_SSL: bool = Field(default=False, alias="smtp_ssl")
    
    # Frontend URL for password reset links
    FRONTEND_URL: str = Field(default="http://localhost:3000", alias="frontend_url")
    
    # Password reset token expiry (in hours)
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = Field(default=24, alias="password_reset_token_expire_hours")
    
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
    
    @field_validator('SMTP_USERNAME')
    def validate_smtp_settings(cls, v):
        if not v:
            warnings.warn("SMTP settings not configured - password reset emails will be disabled")
        return v
    
    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra fields temporarily
        populate_by_name = True  # Allow population by field name

# Create settings instance with properties for backwards compatibility
class SettingsProxy:
    def __init__(self):
        self._settings = Settings()
    
    def __getattr__(self, name):
        # Map lowercase names to uppercase for new fields
        if name.startswith('smtp_') or name == 'frontend_url' or name == 'password_reset_token_expire_hours':
            upper_name = name.upper()
            return getattr(self._settings, upper_name)
        return getattr(self._settings, name)

settings = SettingsProxy()
