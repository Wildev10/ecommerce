'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Loader2, Star, Package } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import type { WishlistItem } from '@/types';
import { formatPrice, extractErrorMessage } from '@/lib/api-helpers';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ma wishlist</h1>
          <p className="text-sm text-slate-400">{items.length} produit{items.length !== 1 ? 's' : ''} sauvegardé{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Heart className="h-10 w-10 text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Wishlist vide</h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Ajoutez des produits à votre wishlist pour les retrouver facilement.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition"
          >
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => {
            const product = item.product;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow relative">
                <button
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingIds.has(item.product_id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-xl shadow-sm transition"
                >
                  {removingIds.has(item.product_id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>

                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                        <span className="bg-white text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">Rupture</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-slate-900 truncate hover:text-blue-600 transition text-sm">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-500">{product.reviews_avg_rating || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={product.stock <= 0}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
