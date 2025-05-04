'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SunIcon, MoonIcon, MapPinIcon, MenuIcon, BellIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { useAuth } from '@/context/AuthContext';
import { getCookie } from '@/lib/cookies';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { isAuthenticated, user, loading, refreshAuthState, hasPendingInvitations } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { openModal, closeModal } = useModal();
  
  // Force auth state refresh on component mount
  useEffect(() => {
    // Check if we have a token but no user data
    const hasToken = !!getCookie('authToken');
    if (hasToken && !user && !loading) {
      console.log('Header detected token but no user, refreshing auth state');
      refreshAuthState();
    }
  }, [user, loading, refreshAuthState]);

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug output for authentication state
  useEffect(() => {
    console.log('Header auth state:', { isAuthenticated, user: user?.username, loading, hasPendingInvitations });
  }, [isAuthenticated, user, loading, hasPendingInvitations]);

  if (!mounted) {
    return <header className="border-b h-16" />;
  }
  
  // Check if we're still loading OR we have a token but no user yet (still loading user data)
  const hasToken = !!getCookie('authToken');
  const isLoading = loading || (hasToken && !user);
  
  if (isLoading) {
    return <header className="border-b h-16" />;
  }
  
  // Authentication state for rendering
  const authenticated = isAuthenticated && !!user;

  return (
    <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <MapPinIcon className="h-6 w-6 text-primary mr-1.5" />
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 text-transparent bg-clip-text">Planit</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-4 md:gap-6">
          {authenticated && (
            <>
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link href="/trips" className="text-sm font-medium transition-colors hover:text-primary">
                My Trips
              </Link>
              {hasPendingInvitations && (
                <Link href="/invitations" className="relative text-sm font-medium transition-colors hover:text-primary">
                  Invitations
                  <Badge className="absolute -top-2 -right-4 h-5 w-5 p-0 flex items-center justify-center bg-red-500">!</Badge>
                </Link>
              )}
              <button 
                onClick={() => openModal('joinTrip')}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Join Trip
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>

          {authenticated ? (
            <>
              {/* Invitations indicator for mobile */}
              {hasPendingInvitations && (
                <Link href="/invitations" className="md:hidden relative">
                  <BellIcon className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-red-500">!</Badge>
                </Link>
              )}

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-4 mt-8">
                    <Link href="/dashboard" className="text-sm font-medium py-2">
                      Dashboard
                    </Link>
                    <Link href="/trips" className="text-sm font-medium py-2">
                      My Trips
                    </Link>
                    {hasPendingInvitations && (
                      <Link href="/invitations" className="text-sm font-medium py-2 flex items-center">
                        Invitations
                        <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">!</Badge>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        closeModal();
                        openModal('joinTrip');
                      }}
                      className="text-sm font-medium py-2 text-left"
                    >
                      Join Trip
                    </button>
                    <Link href="/profile" className="text-sm font-medium py-2">
                      Profile
                    </Link>
                    <Link href="/auth/logout" className="text-sm font-medium py-2">
                      Logout
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-primary/20 transition-all hover:border-primary/50">
                      <AvatarImage src="" alt={user?.username || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {hasPendingInvitations && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500">!</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.username || 'User'}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/trips" className="cursor-pointer">My Trips</Link>
                  </DropdownMenuItem>
                  {hasPendingInvitations && (
                    <DropdownMenuItem asChild>
                      <Link href="/invitations" className="cursor-pointer flex items-center">
                        Invitations
                        <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">!</Badge>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/logout" className="cursor-pointer">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 