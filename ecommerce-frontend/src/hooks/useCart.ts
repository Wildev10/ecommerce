'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useCartStore } from '@/stores/cart-store';
import { extractErrorMessage } from '@/lib/api-helpers';
import { ApiResponse, Cart } from '@/types';
import toast from 'react-hot-toast';

export function useCart() {
  const [loading, setLoading] = useState(false);
  const { cart, itemCount, setCart, clearCart } = useCartStore();

  /**
   * Récupérer le panier
   */
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Cart>>('/cart');
      setCart(response.data.data!);
    } catch (error: any) {
      const message = extractErrorMessage(error);
      if (error.response?.status !== 401) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ajouter au panier
   */
  const addToCart = async (productId: number, quantity: number = 1) => {
    setLoading(true);
    try {
      const response = await api.post<ApiResponse<Cart>>('/cart/items', {
        product_id: productId,
        quantity,
      });
      setCart(response.data.data!);
      toast.success('Produit ajouté au panier');
    } catch (error: any) {
      const message = extractErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour la quantité
   */
  const updateQuantity = async (itemId: number, quantity: number) => {
    setLoading(true);
    try {
      const response = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
        quantity,
      });
      setCart(response.data.data!);
    } catch (error: any) {
      const message = extractErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer un item du panier
   */
  const removeFromCart = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
      setCart(response.data.data!);
      toast.success('Produit retiré du panier');
    } catch (error: any) {
      const message = extractErrorMessage(error);
      toast.error(message);
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
      await api.delete<ApiResponse<null>>('/cart');
      clearCart();
      toast.success('Panier vidé');
    } catch (error: any) {
      const message = extractErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    itemCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    emptyCart,
  };
}
