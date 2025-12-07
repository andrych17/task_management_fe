# Task Management System - Frontend

<img width="1440" height="975" alt="image" src="https://github.com/user-attachments/assets/3899d8f4-8a74-493a-85c0-df1517f62398" />
<img width="1757" height="772" alt="image" src="https://github.com/user-attachments/assets/dc184345-23d5-4d5a-8db8-cf5aa5054ded" />
<img width="827" height="901" alt="image" src="https://github.com/user-attachments/assets/e40ec871-0f26-47f3-aad3-a2cc8dc0e304" />
A modern task management application built with Next.js 16, TypeScript, and Tailwind CSS.

## 📞 Repository Links

- **Frontend:** [https://github.com/andrych17/task_management_fe](https://github.com/andrych17/task_management_fe)
- **Backend:** [https://github.com/andrych17/task_management_be](https://github.com/andrych17/task_management_be)


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
Separates API business logic from UI components.

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

### 2. **Server-Side Rendering (SSR)**
Next.js App Router with Server Components and Server Actions.

```typescript
// app/layout.tsx - Server Component
export default async function RootLayout({ children }) {
  const user = await getServerUser();
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

### 3. **Middleware Pattern**
Route protection at edge level.

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (request.nextUrl.pathname.startsWith('/todos') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### 4. **Component Composition**
Building UIs from reusable components (shadcn/ui + Radix UI).

```typescript
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
      <Button type="submit">Save</Button>
    </form>
  </DialogContent>
</Dialog>
```

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

### Coverage Files Generated

```
coverage/
├── lcov-report/index.html    # Open in browser for detailed report
├── lcov.info
├── coverage-final.json
└── clover.xml
```


