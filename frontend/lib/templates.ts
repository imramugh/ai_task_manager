import { apiClient } from './api';
import { TaskTemplate, Task } from './types';

// Issue #23: Task template functions
export async function getTemplates(
  category?: string,
  isShared?: boolean
): Promise<TaskTemplate[]> {
  const params = new URLSearchParams();
  
  if (category) {
    params.append('category', category);
  }
  
  if (isShared !== undefined) {
    params.append('is_shared', isShared.toString());
  }
  
  const response = await apiClient.get(`/templates?${params}`);
  return response.data;
}

export async function createTemplate(templateData: Partial<TaskTemplate>): Promise<TaskTemplate> {
  const response = await apiClient.post('/templates', templateData);
  return response.data;
}

export async function useTemplate(templateId: number): Promise<Task> {
  const response = await apiClient.post(`/templates/${templateId}/use`);
  return response.data;
}

export async function updateTemplate(
  templateId: number,
  updates: Partial<TaskTemplate>
): Promise<TaskTemplate> {
  const response = await apiClient.put(`/templates/${templateId}`, updates);
  return response.data;
}

export async function deleteTemplate(templateId: number): Promise<void> {
  await apiClient.delete(`/templates/${templateId}`);
}