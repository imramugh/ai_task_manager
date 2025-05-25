import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fix #4: Add SSR-safe localStorage access
const getStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const removeStorageItem = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Try to get token from cookie first (works on both server and client)
    let token = Cookies.get('token');
    
    // Fix #4: Only try localStorage if we're in the browser
    if (!token) {
      token = getStorageItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fix #5: Enhanced error handling
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Fix #5: Better error handling
    const apiError = new APIError(
      error.response?.data?.detail || error.message || 'An error occurred',
      error.response?.data?.code,
      error.response?.data?.field,
      error.response?.status
    );
    
    if (error.response?.status === 401) {
      // Clear both cookie and localStorage
      Cookies.remove('token');
      
      // Fix #4: Only access localStorage and window in browser
      removeStorageItem('token');
      removeStorageItem('user');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(apiError);
  }
);

export default api;