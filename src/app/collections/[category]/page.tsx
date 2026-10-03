import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, ShoppingBag, Star } from 'lucide-react';
import { DEITY_COLLECTIONS } from '@/data/products';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import BackButton from '@/components/BackButton';
import { Category } from '@/types';

interface Props {
  params: Promise<{ category: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

async function resolveCategory(slug: string): Promise<Category | null> {
  let target = slug;
  if (target === 'pooja-essentials') target = 'pooja-items';

  // 1. Direct fetch from backend categories
  const backendCat = await categoriesService.getById(target).catch(() => null);
  if (backendCat) return backendCat;

  // 2. Check all backend categories to match id, slug, or name case-insensitively
  const allBackend = await categoriesService.getAll().catch(() => []);
  const found = allBackend.find(
    (c) =>
      c.slug?.toLowerCase() === target.toLowerCase() ||
      c.id?.toLowerCase() === target.toLowerCase() ||
      c.name?.toLowerCase() === target.toLowerCase()
  );
  if (found) return found;

  // 3. Fallback to deity collections for deity routes (e.g. ganesha-jewellery)
  const deity = DEITY_COLLECTIONS.find(
    (d) => d.slug.toLowerCase() === target.toLowerCase() || d.id.toLowerCase() === target.toLowerCase()
  );
  if (deity) {
    return {
      id: deity.id,
      slug: deity.slug,
      name: deity.name,
      tamilName: deity.tamilName,
      image: deity.image,
      itemCount: 0,
      description: `Sacred consecrated Panchaloham jewellery dedicated to ${deity.deity}.`,
    };
  }

  return null;
}

export async function generateStaticParams() {
  const backendCats = await categoriesService.getAll().catch(() => []);
  const slugs = new Set<string>();
  backendCats.forEach((c) => {
    if (c.slug) slugs.add(c.slug);
    if (c.id) slugs.add(c.id);
  });
  DEITY_COLLECTIONS.forEach((d) => {
    if (d.slug) slugs.add(d.slug);
  });
  return Array.from(slugs).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await resolveCategory(slug);

  if (!category) {
    return constructMetadata({
      title: 'Collection Not Found',
      description: 'The requested jewellery collection could not be found.',
    });
  }

  const slugLower = slug.toLowerCase();
  const additionalKeywords: string[] = [];

  if (slugLower.includes('ganesh')) {
    additionalKeywords.push(
      'ganesha pendant gold',
      'ganpati pendant gold',
      'ganesh locket gold',
      'gold locket ganesh',
      'ganpati locket gold',
      '22k gold ganesh pendant',
      'ganesh pendant silver'
    );
  } else if (slugLower.includes('lakshmi') || slugLower.includes('laxmi')) {
    additionalKeywords.push(
      'lakshmi pendant gold',
      'laxmi pendant gold',
      'gold laxmi pendant',
      'lakshmi dollar chain',
      'female lakshmi pendant designs in gold',
      '5 gram gold lakshmi pendant',
      '8 gram gold lakshmi pendant',
      'lakshmi devi lockets gold',
      'lakshmi pendant necklace'
    );
  } else if (slugLower.includes('chain')) {
    additionalKeywords.push(
      'lakshmi dollar chain',
      'consecration chains',
      'south indian temple jewellery chain',
      'panchaloham chain online'
    );
  } else if (slugLower.includes('pendant')) {
    additionalKeywords.push(
      'ganesha pendant gold',
      'lakshmi pendant gold',
      'south indian temple jewellery',
      'deity pendants',
      'panchaloham pendant'
    );
  }

  return constructMetadata({
    title: `${category.name} | Aamadappetti Temple Jewellery`,
    description: `${category.description} Handcrafted by Aamadappetti sthapatis in authentic sacred Panchaloham 5 metals.`,
    image: category.image,
    canonicalUrl: `/collections/${category.slug}`,
    keywords: [
      category.name,
      `aamadappetti ${category.name.toLowerCase()}`,
      `amadapetti ${category.name.toLowerCase()}`,
      'aamadappetti panchaloham',
      'amadapetti jewellery',
      'south indian temple jewellery',
      'Panchaloham jewellery',
      'temple jewellery',
      'sacred collection',
      ...additionalKeywords,
    ],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = await resolveCategory(slug);

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
                      <img
                        src={product.images?.[0] || '/assets/prod_ganesha_hq.webp'}
                        alt={product.name}
                        loading="lazy"
                      />
                    </Link>
                    <span className="product-deity-badge">{product.deity || 'Sacred'}</span>
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
                            fill={i < Math.floor(product.rating || 5) ? '#f5d77f' : 'none'}
                            stroke="#f5d77f"
                          />
                        ))}
                      </div>
                      <span className="rating-count">({product.reviewsCount || 1})</span>
                    </div>
                    <div className="product-price-row">
                      <span className="current-price">
                        ₹{Number(product.price || 0).toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice != null && Number(product.originalPrice) > Number(product.price || 0) && (
                        <span className="original-price">
                          ₹{Number(product.originalPrice).toLocaleString('en-IN')}
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
