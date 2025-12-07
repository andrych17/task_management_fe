# Console Logging Documentation

This document describes the comprehensive console logging implemented throughout the application to help debug and monitor API interactions.

## Logging Conventions

All services use emoji prefixes for easy visual scanning:

- 🔗 **Fetching data** - GET requests
- ➕ **Creating** - POST requests  
- ✏️ **Updating** - PUT/PATCH requests
- 🗑️ **Deleting** - DELETE requests
- ✅ **Success** - Successful operations
- ❌ **Error** - Failed operations
- ⚠️ **Warning** - Non-critical issues
- 📊 **Data analysis** - Data structure information
- 🔍 **Debug** - Detailed error analysis
- 🌐 **HTTP** - API calls (from interceptor)
- 📦 **Payload** - Request data
- 🔑 **Authentication** - Token operations
- 🚪 **Logout** - User logout
- 🔐 **Login** - User login
- 🚫 **Unauthorized** - 401 errors
- 🔥 **Server error** - 500+ errors

## Service Logging Patterns

### TaskService

**getTasks()** - Fetch all tasks
```javascript
console.log('🔗 [TaskService] Fetching tasks from:', API_ENDPOINTS.TASKS);
console.log('✅ [TaskService] Response:', {
  success: response.data.success,
  hasData: !!response.data.data,
  dataType: Array.isArray(response.data.data) ? 'array' : typeof response.data.data,
  count: Array.isArray(response.data.data) ? response.data.data.length : 0,
  message: response.data.message
});
console.log('📊 [TaskService] Returning ${count} tasks');
```

**getTask(id)** - Fetch single task
```javascript
console.log('🔗 [TaskService] Fetching task #${id}');
console.log('✅ [TaskService] Task #${id} retrieved:', {
  title: response.data.data?.title,
  status: response.data.data?.status,
  project: response.data.data?.project?.name,
  tags: response.data.data?.tags?.length
});
```

**createTask(data)** - Create new task
```javascript
console.log('➕ [TaskService] Creating task:', {
  title: data.title,
  status: data.status,
  project_id: data.project_id,
  tags: data.tags?.length,
  has_due_date: !!data.due_date
});
console.log('✅ [TaskService] Task created:', {
  id: response.data.data?.id,
  title: response.data.data?.title,
  message: response.data.message
});
```

**updateTask(id, data)** - Update task
```javascript
console.log('✏️ [TaskService] Updating task #${id}:', {
  fields: Object.keys(data),
  status: data.status,
  title: data.title
});
console.log('✅ [TaskService] Task #${id} updated:', {
  title: response.data.data?.title,
  status: response.data.data?.status,
  message: response.data.message
});
```

**deleteTask(id)** - Delete task
```javascript
console.log('🗑️ [TaskService] Deleting task #${id}');
console.log('✅ [TaskService] Task #${id} deleted successfully');
```

**Error Handling**
```javascript
console.error('❌ [TaskService] Error fetching tasks:', {
  status: error.response?.status,
  message: error.response?.data?.message,
  errors: error.response?.data?.errors
});
console.error('🔍 [TaskService] Error details:', {
  status: error.response?.status,
  success: error.response?.data?.success,
  message: error.response?.data?.message,
  errors: error.response?.data?.errors
});
```

### ProjectService

Follows the same pattern as TaskService:
- `🔗 [ProjectService] Fetching projects from: /projects`
- `➕ [ProjectService] Creating project: { name, has_description }`
- `✏️ [ProjectService] Updating project #${id}`
- `🗑️ [ProjectService] Deleting project #${id}`
- `✅ [ProjectService] Response: { success, hasData, count }`
- `❌ [ProjectService] Error: { status, message, errors }`

### TagService

Follows the same pattern as TaskService:
- `🔗 [TagService] Fetching tags from: /tags`
- `➕ [TagService] Creating tag: { name }`
- `🗑️ [TagService] Deleting tag #${id}`
- `✅ [TagService] Response: { success, hasData, count }`
- `❌ [TagService] Error: { status, message, errors }`

### AuthContext

**fetchUser()** - Get current user
```javascript
console.log('🔗 [AuthContext] Fetching current user from:', API_ENDPOINTS.USER);
console.log('✅ [AuthContext] User fetched:', {
  id: response.data.id,
  name: response.data.name,
  email: response.data.email
});
console.error('❌ [AuthContext] Error fetching user:', error.response?.data);
```

