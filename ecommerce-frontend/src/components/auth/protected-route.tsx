'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, adminOnly = false, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (adminOnly && user?.role !== 'admin') {
      router.push('/');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
      // Redirect to proper dashboard based on role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'seller':
          router.push('/seller');
          break;
        case 'delivery':
          router.push('/delivery');
          break;
        default:
          router.push('/');
      }
      return;
    }
  }, [isAuthenticated, user, adminOnly, allowedRoles, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Accès non autorisé</p>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Accès non autorisé</p>
      </div>
    );
  }

  return <>{children}</>;
}
