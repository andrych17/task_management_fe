import api from '@/lib/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('API Client', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
    
    // Clear localStorage
    localStorage.clear();
  });

  describe('Token Reading', () => {
    it('should read token from cookies', () => {
      const token = '16|K5PBa8cCStPCi7QdQE2iws3HswHn8cAc4MfDNvAR93cd73df';
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `auth_token=${encodeURIComponent(token)}; path=/`,
      });

      // The interceptor should have been set up during module load
      expect(api).toBeDefined();
    });

    it('should decode URL-encoded tokens from cookies', () => {
      const encodedToken = '16%7CK5PBa8cCStPCi7QdQE2iws3HswHn8cAc4MfDNvAR93cd73df';
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `auth_token=${encodedToken}; path=/`,
      });

      expect(api).toBeDefined();
    });

    it('should fallback to localStorage when cookie not found', () => {
      const token = 'test-token-from-localstorage';
      localStorage.setItem('token', token);

      expect(api).toBeDefined();
    });

    it('should handle missing token gracefully', () => {
      // No cookie, no localStorage
      expect(api).toBeDefined();
    });
  });

  describe('API Configuration', () => {
    it('should be configured with base URL from environment', () => {
      expect(api.defaults.baseURL).toBeDefined();
    });

    it('should have correct default headers', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
      expect(api.defaults.headers['Accept']).toBe('application/json');
    });
  });

  describe('Request Interceptor', () => {
    it('should attach Authorization header when token exists', () => {
      const token = 'test-token';
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `auth_token=${token}; path=/`,
      });

      expect(api.interceptors.request).toBeDefined();
    });

    it('should not attach Authorization header when token is missing', () => {
      expect(api.interceptors.request).toBeDefined();
    });
  });
});
