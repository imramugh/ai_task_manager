import api from './api';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const auth = {
  async login(credentials: LoginCredentials): Promise<{ access_token: string; token_type: string }> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.access_token) {
      // Store token in both cookie and localStorage for redundancy
      Cookies.set(TOKEN_KEY, response.data.access_token, { 
        expires: 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      
      // Also store user info
      try {
        const userResponse = await api.get('/api/auth/me');
        localStorage.setItem(USER_KEY, JSON.stringify(userResponse.data));
      } catch (error) {
        console.error('Failed to fetch user data after login');
      }
    }
    
    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    // First check if we have cached user data
    const cachedUser = localStorage.getItem(USER_KEY);
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        // Verify the token is still valid by making an API call
        const response = await api.get('/api/auth/me');
        // Update cached user data
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        // Token is invalid, clear storage
        Cookies.remove(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        throw error;
      }
    }
    
    // No cached user, fetch from API
    const response = await api.get('/api/auth/me');
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  logout() {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    // Check both cookie and localStorage
    return !!(Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY));
  },

  getCachedUser(): User | null {
    const cachedUser = localStorage.getItem(USER_KEY);
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch {
        return null;
      }
    }
    return null;
  },
};