from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Issue #23: Task template schemas
class TaskTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    task_description: str
    task_priority: str = "medium"
    task_project_id: Optional[int] = None
    task_tags: List[str] = []
    task_duration_days: Optional[int] = None
    is_shared: bool = False
    category: Optional[str] = None

class TaskTemplateCreate(TaskTemplateBase):
    pass

class TaskTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    task_description: Optional[str] = None
    task_priority: Optional[str] = None
    task_project_id: Optional[int] = None
    task_tags: Optional[List[str]] = None
    task_duration_days: Optional[int] = None
    is_shared: Optional[bool] = None
    category: Optional[str] = None

class TaskTemplate(TaskTemplateBase):
    id: int
    user_id: int
    usage_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True