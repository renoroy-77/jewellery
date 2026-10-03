import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Our Heritage & Agamic Metallurgy',
  description:
    'Discover the sacred legacy of Aamadappetti. Handcrafted authentic Panchaloham temple jewellery preserving 40 years of Vedic metallurgy and lost-wax casting.',
  canonicalUrl: '/about',
  keywords: [
    'about aamadappetti',
    'about amadapetti',
    'panchaloham heritage',
    'temple jewellery goldsmith',
    'sacred metallurgy',
    'sthapatis madurai',
  ],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
