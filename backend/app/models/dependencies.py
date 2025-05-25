from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for task dependencies (many-to-many)
task_dependencies = Table(
    'task_dependencies',
    Base.metadata,
    Column('dependent_task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('prerequisite_task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('created_at', DateTime, default=DateTime.utcnow)
)
