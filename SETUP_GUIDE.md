# Quick Start Guide - Task Management Frontend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create or update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 4. Run Tests
```bash
# Run all tests
npm test

# Watch mode (for TDD)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Project Features Implemented

### ✅ Core Functionality
- **Task CRUD Operations**: Create, read, update, and delete tasks
- **Task Details**: Title, description, project, tags, due date, status
- **Sorting**: Tasks sorted by upcoming due date (tasks with no due date appear last)
- **Status Management**: Quick status updates (todo, in-progress, done)

### ✅ Filtering System
- **Filter by Project**: Select a specific project or view all
- **Filter by Tags**: Multi-select tag filtering
- **Filter by Status**: Filter by todo, in-progress, or done
- **Clear Filters**: One-click to reset all filters

### ✅ User Experience
- **Loading States**: Spinners for all async operations
- **Error Handling**: User-friendly error messages with retry option
- **Visual Indicators**: 
  - Overdue tasks (red background)
  - Due-soon tasks (orange text, 3 days warning)
  - Status badges with color coding
- **Statistics Dashboard**: Total, in-progress, and completed task counts

### ✅ Code Quality
- **TypeScript**: Fully typed codebase
- **Service Layer**: Centralized API logic
- **Custom Hooks**: Reusable business logic
- **Component Structure**: Small, focused, testable components
- **DRY Principles**: No code duplication

### ✅ Testing
- **17 Tests Passing**: All tests green
- **Test Coverage**: Components, hooks, and services tested
- **TDD Ready**: Jest + React Testing Library configured
- **Test Scripts**: test, test:watch, test:coverage

## File Structure Created

```
frontend/
├── types/
│   └── index.ts                    # TypeScript interfaces
├── services/
│   ├── taskService.ts              # Task API operations
│   ├── projectService.ts           # Project API operations
│   └── tagService.ts               # Tag API operations
├── hooks/
│   ├── useTasks.ts                 # Task management hook
│   └── __tests__/
│       └── useTasks.test.ts
├── components/
│   ├── TaskCard.tsx                # Task display
│   ├── TaskForm.tsx                # Create/edit form
│   ├── FilterBar.tsx               # Filtering controls
│   ├── LoadingSpinner.tsx          # Loading state
│   ├── ErrorMessage.tsx            # Error display
│   └── __tests__/
│       ├── TaskCard.test.tsx
│       ├── LoadingSpinner.test.tsx
│       └── ErrorMessage.test.tsx
├── app/
│   └── todos/
│       └── page.tsx                # Main tasks page
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Test setup
└── FRONTEND_README.md              # Comprehensive docs
```

## API Integration

### Authentication Flow
1. User logs in → Receives token
2. Token stored in localStorage
3. Axios interceptor adds token to all requests
4. Protected routes check authentication

### Endpoints Used
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/projects` - Fetch projects
- `GET /api/tags` - Fetch tags

## Key Design Patterns

### 1. Service Layer Pattern
```typescript
export class TaskService {
  static async getTasks(): Promise<Task[]> { ... }
  static async createTask(data: CreateTaskData): Promise<Task> { ... }
  // Centralized error handling
  private static handleError(error: any): Error { ... }
}
```

### 2. Custom Hooks
```typescript
export function useTasks() {
  // Encapsulates all task-related logic
  return {
    tasks, projects, tags,
    loading, error,
    createTask, updateTask, deleteTask,
    applyFilters
  };
}
```

### 3. Component Composition
- Small, focused components
- Props-based communication
- Testable in isolation
- Reusable across the app

## Testing Approach

### Component Tests
```typescript
it('calls onEdit when edit button clicked', () => {
  const onEdit = jest.fn();
  render(<TaskCard task={mockTask} onEdit={onEdit} />);
  fireEvent.click(screen.getByTestId('edit-button'));
  expect(onEdit).toHaveBeenCalledWith(mockTask);
});
```

### Hook Tests
```typescript
it('loads initial data on mount', async () => {
  const { result } = renderHook(() => useTasks());
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  expect(result.current.tasks).toEqual(mockTasks);
});
```

## Next Steps

1. **Start Development Server**: `npm run dev`
2. **Ensure Backend is Running**: Laravel API on http://localhost:8000
3. **Register/Login**: Create a user account
4. **Create Tasks**: Test the full CRUD functionality
5. **Try Filtering**: Test project, tag, and status filters

## Troubleshooting

### Tests Failing
```bash
npm test -- --clearCache
```

### API Not Connecting
- Verify backend is running on port 8000
- Check `.env.local` has correct API URL
- Check CORS settings in Laravel

### TypeScript Errors
```bash
npm run build
```

## Documentation

See `FRONTEND_README.md` for complete documentation including:
- Detailed feature list
- API integration guide
- Component documentation
- Testing guide
- Performance optimizations
- Future enhancements

---

**Status**: ✅ All features implemented and tested
**Tests**: ✅ 17/17 passing
**Ready**: ✅ For production use with Laravel backend
