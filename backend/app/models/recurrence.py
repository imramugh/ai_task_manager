from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, date, timedelta
from enum import Enum
import calendar
from typing import Optional
from app.database import Base


class RecurrenceType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    CUSTOM = "custom"


class RecurrencePattern(Base):
    """Model for task recurrence patterns"""
    __tablename__ = "recurrence_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), unique=True)
    
    # Recurrence settings
    recurrence_type = Column(SQLEnum(RecurrenceType), nullable=False)
    interval = Column(Integer, default=1)  # Every N days/weeks/months
    
    # Weekly: which days (stored as comma-separated: "1,3,5" for Mon,Wed,Fri)
    week_days = Column(String(20), nullable=True)
    
    # Monthly: day of month (1-31) or "last"
    month_day = Column(String(10), nullable=True)
    
    # Monthly: week-based (e.g., "2nd Tuesday")
    month_week = Column(Integer, nullable=True)  # 1-4 or -1 for last
    month_week_day = Column(Integer, nullable=True)  # 0-6 for Sun-Sat
    
    # End conditions
    end_type = Column(String(20), default="never")  # never, after_n, by_date
    end_after_count = Column(Integer, nullable=True)
    end_by_date = Column(Date, nullable=True)
    
    # Tracking
    occurrences_created = Column(Integer, default=0)
    last_created_date = Column(Date, nullable=True)
    next_occurrence_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    task = relationship("Task", back_populates="recurrence_pattern")
    
    def calculate_next_occurrence(self, from_date: date) -> Optional[date]:
        """Calculate next occurrence date based on pattern"""
        if self.recurrence_type == RecurrenceType.DAILY:
            return from_date + timedelta(days=self.interval)
            
        elif self.recurrence_type == RecurrenceType.WEEKLY:
            # Handle specific weekdays
            if self.week_days:
                days = [int(d) for d in self.week_days.split(',')]
                current_weekday = from_date.weekday()
                
                # Find next valid weekday
                for i in range(1, 8):
                    next_day = (current_weekday + i) % 7
                    if next_day in days:
                        return from_date + timedelta(days=i)
                        
            return from_date + timedelta(weeks=self.interval)
            
        elif self.recurrence_type == RecurrenceType.MONTHLY:
            # Handle specific day of month
            if self.month_day:
                if self.month_day == "last":
                    # Last day of next month
                    next_month = from_date.replace(day=1) + timedelta(days=32)
                    return next_month.replace(day=1) - timedelta(days=1)
                else:
                    # Specific day of month
                    day = int(self.month_day)
                    next_month = from_date.replace(day=1) + timedelta(days=32)
                    max_day = calendar.monthrange(next_month.year, next_month.month)[1]
                    return next_month.replace(day=min(day, max_day))
            
            # Handle week-based monthly recurrence
            elif self.month_week is not None and self.month_week_day is not None:
                # Calculate the nth occurrence of a weekday in next month
                next_month_start = from_date.replace(day=1) + timedelta(days=32)
                next_month_start = next_month_start.replace(day=1)
                
                # Find all occurrences of the target weekday
                occurrences = []
                for day in range(1, calendar.monthrange(next_month_start.year, next_month_start.month)[1] + 1):
                    d = next_month_start.replace(day=day)
                    if d.weekday() == self.month_week_day:
                        occurrences.append(d)
                
                # Select the nth occurrence
                if self.month_week == -1:  # Last occurrence
                    return occurrences[-1] if occurrences else None
                elif 0 <= self.month_week - 1 < len(occurrences):
                    return occurrences[self.month_week - 1]
                    
        elif self.recurrence_type == RecurrenceType.YEARLY:
            # Simple yearly recurrence
            try:
                return from_date.replace(year=from_date.year + self.interval)
            except ValueError:
                # Handle leap year edge case (Feb 29)
                return from_date.replace(year=from_date.year + self.interval, day=28)
                
        return None
