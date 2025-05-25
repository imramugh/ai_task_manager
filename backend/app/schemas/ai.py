from pydantic import BaseModel
from typing import List, Optional

# Individual message in a conversation
class ConversationMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

# Updated to support conversation history
class ChatMessage(BaseModel):
    content: str
    context: Optional[dict] = None
    # Add conversation history support
    conversation_history: Optional[List[ConversationMessage]] = None

class TaskSuggestion(BaseModel):
    title: str
    description: str
    priority: str
    estimated_hours: Optional[float] = None

class ChatResponse(BaseModel):
    content: str
    suggestions: List[TaskSuggestion] = []