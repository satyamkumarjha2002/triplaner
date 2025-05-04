'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">
            Join Planit to start planning your trips with friends
          </p>
        </div>
        
        <RegisterForm />
      </main>
      
      <Footer />
    </div>
  );
} 