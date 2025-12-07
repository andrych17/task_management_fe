// API Endpoints
// Task Status Constants - Using backend format for SSR consistency
export const TASK_STATUS = {
  TODO: 'todo' as const,
  IN_PROGRESS: 'in-progress' as const,
  DONE: 'done' as const,
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

export const TASK_STATUS_ICONS: Record<string, string> = {
  'todo': '📝',
  'in-progress': '⚙️',
  'done': '✅',
};

// No longer needed - using backend format consistently for SSR
// Keeping for backward compatibility if needed
export const mapBackendStatus = (status: string): string => {
  // Backend format is now the standard, no mapping needed
  return status;
};

export const mapFrontendStatus = (status: string): string => {
  // Backend format is now the standard, no mapping needed
  return status;
};

export const API_ENDPOINTS = {
  // Tasks
  TASKS: '/tasks',
  TASK_BY_ID: (id: number) => `/tasks/${id}`,
  DASHBOARD: '/dashboard',
  
  // Projects (read-only, index only)
  PROJECTS: '/projects',
  
  // Tags (read-only, index with search)
  TAGS: '/tags',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  USER: '/user',
} as const;

// Note: Tags are not separate entities, they are strings used for searching/filtering tasks
