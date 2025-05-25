from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.schemas.template import TaskTemplate, TaskTemplateCreate, TaskTemplateUpdate
from app.models.template import TaskTemplate as TaskTemplateModel
from app.models.task import Task as TaskModel
from app.models.user import User as UserModel
from app.services.auth import get_current_user

# Issue #18: Import rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

# Issue #23: Task templates endpoints
@router.get("/", response_model=List[TaskTemplate])
@limiter.limit("60/minute")
async def get_templates(
    request: Request,
    category: Optional[str] = None,
    is_shared: Optional[bool] = None,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(TaskTemplateModel).filter(
        TaskTemplateModel.user_id == current_user.id
    )
    
    if category:
        query = query.filter(TaskTemplateModel.category == category)
    
    if is_shared is not None:
        query = query.filter(TaskTemplateModel.is_shared == is_shared)
    
    return query.order_by(TaskTemplateModel.usage_count.desc()).all()

@router.post("/", response_model=TaskTemplate)
@limiter.limit("30/minute")
async def create_template(
    request: Request,
    template: TaskTemplateCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_template = TaskTemplateModel(
        **template.dict(),
        user_id=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.post("/{template_id}/use", response_model=Task)
@limiter.limit("60/minute")
async def use_template(
    request: Request,
    template_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get template
    template = db.query(TaskTemplateModel).filter(
        TaskTemplateModel.id == template_id,
        TaskTemplateModel.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Create task from template
    due_date = None
    if template.task_duration_days:
        due_date = datetime.utcnow() + timedelta(days=template.task_duration_days)
    
    task = TaskModel(
        title=template.task_description,
        description=template.description,
        priority=template.task_priority,
        project_id=template.task_project_id,
        due_date=due_date,
        user_id=current_user.id,
        ai_generated=False,
        completed=False
    )
    
    # Update template usage count
    template.usage_count += 1
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task

@router.put("/{template_id}", response_model=TaskTemplate)
@limiter.limit("30/minute")
async def update_template(
    request: Request,
    template_id: int,
    template_update: TaskTemplateUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    template = db.query(TaskTemplateModel).filter(
        TaskTemplateModel.id == template_id,
        TaskTemplateModel.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    for field, value in template_update.dict(exclude_unset=True).items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(template)
    return template

@router.delete("/{template_id}")
@limiter.limit("30/minute")
async def delete_template(
    request: Request,
    template_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    template = db.query(TaskTemplateModel).filter(
        TaskTemplateModel.id == template_id,
        TaskTemplateModel.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}