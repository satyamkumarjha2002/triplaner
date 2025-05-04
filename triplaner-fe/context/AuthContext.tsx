'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { AuthState, User } from '@/types';
import { authService } from '@/services/auth';
import { healthCheckService } from '@/services/health';
import { getCookie } from '@/lib/cookies';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (data: { username: string; email: string; password: string; name?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !!getCookie('authToken'), // Initialize based on token existence
    user: null,
    loading: true,
    hasPendingInvitations: false,
  });
  
  // Ref to track if a refresh is in progress
  const isRefreshing = useRef(false);
  // Ref to track if we should skip the next health check refresh
  const skipNextHealthRefresh = useRef(false);

  const refreshAuthState = useCallback(async () => {
    // Prevent concurrent refreshes
    if (isRefreshing.current) {
      console.log('Auth refresh already in progress, skipping');
      return;
    }
    
    // Check for token first
    const hasToken = !!getCookie('authToken');
    if (!hasToken) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        hasPendingInvitations: false,
      });
      return;
    }
    
    try {
      isRefreshing.current = true;
      const response = await authService.getCurrentUser();
      const user = response.user;
      const hasPendingInvitations = response.hasPendingInvitations || false;
      
      console.log('Auth state refreshed, user:', user ? user.username : 'none', 'pending invitations:', hasPendingInvitations);
      
      setAuthState({
        isAuthenticated: !!user,
        user,
        loading: false,
        hasPendingInvitations,
      });
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        hasPendingInvitations: false,
      });
    } finally {
      isRefreshing.current = false;
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    refreshAuthState();
    
    // Start health check service
    if (!healthCheckService.isActive()) {
      healthCheckService.startHealthCheck();
    }
    
    return () => {
      // Clean up health check on unmount
      if (healthCheckService.isActive()) {
        healthCheckService.stopHealthCheck();
      }
    };
  }, [refreshAuthState]);
  
  // Setup health check callback
  useEffect(() => {
    // Register for health check refreshes
    const unregister = healthCheckService.onSuccess(() => {
      // Only refresh if we're not in loading state (avoid double refreshes on initial load)
      // and we're not skipping this refresh
      if (!authState.loading && !skipNextHealthRefresh.current) {
        console.log('Refreshing auth state after successful health check');
        refreshAuthState();
      } else if (skipNextHealthRefresh.current) {
        console.log('Skipping auth refresh after health check as requested');
        skipNextHealthRefresh.current = false;
      }
    });
    
    // Cleanup on unmount
    return () => {
      unregister();
    };
  }, [authState.loading, refreshAuthState]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const user = response.user;
      const hasPendingInvitations = response.hasPendingInvitations || false;
      
      console.log('Login successful, user:', user.username, 'pending invitations:', hasPendingInvitations);
      
      // Update auth state immediately
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        hasPendingInvitations,
      });
      
      // Ensure health check is active after login
      if (!healthCheckService.isActive()) {
        healthCheckService.startHealthCheck();
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: { username: string; email: string; password: string; name?: string }) => {
    try {
      const response = await authService.register(data);
      const user = response.user;
      
      console.log('Registration successful, user:', user.username);
      
      // Update auth state immediately
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        hasPendingInvitations: false, // New users won't have invitations
      });
      
      // Ensure health check is active after registration
      if (!healthCheckService.isActive()) {
        healthCheckService.startHealthCheck();
      }
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Skip next health check refresh to avoid potential race condition
    skipNextHealthRefresh.current = true;
    
    try {
      await authService.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always update local state even if API call fails
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        hasPendingInvitations: false,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 