# Task Management Frontend - Architecture Overview

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Next.js App Router                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Login    │  │  Register  │  │   Todos    │         │  │
│  │  │    Page    │  │    Page    │  │    Page    │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ TaskCard │  │ TaskForm │  │FilterBar │  │  Error   │       │
│  └──────────┘  └──────────┘  └──────────┘  │  Message │       │
│                                             └──────────┘       │
│                                             ┌──────────┐       │
│                                             │ Loading  │       │
│                                             │ Spinner  │       │
│                                             └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Custom Hooks                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  useTasks Hook                                     │  │  │
│  │  │  • State: tasks, projects, tags, loading, error   │  │  │
│  │  │  • Methods: createTask, updateTask, deleteTask    │  │  │
│  │  │  • Methods: applyFilters, reloadData              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  useAuth Context                                   │  │  │
│  │  │  • State: user, loading                           │  │  │
│  │  │  • Methods: login, register, logout               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ TaskService  │  │ProjectService│  │  TagService  │         │
│  │              │  │              │  │              │         │
│  │ • getTasks   │  │• getProjects │  │  • getTags   │         │
│  │ • createTask │  │• createProj  │  │  • createTag │         │
│  │ • updateTask │  │• updateProj  │  │  • deleteTag │         │
│  │ • deleteTask │  │• deleteProj  │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       HTTP CLIENT LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Axios Instance                         │  │
│  │  • Base URL: http://localhost:8000                       │  │
│  │  • Request Interceptor: Add Auth Token                   │  │
│  │  • Response Interceptor: Handle Errors                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      LARAVEL API BACKEND                        │
│  • POST /api/login                                              │
│  • POST /api/register                                           │
│  • GET  /api/tasks                                              │
│  • POST /api/tasks                                              │
│  • PUT  /api/tasks/:id                                          │
│  • DELETE /api/tasks/:id                                        │
│  • GET  /api/projects                                           │
│  • GET  /api/tags                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Task Creation Flow
```
User fills TaskForm
      ↓
TaskForm validates input
      ↓
onSubmit callback → TodosPage.handleCreateTask()
      ↓
useTasks.createTask(data)
      ↓
TaskService.createTask(data)
      ↓
Axios POST /api/tasks
      ↓
Laravel API processes request
      ↓
Response returns
      ↓
useTasks.loadAllData() (refresh)
      ↓
Tasks state updated
      ↓
UI re-renders with new task
```

### Filtering Flow
```
User changes filter
      ↓
FilterBar onChange event
      ↓
onFilterChange callback → TodosPage
      ↓
setFilters() updates state
      ↓
useEffect triggers applyFilters()
      ↓
Filter logic processes tasks array
      ↓
setFilteredTasks() updates state
      ↓
UI re-renders with filtered tasks
```

## 🧩 Component Relationships

```
TodosPage
├── Header
│   ├── User name display
│   └── Logout button
├── Error Message (conditional)
├── Create Task Button (conditional)
├── TaskForm (conditional)
│   ├── Title input
│   ├── Description textarea
│   ├── Project select
│   ├── Tags checkboxes
│   ├── Due date input
│   ├── Status select
│   └── Submit/Cancel buttons
├── FilterBar
│   ├── Project filter dropdown
│   ├── Status filter dropdown
│   ├── Tags filter checkboxes
│   └── Clear filters button
├── Tasks List
│   └── TaskCard (for each task)
│       ├── Title
│       ├── Description
│       ├── Status dropdown
│       ├── Project badge
│       ├── Tag badges
│       ├── Due date display
│       ├── Edit button
│       └── Delete button
└── Statistics Dashboard
    ├── Total tasks stat
    ├── In progress stat
    └── Completed stat
```

## 🔄 State Management

### Global State (Context)
```typescript
AuthContext
├── user: User | null
├── loading: boolean
├── login(email, password)
├── register(name, email, password)
└── logout()
```

