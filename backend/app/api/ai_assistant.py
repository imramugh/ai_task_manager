from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.ai import AIRequest, AIResponse
from app.models.user import User as UserModel
from app.models.task import Task as TaskModel
from app.services.auth import get_current_user
from app.services.ai_service import AIService
from app.config import settings
import json

# Issue #18: Import rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.post("/chat", response_model=AIResponse)
@limiter.limit("20/hour")  # Issue #18: Strict rate limiting for AI endpoints to control costs
async def chat_with_ai(
    request: Request,
    ai_request: AIRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with AI assistant about tasks
    Rate limited to 20 requests per hour to prevent abuse
    """
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured"
        )
    
    ai_service = AIService()
    
    # Get user's tasks for context
    tasks = db.query(TaskModel).filter(
        TaskModel.user_id == current_user.id
    ).all()
    
    # Create context from tasks
    context = {
        "user_name": current_user.username,
        "total_tasks": len(tasks),
        "active_tasks": len([t for t in tasks if not t.completed]),
        "completed_tasks": len([t for t in tasks if t.completed]),
        "high_priority_tasks": len([t for t in tasks if t.priority == "high" and not t.completed]),
        "tasks_list": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "completed": t.completed,
                "due_date": t.due_date.isoformat() if t.due_date else None
            }
            for t in tasks[:10]  # Limit to 10 most recent tasks for context
        ]
    }
    
    # Get AI response
    response = ai_service.chat(
        message=ai_request.message,
        context=context
    )
    
    return AIResponse(response=response)

@router.post("/generate-tasks")
@limiter.limit("10/hour")  # Issue #18: Even stricter rate limiting for task generation
async def generate_tasks(
    request: Request,
    prompt: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate task suggestions based on a prompt
    Rate limited to 10 requests per hour to prevent abuse
    """
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured"
        )
    
    ai_service = AIService()
    
    # Generate task suggestions
    suggestions = ai_service.generate_task_suggestions(prompt)
    
    # Parse and create tasks
    created_tasks = []
    
    try:
        # The AI should return a JSON array of task suggestions
        task_list = json.loads(suggestions)
        
        for task_data in task_list:
            if isinstance(task_data, dict):
                task = TaskModel(
                    title=task_data.get("title", "Untitled Task"),
                    description=task_data.get("description", ""),
                    priority=task_data.get("priority", "medium"),
                    user_id=current_user.id,
                    ai_generated=True
                )
                db.add(task)
                created_tasks.append(task)
        
        db.commit()
        
        # Refresh all tasks to get their IDs
        for task in created_tasks:
            db.refresh(task)
        
        return {
            "message": f"Generated {len(created_tasks)} tasks",
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority
                }
                for task in created_tasks
            ]
        }
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Failed to parse AI response"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create tasks: {str(e)}"
        )

@router.post("/analyze-productivity")
@limiter.limit("15/hour")  # Issue #18: Rate limiting for analysis endpoint
async def analyze_productivity(
    request: Request,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI analysis of user's productivity
    Rate limited to 15 requests per hour
    """
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured"
        )
    
    ai_service = AIService()
    
    # Get user's tasks
    tasks = db.query(TaskModel).filter(
        TaskModel.user_id == current_user.id
    ).all()
    
    # Prepare task data for analysis
    task_data = {
        "total_tasks": len(tasks),
        "completed_tasks": len([t for t in tasks if t.completed]),
        "overdue_tasks": len([t for t in tasks if t.due_date and t.due_date < datetime.utcnow() and not t.completed]),
        "high_priority_incomplete": len([t for t in tasks if t.priority == "high" and not t.completed]),
        "tasks_by_priority": {
            "high": len([t for t in tasks if t.priority == "high"]),
            "medium": len([t for t in tasks if t.priority == "medium"]),
            "low": len([t for t in tasks if t.priority == "low"])
        }
    }
    
    # Get AI analysis
    analysis = ai_service.analyze_productivity(task_data)
    
    return {"analysis": analysis}