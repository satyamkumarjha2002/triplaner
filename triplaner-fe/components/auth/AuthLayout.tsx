'use client';

import Link from 'next/link';
import { MapPinIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center mx-auto">
            <MapPinIcon className="h-6 w-6 text-primary mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 text-transparent bg-clip-text">Planit</span>
          </Link>
        </div>
        
        {children}
      </div>
    </div>
  );
} 