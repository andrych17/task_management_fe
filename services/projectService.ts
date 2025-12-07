import api from '@/lib/api';
import { Project, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/lib/constants';

export class ProjectService {
  static async getProjects(search?: string): Promise<Project[]> {
    try {
      const url = search 
        ? `${API_ENDPOINTS.PROJECTS}?search=${encodeURIComponent(search)}`
        : API_ENDPOINTS.PROJECTS;
      
      console.log('🔗 [ProjectService] Fetching projects from:', url);
      const response = await api.get(url);
      
      // API returns: { success: true, data: [...] } or { success: true, data: { data: [...] } } (paginated)
      let projects: Project[] = [];
      
      if (response.data.success && response.data.data) {
        // Check if data.data exists (paginated response)
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          projects = response.data.data.data;
          console.log('📊 [ProjectService] Paginated response detected');
        } else if (Array.isArray(response.data.data)) {
          projects = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        projects = response.data;
      }
      
      console.log('✅ [ProjectService] Response:', {
        success: response.data.success,
        count: projects.length,
        message: response.data.message,
        rawDataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data)
      });
      console.log(`📊 [ProjectService] Returning ${projects.length} projects`);
      
      return projects;
    } catch (error: any) {
      console.error('❌ [ProjectService] Error fetching projects:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors
      });
      throw this.handleError(error);
    }
  }

  // Note: Projects are read-only. No create, update, delete endpoints available.
  
  static async createProject(data: { name: string; description?: string }): Promise<Project> {
    console.error('❌ [ProjectService] Create not available - Projects are read-only');
    throw new Error('Projects are read-only. Create operation not available.');
  }

  static async updateProject(id: number, data: { name: string; description?: string }): Promise<Project> {
    console.error('❌ [ProjectService] Update not available - Projects are read-only');
    throw new Error('Projects are read-only. Update operation not available.');
  }

  static async deleteProject(id: number): Promise<void> {
    console.error('❌ [ProjectService] Delete not available - Projects are read-only');
    throw new Error('Projects are read-only. Delete operation not available.');
  }

  private static handleError(error: any): Error {
    console.error('🔍 [ProjectService] Error details:', {
      status: error.response?.status,
      success: error.response?.data?.success,
      message: error.response?.data?.message,
      errors: error.response?.data?.errors
    });
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0] as string[];
      return new Error(firstError[0] || 'Validation failed');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}
