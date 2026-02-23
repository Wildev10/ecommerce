'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Loader2, Star } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import type { WishlistItem } from '@/types';
import { formatPrice } from '@/lib/api-helpers';
import { extractErrorMessage } from '@/lib/api-helpers';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/wishlist');
      return;
    }
    loadWishlist();
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistApi.getAll();
      setItems(res.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    setRemovingIds((prev) => new Set(prev).add(productId));
    try {
      await wishlistApi.remove(productId);
      setItems((prev) => prev.filter((w) => w.product_id !== productId));
      toast.success('Retiré de la wishlist');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    const product = item.product;
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

  if (loading) return <Loading fullPage text="Chargement de la wishlist..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
        Ma wishlist ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Wishlist vide</h2>
          <p className="text-gray-500 mb-6">Ajoutez des produits à votre wishlist pour les retrouver facilement.</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative">
              <button
                onClick={() => handleRemove(item.product_id)}
                disabled={removingIds.has(item.product_id)}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
              >
                {removingIds.has(item.product_id) ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </button>

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
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{product.reviews_avg_rating || 0}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => handleAddToCart(item)}
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
          )})}
        </div>
      )}
    </div>
  );
}
