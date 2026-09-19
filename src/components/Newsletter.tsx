'use client';

import React, { useState } from 'react';
import { Flower2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().includes('@')) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="newsletter-horizontal-card">
          {/* Left: Lotus Line Art */}
          <div className="newsletter-lotus-wrapper">
            <img
              src="/assets/lotus_art.png"
              alt="Lotus of Divinity"
              className="newsletter-lotus-img"
            />
          </div>

          {/* Center: Text Content */}
          <div className="newsletter-center-content">
            <h2 id="newsletter-heading" className="newsletter-title">
              {t('newsletter.title', 'Stay Connected with Divinity')}
            </h2>
            <p className="newsletter-subtitle">
              {t('newsletter.subtitle', 'Get updates on new collections, offers and spiritual insights.')}
            </p>
          </div>

          {/* Right: Email Form */}
          <div className="newsletter-form-wrapper">
            {submitted ? (
              <div className="newsletter-success">
                <CheckCircle2 size={18} color="#2ea44f" />
                <span>Thank you! You are connected.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="newsletter-inline-form">
                <input
                  type="email"
                  required
                  placeholder={t('newsletter.placeholder', 'Enter your email address')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  aria-label="Email address for newsletter"
                />
                <button type="submit" className="newsletter-submit-btn">
                  {t('newsletter.button', 'Subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
