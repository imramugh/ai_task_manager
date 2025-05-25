from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models import RecurrencePattern, Task, User, RecurrenceType
from app.api.auth import get_current_user
from app.schemas.recurrence import (
    RecurrencePatternCreate,
    RecurrencePatternUpdate,
    RecurrencePatternResponse,
    RecurrencePreview
)

router = APIRouter()


@router.post("/tasks/{task_id}/recurrence", response_model=RecurrencePatternResponse)
def set_task_recurrence(
    task_id: int,
    recurrence: RecurrencePatternCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set recurrence pattern for a task"""
    # Verify task exists and belongs to user
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if recurrence already exists
    existing = db.query(RecurrencePattern).filter(
        RecurrencePattern.task_id == task_id
    ).first()
    
    if existing:
        # Update existing pattern
        for key, value in recurrence.dict(exclude_unset=True).items():
            setattr(existing, key, value)
        pattern = existing
    else:
        # Create new pattern
        pattern = RecurrencePattern(
            task_id=task_id,
            **recurrence.dict()
        )
        db.add(pattern)
    
    # Calculate first occurrence
    pattern.next_occurrence_date = pattern.calculate_next_occurrence(date.today())
    
    db.commit()
    db.refresh(pattern)
    
    return pattern


@router.get("/tasks/{task_id}/recurrence", response_model=Optional[RecurrencePatternResponse])
def get_task_recurrence(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recurrence pattern for a task"""
    # Verify task exists and belongs to user
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    pattern = db.query(RecurrencePattern).filter(
        RecurrencePattern.task_id == task_id
    ).first()
    
    return pattern


@router.put("/tasks/{task_id}/recurrence", response_model=RecurrencePatternResponse)
def update_task_recurrence(
    task_id: int,
    recurrence_update: RecurrencePatternUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update recurrence pattern for a task"""
    # Verify task exists and belongs to user
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    pattern = db.query(RecurrencePattern).filter(
        RecurrencePattern.task_id == task_id
    ).first()
    
    if not pattern:
        raise HTTPException(status_code=404, detail="Recurrence pattern not found")
    
    # Update fields
    for field, value in recurrence_update.dict(exclude_unset=True).items():
        setattr(pattern, field, value)
    
    # Recalculate next occurrence
    if pattern.is_active:
        pattern.next_occurrence_date = pattern.calculate_next_occurrence(date.today())
    
    db.commit()
    db.refresh(pattern)
    
    return pattern


@router.delete("/tasks/{task_id}/recurrence")
def delete_task_recurrence(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete recurrence pattern for a task"""
    # Verify task exists and belongs to user
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    pattern = db.query(RecurrencePattern).filter(
        RecurrencePattern.task_id == task_id
    ).first()
    
    if not pattern:
        raise HTTPException(status_code=404, detail="Recurrence pattern not found")
    
    db.delete(pattern)
    db.commit()
    
    return {"message": "Recurrence pattern deleted successfully"}


@router.post("/recurrence/process")
def process_recurring_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process all due recurring tasks (admin only)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    today = date.today()
    
    # Find all active patterns with due occurrences
    due_patterns = db.query(RecurrencePattern).filter(
        RecurrencePattern.is_active == True,
        RecurrencePattern.next_occurrence_date <= today
    ).all()
    
    created_tasks = []
    
    for pattern in due_patterns:
        # Check end conditions
        if pattern.end_type == "after_n" and pattern.occurrences_created >= pattern.end_after_count:
            pattern.is_active = False
            continue
            
        if pattern.end_type == "by_date" and today > pattern.end_by_date:
            pattern.is_active = False
            continue
        
        # Create new task instance
        original_task = pattern.task
        new_task = Task(
            user_id=original_task.user_id,
            title=original_task.title,
            description=original_task.description,
            priority=original_task.priority,
            project_id=original_task.project_id,
            parent_task_id=original_task.parent_task_id,
            estimated_hours=original_task.estimated_hours,
            completed=False,
            # Adjust due date based on recurrence
            due_date=pattern.next_occurrence_date + timedelta(
                days=(original_task.due_date - original_task.created_at.date()).days
                if original_task.due_date else 0
            )
        )
        
        # Copy tags
        new_task.tags = original_task.tags
        
        db.add(new_task)
        created_tasks.append(new_task)
        
        # Update pattern tracking
        pattern.occurrences_created += 1
        pattern.last_created_date = today
        pattern.next_occurrence_date = pattern.calculate_next_occurrence(today)
    
    db.commit()
    
    return {
        "processed": len(due_patterns),
        "created": len(created_tasks),
        "task_ids": [task.id for task in created_tasks]
    }


@router.post("/tasks/{task_id}/recurrence/preview", response_model=RecurrencePreview)
def preview_recurrence(
    task_id: int,
    recurrence: RecurrencePatternCreate,
    count: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview next occurrences of a recurrence pattern"""
    # Verify task exists and belongs to user
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create temporary pattern to calculate occurrences
    pattern = RecurrencePattern(**recurrence.dict())
    
    # Generate next occurrences
    occurrences = []
    current_date = date.today()
    
    for _ in range(count):
        next_date = pattern.calculate_next_occurrence(current_date)
        if next_date:
            occurrences.append(next_date)
            current_date = next_date
        else:
            break
    
    # Generate description
    description = generate_recurrence_description(pattern)
    
    return {
        "description": description,
        "next_occurrences": occurrences
    }


def generate_recurrence_description(pattern: RecurrencePattern) -> str:
    """Generate human-readable description of recurrence pattern"""
    if pattern.recurrence_type == RecurrenceType.DAILY:
        if pattern.interval == 1:
            return "Daily"
        return f"Every {pattern.interval} days"
    
    elif pattern.recurrence_type == RecurrenceType.WEEKLY:
        if pattern.week_days:
            days = [int(d) for d in pattern.week_days.split(',')]
            day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            selected_days = [day_names[d] for d in sorted(days)]
            
            if pattern.interval == 1:
                return f"Weekly on {', '.join(selected_days)}"
            return f"Every {pattern.interval} weeks on {', '.join(selected_days)}"
        else:
            if pattern.interval == 1:
                return "Weekly"
            return f"Every {pattern.interval} weeks"
    
    elif pattern.recurrence_type == RecurrenceType.MONTHLY:
        if pattern.month_day:
            if pattern.month_day == "last":
                return "Monthly on the last day"
            return f"Monthly on day {pattern.month_day}"
        elif pattern.month_week is not None and pattern.month_week_day is not None:
            week_names = ['First', 'Second', 'Third', 'Fourth', 'Last']
            day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            week = week_names[pattern.month_week - 1] if pattern.month_week > 0 else 'Last'
            day = day_names[pattern.month_week_day]
            return f"Monthly on the {week} {day}"
        else:
            if pattern.interval == 1:
                return "Monthly"
            return f"Every {pattern.interval} months"
    
    elif pattern.recurrence_type == RecurrenceType.YEARLY:
        if pattern.interval == 1:
            return "Yearly"
        return f"Every {pattern.interval} years"
    
    return "Custom recurrence"


@router.get("/recurrence/active", response_model=List[RecurrencePatternResponse])
def get_active_recurrences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active recurrence patterns for the user"""
    patterns = db.query(RecurrencePattern).join(Task).filter(
        Task.user_id == current_user.id,
        RecurrencePattern.is_active == True
    ).all()
    
    return patterns
