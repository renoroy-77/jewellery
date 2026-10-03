'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Search, Check, Filter, X, RotateCcw, Loader2 } from 'lucide-react';
import { useProductsQuery, useCategoriesQuery } from '@/hooks/queries/useQueries';
import { useCart } from '@/context/CartContext';
import { Product, Category } from '@/types';

interface ShopCatalogProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
}

export default function ShopCatalog({
  initialProducts = [],
  initialCategories = [],
}: ShopCatalogProps) {
  const { addToCart } = useCart();

  const { data: products = initialProducts, isLoading: loading } = useProductsQuery(
    undefined,
    initialProducts
  );
  const { data: categories = initialCategories } = useCategoriesQuery(initialCategories);

  // Filters State
  const [selectedType, setSelectedType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Category matching helper
  const matchesCategory = (product: Product, cat: Category) => {
    const prodCat = (product.category || '').toLowerCase().trim();
    const prodDeity = (product.deity || '').toLowerCase().trim();
    const catSlug = (cat.slug || '').toLowerCase().trim();
    const catId = (cat.id || '').toLowerCase().trim();
    const catName = (cat.name || '').toLowerCase().trim();

    return (
      prodCat === catSlug ||
      prodCat === catId ||
      prodCat === catName ||
      prodCat.replace(/-/g, ' ') === catName ||
      catName.replace(/-/g, ' ') === prodCat ||
      (catSlug && prodCat.includes(catSlug)) ||
      (catId && prodCat.includes(catId)) ||
      (catName && (prodDeity.includes(catName) || catName.includes(prodDeity)))
    );
  };

  // Jewellery Types (Derived EXCLUSIVELY from backend categories)
  const JEWELLERY_TYPES = useMemo(() => {
    return [
      { label: 'All Sacred Jewellery', value: 'all', count: products.length },
      ...categories.map((c) => ({
        label: c.name,
        value: c.slug || c.id,
        count: products.filter((p) => matchesCategory(p, c)).length,
      })),
    ];
  }, [categories, products]);

  const PRICE_RANGES = [
    { label: 'All Price Ranges', value: 'all' },
    { label: 'Under ₹2,000', value: 'under-2000' },
    { label: '₹2,000 to ₹2,500', value: '2000-2500' },
    { label: 'Above ₹2,500', value: 'above-2500' },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by Jewellery Type
    if (selectedType !== 'all') {
      const activeCat = categories.find(
        (c) => (c.slug || c.id) === selectedType || c.id === selectedType || c.slug === selectedType
      );
      if (activeCat) {
        list = list.filter((p) => matchesCategory(p, activeCat));
      } else {
        const target = selectedType.toLowerCase().trim();
        list = list.filter((p) => {
          const prodCat = (p.category || '').toLowerCase().trim();
          return prodCat === target || prodCat.replace(/-/g, ' ') === target;
        });
      }
    }

    // Filter by Price Range
    if (priceRange === 'under-2000') {
      list = list.filter((p) => p.price < 2000);
    } else if (priceRange === '2000-2500') {
      list = list.filter((p) => p.price >= 2000 && p.price <= 2500);
    } else if (priceRange === 'above-2500') {
      list = list.filter((p) => p.price > 2500);
    }

    // In stock
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.deity.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [selectedType, priceRange, inStockOnly, searchQuery, sortBy]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };


  const resetFilters = () => {
    setSelectedType('all');
    setPriceRange('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters = selectedType !== 'all' || priceRange !== 'all' || searchQuery;

  return (
    <div className="ecom-catalog-wrapper">
      {/* Mobile Filter Toggle */}
      <div className="ecom-mobile-filter-bar">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="ecom-mobile-toggle-btn"
        >
          <Filter size={18} />
          <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter Jewellery'}</span>
        </button>
        <span className="ecom-mobile-count">{filteredProducts.length} Items</span>
      </div>

      <div className="ecom-shop-grid-layout">
        {/* ========================================================= */}
        {/* LEFT SIDEBAR FILTER (Ecommerce standard)                 */}
        {/* ========================================================= */}
        <aside className={`ecom-sidebar ${mobileFilterOpen ? 'open' : ''}`}>
          <div className="ecom-sidebar-header">
            <div className="ecom-sidebar-title">
              <Filter size={18} className="sidebar-filter-icon" />
              <span>Refine Jewellery</span>
            </div>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="ecom-clear-all-btn" title="Reset all filters">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="ecom-sidebar-search">
            <Search size={16} className="sidebar-search-icon" />
            <input
              type="text"
              placeholder="Search jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="sidebar-search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Jewellery Category Filters */}
          <div className="sidebar-filter-group">
            <h4 className="sidebar-group-heading">Jewellery Category</h4>
            <div className="sidebar-options-list">
              {JEWELLERY_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`sidebar-radio-item ${selectedType === type.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="jewellery_type"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={() => setSelectedType(type.value)}
                    className="sidebar-radio-input"
                  />
                  <span className="sidebar-item-label">{type.label}</span>
                  <span className="sidebar-item-count">{type.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="sidebar-filter-group">
            <h4 className="sidebar-group-heading">Price Range</h4>
            <div className="sidebar-options-list">
              {PRICE_RANGES.map((r) => (
                <label
                  key={r.value}
                  className={`sidebar-radio-item ${priceRange === r.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="price_range"
                    value={r.value}
                    checked={priceRange === r.value}
                    onChange={() => setPriceRange(r.value)}
                    className="sidebar-radio-input"
                  />
                  <span className="sidebar-item-label">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Guarantee Badges in Sidebar */}
          <div className="sidebar-trust-mini">
            <div className="mini-trust-item">
              <span className="mini-trust-gold">✓</span>
              <span>100% Five-Metal Panchaloham</span>
            </div>
            <div className="mini-trust-item">
              <span className="mini-trust-gold">✓</span>
              <span>Sanctum Consecrated</span>
            </div>
            <div className="mini-trust-item">
              <span className="mini-trust-gold">✓</span>
              <span>Govt. Assay Hallmarked</span>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT PRODUCTS SECTION                                    */}
        {/* ========================================================= */}
        <main className="ecom-products-area">
          {/* Top meta & sorting toolbar */}
          <div className="ecom-top-toolbar">
            <div className="ecom-count-indicator">
              Showing <strong>{filteredProducts.length}</strong> Sacred Pieces
              {selectedType !== 'all' && (
                <span className="active-filter-badge">
                  Category: {JEWELLERY_TYPES.find((j) => j.value === selectedType)?.label}
                  <button onClick={() => setSelectedType('all')}><X size={12} /></button>
                </span>
              )}
            </div>

            {/* Sort selector */}
            <div className="ecom-sort-box">
              <label htmlFor="ecom-sort-select">Sort By:</label>
              <select
                id="ecom-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ecom-sort-select"
              >
                <option value="featured">Featured & Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '12px' }}>
              <Loader2 size={32} className="spin" style={{ color: 'var(--gold-light)' }} />
              <span style={{ color: '#9bb5ab', fontSize: '0.9rem' }}>Loading consecrated collection from temple database...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="ecom-empty-state">
              <h3>No jewellery matched your filter</h3>
              <p>Try clearing filters or search with another term.</p>
              <button onClick={resetFilters} className="btn-gold" style={{ marginTop: '16px' }}>
                Reset Filters & View All
              </button>
            </div>
          ) : (
            <div className="ecom-product-grid">
              {filteredProducts.map((product) => {

                const isJustAdded = addedProductId === product.id;
                const discountPercent = product.originalPrice && Number(product.originalPrice) > Number(product.price || 0)
                  ? Math.round(((Number(product.originalPrice) - Number(product.price || 0)) / Number(product.originalPrice)) * 100)
                  : 0;

                return (
                  <div key={product.id} className="ecom-product-card">
                    <Link href={`/products/${product.slug}`} className="ecom-card-link">
                      {/* Image */}
                      <div className="ecom-card-img-wrap">
                        <img
                          src={product.images?.[0] || '/assets/prod_ganesha_hq.webp'}
                          alt={product.name}
                          className="ecom-product-img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/prod_ganesha_hq.webp';
                          }}
                        />

                        {/* Badges */}
                        <div className="ecom-card-badge-group">
                          {discountPercent > 0 && (
                            <span className="ecom-discount-tag">{discountPercent}% OFF</span>
                          )}
                          <span className="ecom-purity-tag">5-Metal Panchaloham</span>
                        </div>

                      </div>

                      {/* Product Content */}
                      <div className="ecom-card-body">
                        {(() => {
                          const matchingCat = categories.find((c) => matchesCategory(product, c));
                          const displayCatName = matchingCat
                            ? matchingCat.name
                            : (product.category ? product.category.replace(/-/g, ' ') : 'Panchaloham');
                          return (
                            <span className="ecom-item-category">
                              {displayCatName.toUpperCase()} • CONSECRATED
                            </span>
                          );
                        })()}
                        <h3 className="ecom-item-title">{product.name}</h3>

                        {/* Rating */}
                        <div className="ecom-rating-row">
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < Math.floor(product.rating || 5) ? '#dfba6c' : 'none'}
                                color="#dfba6c"
                              />
                            ))}
                          </div>
                          <span className="ecom-rating-num">{product.rating || 5}</span>
                          <span className="ecom-rating-reviews">({product.reviewsCount || 1})</span>
                        </div>

                        {/* Pricing */}
                        <div className="ecom-pricing-row">
                          <span className="ecom-price-current">
                            ₹{Number(product.price || 0).toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice != null && Number(product.originalPrice) > Number(product.price || 0) && (
                            <span className="ecom-price-original">
                              ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Quick Add To Cart */}
                    <div className="ecom-card-actions">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`ecom-cart-btn ${isJustAdded ? 'added' : ''}`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check size={15} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={15} />
                            <span className="cart-text-desktop">Add to Sacred Bag</span>
                            <span className="cart-text-mobile">Add to Bag</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
