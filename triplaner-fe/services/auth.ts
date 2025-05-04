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
  name?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  hasPendingInvitations?: boolean;
}

// Use a flag to avoid repeated failed auth attempts
let authCheckInProgress = false;
let lastAuthAttempt = 0;
const AUTH_COOLDOWN = 5000; // 5 seconds cooldown between auth checks

export const authService = {
  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    
    // Store token in cookie
    if (response.token) {
      setCookie('authToken', response.token);
    }
    
    return response;
  },

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Store token in cookie
    if (response.token) {
      setCookie('authToken', response.token);
    }
    
    return response;
  },

  // Logout user
  async logout(): Promise<void> {
    // Call the backend endpoint
    await api.post('/auth/logout');
    
    // Remove token from cookie
    removeCookie('authToken');
  },

  // Get current user
  async getCurrentUser(): Promise<AuthResponse | null> {
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
      
      const response = await api.get<AuthResponse>('/auth/me');
      
      authCheckInProgress = false;
      return response;
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
      const response = await this.getCurrentUser();
      return !!response?.user;
    } catch (error) {
      return false;
    }
  }
}; 