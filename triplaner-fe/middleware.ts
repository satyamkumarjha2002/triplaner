import { NextRequest, NextResponse } from 'next/server';

/**
 * This middleware manages route protection and redirects for the application.
 * It checks if the user is authenticated by looking for an auth token cookie and
 * redirects appropriately based on the requested route:
 * 
 * 1. Protected routes require authentication - redirects to login if no token
 * 2. Public routes are accessible to everyone
 * 3. All other routes redirect to home page if user is not authenticated
 */

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/trips',
  '/profile',
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/logout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If it's a protected route and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    console.log(`Redirecting from protected route ${pathname} to login because no auth token found`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If it's not a public or protected route and there's no token, redirect to home
  if (!isPublicRoute && !isProtectedRoute && !token) {
    console.log(`Redirecting from ${pathname} to home because no auth token found`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /images (inside /public)
     * 5. All files with extensions (e.g. favicon.ico)
     */
    '/((?!api|_next|fonts|images|[\\w-]+\\.\\w+).*)',
  ],
}; 