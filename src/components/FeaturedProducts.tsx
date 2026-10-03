'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { useFeaturedProductsQuery } from '@/hooks/queries/useQueries';
import { Product } from '@/types';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { data: featuredProducts = [] } = useFeaturedProductsQuery();

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="products-section section-padding" aria-labelledby="featured-heading">
      <div className="container">
        <div className="featured-section-header">
          <div className="featured-header-title-group">
            <div className="section-kicker">{t('featured.kicker', 'FEATURED PRODUCTS')}</div>
            <h2 id="featured-heading" className="section-title">
              {t('featured.title', 'Blessings for Every Occasion')}
            </h2>
          </div>

          {/* Lotus flourish divider */}
          <div className="lotus-flourish-divider">
            <img
              src="/assets/lotus_flourish.png"
              alt="Lotus Ornament"
              className="lotus-flourish-img"
            />
          </div>

          <Link href="/collections" className="view-all-link">
            <span>Explore All Jewellery</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 4-Item Featured Product Cards Grid */}
        <div className="product-grid-four">
          {featuredProducts.map((product: Product) => (
            <article key={product.id} className="product-card-four" id={`product-${product.id}`}>
                <div className="product-image-container-four">
                  <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`}>
                    <img
                      src={product.images?.[0] || '/assets/prod_ganesha_hq.webp'}
                      alt={`${product.name} - Panchaloham Temple Jewellery`}
                      title={`${product.name} - Panchaloham Temple Jewellery`}
                      width={320}
                      height={320}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/prod_ganesha_hq.webp';
                      }}
                    />
                  </Link>
                  <span className="product-deity-badge-four">{product.deity || 'Sacred'}</span>
                </div>

                <div className="product-info-four">
                  <div className="product-category-meta">{(product.category || 'Panchaloham').toUpperCase()}</div>
                  <h3 className="product-title-four">
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>

                  <div className="product-rating">
                    <div className="rating-stars" aria-label={`${product.rating || 5} out of 5 stars`}>
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
                    <span className="current-price">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                    {product.originalPrice != null && Number(product.originalPrice) > Number(product.price || 0) && (
                      <span className="original-price">
                        ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product, 1)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingBag size={16} />
                    <span>{t('featured.add_to_bag', 'Add to Bag')}</span>
                  </button>
                </div>
              </article>
          ))}
        </div>
      </div>
    </section>
  );
}
