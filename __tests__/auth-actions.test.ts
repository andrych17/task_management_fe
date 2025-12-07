/**
 * Integration Tests for Authentication Flow
 * 
 * Tests the complete authentication flow including:
 * - User login with valid credentials
 * - User registration
 * - Logout functionality
 * - Cookie management
 * - Error handling
 */

import { loginAction, registerAction, logoutAction } from '@/app/actions/auth';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth-server';
import axios from 'axios';

// Mock dependencies
jest.mock('@/lib/auth-server');
jest.mock('axios');
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Authentication Actions', () => {
  const mockSetAuthCookies = setAuthCookies as jest.MockedFunction<typeof setAuthCookies>;
  const mockClearAuthCookies = clearAuthCookies as jest.MockedFunction<typeof clearAuthCookies>;
  const mockAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginAction', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token-123',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);
      mockSetAuthCookies.mockResolvedValue();

      const result = await loginAction('test@example.com', 'password123');

      expect(result).toEqual({ success: true });
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );
      expect(mockSetAuthCookies).toHaveBeenCalledWith(
        'test-token-123',
        mockResponse.data.user
      );
    });

    it('should return error with invalid credentials', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      mockAxios.post.mockRejectedValue(error);

      const result = await loginAction('wrong@example.com', 'wrongpass');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(mockSetAuthCookies).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const error = {
        response: {
          status: 500,
          data: {
            message: 'Server error',
          },
        },
      };

      mockAxios.post.mockRejectedValue(error);

      const result = await loginAction('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('registerAction', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        data: {
          access_token: 'new-token-456',
          user: {
            id: 2,
            name: 'New User',
            email: 'new@example.com',
          },
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);
      mockSetAuthCookies.mockResolvedValue();

      const result = await registerAction('New User', 'new@example.com', 'password123');

      expect(result).toEqual({ success: true });
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/register'),
        {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          password_confirmation: 'password123',
        }
      );
      expect(mockSetAuthCookies).toHaveBeenCalled();
    });

    it('should return error when email already exists', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            message: 'Email already taken',
            errors: {
              email: ['The email has already been taken.'],
            },
          },
        },
      };

      mockAxios.post.mockRejectedValue(error);

      const result = await registerAction('Test User', 'existing@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already taken');
      expect(result.errors).toBeDefined();
      expect(mockSetAuthCookies).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: {
              name: ['The name field is required.'],
              password: ['The password must be at least 8 characters.'],
            },
          },
        },
      };

      mockAxios.post.mockRejectedValue(error);

      const result = await registerAction('', 'test@example.com', '123');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('logoutAction', () => {
    it('should logout successfully', async () => {
      mockClearAuthCookies.mockResolvedValue();

      await expect(logoutAction()).rejects.toThrow();
      expect(mockClearAuthCookies).toHaveBeenCalled();
    });
  });
});
