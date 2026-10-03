import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Secure Sanctum Checkout',
  description: 'Complete your sacred Panchaloham jewellery purchase with 256-bit encrypted checkout and insured transit delivery.',
  canonicalUrl: '/checkout',
  noIndex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
