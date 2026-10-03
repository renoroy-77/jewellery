import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types';

const mockProduct: Product = {
  id: 'prod-test-1',
  slug: 'test-dollar',
  name: 'Sacred Panchaloham Dollar',
  deity: 'Lord Ganesha',
  category: 'lockets',
  price: 2500,
  originalPrice: 3500,
  rating: 5,
  reviewsCount: 12,
  inStock: true,
  description: 'Consecrated sacred temple dollar',
  metalComposition: {
    gold: '2.5%',
    silver: '12.5%',
    copper: '65.0%',
    zinc: '15.0%',
    iron: '5.0%',
    purityCertificate: 'Authentic Temple Guild Certified',
  },
  images: ['/assets/prod_ganesha_hq.webp'],
  benefits: ['Removes obstacles'],
  tags: ['panchaloham', 'ganesha'],
};

const mockProduct2: Product = {
  id: 'prod-test-2',
  slug: 'sacred-chain',
  name: 'Panchaloham Temple Chain',
  deity: 'Lord Murugan',
  category: 'chains',
  price: 1800,
  rating: 5,
  reviewsCount: 8,
  inStock: true,
  description: 'Heavy traditional handmade chain',
  metalComposition: {
    gold: '2.5%',
    silver: '12.5%',
    copper: '65.0%',
    zinc: '15.0%',
    iron: '5.0%',
    purityCertificate: 'Authentic Temple Guild Certified',
  },
  images: ['/assets/cat_chains.png'],
  benefits: ['Spiritual poise'],
  tags: ['panchaloham', 'chain'],
};

describe('Zustand useCartStore (Client State Management)', () => {
  beforeEach(() => {
    useCartStore.setState({
      cart: [],
      wishlist: [],
      isCartOpen: false,
      notification: null,
    });
  });

  it('should initialize with empty cart and wishlist', () => {
    const state = useCartStore.getState();
    expect(state.cart).toEqual([]);
    expect(state.wishlist).toEqual([]);
    expect(state.isCartOpen).toBe(false);
  });

  it('should add a product to the cart with specified quantity', () => {
    useCartStore.getState().addToCart(mockProduct, 2);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].product.id).toBe('prod-test-1');
    expect(state.cart[0].quantity).toBe(2);
    expect(state.isCartOpen).toBe(true);
  });

  it('should increment quantity when same product is added multiple times', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().addToCart(mockProduct, 2);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].quantity).toBe(3);
  });

  it('should add different products as distinct items in cart', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().addToCart(mockProduct2, 1);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(2);
    expect(state.cart[0].product.id).toBe('prod-test-1');
    expect(state.cart[1].product.id).toBe('prod-test-2');
  });

  it('should update item quantity correctly', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().updateQuantity('prod-test-1', 4);

    const state = useCartStore.getState();
    expect(state.cart[0].quantity).toBe(4);
  });

  it('should remove item when quantity is updated to 0', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().updateQuantity('prod-test-1', 0);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(0);
  });

  it('should remove item by ID', () => {
    useCartStore.getState().addToCart(mockProduct, 1);
    useCartStore.getState().addToCart(mockProduct2, 1);
    useCartStore.getState().removeFromCart('prod-test-1');

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].product.id).toBe('prod-test-2');
  });

  it('should clear all items in cart', () => {
    useCartStore.getState().addToCart(mockProduct, 2);
    useCartStore.getState().addToCart(mockProduct2, 1);
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.cart).toEqual([]);
  });

  it('should toggle wishlist items correctly', () => {
    expect(useCartStore.getState().isInWishlist('prod-test-1')).toBe(false);

    useCartStore.getState().toggleWishlist('prod-test-1');
    expect(useCartStore.getState().isInWishlist('prod-test-1')).toBe(true);
    expect(useCartStore.getState().wishlist).toContain('prod-test-1');

    useCartStore.getState().toggleWishlist('prod-test-1');
    expect(useCartStore.getState().isInWishlist('prod-test-1')).toBe(false);
    expect(useCartStore.getState().wishlist).not.toContain('prod-test-1');
  });
});
