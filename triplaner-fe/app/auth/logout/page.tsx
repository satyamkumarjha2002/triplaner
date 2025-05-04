'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOutIcon } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function LogoutPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Redirect to login page after logout
        router.push('/auth/login');
      } catch (err) {
        console.error('Logout error:', err);
        setError('Failed to log out. Please try again.');
      }
    };

    performLogout();
  }, [router, logout]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <LogOutIcon className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <h1 className="text-2xl font-bold mb-2">Logging Out</h1>
          <p className="text-muted-foreground">Please wait while we sign you out...</p>
        </div>
      )}
    </div>
  );
} 