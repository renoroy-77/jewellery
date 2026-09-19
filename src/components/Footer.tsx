'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Flower2,
  Heart,
} from 'lucide-react';
import { siteConfig } from '@/lib/seo';
import { useTranslation } from '@/context/LanguageContext';

export default function Footer() {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer-main" aria-label="Site Footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand & Social */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-logo-link" aria-label="Aamadappetti Home">
              <img
                src="/assets/brand_logo_gold.png"
                alt="aamadappetti PANCHALOHAM JEWELLERY"
                className="footer-logo-img"
              />
            </Link>
            <p className="footer-tagline-text">
              {t('footer.tagline', 'Faith. Tradition. Timeless Beauty.')}
            </p>

            <div className="social-links" aria-label="Social Media Links">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="Facebook"
              >
                <Facebook size={17} />
              </a>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="YouTube"
              >
                <Youtube size={17} />
              </a>
              <a
                href={siteConfig.socials.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="Pinterest"
              >
                <Flower2 size={17} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="footer-col-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/collections">Collections</Link>
              </li>
              <li>
                <Link href="/collections">Sacred Jewellery</Link>
              </li>
              <li>
                <Link href="/collections/pooja-essentials">Ritual Essentials</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/blog">Blog & Journal</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="footer-col-title">Customer Care</h3>
            <ul className="footer-links">
              <li>
                <Link href="/shipping-policy">Shipping Policy</Link>
              </li>
              <li>
                <Link href="/shipping-policy">Return &amp; Exchange</Link>
              </li>
              <li>
                <Link href="/#faq-section">FAQs</Link>
              </li>
              <li>
                <Link href="/about#size-guide">Size Guide</Link>
              </li>
              <li>
                <Link href="/contact">Track Order</Link>
              </li>
              <li>
                <Link href="/shipping-policy">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/shipping-policy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="footer-col-title">Contact Us</h3>
            <div className="footer-contact-item">
              <MapPin size={18} className="footer-contact-icon" />
              <span>Ships Worldwide · India</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} className="footer-contact-icon" />
              <a href="mailto:support@aamaclappetti.in" style={{ color: 'inherit' }}>
                support@aamaclappetti.in
              </a>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} className="footer-contact-icon" />
              <a href="tel:+919600000000" style={{ color: 'inherit' }}>
                +91 96000 00000
              </a>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} className="footer-contact-icon" />
              <span>Mon - Sat, 9 AM - 6 PM</span>
            </div>
          </div>

          {/* Column 5: Temple Emblem */}
          <div className="footer-emblem-col">
            <div className="footer-temple-badge">
              <Flower2 size={24} color="#d4af37" style={{ margin: '0 auto 8px', display: 'block' }} />
              <div className="emblem-title">Divine Jewellery</div>
              <div className="emblem-sub">for a Better Tomorrow</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>© 2026 AamaClappetti. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Made with</span>
            <Heart size={13} color="#f5d77f" fill="#f5d77f" />
            <span>for Devotion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
