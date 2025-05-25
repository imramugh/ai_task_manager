from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List, Dict, Any


class TimeEntryBase(BaseModel):
    description: Optional[str] = None
    is_billable: bool = False
    hourly_rate: Optional[float] = None


class TimeEntryCreate(TimeEntryBase):
    task_id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class TimeEntryUpdate(TimeEntryBase):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class TimeEntryResponse(TimeEntryBase):
    id: int
    task_id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_seconds: Optional[int]
    created_at: Optional[datetime]
    
    class Config:
        orm_mode = True


class TaskTimeInfo(BaseModel):
    id: int
    title: str
    estimated_hours: Optional[float]
    total_time_seconds: int
    time_vs_estimate: Optional[float]
    
    class Config:
        orm_mode = True


class ProjectSummary(BaseModel):
    id: Optional[int]
    name: Optional[str]
    total_seconds: int
    billable_seconds: int
    entries_count: int
    earnings: float
    
    class Config:
        orm_mode = True


class TaskSummary(BaseModel):
    task: TaskTimeInfo
    total_seconds: int
    billable_seconds: int
    entries_count: int
    earnings: float
    
    class Config:
        orm_mode = True


class DateSummary(BaseModel):
    date: date
    total_seconds: int
    billable_seconds: int
    entries_count: int
    earnings: float
    
    class Config:
        orm_mode = True


class TimePeriod(BaseModel):
    start: date
    end: date


class TimeSummaryResponse(BaseModel):
    period: TimePeriod
    summary: List[Dict[str, Any]]  # Can be TaskSummary, ProjectSummary, or DateSummary
    total_time_seconds: int
    billable_time_seconds: int
    total_earnings: float
    
    class Config:
        orm_mode = True
