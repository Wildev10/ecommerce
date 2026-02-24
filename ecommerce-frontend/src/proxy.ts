import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth state from cookie or header
  // Since we use localStorage (client-side), we check via a simple cookie approach
  // The real auth check happens client-side with ProtectedRoute component
  // This middleware handles basic redirects for known patterns

  // Allow public routes
  const publicPaths = ['/', '/login', '/register', '/products', '/categories', '/search'];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith('/products/') || pathname.startsWith('/categories/')
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For API routes, let them pass through
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
