'use client';

import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { formatPrice } from '@/lib/api-helpers';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight, ShoppingCart, Tag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice >= 50000 ? 0 : 2000;
  const grandTotal = totalPrice + shippingFee;
  const progressToFreeShipping = Math.min((totalPrice / 50000) * 100, 100);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Votre panier est vide</h2>
          <p className="text-slate-500 mb-8">Ajoutez des produits pour commencer vos achats</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold transition"
          >
            <ShoppingBag className="h-5 w-5" />
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon panier</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} article{items.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="h-3.5 w-3.5" /> Vider
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 hover:border-slate-200 transition"
            >
              {/* Image */}
              <Link href={`/products/${item.id}`} className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 hover:text-blue-700 transition leading-snug">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-blue-700 font-bold mt-1 text-base">{formatPrice(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Qty controls */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-800 text-sm sm:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-medium py-2 transition"
          >
            ← Continuer mes achats
          </Link>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Free shipping progress */}
          {totalPrice < 50000 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-medium text-slate-700">
                  Plus que <span className="text-orange-600 font-bold">{formatPrice(50000 - totalPrice)}</span> pour la livraison gratuite !
                </p>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Coupon placeholder */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Code promo"
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-slate-50 transition"
                />
              </div>
              <Link
                href="/checkout"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition whitespace-nowrap"
              >
                Appliquer
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 mb-4">Résumé</h2>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                <span className="font-medium text-slate-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Livraison</span>
                {shippingFee === 0 ? (
                  <span className="text-green-600 font-semibold">Gratuite 🎉</span>
                ) : (
                  <span className="font-medium text-slate-900">{formatPrice(shippingFee)}</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mb-5">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900 text-base">Total</span>
                <span className="font-bold text-blue-700 text-xl">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition"
              >
                Commander maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/login?from=/checkout"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition"
              >
                Se connecter pour commander
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
              🔒 Paiement sécurisé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
