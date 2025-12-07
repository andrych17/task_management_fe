# Task Management Frontend

A modern, responsive React/Next.js frontend for the Task Management API, built with TypeScript, TDD principles, and comprehensive error handling.

## Features

### Task Management
- ✅ Create, read, update, and delete tasks
- ✅ Task details: title, description, project, tags, due date, status
- ✅ Visual indicators for overdue and due-soon tasks
- ✅ Quick status updates with dropdown selector
- ✅ Tasks sorted by upcoming due date

### Filtering & Organization
- 🔍 Filter tasks by:
  - Project
  - Tags (multiple selection)
  - Status (todo, in-progress, done)
- 📊 Real-time statistics dashboard
- 🎯 Clear all filters option

### User Experience
- 🎨 Clean, modern UI with Tailwind CSS
- ⚡ Loading states for all async operations
- ❌ Comprehensive error handling with retry options
- 📱 Responsive design for all screen sizes
- 🔐 Protected routes with authentication

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **State Management**: React Hooks (useState, useEffect, custom hooks)

## Project Structure

```
frontend/
├── app/
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   └── todos/                # Main tasks page
│       └── page.tsx
├── components/
│   ├── TaskCard.tsx          # Task display component
│   ├── TaskForm.tsx          # Create/edit task form
│   ├── FilterBar.tsx         # Filtering controls
│   ├── LoadingSpinner.tsx    # Loading indicator
│   ├── ErrorMessage.tsx      # Error display
│   └── __tests__/            # Component tests
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── hooks/
│   ├── useTasks.ts           # Task management hook
│   └── __tests__/            # Hook tests
├── services/
│   ├── taskService.ts        # Task API service
│   ├── projectService.ts     # Project API service
│   └── tagService.ts         # Tag API service
├── types/
│   └── index.ts              # TypeScript interfaces
├── lib/
│   └── api.ts                # Axios instance configuration
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup
└── package.json
```

## Design Patterns

### Service Layer Pattern
All API calls are abstracted into service classes:
- `TaskService` - Task CRUD operations
- `ProjectService` - Project operations
- `TagService` - Tag operations

**Benefits:**
- Centralized API logic
- Consistent error handling
- Easy to mock for testing
- Reusable across components

### Custom Hooks Pattern
Complex state logic is encapsulated in custom hooks:
- `useTasks` - Manages tasks, filtering, and API calls
- `useAuth` - Handles authentication state

**Benefits:**
- Reusable business logic
- Cleaner components
- Easier testing
- Better separation of concerns

### Component Composition
UI is broken into small, focused components:
- Each component has a single responsibility
- Props for communication
- Testable in isolation

## Error Handling

### Service Layer
- Catches API errors
- Extracts meaningful error messages
- Handles validation errors from Laravel
- Returns user-friendly error messages

### Component Layer
- Try-catch blocks for async operations
- Error state management
- User feedback with `ErrorMessage` component
- Retry functionality

### Loading States
- Skeleton screens during data fetch
- Disabled buttons during submissions
- Visual feedback for all async operations

## Testing

### Test Coverage
Minimum 70% code coverage required for:
- Branches
- Functions
- Lines
- Statements

### Test Organization
```
component/
├── Component.tsx
└── __tests__/
    └── Component.test.tsx
```

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Examples

**Component Testing:**
```typescript
it('calls onEdit when edit button clicked', () => {
  const onEdit = jest.fn();
  render(<TaskCard task={mockTask} onEdit={onEdit} />);
  fireEvent.click(screen.getByTestId('edit-button'));
  expect(onEdit).toHaveBeenCalledWith(mockTask);
});
```

**Hook Testing:**
```typescript
it('loads initial data on mount', async () => {
  const { result } = renderHook(() => useTasks());
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  expect(result.current.tasks).toEqual(mockTasks);
});
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running Laravel API backend

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## API Integration

### Authentication
The application uses token-based authentication with Laravel Sanctum:

1. User logs in via `/login`
2. Token stored in localStorage
3. Axios interceptor adds token to all requests
4. Auto-redirect to login if unauthorized

### API Endpoints Used

**Authentication:**
- `POST /api/login`
- `POST /api/register`
- `POST /api/logout`

**Tasks:**
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Projects:**
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project

**Tags:**
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag

### Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>; // Validation errors
}
```

## Component Documentation

### TaskCard
Displays a single task with all details and actions.

**Props:**
- `task: Task` - Task data
- `onEdit: (task: Task) => void` - Edit callback
- `onDelete: (id: number) => void` - Delete callback
- `onStatusChange: (id: number, status: TaskStatus) => void` - Status change callback

**Features:**
- Color-coded status badges
- Overdue/due-soon indicators
- Project and tags display
- Quick status updates
- Edit/delete actions

### TaskForm
Form for creating or editing tasks.

**Props:**
- `task?: Task | null` - Task to edit (null for create)
- `projects: Project[]` - Available projects
- `tags: Tag[]` - Available tags
- `onSubmit: (data) => Promise<void>` - Submit callback
- `onCancel: () => void` - Cancel callback

**Features:**
- Validation (required fields, date constraints)
- Multi-select tags
- Error display
- Loading states
- Auto-populate for edit mode

### FilterBar
Filtering controls for tasks.

**Props:**
- `projects: Project[]` - Available projects
- `tags: Tag[]` - Available tags
- `onFilterChange: (filters) => void` - Filter change callback

**Features:**
- Project dropdown
- Status dropdown
- Multi-select tags
- Clear all filters
- Real-time filtering

## Code Quality

### DRY Principles
- Reusable service classes
- Custom hooks for shared logic
- Component composition
- Utility functions

### Type Safety
- Strict TypeScript configuration
- Comprehensive interfaces
- Type-safe API responses
- No `any` types in production code

### Best Practices
- Proper error boundaries
- Accessibility considerations
- Semantic HTML
- Meaningful test IDs for testing
- Clean, readable code
- Comprehensive comments

## Performance Optimizations

- Parallel API calls with `Promise.all()`
- Memoized callbacks with `useCallback`
- Optimized re-renders
- Efficient filtering algorithms
- Lazy loading (can be added)

## Future Enhancements

- [ ] Drag-and-drop task reordering
- [ ] Calendar view for tasks
- [ ] Task search functionality
- [ ] Export tasks to CSV/PDF
- [ ] Dark mode
- [ ] Offline support with service workers
- [ ] Real-time updates with WebSockets
- [ ] Task templates
- [ ] Collaborative features
- [ ] Mobile app (React Native)

## Troubleshooting

### Common Issues

**Tests failing:**
```bash
# Clear Jest cache
npm test -- --clearCache
```

**API connection issues:**
- Check backend is running
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in Laravel

**TypeScript errors:**
```bash
# Rebuild TypeScript
npm run build
```

## Contributing

1. Follow existing code structure
2. Write tests for new features
3. Maintain 70%+ code coverage
4. Use meaningful commit messages
5. Update documentation

## License

MIT License

---

**Built with ❤️ using Next.js and TypeScript**
