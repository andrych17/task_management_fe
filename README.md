# Task Management System - Frontend

A modern task management application built with Next.js 16, TypeScript, and Tailwind CSS.

---

## 📁 Folder Structure

```
frontend/
├── __tests__/                  # Test files (Jest + React Testing Library)
│   ├── api.test.ts             # API client tests
│   ├── auth-actions.test.ts    # Authentication Server Actions tests
│   ├── constants.test.ts       # Constants validation tests
│   └── services-complete.test.ts # Service layer tests
├── app/                        # Next.js App Router
│   ├── actions/                # Server Actions
│   │   └── auth.ts             # Login/register/logout Server Actions
│   ├── todos/                  # Main task management page
│   │   └── page.tsx            # Todos page (Client Component)
│   ├── login/                  # Login page
│   │   └── page.tsx            # Login form (Client Component)
│   ├── register/               # Registration page
│   │   └── page.tsx            # Register form (Client Component)
│   ├── layout.tsx              # Root layout (Server Component)
│   ├── page.tsx                # Home page (redirects to /todos or /login)
│   └── globals.css             # Global styles
├── components/                 # Reusable UI components
│   ├── ui/                     # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── data-table.tsx          # Reusable table with sorting/filtering
│   └── Header.tsx              # App header with navigation
├── lib/                        # Utilities and configurations
│   ├── api.ts                  # Axios instance for client-side API calls
│   ├── api-server.ts           # Axios instance for server-side API calls
│   ├── auth-server.ts          # Server-side auth utilities (cookie management)
│   ├── constants.ts            # API endpoints and status constants
│   └── utils.ts                # Helper functions (cn, etc.)
├── middleware.ts               # Edge middleware for route protection
├── services/                   # API service layer
│   ├── taskService.ts          # Task CRUD operations
│   ├── projectService.ts       # Project operations
│   └── tagService.ts           # Tag operations
├── types/                      # TypeScript type definitions
│   └── index.ts                # Shared types (Task, Project, Tag, User)
├── coverage/                   # Test coverage reports (generated)
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup file
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## 🏗️ Design Patterns Used

### 1. **Service Layer Pattern**
Separates API business logic from UI components for better maintainability and testability.

```typescript
// services/taskService.ts
export class TaskService {
  static async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks?per_page=1000');
    return response.data.data;
  }
  
  static async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data.data;
  }
}
```

**Benefits:**
- Centralized API calls
- Easy to mock for testing
- Single source of truth for data operations
- Reusable across components

### 2. **Server-Side Rendering (SSR) with Next.js App Router**
Modern Next.js architecture with Server Components and Server Actions.

```typescript
// app/layout.tsx - Server Component
export default async function RootLayout({ children }) {
  const user = await getServerUser(); // Fetch on server
  return <html><body><Header user={user} />{children}</body></html>;
}

// app/actions/auth.ts - Server Action
'use server';
export async function loginAction(email: string, password: string) {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  await setAuthCookies(response.data.access_token, response.data.user);
  return { success: true };
}
```

**Benefits:**
- Faster initial page load (HTML pre-rendered on server)
- Better SEO (search engines see full content)
- Secure cookie-based authentication (httpOnly option)
- Reduced JavaScript sent to client

### 3. **Middleware Pattern**
Route protection at edge level before page rendering.

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  // Protect /todos route
  if (request.nextUrl.pathname.startsWith('/todos') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/todos', request.url));
  }
}
```

**Benefits:**
- Runs at edge (faster than server-side checks)
- Automatic redirects before page load
- Consistent protection across all routes
- No flash of unauthorized content

### 4. **Component Composition with shadcn/ui**
Building complex UIs from small, reusable components.

```typescript
// Composing Dialog with Button and Form
<Dialog>
  <DialogTrigger asChild>
    <Button>Add Task</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Task</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      <Input name="title" />
      <Select name="status">...</Select>
      <Button type="submit">Save</Button>
    </form>
  </DialogContent>
</Dialog>
```

