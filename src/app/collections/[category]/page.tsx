import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, ShoppingBag, Star } from 'lucide-react';
import { CATEGORIES, DEITY_COLLECTIONS } from '@/data/products';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import BackButton from '@/components/BackButton';

interface Props {
  params: Promise<{ category: string }>;
}

const ALL_COLLECTIONS = [
  ...CATEGORIES,
  ...DEITY_COLLECTIONS.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    image: d.image,
    itemCount: 0,
    description: `Sacred consecrated Panchaloham jewellery dedicated to ${d.deity}.`,
  })),
];

export const dynamicParams = true;

export async function generateStaticParams() {
  return ALL_COLLECTIONS.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  let category = ALL_COLLECTIONS.find((c) => c.slug === slug || c.id === slug);
  if (!category) {
    category = (await categoriesService.getById(slug).catch(() => null)) || undefined;
  }

  if (!category) {
    return constructMetadata({
      title: 'Collection Not Found',
      description: 'The requested jewellery collection could not be found.',
    });
  }

  return constructMetadata({
    title: `${category.name} - Consecrated Panchaloham`,
    description: category.description,
    image: category.image,
    canonicalUrl: `/collections/${category.slug}`,
    keywords: [
      category.name,
      'Panchaloham jewellery',
      'temple jewellery',
      'sacred collection',
    ],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  let category = ALL_COLLECTIONS.find((c) => c.slug === slug || c.id === slug);
  if (!category) {
    category = (await categoriesService.getById(slug).catch(() => null)) || undefined;
  }

  if (!category) {
    notFound();
  }

  // Find products matching this category slug from PostgreSQL database
  const allProducts = await productsService.getAll();
  const catSlug = category.slug.toLowerCase();
  const catId = category.id.toLowerCase();
  const catName = category.name.toLowerCase();

  const matchedProducts = allProducts.filter((p) => {
    const pCat = (p.category || '').toLowerCase();
    const pDeity = (p.deity || '').toLowerCase();

    // 1. Direct match on category slug, id, or name (covers categories set by admin)
    if (
      pCat === catSlug ||
      pCat === catId ||
      pCat === catName ||
      pCat.replace(/-/g, ' ') === catName ||
      catSlug.includes(pCat) ||
      pCat.includes(catId)
    ) {
      return true;
    }

    // 2. Deity matching for deity-specific collections
    if (catId === 'ganesha' || catSlug.includes('ganesha')) {
      return pDeity.includes('ganesha') || p.name.toLowerCase().includes('ganesha');
    }
    if (catId === 'murugan' || catSlug.includes('murugan')) {
      return pDeity.includes('murugan') || p.name.toLowerCase().includes('murugan') || p.name.toLowerCase().includes('vel');
    }
    if (catId === 'shiva' || catSlug.includes('shiva')) {
      return pDeity.includes('shiva') || p.name.toLowerCase().includes('shiva') || p.name.toLowerCase().includes('trishul') || p.name.toLowerCase().includes('rudraksha');
    }
    if (catId === 'lakshmi' || catSlug.includes('lakshmi')) {
      return pDeity.includes('lakshmi') || p.name.toLowerCase().includes('lakshmi');
    }
    if (catId === 'devi' || catSlug.includes('devi')) {
      return pDeity.includes('devi') || pDeity.includes('durga') || p.name.toLowerCase().includes('devi');
    }
    if (catId === 'spiritual' || catSlug.includes('spiritual')) {
      return p.tags?.includes('spiritual') || pDeity.includes('brahman') || p.name.toLowerCase().includes('om');
    }

    // 3. Fallback matching
    return (
      pDeity.includes(catId) ||
      pDeity.includes(catSlug) ||
      catName.includes(pDeity)
    );
  });

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: category.name, url: `/collections/${category.slug}` },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />

      <div className="section-padding" style={{ paddingTop: '32px' }}>
        <div className="container">
          <div className="pdp-top-bar">
            <BackButton fallbackUrl="/collections" label="All Collections" />
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <Link href="/collections">Collections</Link>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span style={{ color: 'var(--gold-light)' }}>{category.name}</span>
            </nav>
          </div>

          <div
            style={{
              padding: '36px',
              background: 'radial-gradient(circle at 75% 50%, rgba(18, 54, 41, 0.7), rgba(5, 22, 15, 0.95))',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '16px',
              marginBottom: '40px',
            }}
          >
            <div className="section-kicker">CONSECRATED COLLECTION</div>
            <h1 className="section-title" style={{ fontSize: '2.4rem', marginBottom: '12px' }}>
              {category.name}
            </h1>
            <p style={{ maxWidth: '680px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
              {category.description}
            </p>
          </div>

          {matchedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p>More sanctified pieces are currently being cast by our sthapatis.</p>
              <Link href="/collections" className="btn-gold" style={{ marginTop: '16px' }}>
                Explore Other Collections
              </Link>
            </div>
          ) : (
            <div className="product-grid">
              {matchedProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-image-container">
                    <Link href={`/products/${product.slug}`}>
                      <img src={product.images[0]} alt={product.name} />
                    </Link>
                    <span className="product-deity-badge">{product.deity}</span>
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <div className="product-rating">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={i < Math.floor(product.rating) ? '#f5d77f' : 'none'}
                            stroke="#f5d77f"
                          />
                        ))}
                      </div>
                      <span className="rating-count">({product.reviewsCount})</span>
                    </div>
                    <div className="product-price-row">
                      <span className="current-price">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="original-price">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="add-to-cart-btn"
                      style={{ textAlign: 'center' }}
                    >
                      <ShoppingBag size={16} />
                      <span>View Sacred Details</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
