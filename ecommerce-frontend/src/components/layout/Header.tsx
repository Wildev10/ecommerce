'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart, LogOut, Menu, X, Search, Package,
  Shield, Heart, User, ChevronDown, Truck, Store,
  Flame, Tag, LayoutGrid,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const NAV = [
    { href: '/products', label: 'Tous les produits', icon: LayoutGrid },
    { href: '/products?sort=popular', label: 'Promotions', icon: Flame, highlight: true },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>

      {/* ── Announcement bar ── */}
      <div className="bg-[var(--dark)] text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[var(--dark-muted)]">
            <Truck className="h-3 w-3 text-orange-400 shrink-0" />
            <span>
              Livraison gratuite{' '}
              <strong className="text-white font-semibold">dès 50 000 FCFA</strong>
            </span>
          </span>
          <div className="flex items-center gap-6 text-[var(--dark-muted)]">
            <span>Paiement sécurisé · MTN MoMo &amp; Moov Money</span>
            <Link
              href="/products?sort=popular"
              className="flex items-center gap-1.5 text-orange-400 font-semibold hover:text-orange-300 transition"
            >
              <Flame className="h-3 w-3" />
              Promotions en cours
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main bar ── */}
      <div
        className="bg-white/95 backdrop-blur-xl border-b border-[var(--border)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-[64px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-9 h-9">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:shadow-orange-300 transition-shadow">
                  <Store className="h-4.5 w-4.5 h-[18px] w-[18px] text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white font-black text-[6px] leading-none">B</span>
                </div>
              </div>
              <div className="hidden sm:block leading-none">
                <div className="text-[17px] font-black text-[var(--foreground)] tracking-tight">
                  E<span className="text-orange-500">·</span>Shop
                </div>
                <div className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-0.5">
                  Bénin
                </div>
              </div>
            </Link>

            {/* Search — desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xl mx-auto"
            >
              <div className="relative w-full flex rounded-xl overflow-hidden border-2 border-[var(--border)] focus-within:border-orange-400 focus-within:shadow-[0_0_0_3px_rgb(249_115_22_/_0.10)] transition-all bg-[var(--surface-2)]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit, une marque..."
                  className="flex-1 pl-10 pr-3 py-2.5 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition shrink-0 flex items-center gap-1.5"
                >
                  <span className="hidden lg:inline">Rechercher</span>
                  <Search className="h-4 w-4 lg:hidden" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">

              {/* Wishlist */}
              <Link
                href={isAuthenticated ? '/wishlist' : '/login'}
                className="hidden md:flex items-center justify-center w-9 h-9 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                title="Mes favoris"
              >
                <Heart className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition font-semibold text-sm shadow-sm shadow-orange-200"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden lg:inline">Panier</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[var(--foreground)] text-white text-[9px] font-black rounded-full h-4.5 h-[18px] w-[18px] w-4.5 flex items-center justify-center border border-white shadow">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User */}
              {isAuthenticated && user ? (
                <div className="relative hidden md:block ml-1">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--surface-2)] border border-transparent hover:border-[var(--border)] transition"
                  >
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      {initials}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-[var(--foreground)] leading-tight max-w-[72px] truncate">
                        {user.name.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-[var(--muted)] capitalize leading-tight">
                        {user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Vendeur' : 'Client'}
                      </p>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-[var(--muted)] hidden lg:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[var(--border)] py-1.5 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-[var(--border)] mb-1">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[var(--foreground)] truncate">{user.name}</p>
                              <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {[
                          { href: '/profile', icon: User, label: 'Mon profil', color: 'text-[var(--foreground-2)]', bg: '' },
                          { href: '/orders', icon: Package, label: 'Mes commandes', color: 'text-[var(--foreground-2)]', bg: '' },
                          { href: '/wishlist', icon: Heart, label: 'Mes favoris', color: 'text-red-500', bg: 'hover:bg-red-50' },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${item.color} hover:bg-[var(--surface-2)] ${item.bg} transition`}
                          >
                            <item.icon className="h-4 w-4 opacity-70" />
                            {item.label}
                          </Link>
                        ))}

                        {user.role === 'admin' && (
                          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition">
                            <Shield className="h-4 w-4 opacity-70" />
                            Administration
                          </Link>
                        )}
                        {user.role === 'seller' && (
                          <Link href="/seller" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-50 transition">
                            <Store className="h-4 w-4 opacity-70" />
                            Espace Vendeur
                          </Link>
                        )}
                        {user.role === 'delivery' && (
                          <Link href="/delivery" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition">
                            <Truck className="h-4 w-4 opacity-70" />
                            Mes Livraisons
                          </Link>
                        )}

                        <div className="border-t border-[var(--border)] mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            <LogOut className="h-4 w-4 opacity-70" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 text-sm font-semibold text-[var(--foreground-2)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] rounded-xl transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-2 text-sm font-semibold bg-[var(--foreground)] hover:bg-[var(--foreground-2)] text-white rounded-xl transition shadow-sm"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[var(--foreground-2)] hover:bg-[var(--surface-2)] rounded-xl transition"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ── Nav bar ── */}
          <nav className="hidden md:flex items-center gap-0.5 border-t border-[var(--border)] py-1">
            {NAV.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    link.highlight
                      ? 'text-orange-600 hover:bg-orange-50'
                      : isActive
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-[var(--foreground-2)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[var(--foreground-2)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition"
            >
              <Tag className="h-3.5 w-3.5" />
              Catégories
            </Link>

            {/* Right promo pill */}
            <div className="ml-auto">
              <Link
                href="/products?sort=popular"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-sm shadow-orange-200 hover:shadow-orange-300 transition"
              >
                <Flame className="h-3.5 w-3.5" />
                Offres du jour
                <span className="bg-white/25 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">HOT</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-2xl md:hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="text-[17px] font-black text-[var(--foreground)] tracking-tight">
                E<span className="text-orange-500">·</span>Shop <span className="text-[var(--muted)] font-semibold text-sm">Bénin</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] rounded-xl transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Promo strip */}
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
                <Truck className="h-4 w-4 shrink-0" />
                Livraison gratuite dès 50 000 FCFA
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="flex-1 px-3.5 py-2.5 border-2 border-[var(--border)] focus:border-orange-400 rounded-xl text-sm outline-none bg-[var(--surface-2)] transition"
                />
                <button type="submit" className="px-4 py-2.5 bg-orange-500 text-white rounded-xl">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Nav */}
              <div className="space-y-0.5">
                {NAV.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      link.highlight
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-[var(--foreground-2)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <link.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* User section */}
              <div className="border-t border-[var(--border)] pt-4 space-y-1">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">{user.name}</p>
                        <p className="text-xs text-[var(--muted)]">{user.email}</p>
                      </div>
                    </div>
                    {[
                      { href: '/profile', icon: User, label: 'Mon profil' },
                      { href: '/orders', icon: Package, label: 'Mes commandes' },
                      { href: '/wishlist', icon: Heart, label: 'Mes favoris' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground-2)] hover:bg-[var(--surface-2)] transition"
                      >
                        <item.icon className="h-4 w-4 text-[var(--muted)]" />
                        {item.label}
                      </Link>
                    ))}
                    {user.role === 'admin' && (
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50 transition">
                        <Shield className="h-4 w-4" /> Administration
                      </Link>
                    )}
                    {user.role === 'seller' && (
                      <Link href="/seller" onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-50 transition">
                        <Store className="h-4 w-4" /> Espace Vendeur
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-2.5 border-2 border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-semibold hover:border-[var(--border-2)] transition"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-2.5 bg-[var(--foreground)] text-white rounded-xl text-sm font-semibold transition"
                    >
                      Créer un compte
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
