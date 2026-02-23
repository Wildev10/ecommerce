'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, ShoppingCart, Star, Tag } from 'lucide-react';
import { searchApi } from '@/lib/api';
import type { Product, Category } from '@/types';
import { formatPrice } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import toast from 'react-hot-toast';

export default function SearchPage() {
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
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || '',
      stock: product.stock,
    });
    toast.success('Ajouté au panier');
  };

  // Debounced suggestions
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.suggestions(query);
        setSuggestions(res.products || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8 relative">
        <div className="flex">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, une catégorie..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          <button type="submit" className="px-8 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 font-medium">
            Rechercher
          </button>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(s.name);
                  setSuggestions([]);
                  router.push(`/search?q=${encodeURIComponent(s.name)}`);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : searched ? (
        <div>
          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-blue-600" /> Catégories
              </h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 text-sm font-medium"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {products.length > 0
              ? `${products.length} résultat${products.length > 1 ? 's' : ''} pour "${q}"`
              : `Aucun résultat pour "${q}"`}
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-medium text-gray-900 truncate hover:text-blue-600">{product.name}</h3>
                    </Link>
                    {product.category && (
                      <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{product.reviews_avg_rating || 0}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Essayez avec d&apos;autres termes de recherche</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Tapez votre recherche pour trouver des produits</p>
        </div>
      )}
    </div>
  );
}