**login(email, password)** - User login
```javascript
console.log('🔐 [AuthContext] Attempting login for:', email);
console.log('✅ [AuthContext] Login successful:', {
  user: response.data.user?.name,
  email: response.data.user?.email,
  hasToken: !!response.data.access_token
});
console.error('❌ [AuthContext] Login failed:', {
  status: error.response?.status,
  message: error.response?.data?.message
});
```

**register(name, email, password)** - User registration
```javascript
console.log('➕ [AuthContext] Attempting registration for:', { name, email });
console.log('✅ [AuthContext] Registration successful:', {
  user: response.data.user?.name,
  email: response.data.user?.email,
  hasToken: !!response.data.access_token
});
console.error('❌ [AuthContext] Registration failed:', {
  status: error.response?.status,
  message: error.response?.data?.message,
  errors: error.response?.data?.errors
});
```

**logout()** - User logout
```javascript
console.log('🚪 [AuthContext] Logging out user:', user?.email);
console.log('✅ [AuthContext] Logout API call successful');
console.warn('⚠️ [AuthContext] Logout API call failed (continuing anyway):', error.response?.data);
console.log('✅ [AuthContext] User logged out, redirecting to login');
```

## API Interceptors (lib/api.ts)

### Request Interceptor
```javascript
console.log('🌐 [API] ${method} ${baseURL}${url}');
console.log('📦 [API] Request payload:', config.data);
console.log('🔑 [API] Token attached to request');
console.log('⚠️ [API] No token found (public endpoint)');
```

### Response Interceptor - Success
```javascript
console.log('✅ [API] Response from ${url}:', {
  status: response.status,
  success: response.data?.success,
  hasData: !!response.data?.data,
  dataType: response.data?.data ? (Array.isArray(...) ? 'array[${length}]' : typeof ...) : 'none',
  message: response.data?.message
});
console.log('📊 [API] Response structure:', Object.keys(response.data));
```

### Response Interceptor - Error
```javascript
console.error('❌ [API] Error from ${url}:', {
  status,
  success: data?.success,
  message: data?.message,
  errors: data?.errors,
  error: data?.error
});

// Status-specific logging:
console.error('🚫 [API] Unauthorized - Token may be invalid or expired');  // 401
console.error('⚠️ [API] Validation failed:', data?.errors);                // 422
console.error('🔍 [API] Resource not found');                               // 404
console.error('🔥 [API] Server error');                                     // 500+
```

## Laravel API Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { /* resource data or array */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details",
  "errors": { /* validation errors */ }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": {
    "data": [ /* array of items */ ],
    "current_page": 1,
    "per_page": 15,
    "total": 100
  }
}
```

## How to Use the Logs

### 1. Monitoring API Calls
Open browser DevTools Console and filter by:
- `[API]` - See all HTTP requests/responses
- `[TaskService]` - Monitor task operations
- `[ProjectService]` - Monitor project operations
- `[TagService]` - Monitor tag operations
- `[AuthContext]` - Monitor authentication

### 2. Debugging Errors
When an error occurs:
1. Look for `❌` emoji in console
2. Check the service name (e.g., `[TaskService]`)
3. Review error details: status, message, errors
4. Check `🔍 [Service] Error details` for full context

### 3. Tracking Data Flow
1. Look for `🔗` to see when data is fetched
2. Check `✅` for successful responses
3. Review `📊` for data structure and counts
4. Follow operation lifecycle: Request → Response → Success/Error

### 4. Performance Monitoring
- Count the number of API calls per page load
- Identify redundant requests
- Check response times (use Network tab alongside console logs)

## Example Console Output

```
🌐 [API] GET http://task_management.test/api/tasks
🔑 [API] Token attached to request
🔗 [TaskService] Fetching tasks from: /tasks
✅ [API] Response from /tasks: { status: 200, success: true, hasData: true, dataType: 'array[15]', message: null }
📊 [API] Response structure: ['success', 'data']
✅ [TaskService] Response: { success: true, hasData: true, dataType: 'array', count: 15, message: null }
📊 [TaskService] Returning 15 tasks
```

## Benefits

1. **Easy Debugging** - Quickly identify where errors occur
2. **Data Validation** - Verify API response structure matches expectations
3. **Performance** - Track API call frequency and timing
4. **User Actions** - See what operations users are performing
5. **Error Tracking** - Comprehensive error context for bug reports
6. **Development** - Understand data flow during feature development

## Production Considerations

For production builds, consider:
- Removing or minimizing console logs (use environment variables)
- Implementing a logging service (e.g., Sentry, LogRocket)
- Keeping only error logs for monitoring
- Using log levels (debug, info, warn, error)

Example:
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log('🔗 [TaskService] Fetching tasks...');
}
```
