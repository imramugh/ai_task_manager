import api from './api';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: number;
  parent_task_id?: number;
  ai_generated: boolean;
  user_id: number;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: number;
  parent_task_id?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: number;
}

export const tasks = {
  async getAll(params?: {
    skip?: number;
    limit?: number;
    completed?: boolean;
    project_id?: number;
  }): Promise<Task[]> {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  },

  async get(id: number): Promise<Task> {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  async create(task: TaskCreate): Promise<Task> {
    const response = await api.post('/api/tasks', task);
    return response.data;
  },

  async update(id: number, task: TaskUpdate): Promise<Task> {
    const response = await api.put(`/api/tasks/${id}`, task);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/tasks/${id}`);
  },
};