import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flower2,
} from 'lucide-react';
import { CATEGORIES } from '@/data/products';
import { productsService } from '@/services/productsService';
import { constructMetadata, getProductSchema, getBreadcrumbSchema, siteConfig } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import BackButton from '@/components/BackButton';
import ProductActionSection from './ProductActionSection';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const allProducts = await productsService.getAll();
  return allProducts.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await productsService.getById(slug);

  if (!product) {
    return constructMetadata({
      title: 'Sacred Product Not Found',
      description: 'The requested Panchaloham jewellery item could not be located.',
    });
  }

  return constructMetadata({
    title: `${product.name} - Consecrated Panchaloham`,
    description: product.description.slice(0, 160),
    image: product.images[0],
    canonicalUrl: `/products/${product.slug}`,
    keywords: [
      product.name,
      product.deity,
      'Panchaloham jewellery',
      'five metal temple pendant',
      'sacred jewellery',
      ...product.tags,
    ],
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await productsService.getById(slug);

  if (!product) {
    notFound();
  }

  const matchingCategory = CATEGORIES.find(
    (c) =>
      c.id === product.category ||
      c.slug.includes(product.category) ||
      product.deity.toLowerCase().includes(c.id)
  );

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    {
      name: matchingCategory ? matchingCategory.name : product.deity,
      url: matchingCategory
        ? `/collections/${matchingCategory.slug}`
        : `/collections?deity=${encodeURIComponent(product.deity)}`,
    },
    { name: product.name, url: `/products/${product.slug}` },
  ];

  const productSchema = getProductSchema(product);
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  // Related products from live database
  const allProducts = await productsService.getAll();
  const relatedProducts = allProducts.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.deity === product.deity)
  ).slice(0, 3);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="section-padding" style={{ paddingTop: '32px' }}>
        <div className="container">
          {/* Top Bar with Back Button & Breadcrumbs */}
          <div className="pdp-top-bar">
            <BackButton
              fallbackUrl={matchingCategory ? `/collections/${matchingCategory.slug}` : '/collections'}
              label={matchingCategory ? `Back to ${matchingCategory.name}` : 'Back to Collections'}
            />

            <nav className="breadcrumb-nav" aria-label="Breadcrumbs">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb.url}-${idx}`}>
                  {idx > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span style={{ color: 'var(--gold-light)', fontWeight: 500 }}>
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={crumb.url}>{crumb.name}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Main Product Showcase Grid */}
          <div className="pdp-grid">
            {/* Gallery Column */}
            <div className="pdp-gallery">
              <div className="pdp-main-image">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  loading="eager"
                />
              </div>

              {product.images.length > 1 && (
                <div className="pdp-thumbnails">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className="pdp-thumb-item"
                    >
                      <img
                        src={img}
                        alt={`${product.name} detail angle ${i + 1}`}
                        className="pdp-thumb-img"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="pdp-details">
              <span className="pdp-badge">
                <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
                {product.metalComposition.purityCertificate}
              </span>

              <h1 className="pdp-title">{product.name}</h1>

              <div className="product-rating" style={{ marginBottom: 16 }}>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product.rating) ? '#f5d77f' : 'none'}
                      stroke="#f5d77f"
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.9rem', color: '#d4af37', fontWeight: 600 }}>
                  {product.rating}
                </span>
                <span className="rating-count">({product.reviewsCount} Devotee Reviews)</span>
              </div>

              {/* Responsive Price Row */}
              <div className="pdp-price-row">
                <span className="pdp-price-current">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="pdp-price-original">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="pdp-save-tag">
                    Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="pdp-description-text">
                {product.description}
              </p>

              {/* Client Component for Quantity & Add to Cart */}
              <ProductActionSection product={product} />

              {/* Metal Specs Breakdown Table */}
              <div style={{ marginTop: '28px' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#fff9eb', marginBottom: '12px' }}>
                  Panchaloham Metal Composition (Vedic Ratio)
                </h2>
                <div className="metal-specs-table-wrapper">
                  <table className="metal-specs-table">
                    <thead>
                      <tr>
                        <th>Sacred Element</th>
                        <th>Traditional Name</th>
                        <th>Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Gold</td>
                        <td>Pon (Sacred Gold)</td>
                        <td>{product.metalComposition.gold}</td>
                      </tr>
                      <tr>
                        <td>Silver</td>
                        <td>Velli (Pure Silver)</td>
                        <td>{product.metalComposition.silver}</td>
                      </tr>
                      <tr>
                        <td>Copper</td>
                        <td>Chembu (Sanctum Copper)</td>
                        <td>{product.metalComposition.copper}</td>
                      </tr>
                      <tr>
                        <td>Zinc / Brass</td>
                        <td>Pithalai (Temple Brass)</td>
                        <td>{product.metalComposition.zinc}</td>
                      </tr>
                      <tr>
                        <td>Iron</td>
                        <td>Irumbu (Sacred Iron)</td>
                        <td>{product.metalComposition.iron}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Consecration Details */}
              {product.consecrationDetails && (
                <div className="pdp-consecration-box">
                  <Flower2 size={22} color="#d4af37" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: '#d4af37', marginBottom: '4px' }}>
                      Temple Consecration (Prana Pratishtha)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {product.consecrationDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* Spiritual Benefits List */}
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff9eb', marginBottom: '12px' }}>
                  Spiritual & Astrological Benefits
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {product.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                        fontSize: '0.88rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span style={{ color: '#d4af37' }}>✦</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery & Assurance */}
              <div className="pdp-trust-row">
                <div className="pdp-trust-item">
                  <Truck size={18} color="#d4af37" />
                  <span>Free Express Delivery Above ₹999</span>
                </div>
                <div className="pdp-trust-item">
                  <ShieldCheck size={18} color="#d4af37" />
                  <span>Authenticity Lab Certificate Included</span>
                </div>
                <div className="pdp-trust-item">
                  <RotateCcw size={18} color="#d4af37" />
                  <span>7-Day Sacred Exchange</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#fff9eb', marginBottom: '28px', textAlign: 'center' }}>
                Harmonizing Divine Creations
              </h2>
              <div className="product-grid">
                {relatedProducts.map((relProduct) => (
                  <article key={relProduct.id} className="product-card">
                    <div className="product-image-container">
                      <Link href={`/products/${relProduct.slug}`}>
                        <img src={relProduct.images[0]} alt={relProduct.name} />
                      </Link>
                      <span className="product-deity-badge">{relProduct.deity}</span>
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">
                        <Link href={`/products/${relProduct.slug}`}>{relProduct.name}</Link>
                      </h3>
                      <div className="product-price-row">
                        <span className="current-price">₹{relProduct.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
