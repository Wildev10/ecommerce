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
        await api.post('/cart/items', {
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
        await api.delete(`/cart/items/${productId}`);
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
        await api.put(`/cart/items/${productId}`, { quantity });
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
            product_id: number;
            product_name: string;
            price: number;
            quantity: number;
            image?: string;
            stock: number;
          }) => {
            addItem({
              id: item.product_id,
              name: item.product_name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              stock: item.stock,
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
