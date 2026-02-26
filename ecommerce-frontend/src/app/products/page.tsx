'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { formatPrice } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import Loading from '@/components/ui/loading';
import type { Product, Category, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Produits</h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 border rounded-lg w-64 text-sm" />
          </form>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4" /> Filtres
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select value={currentCategory} onChange={(e) => updateFilters({ category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Toutes</option>
              {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix min</label>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} onBlur={() => updateFilters({ min_price: minPrice })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix max</label>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onBlur={() => updateFilters({ max_price: maxPrice })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="1000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
            <select value={currentSort} onChange={(e) => updateFilters({ sort: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="newest">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="popular">Populaire</option>
            </select>
          </div>
          {(currentCategory || currentMinPrice || currentMaxPrice || currentSearch) && (
            <button onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); router.push('/products'); }} className="text-sm text-red-600 hover:underline flex items-center gap-1">
              <X className="h-3 w-3" /> Réinitialiser
            </button>
          )}
        </div>
      )}

      {loading ? (
        <Loading text="Chargement des produits..." />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h2>
          <p className="text-gray-500">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <Link href={`/products/${product.slug || product.id}`} className="block">
                  <div className="aspect-square bg-gray-100 relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">Rupture</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.slug || product.id}`}>
                    <h3 className="font-medium text-gray-900 mb-1 truncate hover:text-blue-600">{product.name}</h3>
                  </Link>
                  {product.reviews_avg_rating !== undefined && product.reviews_avg_rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-500">{product.reviews_avg_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => updateFilters({ page: String(currentPage - 1) })} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {meta.current_page} / {meta.last_page}</span>
              <button onClick={() => updateFilters({ page: String(currentPage + 1) })} disabled={currentPage === meta.last_page} className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}