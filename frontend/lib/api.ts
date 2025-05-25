import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only remove token and redirect if we're not already on auth pages
      const isAuthPage = window.location.pathname.includes('/login') || 
                        window.location.pathname.includes('/register');
      
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_timestamp');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;