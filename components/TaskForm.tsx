import { useState, useEffect } from 'react';
import { Task, CreateTaskData, UpdateTaskData, Project, Tag, TaskStatus } from '@/types';

interface TaskFormProps {
  task?: Task | null;
  projects: Project[];
  tags: Tag[];
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ task, projects, tags, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Changed to string[]
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo'); // Backend format
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setProjectId(task.project_id);
      setSelectedTags(task.tags.map((tag) => tag.name)); // Map to tag names
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setStatus(task.status);
    }
  }, [task]);

  const handleTagToggle = (tagName: string) => { // Changed parameter to string
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((name) => name !== tagName) : [...prev, tagName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: CreateTaskData | UpdateTaskData = {
        title,
        description: description || undefined,
        project_id: projectId || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined, // Already string[]
        due_date: dueDate || undefined,
        status,
      };

      await onSubmit(data);
      
      // Reset form if creating new task
      if (!task) {
        setTitle('');
        setDescription('');
        setProjectId(null);
        setSelectedTags([]);
        setDueDate('');
        setStatus('todo'); // Backend format
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6" data-testid="task-form">
      <h2 className="text-xl font-bold mb-4">{task ? 'Edit Task' : 'Create New Task'}</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4" data-testid="form-error">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
            maxLength={255}
            data-testid="task-title-input"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
            data-testid="task-description-input"
          />
        </div>

        {/* Project */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <select
            value={projectId || ''}
            onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            data-testid="task-project-select"
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto" data-testid="task-tags-container">
            {tags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags available</p>
            ) : (
              tags.map((tag) => (
                <label key={tag.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.name)}
                    onChange={() => handleTagToggle(tag.name)}
                    className="rounded"
                    data-testid={`task-tag-${tag.id}`}
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={getTodayDate()}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            data-testid="task-due-date-input"
          />
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            data-testid="task-status-input"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="submit-button"
          >
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
