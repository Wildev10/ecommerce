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

  // Filters from URL
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
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: 12,
        sort: currentSort,
      };
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

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
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity: 1,
      stock: product.stock,
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos Produits</h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filtres</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={currentCategory}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Toutes</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* Price range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix min</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => updateFilters({ min_price: minPrice })}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix max</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => updateFilters({ max_price: maxPrice })}
                placeholder="∞"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <select
                value={currentSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="name_asc">Nom A-Z</option>
                <option value="name_desc">Nom Z-A</option>
              </select>
            </div>
          </div>
          {(currentCategory || currentMinPrice || currentMaxPrice || currentSearch) && (
            <button
              onClick={() => router.push('/products')}
              className="text-sm text-red-500 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {meta && (
        <p className="text-gray-500 mb-6">
          {meta.total} produit{meta.total > 1 ? 's' : ''} trouvé{meta.total > 1 ? 's' : ''}
        </p>
      )}

      {/* Products grid */}
      {loading ? (
        <Loading fullPage text="Chargement des produits..." />
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
          <button onClick={() => router.push('/products')} className="mt-4 text-blue-600 hover:underline">
            Voir tous les produits
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <Link href={`/products/${product.slug || product.id}`}>
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="h-16 w-16" />
                      </div>
                    )}
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                      </span>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">Rupture de stock</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  {product.category && (
                    <span className="text-xs text-blue-600 font-medium">{product.category.name}</span>
                  )}
                  <Link href={`/products/${product.slug || product.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate mt-1">{product.name}</h3>
                  </Link>
                  {product.reviews_avg_rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{Number(product.reviews_avg_rating).toFixed(1)}</span>
                      {product.reviews_count && <span className="text-xs text-gray-400">({product.reviews_count})</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.compare_price)}</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 5 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock > 0 ? `${product.stock} dispo` : 'Épuisé'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateFilters({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => updateFilters({ page: String(p) })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${p === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50 text-gray-700'}`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => updateFilters({ page: String(currentPage + 1) })}
                disabled={currentPage >= meta.last_page}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
