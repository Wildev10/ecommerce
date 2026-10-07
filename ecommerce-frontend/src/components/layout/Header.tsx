'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, LogOut, Menu, X, Search, Package,
  Shield, Heart, User, ChevronDown, Truck, Store,
  Tag, Home, Flame,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Produits', href: '/products', icon: Store },
  { label: 'Catégories', href: '/products', icon: Tag, hasDropdown: true },
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

  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">

      {/* ── TOP STRIP ── */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Truck className="h-3 w-3 text-orange-400" />
            <span>Livraison gratuite <strong className="text-white">à partir de 50 000 FCFA</strong></span>
          </span>
          <span className="flex items-center gap-4 text-slate-400">
            <span>Paiement sécurisé MTN MoMo &amp; Moov Money</span>
            <span className="flex items-center gap-1 text-orange-400 font-semibold animate-pulse">
              <Flame className="h-3 w-3" /> Promotions en cours
            </span>
          </span>
        </div>
      </div>

      {/* ── MAIN BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5 h-16">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-10 h-10 shrink-0">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-orange-200 transition-shadow">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-700 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white font-black text-[7px] leading-none">B</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">E</span>
                <span className="text-xl font-black text-orange-500 tracking-tight leading-none">·</span>
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">Shop</span>
              </div>
              <span className="text-[9px] font-bold text-blue-700 tracking-[0.15em] uppercase leading-none">Bénin</span>
            </div>
          </Link>

          {/* ── SEARCH ── */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 rounded-l-xl text-sm focus:outline-none focus:border-orange-400 bg-slate-50 transition"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-r-xl transition flex items-center gap-2 font-semibold text-sm shrink-0"
              >
                <span className="hidden lg:inline">Rechercher</span>
                <Search className="h-4 w-4 lg:hidden" />
              </button>
            </div>
          </form>

          {/* ── ACTIONS ── */}
          <div className="flex items-center gap-1.5 ml-auto md:ml-0">

            {/* Wishlist */}
            <Link
              href={isAuthenticated ? '/wishlist' : '/login'}
              className="hidden md:flex items-center justify-center w-10 h-10 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
              title="Mes favoris"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition shadow-sm shadow-blue-200"
            >
              <ShoppingCart className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              <span className="hidden lg:inline text-sm font-semibold">Panier</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Profile */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-200"
                >
                  <div className="h-8 w-8 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                    {initials}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight max-w-[80px] truncate">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 leading-tight capitalize">{user.role === 'admin' ? '⚡ Admin' : user.role === 'seller' ? '🏪 Vendeur' : 'Client'}</p>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 hidden lg:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    {/* Profile header */}
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      Mon profil
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      Mes commandes
                    </Link>
                    <Link href="/wishlist" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                        <Heart className="h-3.5 w-3.5 text-red-400" />
                      </div>
                      Mes favoris
                    </Link>

                    {user.role === 'admin' && (
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        Administration
                      </Link>
                    )}
                    {user.role === 'seller' && (
                      <Link href="/seller" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-700 hover:bg-orange-50 transition">
                        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Store className="h-3.5 w-3.5 text-orange-600" />
                        </div>
                        Espace Vendeur
                      </Link>
                    )}
                    {user.role === 'delivery' && (
                      <Link href="/delivery" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        Mes Livraisons
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                        <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                          <LogOut className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition">
                  Connexion
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition shadow-sm">
                  Inscription
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── NAV BAR ── */}
        <nav className="hidden md:flex items-center gap-0.5 border-t border-slate-100 py-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
                {link.hasDropdown && <ChevronDown className="h-3 w-3 text-slate-400" />}
              </Link>
            );
          })}

          {/* Promotions link */}
          <Link
            href="/products?sort=popular"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition"
          >
            <Flame className="h-3.5 w-3.5" />
            Promotions
          </Link>

          {/* Promo badge */}
          <div className="ml-auto flex items-center">
            <Link
              href="/products?sort=popular"
              className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-full shadow-sm shadow-orange-200 transition"
            >
              <Flame className="h-3.5 w-3.5 animate-pulse" />
              Promotions en cours
              <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">HOT</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-xl">
          <div className="p-4 space-y-3">
            {/* Livraison strip mobile */}
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium px-3 py-2 rounded-xl">
              <Truck className="h-3.5 w-3.5 shrink-0" />
              Livraison gratuite à partir de 50 000 FCFA
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..." className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-l-xl text-sm focus:outline-none focus:border-orange-400 bg-slate-50" />
              <button type="submit" className="px-4 py-2.5 bg-orange-500 text-white rounded-r-xl">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Nav links */}
            <div className="space-y-0.5">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.label} href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}>
                    <Icon className="h-4 w-4 text-slate-400" />
                    {link.label}
                  </Link>
                );
              })}
              <Link href="/products?sort=popular"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}>
                <Flame className="h-4 w-4" />
                Promotions
              </Link>
            </div>

            {/* User section */}
            <div className="border-t border-slate-100 pt-3 space-y-0.5">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}><User className="h-4 w-4 text-slate-400" /> Mon profil</Link>
                  <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}><Package className="h-4 w-4 text-slate-400" /> Mes commandes</Link>
                  <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}><Heart className="h-4 w-4 text-red-400" /> Mes favoris</Link>
                  {user.role === 'admin' && <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-700 hover:bg-purple-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}><Shield className="h-4 w-4" /> Administration</Link>}
                  {user.role === 'seller' && <Link href="/seller" className="flex items-center gap-3 px-3 py-2.5 text-sm text-orange-700 hover:bg-orange-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}><Store className="h-4 w-4" /> Espace Vendeur</Link>}
                  {user.role === 'delivery' && <Link href="/delivery" className="flex items-center gap-3 px-3 py-2.5 text-sm text-blue-700 hover:bg-blue-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}><Truck className="h-4 w-4" /> Mes Livraisons</Link>}
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-semibold">
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1">
                  <Link href="/login" className="flex-1 text-center py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                  <Link href="/register" className="flex-1 text-center py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold shadow-sm" onClick={() => setMobileMenuOpen(false)}>Inscription</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
