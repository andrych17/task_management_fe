import { TaskService } from '../taskService';
import { ProjectService } from '../projectService';
import { TagService } from '../tagService';
import api from '@/lib/api';

jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Service Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TaskService', () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'pending', due_date: '2025-12-10' },
      { id: 2, title: 'Task 2', status: 'done', due_date: null },
    ];

    it('should get all tasks', async () => {
      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockTasks } });
      
      const result = await TaskService.getTasks();
      
      expect(mockedApi.get).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks', async () => {
      mockedApi.get.mockResolvedValue({ data: { success: true, data: [] } });
      
      const result = await TaskService.getTasks();
      
      expect(result).toEqual([]);
    });

    it('should handle getTasks error with message', async () => {
      mockedApi.get.mockRejectedValue({
        response: { data: { message: 'Server error' } }
      });
      
      await expect(TaskService.getTasks()).rejects.toThrow('Server error');
    });

    it('should handle getTasks error with validation errors', async () => {
      mockedApi.get.mockRejectedValue({
        response: { data: { errors: { field: ['Validation error'] } } }
      });
      
      await expect(TaskService.getTasks()).rejects.toThrow('Validation error');
    });

    it('should handle getTasks generic error', async () => {
      mockedApi.get.mockRejectedValue(new Error('Network error'));
      
      await expect(TaskService.getTasks()).rejects.toThrow('Network error');
    });

    it('should get task by id', async () => {
      mockedApi.get.mockResolvedValue({ data: { data: mockTasks[0] } });
      
      const result = await TaskService.getTask(1);
      
      expect(mockedApi.get).toHaveBeenCalledWith('/tasks/1');
      expect(result).toEqual(mockTasks[0]);
    });

    it('should throw error when task not found', async () => {
      mockedApi.get.mockResolvedValue({ data: {} });
      
      await expect(TaskService.getTask(999)).rejects.toThrow('Task not found');
    });

    it('should create task', async () => {
      const newTask = { title: 'New Task', description: 'Description', status: 'pending' };
      mockedApi.post.mockResolvedValue({ data: { data: { id: 3, ...newTask } } });
      
      const result = await TaskService.createTask(newTask as any);
      
      expect(mockedApi.post).toHaveBeenCalledWith('/tasks', newTask);
      expect(result).toEqual({ id: 3, ...newTask });
    });

    it('should throw error when create task fails', async () => {
      mockedApi.post.mockResolvedValue({ data: {} });
      
      await expect(TaskService.createTask({} as any)).rejects.toThrow('Failed to create task');
    });

    it('should update task', async () => {
      const updates = { title: 'Updated Task' };
      mockedApi.put.mockResolvedValue({ data: { data: { ...mockTasks[0], ...updates } } });
      
      const result = await TaskService.updateTask(1, updates as any);
      
      expect(mockedApi.put).toHaveBeenCalledWith('/tasks/1', updates);
      expect(result.title).toBe('Updated Task');
    });

    it('should throw error when update task fails', async () => {
      mockedApi.put.mockResolvedValue({ data: {} });
      
      await expect(TaskService.updateTask(1, {} as any)).rejects.toThrow('Failed to update task');
    });

    it('should delete task', async () => {
      mockedApi.delete.mockResolvedValue({ data: { success: true } });
      
      await TaskService.deleteTask(1);
      
      expect(mockedApi.delete).toHaveBeenCalledWith('/tasks/1');
    });

    it('should handle delete task error', async () => {
      mockedApi.delete.mockRejectedValue({
        response: { data: { message: 'Cannot delete task' } }
      });
      
      await expect(TaskService.deleteTask(1)).rejects.toThrow('Cannot delete task');
    });
  });

  describe('ProjectService', () => {
    const mockProjects = [
      { id: 1, name: 'Project 1' },
      { id: 2, name: 'Project 2' },
    ];

    it('should get all projects', async () => {
      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockProjects } });
      
      const result = await ProjectService.getProjects();
      
      expect(mockedApi.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when no projects', async () => {
      mockedApi.get.mockResolvedValue({ data: { success: true, data: [] } });
      
      const result = await ProjectService.getProjects();
      
      expect(result).toEqual([]);
    });

    it('should handle getProjects error', async () => {
      mockedApi.get.mockRejectedValue({
        response: { data: { message: 'Unauthorized' } }
      });
      
      await expect(ProjectService.getProjects()).rejects.toThrow('Unauthorized');
    });

    // Projects are read-only - these operations should throw errors
    it('should throw error when trying to create project', async () => {
      const newProject = { name: 'New Project', description: 'Description' };
      
      await expect(ProjectService.createProject(newProject)).rejects.toThrow('Projects are read-only');
    });

    it('should throw error when trying to update project', async () => {
      const updates = { name: 'Updated Project' };
      
      await expect(ProjectService.updateProject(1, updates)).rejects.toThrow('Projects are read-only');
    });

    it('should throw error when trying to delete project', async () => {
      await expect(ProjectService.deleteProject(1)).rejects.toThrow('Projects are read-only');
    });
  });

  describe('TagService', () => {
    const mockTags = [
      { id: 1, name: 'urgent' },
      { id: 2, name: 'bug' },
    ];

    const mockTasks = [
      { id: 1, title: 'Task 1', tags: [{ id: 1, name: 'urgent' }, { id: 2, name: 'bug' }] },
      { id: 2, title: 'Task 2', tags: [{ id: 1, name: 'urgent' }, { id: 3, name: 'feature' }] },
      { id: 3, title: 'Task 3', tags: [] },
    ];

    it('should return empty array (tags not fetched from API)', async () => {
      const result = await TagService.getTags();
      
      expect(result).toEqual([]);
      expect(mockedApi.get).not.toHaveBeenCalled();
    });

    it('should extract unique tags from tasks', () => {
      const result = TagService.extractTagsFromTasks(mockTasks);
      
      expect(result).toHaveLength(3);
      expect(result.map(t => t.name)).toContain('urgent');
      expect(result.map(t => t.name)).toContain('bug');
      expect(result.map(t => t.name)).toContain('feature');
    });

    it('should handle tasks without tags', () => {
      const tasksWithoutTags = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2', tags: [] },
      ];
      
      const result = TagService.extractTagsFromTasks(tasksWithoutTags);
      
      expect(result).toEqual([]);
    });

    it('should deduplicate tags from multiple tasks', () => {
      const result = TagService.extractTagsFromTasks(mockTasks);
      
      // 'urgent' appears in 2 tasks but should only be in result once
      const urgentCount = result.filter(t => t.name === 'urgent').length;
      expect(urgentCount).toBe(1);
    });

    it('should throw error when trying to create tag', async () => {
      await expect(TagService.createTag({ name: 'feature' })).rejects.toThrow('Tags are managed through tasks');
    });

    it('should throw error when trying to delete tag', async () => {
      await expect(TagService.deleteTag(1)).rejects.toThrow('Tags are managed through tasks');
    });
  });
});
