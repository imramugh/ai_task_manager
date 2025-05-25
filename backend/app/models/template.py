from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Issue #23: Task template model
class TaskTemplate(Base):
    __tablename__ = "task_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Task fields to pre-populate
    task_description = Column(Text, nullable=False)
    task_priority = Column(String(20), default="medium")
    task_project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    task_tags = Column(JSON, default=list)
    task_duration_days = Column(Integer, nullable=True)
    
    # Template metadata
    is_shared = Column(Boolean, default=False)
    category = Column(String(50))
    usage_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="templates")
    project = relationship("Project")