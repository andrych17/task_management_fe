import { useState, useEffect, useCallback } from 'react';
import { Task, Project, Tag, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';
import { TagService } from '@/services/tagService';

interface UseTasksReturn {
  tasks: Task[];
  filteredTasks: Task[];
  projects: Project[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: number, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;
  applyFilters: (filters: {
    project_id: number | null;
    tag_ids: number[];
    status: TaskStatus | null;
  }) => void;
  reloadData: () => Promise<void>;
  clearError: () => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tasksData, projectsData, tagsData] = await Promise.all([
        TaskService.getTasks(),
        ProjectService.getProjects(),
        TagService.getTags(),
      ]);

      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setProjects(projectsData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const applyFilters = useCallback(
    (filters: { project_id: number | null; tag_ids: number[]; status: TaskStatus | null }) => {
      let filtered = [...tasks];

      if (filters.project_id !== null) {
        filtered = filtered.filter((task) => task.project_id === filters.project_id);
      }

      if (filters.tag_ids.length > 0) {
        filtered = filtered.filter((task) =>
          filters.tag_ids.some((tagId) => task.tags.some((tag) => tag.id === tagId))
        );
      }

      if (filters.status !== null) {
        filtered = filtered.filter((task) => task.status === filters.status);
      }

      setFilteredTasks(filtered);
    },
    [tasks]
  );

  const createTask = async (data: CreateTaskData) => {
    try {
      await TaskService.createTask(data);
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: number, data: UpdateTaskData) => {
    try {
      // Pass UpdateTaskData directly - TaskService.updateTask now accepts UpdateTaskData
      await TaskService.updateTask(id, data);
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await TaskService.deleteTask(id);
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  const updateTaskStatus = async (id: number, status: TaskStatus) => {
    try {
      await TaskService.updateTask(id, { status });
      await loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return {
    tasks,
    filteredTasks,
    projects,
    tags,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    applyFilters,
    reloadData: loadAllData,
    clearError,
  };
}
