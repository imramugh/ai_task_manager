from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, case
from typing import List, Optional
import math
from datetime import datetime

from app.database import get_db
from app.schemas.task import Task, TaskCreate, TaskUpdate, SortField, SortOrder, TaskSearchParams
from app.schemas.common import PaginatedResponse
from app.models.task import Task as TaskModel
from app.models.user import User as UserModel
from app.services.auth import get_current_user

# Issue #18: Import rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

# Issue #19: Add pagination support
@router.get("/", response_model=PaginatedResponse[Task])
@limiter.limit("100/minute")  # Issue #18: Add rate limiting
async def get_tasks(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    completed: Optional[bool] = None,
    project_id: Optional[int] = None,
    # Issue #22: Add sorting parameters
    sort_by: SortField = Query(SortField.created_at),
    order: SortOrder = Query(SortOrder.desc),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(TaskModel).filter(TaskModel.user_id == current_user.id)
    
    if completed is not None:
        query = query.filter(TaskModel.completed == completed)
    
    if project_id is not None:
        query = query.filter(TaskModel.project_id == project_id)
    
    # Issue #22: Build ordering
    if sort_by == SortField.priority:
        # Custom ordering for priority
        query = query.order_by(
            case(
                (TaskModel.priority == "urgent", 1),
                (TaskModel.priority == "high", 2),
                (TaskModel.priority == "medium", 3),
                (TaskModel.priority == "low", 4),
                else_=5
            ),
            TaskModel.created_at.desc()
        )
    else:
        sort_column = getattr(TaskModel, sort_by.value)
        if order == SortOrder.desc:
            sort_column = sort_column.desc()
        query = query.order_by(sort_column)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    tasks = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return PaginatedResponse(
        items=tasks,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page)
    )

# Issue #20: Add search endpoint
@router.get("/search", response_model=List[Task])
@limiter.limit("60/minute")  # Issue #18: Add rate limiting
async def search_tasks(
    request: Request,
    q: str = Query(..., min_length=1, description="Search query"),
    search_in: List[str] = Query(
        default=["title", "description"],
        description="Fields to search in"
    ),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search tasks by keyword in specified fields.
    Supports searching in: title, description
    """
    query = db.query(TaskModel).filter(
        TaskModel.user_id == current_user.id
    )
    
    # Build search conditions
    search_conditions = []
    search_pattern = f"%{q}%"
    
    if "title" in search_in:
        search_conditions.append(
            func.lower(TaskModel.title).like(func.lower(search_pattern))
        )
    
    if "description" in search_in:
        search_conditions.append(
            func.lower(TaskModel.description).like(func.lower(search_pattern))
        )
    
    # Apply search conditions
    if search_conditions:
        query = query.filter(or_(*search_conditions))
    
    # Order by relevance (tasks with search term in title first)
    tasks = query.order_by(
        TaskModel.title.ilike(f"{q}%").desc(),
        TaskModel.created_at.desc()
    ).all()
    
    return tasks

# Issue #20: Add advanced search endpoint
@router.post("/search/advanced", response_model=List[Task])
@limiter.limit("30/minute")  # Issue #18: Add rate limiting
async def advanced_search(
    request: Request,
    params: TaskSearchParams,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Advanced search with multiple filters"""
    query = db.query(TaskModel).filter(
        TaskModel.user_id == current_user.id
    )
    
    if params.q:
        query = query.filter(
            or_(
                TaskModel.title.ilike(f"%{params.q}%"),
                TaskModel.description.ilike(f"%{params.q}%")
            )
        )
    
    if params.completed is not None:
        query = query.filter(TaskModel.completed == params.completed)
        
    if params.priority:
        query = query.filter(TaskModel.priority == params.priority)
        
    if params.project_id:
        query = query.filter(TaskModel.project_id == params.project_id)
        
    if params.has_due_date is not None:
        if params.has_due_date:
            query = query.filter(TaskModel.due_date.isnot(None))
        else:
            query = query.filter(TaskModel.due_date.is_(None))
            
    if params.overdue:
        query = query.filter(
            TaskModel.due_date < datetime.utcnow(),
            TaskModel.completed == False
        )
        
    if params.created_after:
        query = query.filter(TaskModel.created_at >= params.created_after)
        
    if params.created_before:
        query = query.filter(TaskModel.created_at <= params.created_before)
    
    return query.order_by(TaskModel.created_at.desc()).all()

@router.post("/", response_model=Task)
@limiter.limit("30/minute")  # Issue #18: Add rate limiting
async def create_task(
    request: Request,
    task: TaskCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_task = TaskModel(**task.dict(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=Task)
@limiter.limit("100/minute")  # Issue #18: Add rate limiting
async def get_task(
    request: Request,
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task

@router.put("/{task_id}", response_model=Task)
@limiter.limit("60/minute")  # Issue #18: Add rate limiting
async def update_task(
    request: Request,
    task_id: int,
    task_update: TaskUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
@limiter.limit("30/minute")  # Issue #18: Add rate limiting
async def delete_task(
    request: Request,
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}