'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, X, ShoppingCart, Star, ChevronLeft, ChevronRight,
  Loader2, SlidersHorizontal, ShoppingBag, Package,
  Smartphone, Monitor, Headphones, Zap, Shirt, User, Gem, Baby,
  Home, Armchair, Sparkles, Leaf, Dumbbell, Trophy, Watch,
  BookOpen, Gamepad2, UtensilsCrossed, type LucideIcon,
  ArrowUpDown, TrendingUp, TrendingDown, Clock, Flame,
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import type { Product, Category, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  return (
    <div className="product-card bg-white rounded-2xl border border-slate-100 overflow-hidden group flex flex-col">
      <Link href={`/products/${product.slug || product.id}`} className="block relative">
        <div className="aspect-square bg-slate-50 relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Package className="h-12 w-12 text-slate-300" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
            )}
            {product.stock === 0 && (
              <span className="bg-slate-800/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Rupture</span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1.5 hover:text-blue-700 transition leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.reviews_avg_rating !== undefined && Number(product.reviews_avg_rating) > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={Number(product.reviews_avg_rating)} />
            <span className="text-xs text-slate-400">({Number(product.reviews_avg_rating).toFixed(1)})</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div>
            <p className="font-bold text-blue-700 text-base">{formatPrice(product.price)}</p>
            {product.compare_price && product.compare_price > product.price && (
              <p className="text-xs text-slate-400 line-through">{formatPrice(product.compare_price)}</p>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ajouter au panier"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

type CatMeta = {
  icon: LucideIcon;
  color: string;
  iconBg: string;
  hoverBg: string;
  activeBg: string;
  activeText: string;
  glow: string;
};

const CATEGORY_MAP: Record<string, CatMeta> = {
  'electronique':                   { icon: Zap,             color: 'text-yellow-600',  iconBg: 'bg-yellow-100',  hoverBg: 'hover:bg-yellow-50',  activeBg: 'bg-yellow-500',  activeText: 'text-white', glow: 'shadow-yellow-200' },
  'electronique-smartphones':       { icon: Smartphone,      color: 'text-blue-600',    iconBg: 'bg-blue-100',    hoverBg: 'hover:bg-blue-50',    activeBg: 'bg-blue-600',    activeText: 'text-white', glow: 'shadow-blue-200' },
  'electronique-ordinateurs':       { icon: Monitor,         color: 'text-violet-600',  iconBg: 'bg-violet-100',  hoverBg: 'hover:bg-violet-50',  activeBg: 'bg-violet-600',  activeText: 'text-white', glow: 'shadow-violet-200' },
  'electronique-accessoires-tech':  { icon: Headphones,      color: 'text-cyan-600',    iconBg: 'bg-cyan-100',    hoverBg: 'hover:bg-cyan-50',    activeBg: 'bg-cyan-600',    activeText: 'text-white', glow: 'shadow-cyan-200' },
  'vetements':                      { icon: Shirt,           color: 'text-pink-600',    iconBg: 'bg-pink-100',    hoverBg: 'hover:bg-pink-50',    activeBg: 'bg-pink-600',    activeText: 'text-white', glow: 'shadow-pink-200' },
  'vetements-homme':                { icon: User,            color: 'text-slate-600',   iconBg: 'bg-slate-100',   hoverBg: 'hover:bg-slate-50',   activeBg: 'bg-slate-700',   activeText: 'text-white', glow: 'shadow-slate-200' },
  'vetements-femme':                { icon: Gem,             color: 'text-rose-600',    iconBg: 'bg-rose-100',    hoverBg: 'hover:bg-rose-50',    activeBg: 'bg-rose-500',    activeText: 'text-white', glow: 'shadow-rose-200' },
  'vetements-enfant':               { icon: Baby,            color: 'text-orange-500',  iconBg: 'bg-orange-100',  hoverBg: 'hover:bg-orange-50',  activeBg: 'bg-orange-500',  activeText: 'text-white', glow: 'shadow-orange-200' },
  'maison-jardin':                  { icon: Home,            color: 'text-green-600',   iconBg: 'bg-green-100',   hoverBg: 'hover:bg-green-50',   activeBg: 'bg-green-600',   activeText: 'text-white', glow: 'shadow-green-200' },
  'maison-jardin-mobilier':         { icon: Armchair,        color: 'text-amber-600',   iconBg: 'bg-amber-100',   hoverBg: 'hover:bg-amber-50',   activeBg: 'bg-amber-600',   activeText: 'text-white', glow: 'shadow-amber-200' },
  'maison-jardin-decoration':       { icon: Sparkles,        color: 'text-indigo-600',  iconBg: 'bg-indigo-100',  hoverBg: 'hover:bg-indigo-50',  activeBg: 'bg-indigo-600',  activeText: 'text-white', glow: 'shadow-indigo-200' },
  'maison-jardin-jardin':           { icon: Leaf,            color: 'text-emerald-600', iconBg: 'bg-emerald-100', hoverBg: 'hover:bg-emerald-50', activeBg: 'bg-emerald-600', activeText: 'text-white', glow: 'shadow-emerald-200' },
  'sports':                         { icon: Dumbbell,        color: 'text-red-600',     iconBg: 'bg-red-100',     hoverBg: 'hover:bg-red-50',     activeBg: 'bg-red-500',     activeText: 'text-white', glow: 'shadow-red-200' },
  'sports-fitness':                 { icon: Dumbbell,        color: 'text-red-600',     iconBg: 'bg-red-100',     hoverBg: 'hover:bg-red-50',     activeBg: 'bg-red-500',     activeText: 'text-white', glow: 'shadow-red-200' },
  'sports-football':                { icon: Trophy,          color: 'text-green-600',   iconBg: 'bg-green-100',   hoverBg: 'hover:bg-green-50',   activeBg: 'bg-green-600',   activeText: 'text-white', glow: 'shadow-green-200' },
  'sports-running':                 { icon: Watch,           color: 'text-orange-600',  iconBg: 'bg-orange-100',  hoverBg: 'hover:bg-orange-50',  activeBg: 'bg-orange-600',  activeText: 'text-white', glow: 'shadow-orange-200' },
  'livres':                         { icon: BookOpen,        color: 'text-teal-600',    iconBg: 'bg-teal-100',    hoverBg: 'hover:bg-teal-50',    activeBg: 'bg-teal-600',    activeText: 'text-white', glow: 'shadow-teal-200' },
  'beaute':                         { icon: Sparkles,        color: 'text-fuchsia-600', iconBg: 'bg-fuchsia-100', hoverBg: 'hover:bg-fuchsia-50', activeBg: 'bg-fuchsia-600', activeText: 'text-white', glow: 'shadow-fuchsia-200' },
  'jouets':                         { icon: Gamepad2,        color: 'text-yellow-600',  iconBg: 'bg-yellow-100',  hoverBg: 'hover:bg-yellow-50',  activeBg: 'bg-yellow-500',  activeText: 'text-white', glow: 'shadow-yellow-200' },
  'alimentation':                   { icon: UtensilsCrossed, color: 'text-orange-600',  iconBg: 'bg-orange-100',  hoverBg: 'hover:bg-orange-50',  activeBg: 'bg-orange-600',  activeText: 'text-white', glow: 'shadow-orange-200' },
  'alimentation-produits-locaux':   { icon: UtensilsCrossed, color: 'text-lime-600',    iconBg: 'bg-lime-100',    hoverBg: 'hover:bg-lime-50',    activeBg: 'bg-lime-600',    activeText: 'text-white', glow: 'shadow-lime-200' },
  'alimentation-snacks':            { icon: UtensilsCrossed, color: 'text-amber-600',   iconBg: 'bg-amber-100',   hoverBg: 'hover:bg-amber-50',   activeBg: 'bg-amber-600',   activeText: 'text-white', glow: 'shadow-amber-200' },
  'alimentation-boissons':          { icon: UtensilsCrossed, color: 'text-sky-600',     iconBg: 'bg-sky-100',     hoverBg: 'hover:bg-sky-50',     activeBg: 'bg-sky-600',     activeText: 'text-white', glow: 'shadow-sky-200' },
};

function getCatMeta(slug: string): CatMeta {
  return CATEGORY_MAP[slug] ?? {
    icon: ShoppingBag, color: 'text-slate-500', iconBg: 'bg-slate-100',
    hoverBg: 'hover:bg-slate-50', activeBg: 'bg-slate-600', activeText: 'text-white', glow: 'shadow-slate-200',
  };
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';

  const [search, setSearch] = useState(currentSearch);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: currentPage, per_page: 12, sort: currentSort };
      if (currentSearch) params.search = currentSearch;
      if (currentCategory) params.category = currentCategory;
      if (currentMinPrice) params.min_price = Number(currentMinPrice);
      if (currentMaxPrice) params.max_price = Number(currentMaxPrice);
      const res = await productsApi.getAll(params);
      setProducts(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      setProducts([]);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentCategory, currentSort, currentMinPrice, currentMaxPrice]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { categoriesApi.getAll().then(setCategories).catch(() => {}); }, []);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!updates.page) params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search, page: '1' });
  };

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image_url || '', quantity: 1, stock: product.stock });
    toast.success(`${product.name} ajouté au panier`);
  };

  const hasActiveFilters = !!(currentCategory || currentMinPrice || currentMaxPrice || currentSearch);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Nos produits</h1>
        {meta && (
          <p className="text-sm text-slate-500 mt-1">{meta.total ?? products.length} résultat{(meta.total ?? products.length) > 1 ? 's' : ''}</p>
        )}
      </div>

      <div className="flex gap-8">

        {/* ── SIDEBAR FILTERS ── */}
        <aside className={`
          shrink-0 w-60 space-y-6
          ${sidebarOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto lg:relative lg:inset-auto lg:bg-transparent lg:p-0' : 'hidden lg:block'}
        `}>
          {/* Mobile close */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <h2 className="font-bold text-slate-900 text-lg">Filtres</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); router.push('/products'); setSidebarOpen(false); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition font-medium"
            >
              <X className="h-3.5 w-3.5" /> Effacer les filtres
            </button>
          )}

          {/* Search */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Recherche</h3>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mot-clé..."
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50 transition"
                />
              </div>
            </form>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Catégories</h3>
            <div className="space-y-1">
              {/* Tous les produits */}
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all duration-200 text-sm font-semibold ${
                  !currentCategory
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-300'
                    : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300 hover:shadow-sm hover:scale-[1.01]'
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  !currentCategory ? 'bg-white/15' : 'bg-slate-100'
                }`}>
                  <ShoppingBag className={`h-4 w-4 ${!currentCategory ? 'text-white' : 'text-slate-500'}`} />
                </span>
                <span className="truncate">Tous les produits</span>
              </button>

              {categories.map((cat) => {
                const isActive = currentCategory === cat.slug;
                const m = getCatMeta(cat.slug);
                const Icon = m.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { updateFilters({ category: cat.slug }); setSidebarOpen(false); }}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all duration-200 text-sm font-semibold ${
                      isActive
                        ? `${m.activeBg} border-transparent ${m.activeText} shadow-md ${m.glow}`
                        : `bg-white border-slate-100 text-slate-700 ${m.hoverBg} hover:border-slate-200 hover:shadow-sm hover:scale-[1.01]`
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 ${
                      isActive ? 'bg-white/20' : m.iconBg
                    }`}>
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : m.color}`} />
                    </span>
                    <span className="truncate">{cat.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price range */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Prix (FCFA)</h3>
            <div className="space-y-2">
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Min</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={() => updateFilters({ min_price: minPrice })}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-300 hover:shadow-sm transition-all"
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="mx-2 text-xs text-slate-400 font-semibold">à</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Max</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={() => updateFilters({ max_price: maxPrice })}
                  placeholder="∞"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-300 hover:shadow-sm transition-all"
                />
              </div>
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); updateFilters({ min_price: '', max_price: '' }); }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition"
                >
                  <X className="h-3 w-3" /> Effacer le prix
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Trier par</h3>
            <div className="space-y-1">
              {[
                { value: 'newest',     label: 'Plus récents',     icon: Clock,      iconColor: 'text-blue-500',   iconBg: 'bg-blue-50',   activeBg: 'bg-blue-600',   glow: 'shadow-blue-200' },
                { value: 'price_asc',  label: 'Prix croissant',   icon: TrendingUp, iconColor: 'text-green-500',  iconBg: 'bg-green-50',  activeBg: 'bg-green-600',  glow: 'shadow-green-200' },
                { value: 'price_desc', label: 'Prix décroissant', icon: TrendingDown,iconColor: 'text-red-500',   iconBg: 'bg-red-50',    activeBg: 'bg-red-500',    glow: 'shadow-red-200' },
                { value: 'popular',    label: 'Populaires',       icon: Flame,      iconColor: 'text-orange-500', iconBg: 'bg-orange-50', activeBg: 'bg-orange-500', glow: 'shadow-orange-200' },
              ].map((opt) => {
                const isActive = currentSort === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateFilters({ sort: opt.value })}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? `${opt.activeBg} border-transparent text-white shadow-md ${opt.glow}`
                        : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200 hover:shadow-sm hover:scale-[1.01]'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 ${
                      isActive ? 'bg-white/20' : opt.iconBg
                    }`}>
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : opt.iconColor}`} />
                    </span>
                    <span>{opt.label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Overlay mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-5 p-3 bg-white rounded-xl border border-slate-100">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-orange-500" />}
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              {hasActiveFilters && (
                <button onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); router.push('/products'); }} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium">
                  <X className="h-3.5 w-3.5" /> Effacer
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400 hidden sm:inline">Trier :</span>
              <select
                value={currentSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="text-sm border-2 border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="newest">Plus récents</option>
                <option value="price_asc">Prix ↑</option>
                <option value="price_desc">Prix ↓</option>
                <option value="popular">Populaires</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
              <ShoppingBag className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Aucun produit trouvé</h2>
              <p className="text-slate-500 text-sm mb-6">Essayez de modifier vos filtres</p>
              <button onClick={() => router.push('/products')} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition">
                Voir tous les produits
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => updateFilters({ page: String(currentPage - 1) })}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="h-4 w-4" /> Précédent
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => updateFilters({ page: String(page) })}
                          className={`w-9 h-9 rounded-xl text-sm font-medium transition ${currentPage === page ? 'bg-blue-700 text-white' : 'border-2 border-slate-200 text-slate-700 hover:border-blue-400'}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => updateFilters({ page: String(currentPage + 1) })}
                    disabled={currentPage === meta.last_page}
                    className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Suivant <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
