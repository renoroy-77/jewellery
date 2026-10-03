import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Devotee Login & Sanctum Access',
  description: 'Sign in password-free to access your Aamadappetti account, manage sacred orders, and track sanctum shipments.',
  canonicalUrl: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
