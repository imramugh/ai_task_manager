from pydantic_settings import BaseSettings
from typing import Optional
import secrets

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://taskuser:taskpass@localhost:5432/ai_task_manager"
    
    # Security - Generate a default secret key if not provided
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200  # 30 days
    
    # OpenAI
    openai_api_key: Optional[str] = None
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

    def __init__(self, **data):
        super().__init__(**data)
        # Generate a secure secret key if using the default
        if self.secret_key == "your-secret-key-here-change-in-production":
            print("WARNING: Using default SECRET_KEY. Please set a secure SECRET_KEY in your .env file for production!")
            # For development, use a consistent key based on the database URL
            # This ensures the key remains the same across restarts
            import hashlib
            self.secret_key = hashlib.sha256(self.database_url.encode()).hexdigest()

settings = Settings()