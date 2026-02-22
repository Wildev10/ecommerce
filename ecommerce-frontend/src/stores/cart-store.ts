import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart } from '@/types';

interface CartState {
  cart: Cart | null;
  itemCount: number;

  // Actions
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      itemCount: 0,

      setCart: (cart) =>
        set({
          cart,
          itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
        }),

      clearCart: () =>
        set({
          cart: null,
          itemCount: 0,
        }),

      getItemCount: () => get().itemCount,
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
        itemCount: state.itemCount,
      }),
    }
  )
);
