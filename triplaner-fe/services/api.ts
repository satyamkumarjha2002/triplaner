// Base API service for all HTTP requests

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getCookie, removeCookie } from '@/lib/cookies';

// Configure base API URL
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';
// Ensure we don't append /api if it's already included in the base URL
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Flag to prevent infinite redirect loops
let isRedirecting = false;

// Create and configure Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in cross-site requests
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookies if available
    const token = getCookie('authToken');
    
    // Add auth header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login page or refresh token
      if (typeof window !== 'undefined' && !isRedirecting) {
        // Set flag to prevent multiple redirects
        isRedirecting = true;
        
        // Clear token
        removeCookie('authToken');
        
        // Only redirect if we're not already on the login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/auth/login')) {
          console.log('Unauthorized access detected, redirecting to login');
          window.location.href = '/auth/login';
        } else {
          // Reset the flag if we're already on the login page
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API service with typed methods
export const api = {
  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance(config);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // HTTP method helpers
  async get<T>(endpoint: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url: endpoint, params });
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url: endpoint, data });
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url: endpoint, data });
  },

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'DELETE', url: endpoint, data });
  },
  
  // Multipart form data (for file uploads)
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url: endpoint,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}; 