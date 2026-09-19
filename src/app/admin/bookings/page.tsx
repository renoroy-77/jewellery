'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBookingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
      <p>Redirecting to Devotees &amp; Users Directory...</p>
    </div>
  );
}
