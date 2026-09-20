'use client';

import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
}

export default function ProductActionSection({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  return (
    <div className="pdp-actions-wrapper">
      <div className="pdp-action-row" style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>
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

        {/* Main Add to Cart CTA */}
        <button
          type="button"
          onClick={() => addToCart(product, quantity)}
          className="btn-gold pdp-add-cart-cta"
          id="pdp-add-to-cart-btn"
          style={{ flex: 1 }}
        >
          <ShoppingBag size={20} />
          <span>Add to Sacred Bag</span>
        </button>
      </div>
    </div>
  );
}
