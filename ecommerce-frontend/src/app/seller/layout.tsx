'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Menu, X, ChevronLeft,
  Archive, Store, Wallet, Truck, MessageCircle, ExternalLink,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuthStore } from '@/stores/auth-store';

const NAV_ITEMS = [
  { href: '/seller', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/seller/products', label: 'Mes produits', icon: Package },
  { href: '/seller/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/seller/shop', label: 'Ma boutique', icon: Store },
  { href: '/seller/wallet', label: 'Portefeuille', icon: Wallet },
  { href: '/seller/shipping', label: 'Livraison', icon: Truck },
  { href: '/seller/messages', label: 'Messages', icon: MessageCircle },
  { href: '/seller/stock', label: 'Gestion stock', icon: Archive },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((i) =>
    i.exact ? pathname === i.href : pathname.startsWith(i.href)
  );

  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 shrink-0">
            <Link href="/seller" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Store className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <span className="block text-sm font-bold text-white leading-tight">Espace Vendeur</span>
                <span className="block text-[10px] text-slate-400 leading-tight">E-Shop Bénin</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + back to site */}
          <div className="p-3 border-t border-slate-800 space-y-2 shrink-0">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              onClick={() => setSidebarOpen(false)}
            >
              <ExternalLink className="h-4 w-4" />
              Retour au site
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 lg:px-8 gap-4 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/seller" className="text-slate-400 hover:text-slate-900 transition">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900">{activeItem?.label || 'Vendeur'}</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
