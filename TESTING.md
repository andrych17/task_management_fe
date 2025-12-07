# Testing Documentation

## Test-Driven Development (TDD) Strategy

This project follows TDD principles with a minimum of 70% code coverage across all critical modules.

## Test Structure

All tests are located in the `__tests__` directory at the project root for easier management and discovery.

```
__tests__/
├── api.test.ts                      # API client tests
├── auth-actions.test.ts             # Server Actions authentication tests
├── constants.test.ts                # Constants validation tests
├── services-complete.test.ts        # Service layer tests (CRUD operations)
├── TaskCard.test.tsx                # Component tests
├── LoadingSpinner.test.tsx          # UI component tests
├── ErrorMessage.test.tsx            # Error handling component tests
└── ...                              # Additional test files
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Coverage Requirements

The project maintains **70% minimum coverage** across all metrics:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### What's Covered

1. **API Layer** (`lib/api.ts`)
   - Token reading from cookies
   - URL decoding for Laravel Sanctum tokens
   - Fallback to localStorage
   - Request interceptors
   - Error handling

2. **Service Layer** (`services/`)
   - Task CRUD operations
   - Project management
   - Tag management
   - Error handling and logging
   - Response data normalization

3. **Authentication** (`app/actions/auth.ts`)
   - Login flow
   - Registration flow
   - Logout functionality
   - Cookie management
   - Validation errors

4. **Components**
   - TaskCard rendering
   - LoadingSpinner states
   - ErrorMessage display
   - UI interactions

5. **Utilities** (`lib/`)
   - Constants validation
   - Helper functions

### What's Excluded

- Next.js page components (tested via E2E)
- Shadcn UI components (pre-tested library)
- Type definition files (`.d.ts`)
- Build artifacts (`.next/`)

## Test Best Practices

### 1. **Arrange-Act-Assert (AAA) Pattern**
```typescript
it('should login successfully', async () => {
  // Arrange
  const mockResponse = { data: { access_token: 'token', user: {...} } };
  mockAxios.post.mockResolvedValue(mockResponse);
  
  // Act
  const result = await loginAction('email@test.com', 'password');
  
  // Assert
  expect(result.success).toBe(true);
});
```

### 2. **Test Isolation**
Each test is independent and doesn't rely on others:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

### 3. **Mock External Dependencies**
```typescript
jest.mock('axios');
jest.mock('@/lib/auth-server');
```

### 4. **Test Both Success and Failure Paths**
```typescript
describe('createTask', () => {
  it('should create successfully', async () => { ... });
  it('should handle errors', async () => { ... });
});
```

### 5. **Descriptive Test Names**
- ✅ `should return error when email already exists`
- ❌ `test error handling`

## TDD Workflow

1. **Write the test first** (Red phase)
   ```bash
   npm run test:watch
   ```

2. **Write minimal code to pass** (Green phase)
   - Implement just enough code to make the test pass

3. **Refactor** (Refactor phase)
   - Clean up code while keeping tests green
   - Add more test cases if needed

4. **Check coverage**
   ```bash
   npm run test:coverage
   ```

5. **Repeat** for next feature

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull request creation
- Merge to main branch

Coverage reports are generated and must meet the 70% threshold before merging.

## Debugging Tests

### Run specific test file
```bash
npm test -- api.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="login"
```

### Debug in VS Code
Add breakpoint and use Jest debug configuration in `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## Common Testing Patterns

### Testing Async Functions
```typescript
it('should fetch data', async () => {
  mockApi.get.mockResolvedValue({ data: [...] });
  const result = await service.getData();
  expect(result).toEqual([...]);
});
```

### Testing Error Handling
```typescript
it('should handle errors', async () => {
  const error = { response: { status: 500 } };
  mockApi.get.mockRejectedValue(error);
  await expect(service.getData()).rejects.toThrow();
});
```

### Testing React Components
```typescript
it('should render correctly', () => {
  render(<Component {...props} />);
  expect(screen.getByText('Title')).toBeInTheDocument();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TDD Best Practices](https://testdriven.io/test-driven-development/)
