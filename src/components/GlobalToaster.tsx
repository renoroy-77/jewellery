'use client';

import React from 'react';
import { Toaster } from 'sonner';

export default function GlobalToaster() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        style: {
          background: '#041810',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          color: '#fcf9f2',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.12)',
          fontFamily: 'inherit',
          borderRadius: '12px',
          fontSize: '0.88rem',
          padding: '12px 16px',
        },
        className: 'aamadappetti-sonner-toast',
      }}
    />
  );
}
