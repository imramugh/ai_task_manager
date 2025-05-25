from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Association table for many-to-many relationship between tasks and tags
task_tags = Table(
    'task_tags',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

# Association table for task dependencies (many-to-many)
task_dependencies = Table(
    'task_dependencies',
    Base.metadata,
    Column('dependent_task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('prerequisite_task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('created_at', DateTime, default=func.now())
)

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    color = Column(String, default="#3B82F6")
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tasks = relationship("Task", back_populates="project")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, default="#6B7280")
    
    # Relationships
    tasks = relationship("Task", secondary=task_tags, back_populates="tags")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high, urgent
    due_date = Column(DateTime(timezone=True))
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    
    # AI-related fields
    ai_generated = Column(Boolean, default=False)
    ai_context = Column(Text)  # Store conversation context that led to task creation
    
    # Time tracking fields
    estimated_hours = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")
    subtasks = relationship("Task", backref="parent_task", remote_side=[id])
    
    # Time tracking relationships
    time_entries = relationship("TimeEntry", back_populates="task", cascade="all, delete-orphan")
    
    # Recurrence pattern relationship
    recurrence_pattern = relationship("RecurrencePattern", back_populates="task", uselist=False)
    
    # Task dependencies
    prerequisites = relationship(
        "Task",
        secondary=task_dependencies,
        primaryjoin=id == task_dependencies.c.dependent_task_id,
        secondaryjoin=id == task_dependencies.c.prerequisite_task_id,
        backref="dependents"
    )
    
    @property
    def total_time_seconds(self):
        """Calculate total time spent on this task"""
        return sum(entry.duration_seconds or entry.calculated_duration 
                  for entry in self.time_entries)
    
    @property
    def total_time_hours(self):
        """Calculate total time in hours"""
        return self.total_time_seconds / 3600
    
    @property
    def time_vs_estimate(self):
        """Calculate percentage of actual time vs estimated time"""
        if not self.estimated_hours:
            return None
        return (self.total_time_hours / self.estimated_hours) * 100
    
    @property
    def is_blocked(self):
        """Check if task is blocked by incomplete prerequisites"""
        return any(not prereq.completed for prereq in self.prerequisites)
    
    @property
    def can_start(self):
        """Check if all prerequisites are completed"""
        return all(prereq.completed for prereq in self.prerequisites)
