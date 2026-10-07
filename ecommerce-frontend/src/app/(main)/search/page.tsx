'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, ShoppingCart, Star, Tag } from 'lucide-react';
import { searchApi } from '@/lib/api';
import type { Product, Category } from '@/types';
import { formatPrice, getProductImage } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import toast from 'react-hot-toast';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const { addItem } = useCartStore();

  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string; slug: string; price: number; image: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [q]);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchApi.search(term);
      setProducts(res.products || []);
      setCategories(res.categories || []);
    } catch {
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url || '',
      stock: product.stock,
    });
    toast.success('Ajouté au panier');
  };

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.suggestions(query);
        setSuggestions(res.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex gap-0">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Rechercher un produit, une catégorie..."
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-slate-200 border-r-0 rounded-l-2xl focus:outline-none focus:border-blue-500 transition"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-7 bg-blue-600 hover:bg-blue-700 text-white rounded-r-2xl font-semibold text-sm transition"
            >
              Rechercher
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 bg-white border-2 border-slate-200 rounded-2xl shadow-lg mt-2 overflow-hidden">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => {
                    setQuery(s.name);
                    setShowSuggestions(false);
                    router.push(`/search?q=${encodeURIComponent(s.name)}`);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 border-b border-slate-50 last:border-0"
                >
                  <SearchIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">Recherche en cours...</p>
        </div>
      ) : searched ? (
        <div className="space-y-8">
          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-blue-600" /> Catégories correspondantes
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-sm font-semibold transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-5">
              {products.length > 0
                ? `${products.length} résultat${products.length > 1 ? 's' : ''} pour « ${q} »`
                : `Aucun résultat pour « ${q} »`}
            </h2>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                        <img
                          src={getProductImage(product.name, product.image_url) ?? ''}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            -{Math.round((1 - product.price / product.compare_price) * 100)}%
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold text-slate-900 truncate hover:text-blue-600 transition text-sm">{product.name}</h3>
                      </Link>
                      {product.category && (
                        <p className="text-xs text-slate-400 mt-0.5">{product.category.name}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-slate-500">{product.reviews_avg_rating || 0}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-base font-bold text-blue-600">{formatPrice(product.price)}</span>
                          {product.compare_price && product.compare_price > product.price && (
                            <span className="text-xs text-slate-400 line-through ml-1.5">{formatPrice(product.compare_price)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Aucun produit trouvé</p>
                <p className="text-slate-400 text-sm mt-1">Essayez avec d&apos;autres termes de recherche</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <SearchIcon className="h-10 w-10 text-blue-300" />
          </div>
          <p className="text-slate-600 font-medium">Que recherchez-vous ?</p>
          <p className="text-slate-400 text-sm mt-1">Tapez votre recherche pour trouver des produits</p>
        </div>
      )}
    </div>
  );
}
