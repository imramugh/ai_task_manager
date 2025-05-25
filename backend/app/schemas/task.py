from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Issue #22: Add enums for sorting
class SortField(str, Enum):
    created_at = "created_at"
    updated_at = "updated_at"
    due_date = "due_date"
    priority = "priority"
    title = "title"
    completed = "completed"

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None
    parent_task_id: Optional[int] = None

class TaskCreate(TaskBase):
    # Issue #17: Add validation for empty task descriptions
    @validator('title')
    def title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Task title cannot be empty')
        if len(v.strip()) < 3:
            raise ValueError('Task title must be at least 3 characters long')
        return v.strip()
    
    @validator('description')
    def description_not_empty(cls, v):
        if v is not None and v.strip() == '':
            return None
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None
    
    @validator('title')
    def title_not_empty(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Task title cannot be empty')
            if len(v.strip()) < 3:
                raise ValueError('Task title must be at least 3 characters long')
        return v.strip() if v else v

class Task(TaskBase):
    id: int
    completed: bool
    ai_generated: bool
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Issue #20: Add search parameters schema
class TaskSearchParams(BaseModel):
    q: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    project_id: Optional[int] = None
    has_due_date: Optional[bool] = None
    overdue: Optional[bool] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None