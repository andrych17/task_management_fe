import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../TaskCard';
import { Task } from '@/types';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  due_date: '2025-12-10',
  user_id: 1,
  project_id: 1,
  project: {
    id: 1,
    name: 'Test Project',
    description: null,
    user_id: 1,
    created_at: '2025-12-01',
    updated_at: '2025-12-01',
  },
  tags: [
    { id: 1, name: 'Tag1', user_id: 1, created_at: '2025-12-01', updated_at: '2025-12-01' },
    { id: 2, name: 'Tag2', user_id: 1, created_at: '2025-12-01', updated_at: '2025-12-01' },
  ],
  created_at: '2025-12-01',
  updated_at: '2025-12-01',
};

describe('TaskCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByTestId('task-title')).toHaveTextContent('Test Task');
    expect(screen.getByTestId('task-description')).toHaveTextContent('Test Description');
    expect(screen.getByTestId('task-project')).toHaveTextContent('Test Project');
  });

  it('renders tags correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const tags = screen.getAllByTestId('task-tag');
    expect(tags).toHaveLength(2);
    expect(tags[0]).toHaveTextContent('Tag1');
    expect(tags[1]).toHaveTextContent('Tag2');
  });

  it('calls onEdit when edit button clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByTestId('edit-button'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByTestId('delete-button'));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('calls onStatusChange when status changed', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByTestId('task-status-select');
    fireEvent.change(statusSelect, { target: { value: 'in-progress' } });
    expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'in-progress');
  });

  it('renders without project when project is null', () => {
    const taskWithoutProject = { ...mockTask, project_id: null, project: undefined };
    render(
      <TaskCard
        task={taskWithoutProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByTestId('task-project')).not.toBeInTheDocument();
  });

  it('renders "No due date" when due_date is null', () => {
    const taskWithoutDueDate = { ...mockTask, due_date: null };
    render(
      <TaskCard
        task={taskWithoutDueDate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByTestId('task-due-date')).toHaveTextContent('No due date');
  });
});
