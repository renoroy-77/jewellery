import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
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
        <div
          style={{
            fontSize: '4.5rem',
            fontFamily: 'var(--font-serif)',
            background: 'var(--gold-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: '16px',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.6rem',
            color: '#fcf9f2',
            marginBottom: '14px',
          }}
        >
          Sacred Piece Not Found
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '28px',
          }}
        >
          The page or sacred jewellery item you are looking for may have been moved or is currently being sanctified in our temple workshop.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </Link>
          <Link href="/collections" className="btn-outline-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            <span>View All Collections</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
