'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  fallbackUrl = '/collections',
  label = 'Back',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`site-back-btn ${className}`}
      aria-label={label}
    >
      <ArrowLeft size={15} className="site-back-btn-icon" />
      <span>{label}</span>
    </button>
  );
}
