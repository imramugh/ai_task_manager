import { apiClient } from './api';
import { Task, PaginatedResponse, SortConfig, TaskSearchParams } from './types';

// Issue #19: Update to use pagination
export async function getTasks(
  page: number = 1,
  perPage: number = 20,
  sortConfig?: SortConfig,
  filters?: {
    completed?: boolean;
    project_id?: number;
  }
): Promise<PaginatedResponse<Task>> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (sortConfig) {
    params.append('sort_by', sortConfig.field);
    params.append('order', sortConfig.order);
  }

  if (filters?.completed !== undefined) {
    params.append('completed', filters.completed.toString());
  }

  if (filters?.project_id) {
    params.append('project_id', filters.project_id.toString());
  }

  const response = await apiClient.get(`/tasks?${params}`);
  return response.data;
}

// Issue #20: Add search functionality
export async function searchTasks(query: string, searchIn: string[] = ['title', 'description']): Promise<Task[]> {
  const params = new URLSearchParams({
    q: query,
  });
  
  searchIn.forEach(field => params.append('search_in', field));
  
  const response = await apiClient.get(`/tasks/search?${params}`);
  return response.data;
}

// Issue #20: Add advanced search
export async function advancedSearchTasks(params: TaskSearchParams): Promise<Task[]> {
  const response = await apiClient.post('/tasks/search/advanced', params);
  return response.data;
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
}

export async function updateTask(
  taskId: number,
  updates: Partial<Task>
): Promise<Task> {
  const response = await apiClient.put(`/tasks/${taskId}`, updates);
  return response.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}

export async function toggleTaskComplete(
  taskId: number,
  completed: boolean
): Promise<Task> {
  return updateTask(taskId, { completed });
}