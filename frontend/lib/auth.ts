import api from './api';

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
      localStorage.setItem('token', response.data.access_token);
      // Also store user info
      try {
        const userResponse = await api.get('/api/auth/me');
        localStorage.setItem('user', JSON.stringify(userResponse.data));
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
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        // Verify the token is still valid by making an API call
        const response = await api.get('/api/auth/me');
        // Update cached user data
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw error;
      }
    }
    
    // No cached user, fetch from API
    const response = await api.get('/api/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getCachedUser(): User | null {
    const cachedUser = localStorage.getItem('user');
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