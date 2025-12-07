'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      // console.log('🔗 [AuthContext] Fetching current user from:', API_ENDPOINTS.USER);
      const response = await api.get(API_ENDPOINTS.USER);
      
      // API returns { success: true, user: {...} }
      const userData = response.data.user || response.data;
      
      // console.log('✅ [AuthContext] User fetched:', {
      //   id: userData.id,
      //   name: userData.name,
      //   email: userData.email
      // });
      setUser(userData);
    } catch (error: any) {
      // console.error('❌ [AuthContext] Error fetching user:', error.response?.data);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // console.log('🔑 [AuthContext] Attempting login for:', email);
      const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
      
      // console.log('✅ [AuthContext] Login successful:', {
      //   user: response.data.user?.name,
      //   email: response.data.user?.email,
      //   hasToken: !!response.data.access_token,
      //   tokenType: response.data.token_type
      // });
      
      // Store access_token and user data
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      router.push('/todos');
    } catch (error: any) {
      // console.error('❌ [AuthContext] Login failed:', {
      //   status: error.response?.status,
      //   message: error.response?.data?.message,
      //   errors: error.response?.data?.errors
      // });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // console.log('➕ [AuthContext] Attempting registration for:', { name, email });
      const response = await api.post(API_ENDPOINTS.REGISTER, { name, email, password, password_confirmation: password });
      // console.log('✅ [AuthContext] Registration successful:', {
      //   user: response.data.user?.name,
      //   email: response.data.user?.email,
      //   hasToken: !!response.data.access_token
      // });
      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      router.push('/todos');
    } catch (error: any) {
      // console.error('❌ [AuthContext] Registration failed:', {
      //   status: error.response?.status,
      //   message: error.response?.data?.message,
      //   errors: error.response?.data?.errors
      // });
      throw error;
    }
  };

  const logout = async () => {
    // console.log('🚪 [AuthContext] Logging out user:', user?.email);
    
    // First, call logout API to revoke token in backend (while we still have the token)
    try {
      const response = await api.post(API_ENDPOINTS.LOGOUT);
      // console.log('✅ [AuthContext] Logout API success:', response.data.message);
    } catch (error: any) {
      // console.warn('⚠️ [AuthContext] Logout API failed:', error.response?.data?.message || error.message);
    }
    
    // Then clear state and localStorage
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // console.log('✅ [AuthContext] Auth data cleared from client');
    
    // Finally redirect to login
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
