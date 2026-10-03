import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ShopCatalog from '@/components/ShopCatalog';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = constructMetadata({
  title: 'Panchaloham Temple Jewellery Collections',
  description:
    'Shop authentic 5-metal Panchaloham temple jewellery from Aamadappetti (Amadapetti). Explore sacred deity pendants (Murugan, Ganesha, Shiva, Lakshmi), temple chains, and energized rings.',
  canonicalUrl: '/collections',
  keywords: [
    'aamadappetti collections',
    'amadapetti collections',
    'aamadappetti jewellery store',
    'amadapetti panchaloham',
    'buy panchaloham online',
    'authentic temple jewellery',
  ],
});

export default async function CollectionsPage() {
  const [initialProducts, initialCategories] = await Promise.all([
    productsService.getAll(),
    categoriesService.getAll().catch(() => []),
  ]);
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Jewellery', url: '/collections' },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />

      <div className="section-padding">
        <div className="container">
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold-light)' }}>Jewellery Catalog</span>
          </nav>

          <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <div className="section-kicker">CONSECRATED HEIRLOOMS</div>
            <h1 className="section-title">Sacred Panchaloham Jewellery</h1>
            <p style={{ marginTop: '8px', maxWidth: '720px' }}>
              Handcrafted in the sacred proportion of 5 metals (Gold, Silver, Copper, Zinc, Iron) to harmonize planetary energies and bestow divine grace upon the wearer.
            </p>
          </div>

          {/* Full E-Commerce Shop Component with Filtering, Sorting & Cart */}
          <ShopCatalog initialProducts={initialProducts} initialCategories={initialCategories} />
        </div>
      </div>
    </>
  );
}
