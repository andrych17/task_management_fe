'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, Project, Tag, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types';
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_STATUS_ICONS, mapFrontendStatus, mapBackendStatus } from '@/lib/constants';
import { API_ENDPOINTS } from '@/lib/constants';
import api from '@/lib/api';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';
import { TagService } from '@/services/tagService';
import { DataTable, ArrowUpDown } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate, isOverdue, isDueSoon } from '@/lib/utils';
import { toast } from 'sonner';

export default function TodosPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Filter state
  const [filterProject, setFilterProject] = useState<string>('none');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    project_id: undefined,
    tags: [],
    due_date: '',
    status: 'todo',
  });
  
  // Tag selection state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');
  
  // Selected tasks for bulk delete
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  // Load data on mount - auth checked by middleware
  useEffect(() => {
    loadAllData();
  }, []);

  // Clear selected tasks when filters change
  useEffect(() => {
    setSelectedTaskIds([]);
  }, [filterProject, filterTags, filterStatus]);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        project_id: editingTask.project_id || undefined,
        tags: [], // Tags are managed separately via selectedTags
        due_date: editingTask.due_date ? editingTask.due_date.split('T')[0] : '',
        status: mapBackendStatus(editingTask.status) as TaskStatus, // Convert backend status to frontend format
      });
      // Set selected tags for editing
      setSelectedTags(editingTask.tags.map((tag) => tag.name));
      setShowForm(true);
    }
  }, [editingTask]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading data...');
      const [tasksData, projectsData, dashboardData, tagsData] = await Promise.all([
        TaskService.getTasks(),
        ProjectService.getProjects(),
        api.get(API_ENDPOINTS.DASHBOARD),
        TagService.getTags(),
      ]);

      console.log('📋 Tasks:', tasksData);
      console.log('📁 Projects:', projectsData);
      console.log('📊 Dashboard stats:', dashboardData.data);
      console.log('🏷️ Tags from API:', tagsData);

      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
      
      // Set stats from dashboard API
      setStats({
        total: dashboardData.data.total_tasks || 0,
        todo: dashboardData.data.todo || 0,
        inProgress: dashboardData.data.in_progress || 0,
        done: dashboardData.data.done || 0,
      });
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load data');
      setTasks([]);
      setProjects([]);
      setTags([]);
      setStats({ total: 0, todo: 0, inProgress: 0, done: 0 });
    } finally {
      setLoading(false);
    }
  };

  const reloadData = async () => {
    // Reload data without showing loading state
    try {
      console.log('🔄 Reloading data silently...');
      const [tasksData, projectsData, dashboardData, tagsData] = await Promise.all([
        TaskService.getTasks(),
        ProjectService.getProjects(),
        api.get(API_ENDPOINTS.DASHBOARD),
        TagService.getTags(),
      ]);

      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
      
      // Set stats from dashboard API
      setStats({
        total: dashboardData.data.total_tasks || 0,
        todo: dashboardData.data.todo || 0,
        inProgress: dashboardData.data.in_progress || 0,
        done: dashboardData.data.done || 0,
      });
      
      console.log('✅ Data reloaded successfully');
    } catch (err: any) {
      console.error('❌ Error reloading data:', err);
      // Don't show error to user, silently fail
    }
  };

  const handleTagSearch = async (query: string) => {
    setTagSearchQuery(query);
    try {
      const tagsData = await TagService.getTags(query);
      setTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (err: any) {
      console.error('❌ Error searching tags:', err);
    }
  };

  const handleProjectSearch = async (query: string) => {
    setProjectSearchQuery(query);
    try {
      const projectsData = await ProjectService.getProjects(query);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err: any) {
      console.error('❌ Error searching projects:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    // Client-side validation
    const errors: Record<string, string[]> = {};
    
    if (!formData.title?.trim()) {
      errors.title = ['Task title is required'];
    } else if (formData.title.length > 255) {
      errors.title = ['Task title cannot exceed 255 characters'];
    }
    
    if (selectedTags.some(tag => tag.length > 50)) {
      errors.tags = ['Tag name cannot exceed 50 characters'];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the form errors');
      return;
    }

    try {
      if (editingTask) {
        // Convert formData to proper format for update
        const updateData: UpdateTaskData = {
          title: formData.title,
          description: formData.description,
          project_id: formData.project_id,
          due_date: formData.due_date,
          status: mapFrontendStatus(formData.status || 'todo') as TaskStatus, // Convert to backend format
          tags: selectedTags, // Use selectedTags string array
        };
        await TaskService.updateTask(editingTask.id, updateData);
        toast.success('Task updated successfully!');
      } else {
        // Create task with selectedTags as string array
        const createData: CreateTaskData = {
          ...formData,
          status: mapFrontendStatus(formData.status || 'todo') as TaskStatus, // Convert to backend format
          tags: selectedTags, // Use selectedTags string array
        };
        await TaskService.createTask(createData);
        toast.success('Task created successfully!');
      }
      
      // Reload data without page refresh or loading state
      await reloadData();
      handleCancel();
    } catch (err: any) {
      console.error('❌ Error submitting task:', err);
      
      // Handle validation errors from API
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
        toast.error(err.response.data.message || 'Validation failed');
      } else {
        const errorMessage = err.message || 'Failed to save task';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await TaskService.deleteTask(id);
      await reloadData();
      toast.success('Task deleted successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete task';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.length} task(s)?`)) return;

    try {
      await Promise.all(selectedTaskIds.map(id => TaskService.deleteTask(id)));
      toast.success(`${selectedTaskIds.length} task(s) deleted successfully!`);
      setSelectedTaskIds([]);
      await reloadData();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete tasks';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(task => task.id));
    }
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    try {
      await TaskService.updateTask(id, { status });
      await reloadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      project_id: undefined,
      tags: [],
      due_date: '',
      status: 'todo',
    });
    setSelectedTags([]);
    setTagInput('');
    setFormErrors({});
  };

  const getStatusBadge = (status: TaskStatus) => {
    const variants: Record<string, 'outline' | 'default' | 'success'> = {
      pending: 'outline',
      todo: 'outline',
      in_progress: 'default',
      'in-progress': 'default',
      completed: 'success',
      done: 'success',
    };
    return variants[status] || 'outline';
  };

  const columns: ColumnDef<Task>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
          onChange={toggleSelectAll}
          className="cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedTaskIds.includes(row.original.id)}
          onChange={() => toggleTaskSelection(row.original.id)}
          className="cursor-pointer"
        />
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const task = row.original;
        const overdue = isOverdue(task.due_date, task.status);
        const dueSoon = isDueSoon(task.due_date, task.status);

        return (
          <div className="space-y-1">
            <div className="font-medium">{task.title}</div>
            {task.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </div>
            )}
            {(overdue || dueSoon) && (
              <div
                className={`text-xs font-semibold ${
                  overdue ? 'text-red-600' : 'text-orange-600'
                }`}
              >
                {overdue ? '⚠️ Overdue' : '⏰ Due Soon'}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'due_date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const task = row.original;
        const overdue = isOverdue(task.due_date, task.status);
        const dueSoon = isDueSoon(task.due_date, task.status);

        return (
          <div
            className={`text-sm ${
              overdue ? 'text-red-600 font-semibold' : dueSoon ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            {formatDate(task.due_date)}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.due_date;
        const dateB = rowB.original.due_date;

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
    },
    {
      accessorKey: 'project',
      header: 'Project',
      cell: ({ row }) => {
        const project = row.original.project;
        return project ? (
          <Badge variant="secondary">{project.name}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">No project</span>
        );
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const taskTags = row.original.tags;
        return (
          <div className="flex flex-wrap gap-1">
            {taskTags.length > 0 ? (
              taskTags.map((tag) => (
                <span key={tag.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  #{tag.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No tags</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const task = row.original;
        const status = task.status as string;
        return (
          <Badge variant={status === 'completed' || status === 'done' ? 'default' : 'secondary'} className="font-medium">
            {TASK_STATUS_ICONS[status] || '📝'} {TASK_STATUS_LABELS[status] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
        return (
          <div className="text-sm text-muted-foreground">
            {formatDate(createdAt)}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.created_at;
        const dateB = rowB.original.created_at;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingTask(task)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User check handled by middleware

  // Filter tasks
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) => {
    if (filterProject !== 'all' && filterProject !== 'none' && task.project_id?.toString() !== filterProject) {
      return false;
    }
    
    // Multi-tag filter: task must have ALL selected tags
    if (filterTags.length > 0 && Array.isArray(task.tags)) {
      const taskTagNames = task.tags.map(t => t.name);
      const hasAllTags = filterTags.every(filterTag => taskTagNames.includes(filterTag));
      if (!hasAllTags) {
        return false;
      }
    }
    
    if (filterStatus !== 'all') {
      // Backend uses: 'todo', 'in-progress', 'done'
      // Filter uses same values from TASK_STATUS constants
      const statusMatch = task.status === filterStatus ||
        (filterStatus === TASK_STATUS.TODO && task.status === 'todo') ||
        (filterStatus === TASK_STATUS.IN_PROGRESS && task.status === 'in-progress') ||
        (filterStatus === TASK_STATUS.DONE && task.status === 'done');
      
      if (!statusMatch) {
        return false;
      }
    }
    return true;
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-destructive">Error</h3>
                  <p className="text-sm text-destructive/90 mt-1">{error}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.done}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Filter tasks by project, tag, or status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <SearchableSelect
                  options={projects}
                  value={filterProject}
                  onChange={setFilterProject}
                  onSearch={handleProjectSearch}
                  placeholder="All Projects"
                  searchPlaceholder="Search projects..."
                  emptyText="No projects found."
                  allowNone={true}
                  noneLabel="All Projects"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <MultiSelect
                  options={tags}
                  selected={filterTags}
                  onChange={setFilterTags}
                  onSearch={handleTagSearch}
                  placeholder="All Tags"
                  searchPlaceholder="Search tags..."
                  emptyText="No tags found."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={TASK_STATUS.TODO}>
                      {TASK_STATUS_ICONS[TASK_STATUS.TODO]} {TASK_STATUS_LABELS[TASK_STATUS.TODO]}
                    </SelectItem>
                    <SelectItem value={TASK_STATUS.IN_PROGRESS}>
                      {TASK_STATUS_ICONS[TASK_STATUS.IN_PROGRESS]} {TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}
                    </SelectItem>
                    <SelectItem value={TASK_STATUS.DONE}>
                      {TASK_STATUS_ICONS[TASK_STATUS.DONE]} {TASK_STATUS_LABELS[TASK_STATUS.DONE]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(filterProject !== 'all' && filterProject !== 'none' || filterTags.length > 0 || filterStatus !== 'all') && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterProject('none');
                    setFilterTags([]);
                    setFilterStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Task Dialog */}
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) handleCancel();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingTask ? '✏️ Edit Task' : '➕ Create New Task'}
              </DialogTitle>
              <DialogDescription>
                {editingTask
                  ? 'Update the task details below'
                  : 'Fill in the details to create a new task'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) {
                      const { title, ...rest } = formErrors;
                      setFormErrors(rest);
                    }
                  }}
                  required
                  maxLength={255}
                  placeholder="Enter task title"
                  className={`border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                    formErrors.title ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter task description (optional)"
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Project</label>
                  <SearchableSelect
                    options={projects}
                    value={formData.project_id?.toString() || 'none'}
                    onChange={(value) => {
                      setFormData({ ...formData, project_id: value === 'none' ? undefined : Number(value) });
                      if (formErrors.project_id) {
                        const { project_id, ...rest } = formErrors;
                        setFormErrors(rest);
                      }
                    }}
                    onSearch={handleProjectSearch}
                    placeholder="Select project (optional)"
                    searchPlaceholder="Search projects..."
                    emptyText="No projects found."
                    allowNone={true}
                    noneLabel="No Project"
                    className={`border-purple-200 focus:border-purple-400 focus:ring-purple-400 ${
                      formErrors.project_id ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.project_id && (
                    <p className="text-sm text-red-500">{formErrors.project_id[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => {
                      setFormData({ ...formData, status: value as TaskStatus });
                      if (formErrors.status) {
                        const { status, ...rest } = formErrors;
                        setFormErrors(rest);
                      }
                    }}
                  >
                    <SelectTrigger className={`border-green-200 focus:border-green-400 focus:ring-green-400 ${
                      formErrors.status ? 'border-red-500' : ''
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TASK_STATUS.TODO}>
                        {TASK_STATUS_ICONS[TASK_STATUS.TODO]} {TASK_STATUS_LABELS[TASK_STATUS.TODO]}
                      </SelectItem>
                      <SelectItem value={TASK_STATUS.IN_PROGRESS}>
                        {TASK_STATUS_ICONS[TASK_STATUS.IN_PROGRESS]} {TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}
                      </SelectItem>
                      <SelectItem value={TASK_STATUS.DONE}>
                        {TASK_STATUS_ICONS[TASK_STATUS.DONE]} {TASK_STATUS_LABELS[TASK_STATUS.DONE]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.status && (
                    <p className="text-sm text-red-500">{formErrors.status[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Due Date</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => {
                    setFormData({ ...formData, due_date: e.target.value });
                    if (formErrors.due_date) {
                      const { due_date, ...rest } = formErrors;
                      setFormErrors(rest);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                    formErrors.due_date ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.due_date && (
                  <p className="text-sm text-red-500">{formErrors.due_date[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tags</label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Type tag and press Enter to add"
                  className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 ${
                    formErrors.tags ? 'border-red-500' : ''
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
                        if (tagInput.trim().length > 50) {
                          setFormErrors({ ...formErrors, tags: ['Tag name cannot exceed 50 characters'] });
                          return;
                        }
                        setSelectedTags([...selectedTags, tagInput.trim()]);
                        setTagInput('');
                        if (formErrors.tags) {
                          const { tags, ...rest } = formErrors;
                          setFormErrors(rest);
                        }
                      }
                    }
                  }}
                />
                {formErrors.tags && (
                  <p className="text-sm text-red-500">{formErrors.tags[0]}</p>
                )}
                
                {/* Display selected tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium cursor-pointer hover:bg-blue-200"
                        onClick={() => setSelectedTags(selectedTags.filter((_, i) => i !== index))}
                      >
                        #{tag}
                        <X className="h-3 w-3" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!formData.title.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {editingTask ? '💾 Update Task' : '✨ Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Button */}
        <div className="mb-6 flex items-center gap-3">
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
          </Button>
          
          {selectedTaskIds.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              className="shadow-md"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedTaskIds.length})
            </Button>
          )}
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            <CardDescription>
              View and manage all your tasks with sorting and pagination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={filteredTasks} 
              pageSize={10}
              initialSort={[{ id: 'created_at', desc: true }]}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
