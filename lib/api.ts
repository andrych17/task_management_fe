import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  const url = config.url?.startsWith('/') ? config.url : `/${config.url}`;
  console.log(`🌐 [API] ${method} ${config.baseURL}${url}`);
  
  if (config.data && Object.keys(config.data).length > 0) {
    console.log(`📦 [API] Request payload:`, config.data);
  }
  
  // Try to get token from cookies first (SSR), then localStorage (fallback)
  let token = null;
  
  // Get from cookies
  if (typeof document !== 'undefined') {
    console.log('🍪 [API] All cookies:', document.cookie);
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    if (authCookie) {
      token = decodeURIComponent(authCookie.split('=')[1]);
      console.log('✅ [API] Token found in cookies');
      console.log('🔓 [API] Decoded token:', token);
    } else {
      console.log('❌ [API] No auth_token cookie found');
    }
  }
  
  // Fallback to localStorage (backward compatibility)
  if (!token && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('token');
    if (token) {
      console.log('✅ [API] Token found in localStorage (fallback)');
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 [API] Token attached to request');
  } else {
    console.log('⚠️ [API] No token found (public endpoint)');
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    console.log(`✅ [API] Response from ${url}:`, {
      status: response.status,
      success: response.data?.success,
      hasData: !!response.data?.data,
      dataType: response.data?.data ? (Array.isArray(response.data.data) ? `array[${response.data.data.length}]` : typeof response.data.data) : 'none',
      message: response.data?.message
    });
    
    // Log response data structure for debugging
    if (response.data) {
      console.log(`📊 [API] Response structure:`, Object.keys(response.data));
    }
    
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    const data = error.response?.data;
    
    console.error(`❌ [API] Error from ${url}:`, {
      status,
      success: data?.success,
      message: data?.message,
      errors: data?.errors,
      error: data?.error
    });
    
    // Detailed error logging
    if (status === 401) {
      console.error('🚫 [API] Unauthorized - Token may be invalid or expired');
    } else if (status === 422) {
      console.error('⚠️ [API] Validation failed:', data?.errors);
    } else if (status === 404) {
      console.error('🔍 [API] Resource not found');
    } else if (status >= 500) {
      console.error('🔥 [API] Server error');
    }
    
    return Promise.reject(error);
  }
);

export default api;
