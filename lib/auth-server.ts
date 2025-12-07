import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'auth_user';

/**
 * Server-side authentication utilities
 * Uses cookies instead of localStorage for SSR compatibility
 */

export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Get authentication token from cookies (server-side only)
 */
export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME);
  return token?.value || null;
}

/**
 * Get user data from cookies (server-side only)
 */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);
  
  if (!userCookie?.value) {
    return null;
  }
  
  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

/**
 * Set authentication cookies (server-side only)
 */
export async function setAuthCookies(token: string, user: User): Promise<void> {
  const cookieStore = await cookies();
  
  // Set token cookie - NOT httpOnly so client JavaScript can read it
  // In production with HTTPS, you can enable httpOnly for XSS protection
  // But it requires server-side API proxy
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: false, // Allow client-side read for API calls
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  // Set user cookie
  cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear authentication cookies (server-side only)
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
}

/**
 * Check if user is authenticated (server-side only)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getServerToken();
  return !!token;
}
