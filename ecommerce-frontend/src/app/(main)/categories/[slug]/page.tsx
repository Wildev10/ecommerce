'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import type { Product, Category } from '@/types';
import { formatPrice } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import { useCartStore } from '@/stores/cart-store';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCartStore();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCategory();
  }, [slug]);

  useEffect(() => {
    loadProducts();
  }, [slug, page]);

  const loadCategory = async () => {
    try {
      const cats = await categoriesApi.getAll();
      const found = cats.find((c: Category) => c.slug === slug);
      setCategory(found || null);
    } catch {}
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getProducts(slug, { page });
      setProducts(res.data);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
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

  if (loading && products.length === 0) return <Loading fullPage text="Chargement..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Tous les produits
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category?.name || slug}</h1>
        {category?.description && <p className="text-gray-500 mt-2">{category.description}</p>}
        <p className="text-sm text-gray-400 mt-1">{total} produit{total > 1 ? 's' : ''}</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun produit</h2>
          <p className="text-gray-500">Aucun produit dans cette catégorie pour le moment.</p>
        </div>
      ) : (
        <>
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
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 truncate hover:text-blue-600">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.reviews_avg_rating || 0}</span>
                    <span className="text-xs text-gray-400">({product.reviews_count || 0})</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.compare_price)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                  {product.stock <= 0 && (
                    <p className="text-xs text-red-500 mt-1">Rupture de stock</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Précédent</button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {lastPage}</span>
              <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Suivant</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
