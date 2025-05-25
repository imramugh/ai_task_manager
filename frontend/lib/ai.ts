import api from './api';

export interface ChatMessage {
  content: string;
  context?: any;
}

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: string;
  estimated_hours?: number;
}

export interface ChatResponse {
  content: string;
  suggestions: TaskSuggestion[];
}

export const ai = {
  async chat(message: ChatMessage): Promise<ChatResponse> {
    const response = await api.post('/api/ai/chat', message);
    return response.data;
  },

  async generateTasks(message: ChatMessage): Promise<{
    message: string;
    tasks: any[];
  }> {
    const response = await api.post('/api/ai/generate-tasks', message);
    return response.data;
  },
};