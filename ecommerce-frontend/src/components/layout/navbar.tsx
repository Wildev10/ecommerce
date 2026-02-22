'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Package,
  Search,
  Home,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/useAuth';


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { itemCount } = useCartStore();
  const { logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + liens principaux */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              {process.env.NEXT_PUBLIC_APP_NAME || 'E-Commerce'}
            </Link>

            {/* Liens desktop */}
            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-blue-600 transition"
              >
                <Home className="w-4 h-4 mr-1" />
                Accueil
              </Link>
              <Link
                href="/products"
                className="flex items-center text-gray-600 hover:text-blue-600 transition"
              >
                <Package className="w-4 h-4 mr-1" />
                Produits
              </Link>
            </div>
          </div>

          {/* Droite : cart + auth */}
          <div className="flex items-center space-x-4">
            {/* Panier */}
            {isAuthenticated && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-blue-600 transition"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop auth */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center text-gray-600 hover:text-blue-600 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1" />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="flex items-center text-gray-600 hover:text-blue-600 transition"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Commandes
                  </Link>
                  <span className="text-sm text-gray-500">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex items-center text-gray-600 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block py-2 text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/products"
              className="block py-2 text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Produits
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/cart"
                  className="block py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Panier ({itemCount})
                </Link>
                <Link
                  href="/orders"
                  className="block py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mes commandes
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block py-2 text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
