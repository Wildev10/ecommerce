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
  Heart,
  User,
  ChevronDown,
  Truck,
  Phone,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/products' },
  { label: 'Catégories', href: '/products', hasDropdown: true },
  { label: 'Promotions', href: '/products?sort=popular' },
];

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: 'var(--shadow)' }}>
      {/* Top bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-orange-400" />
              Livraison gratuite dès <span className="text-white font-medium">50.000 FCFA</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              Livraison partout au Bénin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-orange-400" />
              +229 XX XX XX XX
            </span>
            {!isAuthenticated && (
              <span>
                <Link href="/login" className="hover:text-white transition">Connexion</Link>
                {' · '}
                <Link href="/register" className="hover:text-white transition">Inscription</Link>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-linear-to-br from-blue-700 to-blue-900 rounded-xl flex items-center justify-center shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-lg font-bold text-slate-900 leading-tight">E-Shop</span>
              <span className="block text-[10px] font-medium text-orange-500 leading-tight tracking-wide uppercase">Bénin</span>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="w-full pl-5 pr-4 py-2.5 border-2 border-slate-200 rounded-l-xl text-sm focus:outline-none focus:border-blue-600 bg-slate-50 transition"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-r-xl transition flex items-center gap-2 font-medium text-sm"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Rechercher</span>
              </button>
            </div>
          </form>

          {/* Actions — desktop */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Wishlist */}
            <Link
              href={isAuthenticated ? '/products?wishlist=true' : '/login'}
              className="hidden md:flex p-2.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition"
              title="Favoris"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden lg:inline text-sm font-medium">Panier</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User menu — desktop */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-xl transition"
                >
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate hidden lg:block">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden lg:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" onClick={() => setUserMenuOpen(false)}>
                      <User className="h-4 w-4 text-slate-400" />
                      Mon profil
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" onClick={() => setUserMenuOpen(false)}>
                      <Package className="h-4 w-4 text-slate-400" />
                      Mes commandes
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition" onClick={() => setUserMenuOpen(false)}>
                        <Shield className="h-4 w-4" />
                        Administration
                      </Link>
                    )}
                    {user.role === 'seller' && (
                      <Link href="/seller" className="flex items-center gap-3 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition" onClick={() => setUserMenuOpen(false)}>
                        <Package className="h-4 w-4" />
                        Espace Vendeur
                      </Link>
                    )}
                    {user.role === 'delivery' && (
                      <Link href="/delivery" className="flex items-center gap-3 px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition" onClick={() => setUserMenuOpen(false)}>
                        <Truck className="h-4 w-4" />
                        Mes Livraisons
                      </Link>
                    )}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition">
                  Connexion
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition">
                  Inscription
                </Link>
              </div>
            )}

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation bar — desktop */}
        <nav className="hidden md:flex items-center gap-1 pb-2 border-t border-slate-100 pt-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
            >
              {link.label}
              {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
            </Link>
          ))}
          <div className="ml-auto">
            <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-full">
              🔥 Promotions en cours
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
          <div className="p-4 space-y-3">
            {/* Search mobile */}
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-l-xl text-sm focus:outline-none focus:border-blue-600 bg-slate-50"
              />
              <button type="submit" className="px-4 py-2.5 bg-orange-500 text-white rounded-r-xl">
                <Search className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Mon profil</Link>
                  <Link href="/orders" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Mes commandes</Link>
                  {user.role === 'admin' && <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Administration</Link>}
                  {user.role === 'seller' && <Link href="/seller" className="block px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Espace Vendeur</Link>}
                  {user.role === 'delivery' && <Link href="/delivery" className="block px-4 py-2.5 text-sm text-orange-700 hover:bg-orange-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Mes Livraisons</Link>}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium">
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link href="/login" className="flex-1 text-center py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                  <Link href="/register" className="flex-1 text-center py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Inscription</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
