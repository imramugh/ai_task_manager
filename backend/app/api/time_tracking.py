from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, date, timedelta
from app.database import get_db
from app.models import TimeEntry, Task, User
from app.api.auth import get_current_user
from app.schemas.time_tracking import (
    TimeEntryCreate, 
    TimeEntryResponse, 
    TimeEntryUpdate,
    TimeSummaryResponse
)

router = APIRouter()


@router.post("/tasks/{task_id}/timer/start", response_model=TimeEntryResponse)
def start_timer(
    task_id: int,
    entry_data: TimeEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start time tracking for a task"""
    # Verify task exists and belongs to user
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if there's already a running timer
    running_entry = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user.id,
        TimeEntry.end_time.is_(None)
    ).first()
    
    if running_entry:
        # Stop the running timer first
        running_entry.end_time = datetime.utcnow()
        running_entry.duration_seconds = int(
            (running_entry.end_time - running_entry.start_time).total_seconds()
        )
    
    # Create new time entry
    time_entry = TimeEntry(
        task_id=task_id,
        user_id=current_user.id,
        start_time=datetime.utcnow(),
        description=entry_data.description,
        is_billable=entry_data.is_billable,
        hourly_rate=entry_data.hourly_rate or current_user.default_hourly_rate
    )
    
    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)
    
    return time_entry


@router.post("/timer/{entry_id}/stop", response_model=TimeEntryResponse)
def stop_timer(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stop a running timer"""
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id
    ).first()
    
    if not time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    if time_entry.end_time:
        raise HTTPException(status_code=400, detail="Timer already stopped")
    
    time_entry.end_time = datetime.utcnow()
    time_entry.duration_seconds = int(
        (time_entry.end_time - time_entry.start_time).total_seconds()
    )
    
    db.commit()
    db.refresh(time_entry)
    
    return time_entry


@router.get("/time-entries", response_model=List[TimeEntryResponse])
def get_time_entries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    task_id: Optional[int] = None,
    project_id: Optional[int] = None,
    is_billable: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get time entries with filtering"""
    query = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user.id
    )
    
    if start_date:
        query = query.filter(TimeEntry.start_time >= start_date)
    if end_date:
        query = query.filter(TimeEntry.start_time <= end_date + timedelta(days=1))
    if task_id:
        query = query.filter(TimeEntry.task_id == task_id)
    if project_id:
        query = query.join(Task).filter(Task.project_id == project_id)
    if is_billable is not None:
        query = query.filter(TimeEntry.is_billable == is_billable)
    
    return query.order_by(TimeEntry.start_time.desc()).all()


@router.post("/time-entries", response_model=TimeEntryResponse)
def create_manual_time_entry(
    entry_data: TimeEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a manual time entry"""
    # Verify task exists and belongs to user
    task = db.query(Task).filter(
        Task.id == entry_data.task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Calculate duration if both start and end time provided
    duration = None
    if entry_data.start_time and entry_data.end_time:
        duration = int((entry_data.end_time - entry_data.start_time).total_seconds())
    
    time_entry = TimeEntry(
        task_id=entry_data.task_id,
        user_id=current_user.id,
        start_time=entry_data.start_time,
        end_time=entry_data.end_time,
        duration_seconds=duration,
        description=entry_data.description,
        is_billable=entry_data.is_billable,
        hourly_rate=entry_data.hourly_rate or current_user.default_hourly_rate
    )
    
    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)
    
    return time_entry


@router.put("/time-entries/{entry_id}", response_model=TimeEntryResponse)
def update_time_entry(
    entry_id: int,
    entry_update: TimeEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a time entry"""
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id
    ).first()
    
    if not time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Update fields
    for field, value in entry_update.dict(exclude_unset=True).items():
        setattr(time_entry, field, value)
    
    # Recalculate duration if times changed
    if time_entry.start_time and time_entry.end_time:
        time_entry.duration_seconds = int(
            (time_entry.end_time - time_entry.start_time).total_seconds()
        )
    
    db.commit()
    db.refresh(time_entry)
    
    return time_entry


@router.delete("/time-entries/{entry_id}")
def delete_time_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a time entry"""
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.id == entry_id,
        TimeEntry.user_id == current_user.id
    ).first()
    
    if not time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    db.delete(time_entry)
    db.commit()
    
    return {"message": "Time entry deleted successfully"}


@router.get("/reports/time-summary", response_model=TimeSummaryResponse)
def get_time_summary(
    period: str = Query("week", enum=["day", "week", "month", "year", "custom"]),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    group_by: str = Query("task", enum=["task", "project", "date"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get time tracking summary report"""
    # Determine date range based on period
    today = date.today()
    
    if period == "day":
        start_date = today
        end_date = today
    elif period == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
    elif period == "month":
        start_date = today.replace(day=1)
        next_month = start_date + timedelta(days=32)
        end_date = next_month.replace(day=1) - timedelta(days=1)
    elif period == "year":
        start_date = today.replace(month=1, day=1)
        end_date = today.replace(month=12, day=31)
    
    # Build query
    query = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user.id,
        TimeEntry.start_time >= start_date,
        TimeEntry.start_time <= end_date + timedelta(days=1)
    )
    
    entries = query.all()
    
    # Calculate summary statistics
    total_time = sum(e.duration_seconds or 0 for e in entries)
    billable_time = sum(e.duration_seconds or 0 for e in entries if e.is_billable)
    total_earnings = sum(
        (e.duration_seconds or 0) / 3600 * (e.hourly_rate or 0)
        for e in entries if e.is_billable
    )
    
    # Group data based on group_by parameter
    summary_data = []
    
    if group_by == "task":
        # Group by task
        task_groups = {}
        for entry in entries:
            if entry.task_id not in task_groups:
                task_groups[entry.task_id] = {
                    "task": entry.task,
                    "total_seconds": 0,
                    "billable_seconds": 0,
                    "entries_count": 0,
                    "earnings": 0
                }
            
            task_groups[entry.task_id]["total_seconds"] += entry.duration_seconds or 0
            if entry.is_billable:
                task_groups[entry.task_id]["billable_seconds"] += entry.duration_seconds or 0
                task_groups[entry.task_id]["earnings"] += (
                    (entry.duration_seconds or 0) / 3600 * (entry.hourly_rate or 0)
                )
            task_groups[entry.task_id]["entries_count"] += 1
        
        summary_data = list(task_groups.values())
    
    elif group_by == "project":
        # Group by project
        project_groups = {}
        for entry in entries:
            project_id = entry.task.project_id or "no_project"
            if project_id not in project_groups:
                project_groups[project_id] = {
                    "project": entry.task.project if entry.task.project else None,
                    "total_seconds": 0,
                    "billable_seconds": 0,
                    "entries_count": 0,
                    "earnings": 0
                }
            
            project_groups[project_id]["total_seconds"] += entry.duration_seconds or 0
            if entry.is_billable:
                project_groups[project_id]["billable_seconds"] += entry.duration_seconds or 0
                project_groups[project_id]["earnings"] += (
                    (entry.duration_seconds or 0) / 3600 * (entry.hourly_rate or 0)
                )
            project_groups[project_id]["entries_count"] += 1
        
        summary_data = list(project_groups.values())
    
    return {
        "period": {"start": start_date, "end": end_date},
        "summary": summary_data,
        "total_time_seconds": total_time,
        "billable_time_seconds": billable_time,
        "total_earnings": total_earnings
    }


@router.get("/timer/running", response_model=Optional[TimeEntryResponse])
def get_running_timer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the currently running timer if any"""
    running_entry = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user.id,
        TimeEntry.end_time.is_(None)
    ).first()
    
    return running_entry
