import api from './api';

export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  color?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  color?: string;
}

export const projects = {
  async getAll(): Promise<Project[]> {
    const response = await api.get('/api/projects');
    return response.data;
  },

  async get(id: number): Promise<Project> {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  async create(project: ProjectCreate): Promise<Project> {
    const response = await api.post('/api/projects', project);
    return response.data;
  },

  async update(id: number, project: ProjectUpdate): Promise<Project> {
    const response = await api.put(`/api/projects/${id}`, project);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/projects/${id}`);
  },
};