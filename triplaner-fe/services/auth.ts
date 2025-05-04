import { api } from './api';
import { User } from '../types';
import { setCookie, getCookie, removeCookie } from '@/lib/cookies';
import { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Use a flag to avoid repeated failed auth attempts
let authCheckInProgress = false;
let lastAuthAttempt = 0;
const AUTH_COOLDOWN = 5000; // 5 seconds cooldown between auth checks

export const authService = {
  // Login user
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<{ user: User, token: string }>('/auth/login', { email, password });
    
    // Store token in cookie
    if (response.token) {
      setCookie('authToken', response.token);
    }
    
    return response.user;
  },

  // Register new user
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<{ user: User, token: string }>('/auth/register', data);
    
    // Store token in cookie
    if (response.token) {
      setCookie('authToken', response.token);
    }
    
    return response.user;
  },

  // Logout user
  async logout(): Promise<void> {
    // Call the backend endpoint
    await api.post('/auth/logout');
    
    // Remove token from cookie
    removeCookie('authToken');
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    // Check if there's a token before making the request
    const token = getCookie('authToken');
    if (!token) {
      return null;
    }
    
    // Implement cooldown to prevent repeated failed auth attempts
    const now = Date.now();
    if (authCheckInProgress || (now - lastAuthAttempt < AUTH_COOLDOWN)) {
      console.log('Auth check skipped - too frequent or already in progress');
      return null;
    }
    
    try {
      authCheckInProgress = true;
      lastAuthAttempt = now;
      
      const user = await api.get<User>('/auth/me');
      
      authCheckInProgress = false;
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      authCheckInProgress = false;
      
      // If unauthorized, clear token to prevent further requests
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        removeCookie('authToken');
      }
      
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