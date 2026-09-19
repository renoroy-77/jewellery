'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookConsultationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/collections');
  }, [router]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
      <p>Redirecting to Sacred Jewellery Collections...</p>
    </div>
  );
}
