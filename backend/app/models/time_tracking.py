from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class TimeEntry(Base):
    """Model for tracking time spent on tasks"""
    __tablename__ = "time_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Time tracking
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)  # Calculated field
    
    # Additional info
    description = Column(Text, nullable=True)
    is_billable = Column(Boolean, default=False)
    hourly_rate = Column(Float, nullable=True)
    
    # Relationships
    task = relationship("Task", back_populates="time_entries")
    user = relationship("User", back_populates="time_entries")
    
    @property
    def is_running(self):
        """Check if timer is currently running"""
        return self.end_time is None
    
    @property
    def calculated_duration(self):
        """Calculate duration in seconds"""
        if self.end_time:
            return int((self.end_time - self.start_time).total_seconds())
        elif self.start_time:
            return int((datetime.utcnow() - self.start_time).total_seconds())
        return 0
