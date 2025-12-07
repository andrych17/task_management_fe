'use server';

import { redirect } from 'next/navigation';
import axios from 'axios';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth-server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://task_management.test/api';

interface LoginResult {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}

interface RegisterResult {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Server Action: Login user
 */
export async function loginAction(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    const { access_token, user } = response.data;
    
    // Set authentication cookies
    await setAuthCookies(access_token, user);
    
    return { success: true };
  } catch (error: any) {
    if (error.response?.status === 422) {
      return {
        success: false,
        error: error.response.data.message || 'Invalid credentials',
        errors: error.response.data.errors,
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
}

/**
 * Server Action: Register user
 */
export async function registerAction(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
      password_confirmation: password,
    });
    
    const { access_token, user } = response.data;
    
    // Set authentication cookies
    await setAuthCookies(access_token, user);
    
    return { success: true };
  } catch (error: any) {
    if (error.response?.status === 422) {
      return {
        success: false,
        error: error.response.data.message || 'Validation failed',
        errors: error.response.data.errors,
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
}

/**
 * Server Action: Logout user
 */
export async function logoutAction(): Promise<void> {
  // Clear cookies first
  await clearAuthCookies();
  
  // Redirect to login
  redirect('/login');
}
