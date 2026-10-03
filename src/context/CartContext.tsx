'use client';

import React, { createContext, useContext } from 'react';
import { Product, CartItem } from '@/types';
import { useCartStore } from '@/store/useCartStore';

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  notification: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartStore((s) => s.cart);
  const wishlist = useCartStore((s) => s.wishlist);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const notification = useCartStore((s) => s.notification);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const isInWishlist = useCartStore((s) => s.isInWishlist);

  const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const subtotal = cart.reduce(
    (total, item) => total + (Number(item.product.price) || 0) * (item.quantity || 1),
    0
  );

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    totalItems,
    subtotal,
    wishlist,
    toggleWishlist,
    isInWishlist,
    notification,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    const store = useCartStore.getState();
    const totalItems = store.cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const subtotal = store.cart.reduce(
      (total, item) => total + (Number(item.product.price) || 0) * (item.quantity || 1),
      0
    );
    return {
      cart: store.cart,
      addToCart: store.addToCart,
      removeFromCart: store.removeFromCart,
      updateQuantity: store.updateQuantity,
      clearCart: store.clearCart,
      isCartOpen: store.isCartOpen,
      setIsCartOpen: store.setIsCartOpen,
      totalItems,
      subtotal,
      wishlist: store.wishlist,
      toggleWishlist: store.toggleWishlist,
      isInWishlist: store.isInWishlist,
      notification: store.notification,
    };
  }
  return context;
}
