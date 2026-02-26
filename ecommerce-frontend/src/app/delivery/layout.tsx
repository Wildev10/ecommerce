'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Clock, UserCircle,
  Menu, X, ChevronLeft, Truck,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuthStore } from '@/stores/auth-store';

const NAV_ITEMS = [
  { href: '/delivery', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/delivery/orders', label: 'Mes livraisons', icon: Package },
  { href: '/delivery/history', label: 'Historique', icon: Clock },
  { href: '/delivery/profile', label: 'Mon profil', icon: UserCircle },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if ('exact' in item && item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <ProtectedRoute allowedRoles={['delivery', 'admin']}>
      <div className="min-h-screen bg-gray-100 flex">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/delivery" className="flex items-center gap-2 text-xl font-bold text-orange-600">
              <Truck className="h-6 w-6" /> Livraison
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center gap-3 mb-3 px-4">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4" /> Retour au site
            </Link>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 bg-white shadow-sm flex items-center px-6 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {NAV_ITEMS.find((i) => isActive(i))?.label || 'Livraison'}
            </h2>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
