import api from '@/lib/api';
import { Task, CreateTaskData, UpdateTaskData, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/lib/constants';

export class TaskService {
  static async getTasks(): Promise<Task[]> {
    try {
      console.log('🔗 [TaskService] Fetching tasks from:', API_ENDPOINTS.TASKS);
      // Fetch all tasks with large per_page to get everything
      const response = await api.get(`${API_ENDPOINTS.TASKS}?per_page=1000`);
      
      // API returns: { success: true, data: [...] } or { success: true, data: { data: [...] } } (paginated)
      let tasks: Task[] = [];
      
      if (response.data.success && response.data.data) {
        // Check if data.data exists (paginated response)
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          tasks = response.data.data.data;
          console.log('📊 [TaskService] Paginated response detected');
        } else if (Array.isArray(response.data.data)) {
          tasks = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        tasks = response.data;
      }
      
      console.log('✅ [TaskService] Response:', {
        success: response.data.success,
        count: tasks.length,
        message: response.data.message,
        rawDataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data)
      });
      console.log(`📊 [TaskService] Returning ${tasks.length} tasks`);
      
      return tasks;
    } catch (error: any) {
      console.error('❌ [TaskService] Error fetching tasks:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors
      });
      throw this.handleError(error);
    }
  }

  static async getTask(id: number): Promise<Task> {
    try {
      console.log(`🔗 [TaskService] Fetching task #${id}`);
      const response = await api.get<ApiResponse<Task>>(API_ENDPOINTS.TASK_BY_ID(id));
      console.log(`✅ [TaskService] Task #${id} retrieved:`, {
        title: response.data.data?.title,
        status: response.data.data?.status,
        project: response.data.data?.project?.name,
        tags: response.data.data?.tags?.length
      });
      if (!response.data.data) {
        throw new Error('Task not found');
      }
      return response.data.data;
    } catch (error: any) {
      console.error(`❌ [TaskService] Error fetching task #${id}:`, error.response?.data);
      throw this.handleError(error);
    }
  }

  static async createTask(data: CreateTaskData): Promise<Task> {
    try {
      console.log('➕ [TaskService] Creating task:', {
        title: data.title,
        status: data.status,
        project_id: data.project_id,
        tags: data.tags?.length,
        has_due_date: !!data.due_date
      });
      const response = await api.post<ApiResponse<Task>>(API_ENDPOINTS.TASKS, data);
      console.log('✅ [TaskService] Task created:', {
        id: response.data.data?.id,
        title: response.data.data?.title,
        message: response.data.message
      });
      if (!response.data.data) {
        throw new Error('Failed to create task');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('❌ [TaskService] Error creating task:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors
      });
      throw this.handleError(error);
    }
  }

  static async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    try {
      console.log(`✏️ [TaskService] Updating task #${id}:`, {
        fields: Object.keys(data),
        status: data.status,
        title: data.title,
        tags: data.tags
      });
      const response = await api.put<ApiResponse<Task>>(API_ENDPOINTS.TASK_BY_ID(id), data);
      console.log(`✅ [TaskService] Task #${id} updated:`, {
        title: response.data.data?.title,
        status: response.data.data?.status,
        message: response.data.message
      });
      if (!response.data.data) {
        throw new Error('Failed to update task');
      }
      return response.data.data;
    } catch (error: any) {
      console.error(`❌ [TaskService] Error updating task #${id}:`, error.response?.data);
      throw this.handleError(error);
    }
  }

  static async deleteTask(id: number): Promise<void> {
    try {
      console.log(`🗑️ [TaskService] Deleting task #${id}`);
      const response = await api.delete(API_ENDPOINTS.TASK_BY_ID(id));
      console.log(`✅ [TaskService] Task #${id} deleted successfully`);
    } catch (error: any) {
      console.error(`❌ [TaskService] Error deleting task #${id}:`, error.response?.data);
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): Error {
    console.error('🔍 [TaskService] Error details:', {
      status: error.response?.status,
      success: error.response?.data?.success,
      message: error.response?.data?.message,
      errors: error.response?.data?.errors
    });
    
    // Preserve the original error with response data for proper error handling
    if (error.response) {
      // Create a new error but attach the response data
      const err: any = new Error(error.response?.data?.message || error.message || 'An unexpected error occurred');
      err.response = error.response;
      return err;
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}
