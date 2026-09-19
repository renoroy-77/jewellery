'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
      }}
    >
      <div style={{ maxWidth: '520px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            background: 'var(--gold-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
          }}
        >
          Something Went Unexpectedly
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '28px',
          }}
        >
          We encountered a temporary blessing hiccup while loading this page. Please refresh or return to the main catalogue.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            className="btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="btn-outline-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
