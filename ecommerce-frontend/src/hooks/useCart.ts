// src/hooks/useCart.ts

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import api from '@/lib/axios';

export function useCart() {
  const [loading, setLoading] = useState(false);
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  /**
   * Ajouter un produit au panier
   */
  const addToCart = async (
    product: {
      id: number;
      name: string;
      price: number;
      image?: string;
      stock: number;
    },
    quantity: number = 1
  ) => {
    setLoading(true);
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity,
      });

      // Sync avec le backend (fire & forget)
      try {
        await api.post('/cart', {
          product_id: product.id,
          quantity,
        });
      } catch {
        // Le panier local reste valide
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retirer un produit du panier
   */
  const removeFromCart = async (productId: number) => {
    setLoading(true);
    try {
      removeItem(productId);

      try {
        await api.delete(`/cart/${productId}`);
      } catch {
        // Silencieux
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour la quantité
   */
  const changeQuantity = async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      updateQuantity(productId, quantity);

      try {
        await api.put(`/cart/${productId}`, { quantity });
      } catch {
        // Silencieux
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vider le panier
   */
  const emptyCart = async () => {
    setLoading(true);
    try {
      clearCart();

      try {
        await api.delete('/cart');
      } catch {
        // Silencieux
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Synchroniser avec le backend
   */
  const syncCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart');
      if (response.data?.data?.items) {
        clearCart();
        response.data.data.items.forEach(
          (item: {
            item_id: number;
            product_id: number;
            product_name: string;
            product_price: number;
            product_image: string | null;
            quantity: number;
            subtotal: number;
          }) => {
            addItem({
              id: item.product_id,
              name: item.product_name,
              price: item.product_price,
              quantity: item.quantity,
              image: item.product_image || undefined,
              stock: 999, // Backend cart doesn't return stock; use safe default
            });
          }
        );
      }
    } catch {
      // Garde le panier local
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    totalItems: getTotalItems(),
    totalPrice: getTotalPrice(),
    addToCart,
    removeFromCart,
    changeQuantity,
    emptyCart,
    syncCart,
  };
}
