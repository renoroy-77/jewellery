'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTranslationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/cms');
  }, [router]);

  return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
      <p>Redirecting to CMS &amp; Banners...</p>
    </div>
  );
}
