'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CreateTripForm } from '@/components/trips/CreateTripForm';

export default function NewTripPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create a New Trip</h1>
          <p className="text-muted-foreground">
            Start planning your next adventure
          </p>
        </div>
        
        <CreateTripForm />
      </main>
      
      <Footer />
    </div>
  );
} 