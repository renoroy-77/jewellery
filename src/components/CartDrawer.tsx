'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';

export default function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`cart-drawer ${isCartOpen ? 'open' : ''}`}
        aria-label="Shopping Bag"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="#d4af37" />
            <h2 className="cart-drawer-title">{t('cart.title', 'Shopping Bag')} ({totalItems})</h2>
          </div>
          <button
            className="cart-drawer-close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items List */}
        {cart.length === 0 ? (
          <div
            style={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <ShoppingBag size={48} color="#799185" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fcf9f2' }}>
              Your sacred bag is empty
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#799185', marginBottom: '24px' }}>
              Select consecrated Panchaloham pendants, chains, or deity artefacts to begin your spiritual journey.
            </p>
            <button
              className="btn-gold"
              onClick={() => setIsCartOpen(false)}
              style={{ fontSize: '0.9rem', padding: '10px 20px' }}
            >
              Browse Collections
            </button>
          </div>
        ) : (
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.product.id} className="cart-item-row">
                <div className="cart-item-img">
                  <img src={item.product.images[0]} alt={item.product.name} />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">
                    ₹{item.product.price.toLocaleString('en-IN')}
                  </div>
                  <div className="cart-qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      aria-label="Remove item"
                      style={{
                        marginLeft: 'auto',
                        color: 'var(--text-muted)',
                        transition: 'color 0.2s',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer with Subtotal & Checkout */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span className="cart-subtotal-val">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Taxes and insured shipping calculated at checkout.
            </div>
            <button
              className="btn-gold"
              id="cart-proceed-checkout-btn"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => {
                setIsCartOpen(false);
                router.push('/checkout');
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={14} color="#d4af37" />
              <span>100% Certified Panchaloham Guarantee</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
