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
      // Also store login timestamp to help with token expiry
      localStorage.setItem('token_timestamp', Date.now().toString());
    }
    
    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const timestamp = localStorage.getItem('token_timestamp');
    
    if (!token) return false;
    
    // Check if token is older than 30 days (optional)
    if (timestamp) {
      const tokenAge = Date.now() - parseInt(timestamp);
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (tokenAge > thirtyDays) {
        this.logout();
        return false;
      }
    }
    
    return true;
  },

  async verifyToken(): Promise<boolean> {
    if (!this.isAuthenticated()) return false;
    
    try {
      await this.getMe();
      return true;
    } catch (error) {
      // Token is invalid or expired
      this.logout();
      return false;
    }
  },
};