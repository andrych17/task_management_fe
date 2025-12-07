import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from '../useTasks';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';
import { TagService } from '@/services/tagService';

jest.mock('@/services/taskService');
jest.mock('@/services/projectService');
jest.mock('@/services/tagService');

const mockTasks = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Description 1',
    status: 'todo' as const,
    due_date: '2025-12-10',
    user_id: 1,
    project_id: 1,
    tags: [],
    created_at: '2025-12-01',
    updated_at: '2025-12-01',
  },
];

const mockProjects = [
  {
    id: 1,
    name: 'Project 1',
    description: null,
    user_id: 1,
    created_at: '2025-12-01',
    updated_at: '2025-12-01',
  },
];

const mockTags = [
  {
    id: 1,
    name: 'Tag 1',
    user_id: 1,
    created_at: '2025-12-01',
    updated_at: '2025-12-01',
  },
];

describe('useTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (TaskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    (ProjectService.getProjects as jest.Mock).mockResolvedValue(mockProjects);
    (TagService.getTags as jest.Mock).mockResolvedValue(mockTags);
  });

  it('loads initial data on mount', async () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.tags).toEqual(mockTags);
  });

  it('handles errors when loading data', async () => {
    (TaskService.getTasks as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load');
  });

  it('creates a new task', async () => {
    (TaskService.createTask as jest.Mock).mockResolvedValue(mockTasks[0]);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.createTask({ title: 'New Task' });

    expect(TaskService.createTask).toHaveBeenCalledWith({ title: 'New Task' });
  });

  it('filters tasks by project', async () => {
    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.applyFilters({
      project_id: 1,
      tag_ids: [],
      status: null,
    });

    expect(result.current.filteredTasks).toEqual(mockTasks);
  });
});
