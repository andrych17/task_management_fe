export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  tasks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export type TaskStatus =  'todo' | 'in-progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  user_id: number;
  project_id: number | null;
  project?: Project;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  project_id?: number;
  tags?: string[]; // Changed to string[] to match API documentation
  due_date?: string;
  status?: TaskStatus;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  project_id?: number | null;
  tags?: string[]; // Changed to string[] to match API documentation
  due_date?: string | null;
  status?: TaskStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface FilterOptions {
  project_id?: number | null;
  tag_ids?: number[];
  due_date?: string | null;
  status?: TaskStatus | null;
}
