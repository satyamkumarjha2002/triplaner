'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { getCookie } from '@/lib/cookies';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [redirectChecked, setRedirectChecked] = useState(false);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    // Only check once loading is complete and we haven't checked before
    if (!loading && !redirectChecked) {
      setRedirectChecked(true);
      
      const hasToken = !!getCookie('authToken');
      
      // If authenticated or has token, redirect to dashboard
      if (isAuthenticated || hasToken) {
        console.log('Already authenticated, redirecting to dashboard');
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, loading, redirectChecked, router]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
} 