from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    content: str
    context: Optional[dict] = None

class TaskSuggestion(BaseModel):
    title: str
    description: str
    priority: str
    estimated_hours: Optional[float] = None

class ChatResponse(BaseModel):
    content: str
    suggestions: List[TaskSuggestion] = []