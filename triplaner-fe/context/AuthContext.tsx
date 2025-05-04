'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AuthState, User } from '@/types';
import { authService } from '@/services/auth';
import { healthCheckService } from '@/services/health';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (data: { username: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const refreshAuthState = async () => {
    try {
      const user = await authService.getCurrentUser();
      setAuthState({
        isAuthenticated: !!user,
        user,
        loading: false,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    // Initial auth state load
    refreshAuthState();
    
    // Register for health check refreshes
    // This helps re-authenticate after connection interruptions
    const unregister = healthCheckService.onSuccess(() => {
      // Only refresh if we're not in loading state (avoid double refreshes on initial load)
      if (!authState.loading) {
        console.log('Refreshing auth state after successful health check');
        refreshAuthState();
      }
    });
    
    // Cleanup on unmount
    return () => {
      unregister();
    };
  }, [authState.loading]);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setAuthState({
      isAuthenticated: true,
      user,
      loading: false,
    });
    return user;
  };

  const register = async (data: { username: string; email: string; password: string }) => {
    const user = await authService.register(data);
    setAuthState({
      isAuthenticated: true,
      user,
      loading: false,
    });
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
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