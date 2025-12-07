import axios from 'axios';
import { getServerToken } from './auth-server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://task_management.test/api';

/**
 * Server-side API client
 * Uses cookies for authentication instead of localStorage
 */
const apiServer = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add token from cookies
apiServer.interceptors.request.use(
  async (config) => {
    const token = await getServerToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiServer.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - will be handled by middleware
      console.error('[API Server] Unauthorized - token may be invalid');
    }
    return Promise.reject(error);
  }
);

export default apiServer;
