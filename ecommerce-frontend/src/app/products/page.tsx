'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  X,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  ShoppingBag,
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
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-14 w-14 text-slate-200" />
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
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Catégorie</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition font-medium ${!currentCategory ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Toutes les catégories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { updateFilters({ category: cat.slug }); setSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-xl transition ${currentCategory === cat.slug ? 'bg-blue-700 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Prix (FCFA)</h3>
            <div className="space-y-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => updateFilters({ min_price: minPrice })}
                placeholder="Min"
                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50 transition"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => updateFilters({ max_price: maxPrice })}
                placeholder="Max"
                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50 transition"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Trier par</h3>
            <div className="space-y-1">
              {[
                { value: 'newest', label: 'Plus récents' },
                { value: 'price_asc', label: 'Prix croissant' },
                { value: 'price_desc', label: 'Prix décroissant' },
                { value: 'popular', label: 'Populaires' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilters({ sort: opt.value })}
                  className={`w-full text-left px-3 py-2 text-sm rounded-xl transition ${currentSort === opt.value ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {opt.label}
                </button>
              ))}
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
