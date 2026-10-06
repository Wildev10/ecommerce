import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes protégées et les rôles autorisés
const PROTECTED_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin',    roles: ['admin'] },
  { prefix: '/dashboard', roles: ['admin'] },
  { prefix: '/seller',   roles: ['seller', 'admin'] },
  { prefix: '/delivery', roles: ['delivery'] },
  { prefix: '/cart',     roles: ['buyer', 'seller', 'admin', 'delivery'] },
  { prefix: '/checkout', roles: ['buyer', 'seller', 'admin', 'delivery'] },
  { prefix: '/orders',   roles: ['buyer', 'seller', 'admin', 'delivery'] },
  { prefix: '/profile',  roles: ['buyer', 'seller', 'admin', 'delivery'] },
  { prefix: '/disputes', roles: ['buyer', 'seller', 'admin'] },
  { prefix: '/messages', roles: ['buyer', 'seller', 'admin'] },
  { prefix: '/payment', roles: ['buyer', 'seller', 'admin', 'delivery'] },
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  // Le token est stocké dans le cookie __auth_token (posé au login côté client)
  const token = request.cookies.get('__auth_token')?.value;
  const role  = request.cookies.get('__auth_role')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role && !match.roles.includes(role)) {
    const fallback = role === 'admin'
      ? '/admin/dashboard'
      : role === 'seller'
      ? '/seller'
      : role === 'delivery'
      ? '/delivery'
      : '/';
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
