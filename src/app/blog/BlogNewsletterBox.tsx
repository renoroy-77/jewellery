'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function BlogNewsletterBox() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <div className="blog-newsletter-box">
      <div className="blog-newsletter-icon">✦</div>
      <h4 className="blog-newsletter-title">Get Sacred Updates</h4>
      <p className="blog-newsletter-desc">
        Monthly dispatches on new jewellery arrivals, temple festival guides, and Agamic lore.
      </p>

      {isSubscribed ? (
        <div style={{ padding: '14px', background: 'rgba(52, 211, 153, 0.15)', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.4)', color: '#6ee7b7', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
            <Check size={16} /> Subscribed with Blessings
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
            You will receive our next sacred dispatch.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="blog-newsletter-form">
          <input
            type="email"
            required
            placeholder="Your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="blog-newsletter-input"
            aria-label="Email address for sacred newsletter"
          />
          <button type="submit" className="btn-gold blog-newsletter-btn">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
