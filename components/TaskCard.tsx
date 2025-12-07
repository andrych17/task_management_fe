import { Task, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isDueSoon = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today && task.status !== 'done';
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        isOverdue(task.due_date) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
      }`}
      data-testid="task-card"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="task-title">
          {task.title}
        </h3>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
          data-testid="task-status-select"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {task.description && (
        <p className="text-gray-600 mb-3" data-testid="task-description">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {task.project && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm" data-testid="task-project">
            📁 {task.project.name}
          </span>
        )}
        {task.tags.map((tag) => (
          <span key={tag.id} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm" data-testid="task-tag">
            🏷️ {tag.name}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <span
          className={`text-sm ${
            isOverdue(task.due_date)
              ? 'text-red-600 font-semibold'
              : isDueSoon(task.due_date)
              ? 'text-orange-600 font-semibold'
              : 'text-gray-500'
          }`}
          data-testid="task-due-date"
        >
          📅 {formatDate(task.due_date)}
          {isOverdue(task.due_date) && ' (Overdue)'}
          {!isOverdue(task.due_date) && isDueSoon(task.due_date) && ' (Due Soon)'}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            data-testid="edit-button"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            data-testid="delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
