// Common types for the application

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

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
  project?: Project;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

// Issue #19: Add pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Issue #22: Add sorting types
export type SortField = 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title' | 'completed';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

// Issue #20: Add search params
export interface TaskSearchParams {
  q?: string;
  completed?: boolean;
  priority?: string;
  project_id?: number;
  has_due_date?: boolean;
  overdue?: boolean;
  created_after?: string;
  created_before?: string;
}

// Issue #23: Add template types
export interface TaskTemplate {
  id: number;
  name: string;
  description?: string;
  task_description: string;
  task_priority: string;
  task_project_id?: number;
  task_tags: string[];
  task_duration_days?: number;
  is_shared: boolean;
  category?: string;
  usage_count: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
}