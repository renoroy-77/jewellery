import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ShopCatalog from '@/components/ShopCatalog';
import { productsService } from '@/services/productsService';

export const metadata: Metadata = constructMetadata({
  title: 'Divine Panchaloham Jewellery | All Sacred Pieces',
  description:
    'Shop authentic 5-metal Panchaloham temple jewellery, sacred deity pendants (Ganesha, Murugan, Shiva, Lakshmi), temple chains, and energized rings handcrafted in Kerala.',
  canonicalUrl: '/collections',
});

export default async function CollectionsPage() {
  const initialProducts = await productsService.getAll();
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
          <ShopCatalog initialProducts={initialProducts} />
        </div>
      </div>
    </>
  );
}
