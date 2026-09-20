'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Sparkles, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/types';
import { productsService } from '@/services/productsService';
import { cmsService } from '@/services/cmsService';
import { INITIAL_ANNOUNCEMENTS, AnnouncementCMS } from '@/data/cmsData';
import { devoteeAuthService, DevoteeUserProfile } from '@/services/devoteeAuthService';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isSubPage = pathname !== '/';
  const { totalItems, setIsCartOpen } = useCart();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [announcement, setAnnouncement] = useState<AnnouncementCMS>(INITIAL_ANNOUNCEMENTS);
  const [loggedDevotee, setLoggedDevotee] = useState<DevoteeUserProfile | null>(null);

  React.useEffect(() => {
    cmsService
      .getAnnouncement()
      .then((data) => {
        if (data) setAnnouncement(data);
      })
      .catch(() => {});

    const updateDevotee = () => {
      const sess = devoteeAuthService.getStoredSession();
      setLoggedDevotee(sess ? sess.user : null);
    };

    updateDevotee();
    window.addEventListener('aamadappetti_auth_change', updateDevotee);
    return () => window.removeEventListener('aamadappetti_auth_change', updateDevotee);
  }, []);

  // If on admin route, suppress the consumer store header
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      try {
        const results = await productsService.getAll({ search: query.trim() });
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-content">
          <div className="announcement-items-center">
            <span>{announcement.freeShippingText || t('announcement.free_shipping', 'Free Shipping on Orders Above ₹999')}</span>
            <span className="announcement-pipe">|</span>
            <span>{announcement.authenticityText || t('announcement.panchaloham_purity', 'Authentic Panchaloham')}</span>
            <span className="announcement-pipe announcement-hide-mobile">|</span>
            <span className="announcement-hide-mobile">{announcement.worldwideText || t('announcement.worldwide_blessings', 'Blessings Delivered Worldwide')}</span>
            {announcement.activePromoAlert && (
              <>
                <span className="announcement-pipe">|</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{announcement.activePromoAlert}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="header-main">
        <div className="container header-container">
          <div className="header-brand-wrap">
            {/* Mobile Back Button: Only shown on sub-pages on mobile */}
            {isSubPage && (
              <button
                type="button"
                className="header-mobile-back-btn"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push('/');
                  }
                }}
                aria-label="Go back to previous page"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            {/* Official Brand Logo */}
            <Link href="/" className="brand-logo" aria-label="Aamadappetti Home" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/assets/brand_logo_gold.png"
                alt="aamadappetti PANCHALOHAM JEWELLERY"
                className="brand-logo-img"
                style={{ maxHeight: '48px', height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Main Navigation" style={{ display: mobileMenuOpen ? 'none' : undefined }}>
            <ul className="nav-links">
              <li className="nav-item">
                <Link href="/" className={pathname === '/' ? 'active-nav' : ''}>
                  {t('nav.home', 'Home')}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/collections"
                  className={pathname.startsWith('/collections') || pathname.startsWith('/products') ? 'active-nav' : ''}
                >
                  {t('nav.jewellery', 'Jewellery')}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/about" className={pathname === '/about' ? 'active-nav' : ''}>
                  {t('nav.about', 'About')}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/blog" className={pathname.startsWith('/blog') ? 'active-nav' : ''}>
                  {t('nav.blog', 'Blog')}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/contact" className={pathname === '/contact' ? 'active-nav' : ''}>
                  {t('nav.contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Search Bar */}
          <div className="search-box">
            <input
              type="search"
              placeholder={t('header.search_placeholder', 'Search for jewellery, deity or occasion...')}
              className="search-input"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              aria-label="Search catalogue"
            />
            <button className="search-icon-btn" aria-label="Search button">
              <Search size={16} />
            </button>

            {/* Quick search popup */}
            {isSearchFocused && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  background: '#0a241b',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  zIndex: 200,
                  maxHeight: '320px',
                  overflowY: 'auto',
                  padding: '8px 0',
                }}
              >
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                    }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#fcf9f2' }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: 600 }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User & Cart Actions + Mobile Hamburger */}
          <div className="header-actions">
            <Link
              href="/account"
              className={`header-icon-btn header-user-btn ${pathname === '/account' ? 'active-user' : ''}`}
              aria-label={loggedDevotee ? `Signed in as ${loggedDevotee.name}` : "Devotee Account & Profile"}
              title={loggedDevotee ? `Signed in as ${loggedDevotee.name} (Active 29-Day Session)` : "Devotee Login"}
              style={{ position: 'relative' }}
            >
              <User size={19} />
              {loggedDevotee && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#d4af37',
                    boxShadow: '0 0 6px #d4af37',
                  }}
                />
              )}
            </Link>

            <button
              className="header-icon-btn cart-icon-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping bag with ${totalItems} items`}
            >
              <ShoppingBag size={19} />
              <span className="badge-count">{totalItems}</span>
            </button>

            {/* Mobile Hamburger Menu Button on the RIGHT */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              style={{ color: '#d4af37' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            {/* Mobile Search Box */}
            <div className="mobile-search-box">
              <input
                type="search"
                placeholder="Search jewellery, deity, rings..."
                className="mobile-search-input"
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search catalogue on mobile"
              />
              <button className="mobile-search-btn" aria-label="Search button">
                <Search size={16} />
              </button>
            </div>

            {/* Mobile Search Results dropdown if searching */}
            {searchQuery.trim().length > 1 && searchResults.length > 0 && (
              <div className="mobile-search-results">
                {searchResults.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-search-result-item"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="mobile-search-result-img"
                    />
                    <div>
                      <div className="mobile-search-result-name">{product.name}</div>
                      <div className="mobile-search-result-price">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="mobile-nav-list">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                <span>{t('nav.home', 'Home')}</span>
                <span className="mobile-nav-arrow">›</span>
              </Link>
              <Link
                href="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                <span>{t('nav.jewellery', 'Jewellery')}</span>
                <span className="mobile-nav-arrow">›</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                <span>{t('nav.about', 'About')}</span>
                <span className="mobile-nav-arrow">›</span>
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                <span>{t('nav.blog', 'Blog')}</span>
                <span className="mobile-nav-arrow">›</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                <span>{t('nav.contact', 'Contact')}</span>
                <span className="mobile-nav-arrow">›</span>
              </Link>

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
                style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)', marginTop: '4px', paddingTop: '10px' }}
              >
                <span style={{ color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} /> {t('header.account', 'Account')} &amp; Orders
                </span>
                <span className="mobile-nav-arrow">›</span>
              </Link>
            </div>

            {/* Mobile Drawer Quick Contact / Assurance */}
            <div className="mobile-drawer-footer">
              <div className="mobile-drawer-assurance">
                <Sparkles size={14} className="gold-text" />
                <span>100% Certified Agamic Panchaloham</span>
              </div>
              <div className="mobile-drawer-contact">
                <span>Direct Consultation: +91 96000 00000</span>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
