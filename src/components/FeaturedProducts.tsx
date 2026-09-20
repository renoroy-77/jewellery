'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { productsService } from '@/services/productsService';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/types';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsService
      .getAll({ featured: true })
      .then((data) => {
        if (data.length > 0) {
          setFeaturedProducts(data.slice(0, 8));
        } else {
          productsService.getAll().then((all) => setFeaturedProducts(all.slice(0, 8)));
        }
      })
      .catch(() => setFeaturedProducts([]));
  }, []);

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
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                    />
                  </Link>
                  <span className="product-deity-badge-four">{product.deity}</span>
                </div>

                <div className="product-info-four">
                  <div className="product-category-meta">{product.category.toUpperCase()}</div>
                  <h3 className="product-title-four">
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>

                  <div className="product-rating">
                    <div className="rating-stars" aria-label={`${product.rating} out of 5 stars`}>
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
                    <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice && (
                      <span className="original-price">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
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