### Page State (useTasks Hook)
```typescript
useTasks()
├── tasks: Task[]
├── filteredTasks: Task[]
├── projects: Project[]
├── tags: Tag[]
├── loading: boolean
├── error: string | null
├── createTask(data)
├── updateTask(id, data)
├── deleteTask(id)
├── updateTaskStatus(id, status)
├── applyFilters(filters)
└── reloadData()
```

### Local Component State
```typescript
TodosPage
├── showForm: boolean
├── editingTask: Task | null
└── filters: FilterOptions

TaskForm
├── title: string
├── description: string
├── projectId: number | null
├── selectedTags: number[]
├── dueDate: string
├── status: TaskStatus
├── loading: boolean
└── error: string | null
```

## 🎨 Styling Architecture

```
Tailwind CSS Classes
├── Layout Classes
│   ├── Flexbox (flex, justify-between, items-center)
│   ├── Grid (grid, grid-cols-3)
│   └── Spacing (p-4, m-2, gap-4)
├── Component Classes
│   ├── Borders (border, rounded-lg)
│   ├── Shadows (shadow, shadow-md)
│   └── Background (bg-white, bg-gray-50)
├── Typography
│   ├── Font Size (text-sm, text-lg, text-2xl)
│   ├── Font Weight (font-semibold, font-bold)
│   └── Colors (text-gray-600, text-blue-600)
└── Interactive
    ├── Hover States (hover:bg-blue-600)
    ├── Focus States (focus:ring-2)
    └── Disabled States (disabled:bg-gray-300)
```

## 🧪 Testing Architecture

```
Test Files
├── components/__tests__/
│   ├── LoadingSpinner.test.tsx
│   │   └── Tests: rendering, animation class
│   ├── ErrorMessage.test.tsx
│   │   └── Tests: message display, retry button
│   └── TaskCard.test.tsx
│       └── Tests: task display, actions, status change
└── hooks/__tests__/
    └── useTasks.test.ts
        └── Tests: data loading, CRUD operations, filtering

Test Strategy
├── Unit Tests
│   ├── Component behavior
│   ├── Hook logic
│   └── Service methods (future)
├── Integration Tests
│   └── Hook with mocked services
└── Coverage Goals
    └── 70%+ for all tested modules
```

## 📦 Build & Deploy Flow

```
Development
npm run dev → Next.js Dev Server → http://localhost:3000

Testing
npm test → Jest → Run all tests → Report coverage

Production Build
npm run build → Next.js Build → Optimized output → .next/

Production Serve
npm start → Next.js Production Server → Serve optimized app
```

## 🔒 Security Architecture

```
Authentication Flow
├── User Login
│   ├── POST /api/login
│   ├── Receive token
│   └── Store in localStorage
├── Token Management
│   ├── Axios request interceptor
│   ├── Add "Authorization: Bearer {token}"
│   └── All API requests authenticated
└── Protected Routes
    ├── Check user state
    ├── Redirect to /login if not authenticated
    └── Allow access if authenticated

Error Handling
├── API Errors
│   ├── Network errors
│   ├── Authentication errors (401)
│   ├── Validation errors (422)
│   └── Server errors (500)
├── Service Layer
│   ├── Extract error messages
│   ├── Format user-friendly messages
│   └── Throw to component
└── Component Layer
    ├── Display error message
    ├── Provide retry option
    └── Log for debugging
```

## 📈 Performance Considerations

```
Optimization Strategies
├── API Calls
│   ├── Parallel requests (Promise.all)
│   ├── Single reload after mutations
│   └── Debounced filters (future)
├── React Rendering
│   ├── useCallback for memoized functions
│   ├── Component composition
│   └── Conditional rendering
├── Bundle Size
│   ├── Next.js automatic code splitting
│   ├── Tree shaking
│   └── Minification in production
└── Loading States
    ├── Optimistic UI updates (future)
    ├── Loading skeletons (future)
    └── Progressive loading (future)
```

---

This architecture provides a solid foundation for:
- ✅ Scalability
- ✅ Maintainability
- ✅ Testability
- ✅ Performance
- ✅ Developer Experience
