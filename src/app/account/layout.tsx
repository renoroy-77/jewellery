import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Devotee Account & Sanctum Orders',
  description: 'Manage your consecrated temple jewellery orders, track active shipments, and view your saved devotee addresses.',
  canonicalUrl: '/account',
  noIndex: true,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
