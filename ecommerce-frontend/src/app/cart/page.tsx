'use client';

import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Panier vide</h2>
        <p className="text-gray-500 mb-6">Ajoutez des produits pour commencer</p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste articles */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
            >
              <div className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">Image</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-blue-600 font-bold">{Number(item.price).toFixed(2)} €</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded-lg border hover:bg-gray-100"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-lg border hover:bg-gray-100"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <p className="font-bold text-gray-900 w-24 text-right">
                {(Number(item.price) * item.quantity).toFixed(2)} €
              </p>

              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Vider le panier
          </button>
        </div>

        {/* Résumé */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className="text-green-600">Gratuite</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">{totalPrice.toFixed(2)} €</span>
            </div>
          </div>

          {isAuthenticated ? (
            <Link
              href="/checkout"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Commander
            </Link>
          ) : (
            <Link
              href="/login?redirect=/cart"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Connectez-vous pour commander
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
