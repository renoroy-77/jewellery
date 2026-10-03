import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from '@/types';
import { toast } from 'sonner';

export interface CartStoreState {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  notification: string | null;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setNotification: (msg: string | null) => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      isCartOpen: false,
      notification: null,

      addToCart: (product: Product, quantity: number = 1) => {
        const { cart } = get();
        const existingIndex = cart.findIndex((item) => item.product.id === product.id);

        let newCart: CartItem[];
        if (existingIndex > -1) {
          newCart = cart.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [...cart, { product, quantity }];
        }

        set({
          cart: newCart,
          isCartOpen: true,
          notification: `Added "${product.name}" to your sacred bag`,
        });

        toast.success(`Added ${product.name} to your sacred bag`);
        setTimeout(() => set({ notification: null }), 3000);
      },

      removeFromCart: (productId: string) => {
        const { cart } = get();
        const removedItem = cart.find((item) => item.product.id === productId);
        const newCart = cart.filter((item) => item.product.id !== productId);

        set({ cart: newCart });
        if (removedItem) {
          toast.info(`Removed ${removedItem.product.name} from sacred bag`);
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const { cart } = get();
        const newCart = cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        set({ cart: newCart });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      setIsCartOpen: (open: boolean) => {
        set({ isCartOpen: open });
      },

      toggleWishlist: (productId: string) => {
        const { wishlist } = get();
        const exists = wishlist.includes(productId);
        const newWishlist = exists
          ? wishlist.filter((id) => id !== productId)
          : [...wishlist, productId];

        set({ wishlist: newWishlist });
        toast.info(exists ? 'Removed from wishlist' : 'Saved to sacred wishlist');
      },

      isInWishlist: (productId: string) => {
        return get().wishlist.includes(productId);
      },

      setNotification: (msg: string | null) => {
        set({ notification: msg });
      },
    }),
    {
      name: 'aamaclappetti_cart_zustand',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist }),
    }
  )
);

// Derived convenience hooks for selectors
export const useCartItems = () => useCartStore((state) => state.cart);
export const useCartTotalItems = () =>
  useCartStore((state) => state.cart.reduce((total, item) => total + (item.quantity || 1), 0));
export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.cart.reduce((total, item) => total + (Number(item.product.price) || 0) * (item.quantity || 1), 0)
  );
