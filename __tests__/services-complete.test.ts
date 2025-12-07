import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';
import { TagService } from '@/services/tagService';
import api from '@/lib/api';

jest.mock('@/lib/api');

describe('TaskService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch and return tasks successfully', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'todo' },
        { id: 2, title: 'Task 2', status: 'in-progress' },
      ];

      mockApi.get.mockResolvedValue({
        data: { success: true, data: mockTasks },
      });

      const result = await TaskService.getTasks();
      expect(result).toEqual(mockTasks);
      expect(mockApi.get).toHaveBeenCalledWith('/tasks?per_page=1000');
    });

    it('should handle paginated response', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1' }];
      
      mockApi.get.mockResolvedValue({
        data: { 
          success: true, 
          data: { data: mockTasks, total: 1 } 
        },
      });

      const result = await TaskService.getTasks();
      expect(result).toEqual(mockTasks);
    });

    it('should handle errors when fetching tasks', async () => {
      const error = { response: { status: 500, data: { message: 'Server error' } } };
      mockApi.get.mockRejectedValue(error);

      await expect(TaskService.getTasks()).rejects.toThrow();
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTask = { title: 'New Task', description: 'Description' };
      const createdTask = { id: 1, ...newTask, status: 'todo' };

      mockApi.post.mockResolvedValue({
        data: { success: true, data: createdTask },
      });

      const result = await TaskService.createTask(newTask);
      expect(result).toEqual(createdTask);
      expect(mockApi.post).toHaveBeenCalledWith('/tasks', newTask);
    });

    it('should handle errors when creating task', async () => {
      const error = { response: { status: 422, data: { errors: {} } } };
      mockApi.post.mockRejectedValue(error);

      await expect(TaskService.createTask({ title: 'Test' })).rejects.toThrow();
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updates = { title: 'Updated Task' };
      const updatedTask = { id: 1, ...updates };

      mockApi.put.mockResolvedValue({
        data: { success: true, data: updatedTask },
      });

      const result = await TaskService.updateTask(1, updates);
      expect(result).toEqual(updatedTask);
      expect(mockApi.put).toHaveBeenCalledWith('/tasks/1', updates);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockApi.delete.mockResolvedValue({
        data: { success: true, message: 'Task deleted' },
      });

      await TaskService.deleteTask(1);
      expect(mockApi.delete).toHaveBeenCalledWith('/tasks/1');
    });
  });
});

describe('ProjectService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should fetch and return projects successfully', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1' },
        { id: 2, name: 'Project 2' },
      ];

      mockApi.get.mockResolvedValue({
        data: { success: true, data: mockProjects },
      });

      const result = await ProjectService.getProjects();
      expect(result).toEqual(mockProjects);
      expect(mockApi.get).toHaveBeenCalledWith('/projects?per_page=100');
    });

    it('should handle errors when fetching projects', async () => {
      const error = { response: { status: 401 } };
      mockApi.get.mockRejectedValue(error);

      await expect(ProjectService.getProjects()).rejects.toThrow();
    });
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const newProject = { name: 'New Project' };
      const createdProject = { id: 1, ...newProject };

      mockApi.post.mockResolvedValue({
        data: { success: true, data: createdProject },
      });

      const result = await ProjectService.createProject(newProject);
      expect(result).toEqual(createdProject);
    });
  });
});

describe('TagService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTags', () => {
    it('should fetch and return tags successfully', async () => {
      const mockTags = [
        { id: 1, name: 'Tag 1' },
        { id: 2, name: 'Tag 2' },
      ];

      mockApi.get.mockResolvedValue({
        data: { success: true, data: mockTags },
      });

      const result = await TagService.getTags();
      expect(result).toEqual(mockTags);
      expect(mockApi.get).toHaveBeenCalledWith('/tags?per_page=100');
    });

    it('should handle errors when fetching tags', async () => {
      const error = { response: { status: 500 } };
      mockApi.get.mockRejectedValue(error);

      await expect(TagService.getTags()).rejects.toThrow();
    });
  });

  describe('createTag', () => {
    it('should create a tag successfully', async () => {
      const newTag = { name: 'New Tag', color: '#FF0000' };
      const createdTag = { id: 1, ...newTag };

      mockApi.post.mockResolvedValue({
        data: { success: true, data: createdTag },
      });

      const result = await TagService.createTag(newTag);
      expect(result).toEqual(createdTag);
    });
  });
});
