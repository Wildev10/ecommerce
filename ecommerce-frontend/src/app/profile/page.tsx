'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Avatar */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
              user.role === 'admin'
                ? 'bg-red-100 text-red-700'
                : user.role === 'seller'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {user.role === 'admin' ? 'Administrateur' : user.role === 'seller' ? 'Vendeur' : 'Client'}
            </span>
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <EnvelopeIcon className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Rôle</p>
              <p className="font-medium text-gray-900 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/orders"
            className="flex items-center justify-center space-x-2 p-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <ClockIcon className="h-5 w-5" />
            <span>Mes commandes</span>
          </Link>
          {user.role === 'seller' && (
            <Link
              href="/seller/products"
              className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Gérer mes produits</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
