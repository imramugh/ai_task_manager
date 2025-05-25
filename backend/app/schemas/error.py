"""Error response schemas for standardized API errors"""
from pydantic import BaseModel
from typing import Optional

class ErrorResponse(BaseModel):
    """Standardized error response format"""
    detail: str
    code: Optional[str] = None
    field: Optional[str] = None

class ValidationErrorResponse(BaseModel):
    """Validation error response with field details"""
    detail: str = "Validation error"
    errors: list[dict]
    code: str = "VALIDATION_ERROR"