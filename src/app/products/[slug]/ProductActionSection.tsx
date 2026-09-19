'use client';

import React, { useState } from 'react';
import { ShoppingBag, Heart, Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
}

export default function ProductActionSection({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="pdp-actions-wrapper">
      <div className="pdp-action-row">
        {/* Quantity Modifier */}
        <div className="pdp-qty-box">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="pdp-qty-btn"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="pdp-qty-number">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="pdp-qty-btn"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Add to Wishlist Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className={`btn-outline-gold pdp-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={18} fill={isWishlisted ? '#d4af37' : 'none'} color="#d4af37" />
          <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
        </button>
      </div>

      {/* Main Add to Cart CTA */}
      <button
        type="button"
        onClick={() => addToCart(product, quantity)}
        className="btn-gold pdp-add-cart-cta"
        id="pdp-add-to-cart-btn"
      >
        <ShoppingBag size={20} />
        <span>Add to Sacred Bag</span>
      </button>
    </div>
  );
}