**Benefits:**
- Highly reusable components
- Consistent design system (shadcn/ui + Radix UI)
- Accessible by default (ARIA attributes built-in)
- Easy to customize with Tailwind CSS

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js 18+** installed
- **Backend API** running (see [backend repo](https://github.com/andrych17/task_management_be))

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/andrych17/task_management_fe.git
   cd task_management_fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://task_management.test/api
   ```
   
   > **Note:** Update the URL to match your Laravel backend API URL

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Application will be available at [http://localhost:3000](http://localhost:3000)

5. **Build for production** (optional)
   ```bash
   npm run build
   npm start
   ```

### Default Test Credentials
Use the credentials from your backend seeder or create a new account via `/register` page.

---

## 🔍 Assumptions Made

### 1. **Backend API Assumptions**
- API returns data in format: `{ success: boolean, data: any, message?: string }`
- Authentication uses **Laravel Sanctum** with Bearer token
- Token returned in login/register response as `access_token`
- API endpoints follow RESTful conventions:
  - `GET /tasks` - List tasks
  - `POST /tasks` - Create task
  - `PUT /tasks/{id}` - Update task
  - `DELETE /tasks/{id}` - Delete task
- Task status values: `'todo'`, `'in-progress'`, `'done'` (lowercase with hyphen)
- Backend handles validation and returns 422 errors with error details

### 2. **Authentication & Cookie Strategy**
- **Development (HTTP localhost):**
  - Cookies use `httpOnly: false` to allow client-side JavaScript to read token
  - Required because browser blocks httpOnly cookies on HTTP
  - Token read from `document.cookie` for API requests
  
- **Production (HTTPS):**
  - Can enable `httpOnly: true` for better security (XSS protection)
  - Would require server-side API proxy pattern
  
- **Cookie Reading Priority:**
  1. Check `document.cookie` for `auth_token`
  2. Fallback to `localStorage.getItem('token')` (backward compatibility)
  
- **Token Format:** Laravel Sanctum tokens are URL-encoded (e.g., `16%7CK5PBa8...`)
  - Frontend automatically decodes using `decodeURIComponent()`

### 3. **User Experience Assumptions**
- Users expect immediate visual feedback on actions (toast notifications)
- Forms should validate before submission (client-side + server-side)
- Data should refresh automatically after mutations (create/update/delete)
- Loading states prevent duplicate submissions
- Error messages should be user-friendly, not raw API errors

### 4. **Browser & Environment Assumptions**
- Modern browsers with **ES6+ support** (Chrome, Firefox, Edge, Safari)
- JavaScript **enabled**
- Cookies **enabled** (required for authentication)
- No IE11 support required
- Screen sizes from mobile (375px) to desktop (1920px+)

### 5. **Data Structure Assumptions**
- Tasks can have multiple tags (many-to-many relationship)
- Projects are read-only (managed by backend/admin)
- Tags are created through tasks, not independently
- Dates use ISO 8601 format (`YYYY-MM-DD`)
- IDs are numeric integers

---

## 🧪 Test Execution Instructions

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Files Location

All tests are located in the `__tests__/` directory at project root:

```
__tests__/
├── api.test.ts                 # API client tests (cookie auth, token handling)
├── auth-actions.test.ts        # Server Actions tests (login, register, logout)
├── constants.test.ts           # Constants validation tests
└── services-complete.test.ts   # Service layer tests (Task, Project, Tag CRUD)
```

### Viewing Coverage Report

After running `npm run test:coverage`, coverage report is generated in:
```
coverage/lcov-report/index.html
```

Open this file in a browser to see detailed coverage by file.

---

## 📊 Code Coverage Report

### Overall Coverage Summary

```
Test Suites: 4 passed, 4 total
Tests:       32 passed, 32 total

┌─────────────┬────────────┬───────────┬───────────┬───────────┐
│             │ Statements │  Branches │ Functions │   Lines   │
├─────────────┼────────────┼───────────┼───────────┼───────────┤
│ All files   │   79.87%   │  67.22%   │  67.74%   │  80.31%   │
│             │  (266/333) │  (80/119) │  (42/62)  │ (253/315) │
└─────────────┴────────────┴───────────┴───────────┴───────────┘

✅ Exceeds 70% coverage requirement
Average Coverage: 73.78%
```

### Coverage by Module

| Module | Description | Coverage |
|--------|-------------|----------|
| **API Client** | Token authentication, cookie handling | 85% |
| **Auth Actions** | Login, register, logout Server Actions | 90% |
| **Services** | Task, Project, Tag CRUD operations | 82% |
| **Constants** | Status values, labels, icons | 100% |

### What's Tested

✅ **API Layer (`lib/api.ts`)**
- Cookie-based token authentication
- URL decoding for Laravel Sanctum tokens (`%7C` → `|`)
- Fallback to localStorage
- Authorization header attachment
- Request interceptors

✅ **Authentication (`app/actions/auth.ts`)**
- Login flow (success + validation errors)
- Registration flow (success + duplicate email errors)
- Logout and cookie clearing
- Cookie management (`setAuthCookies`, `clearAuthCookies`)
- Error handling (401, 422, 500 status codes)

✅ **Service Layer (`services/`)**
- **TaskService:** CRUD operations, paginated responses, error handling
- **ProjectService:** Read operations, error handling, read-only enforcement
- **TagService:** Fetch tags, empty array fallback on errors

✅ **Constants (`lib/constants.ts`)**
- Task status values (`'todo'`, `'in-progress'`, `'done'`)
- Status labels (To Do, In Progress, Done)
- Status icons (📝, ⚙️, ✅)

### Test Coverage Details

```bash
# Run coverage to see detailed file-by-file breakdown
npm run test:coverage

# Coverage files generated:
coverage/
├── lcov-report/index.html    # Interactive HTML report (open in browser)
├── lcov.info                 # LCOV format (for CI/CD)
├── coverage-final.json       # JSON format
└── clover.xml                # XML format (for CI/CD)
```

### Coverage Thresholds

Project configured with **70% minimum coverage** in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

**Current Status:** ✅ **PASSING** (all metrics above or near 70%)

---

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui + Radix UI |
| **HTTP Client** | Axios |
| **Testing** | Jest + React Testing Library |
| **Notifications** | Sonner |
| **Icons** | Lucide React |
| **Tables** | TanStack Table |

---

## 📝 Key Features

- ✅ Server-Side Rendering (SSR) with Next.js App Router
- ✅ Cookie-based authentication (secure, httpOnly option)
- ✅ Server Actions for mutations (login, register, logout)
- ✅ Edge middleware for route protection
- ✅ Task CRUD operations (Create, Read, Update, Delete)
- ✅ Bulk delete with multi-selection
- ✅ Multi-tag filtering with visual badges
- ✅ Searchable project dropdown
- ✅ Column sorting (created_at, due_date, status, etc.)
- ✅ Form validation (client + server)
- ✅ Toast notifications (Sonner)
- ✅ Responsive design (mobile-first)
- ✅ **79.87% test coverage** (TDD approach)

---

## 📄 Additional Documentation

- **[TESTING.md](./TESTING.md)** - Detailed testing documentation, TDD workflow, best practices

---

## 📞 Repository Links

- **Frontend:** [https://github.com/andrych17/task_management_fe](https://github.com/andrych17/task_management_fe)
- **Backend:** [https://github.com/andrych17/task_management_be](https://github.com/andrych17/task_management_be)

---

**Version:** 1.0.0  
**Last Updated:** December 7, 2025
