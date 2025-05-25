from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None
    parent_task_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None

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