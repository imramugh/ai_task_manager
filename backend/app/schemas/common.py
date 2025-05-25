from typing import Generic, TypeVar, List
from pydantic import BaseModel

# Issue #19: Add pagination schemas
T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 20
    
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int