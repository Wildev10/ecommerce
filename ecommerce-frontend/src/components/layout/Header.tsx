'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Search,
  Package,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">E-Shop</span>
          </Link>

          {/* Barre de recherche - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">
              Produits
            </Link>

            {/* Panier */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Lien Admin */}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 font-medium"
                  >
                    <Shield size={18} />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Menu utilisateur */}
                <Link
                  href="/orders"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <Package size={18} />
                  <span>Commandes</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>

                <Link
                  href="/profile"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:inline">{user.name}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <Link href="/cart" className="relative p-2 text-gray-600">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            {/* Recherche mobile */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>

            <Link
              href="/products"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Produits
            </Link>

            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mes commandes
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex space-x-2 px-4">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2 border border-blue-600 text-blue-600 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
