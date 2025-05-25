from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from openai import OpenAI
import json
from app.database import get_db
from app.schemas.ai import ChatMessage, ChatResponse, TaskSuggestion
from app.models.user import User as UserModel
from app.models.task import Task as TaskModel
from app.services.auth import get_current_user
from app.config import settings

router = APIRouter()

# Initialize OpenAI client
client = None
if settings.openai_api_key:
    client = OpenAI(api_key=settings.openai_api_key)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    message: ChatMessage,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not client:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables."
        )
    
    try:
        # Create the system prompt
        system_prompt = """
        You are an AI task management assistant. Your role is to help users plan tasks, 
        break down projects, and organize their work efficiently. When users describe 
        what they want to accomplish, you should:
        
        1. Ask clarifying questions if needed
        2. Suggest a structured breakdown of tasks
        3. Recommend priorities and timelines
        4. Output task suggestions in a structured format
        
        Always be helpful, concise, and focused on actionable task management.
        """
        
        # Create the chat completion using the new client
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message.content}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        assistant_message = response.choices[0].message.content
        
        return ChatResponse(
            content=assistant_message,
            suggestions=[]
        )
        
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")  # This will help with debugging
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-tasks")
async def generate_tasks(
    message: ChatMessage,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not client:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables."
        )
    
    try:
        # Extract project_id from context if provided
        project_id = None
        if message.context and isinstance(message.context, dict):
            project_id = message.context.get('project_id')
        
        # Create a function calling prompt
        functions = [
            {
                "type": "function",
                "function": {
                    "name": "create_tasks",
                    "description": "Create a list of tasks based on user requirements",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "tasks": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "description": {"type": "string"},
                                        "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]},
                                        "estimated_hours": {"type": "number"}
                                    },
                                    "required": ["title", "description", "priority"]
                                }
                            }
                        },
                        "required": ["tasks"]
                    }
                }
            }
        ]
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a task planning assistant. Generate structured tasks based on user requirements."},
                {"role": "user", "content": message.content}
            ],
            tools=functions,
            tool_choice={"type": "function", "function": {"name": "create_tasks"}}
        )
        
        # Parse the function call response
        tool_call = response.choices[0].message.tool_calls[0]
        function_args = json.loads(tool_call.function.arguments)
        suggested_tasks = function_args.get("tasks", [])
        
        # Create tasks in the database
        created_tasks = []
        for task_data in suggested_tasks:
            db_task = TaskModel(
                title=task_data["title"],
                description=task_data["description"],
                priority=task_data["priority"],
                ai_generated=True,
                ai_context=message.content,
                user_id=current_user.id,
                project_id=project_id  # Add project_id if provided
            )
            db.add(db_task)
            created_tasks.append(db_task)
        
        db.commit()
        
        return {
            "message": f"Created {len(created_tasks)} tasks",
            "tasks": created_tasks
        }
        
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")  # This will help with debugging
        raise HTTPException(status_code=500, detail=str(e))