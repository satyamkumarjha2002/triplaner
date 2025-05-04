'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { getCookie } from '@/lib/cookies';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [redirectChecked, setRedirectChecked] = useState(false);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    // Only check once loading is complete and we haven't checked before
    if (!loading && !redirectChecked) {
      setRedirectChecked(true);
      
      const hasToken = !!getCookie('authToken');
      
      // If authenticated or has token, redirect to trips page
      if (isAuthenticated || hasToken) {
        console.log('Already authenticated, redirecting to trips page');
        router.replace('/trips');
      }
    }
  }, [isAuthenticated, loading, redirectChecked, router]);

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
} 