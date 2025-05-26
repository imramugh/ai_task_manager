import openai
from typing import Dict, Any, List
from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        if settings.openai_api_key:
            openai.api_key = settings.openai_api_key
        else:
            logger.warning("OpenAI API key not configured")
    
    def chat(self, message: str, context: Dict[str, Any] = None) -> str:
        """
        Chat with AI assistant about tasks
        """
        if not settings.openai_api_key:
            return "AI service is not configured. Please set OPENAI_API_KEY."
        
        try:
            # Prepare system message with context
            system_message = "You are a helpful AI assistant for task management. "
            if context:
                system_message += f"User context: {json.dumps(context, default=str)}"
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return f"Sorry, I encountered an error: {str(e)}"
    
    def generate_task_suggestions(self, prompt: str) -> str:
        """
        Generate task suggestions based on a prompt
        """
        if not settings.openai_api_key:
            return "[]"
        
        try:
            system_message = """You are a task management assistant. Generate a JSON array of task suggestions based on the user's prompt. 
            Each task should have: title, description, priority (high/medium/low).
            Return only valid JSON array format."""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Generate tasks for: {prompt}"}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return "[]"
    
    def analyze_productivity(self, task_data: Dict[str, Any]) -> str:
        """
        Analyze user's productivity based on task data
        """
        if not settings.openai_api_key:
            return "AI service is not configured. Please set OPENAI_API_KEY."
        
        try:
            system_message = "You are a productivity analyst. Analyze the user's task data and provide insights and recommendations."
            
            prompt = f"Analyze this task data and provide productivity insights: {json.dumps(task_data)}"
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return f"Sorry, I encountered an error analyzing your productivity: {str(e)}" 