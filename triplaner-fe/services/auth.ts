import { api } from './api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  // Login user
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<{ user: User, token: string }>('/auth/login', { email, password });
    
    // Store token in localStorage
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.token);
    }
    
    return response.user;
  },

  // Register new user
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<{ user: User, token: string }>('/auth/register', data);
    
    // Store token in localStorage
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.token);
    }
    
    return response.user;
  },

  // Logout user
  async logout(): Promise<void> {
    // Call the backend endpoint
    await api.post('/auth/logout');
    
    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      return await api.get<User>('/auth/me');
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}; 