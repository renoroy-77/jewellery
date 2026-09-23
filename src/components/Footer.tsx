'use client';

import React, { useState, useEffect } from 'react';
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
  MessageCircle,
} from 'lucide-react';
import { siteConfig } from '@/lib/seo';
import { useTranslation } from '@/context/LanguageContext';
import { cmsService } from '@/services/cmsService';
import { FooterCMS, INITIAL_FOOTER_CMS } from '@/data/cmsData';

export default function Footer() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [footerData, setFooterData] = useState<FooterCMS>(INITIAL_FOOTER_CMS);

  useEffect(() => {
    cmsService
      .getFooter()
      .then((data) => {
        if (data) setFooterData(data);
      })
      .catch(() => {});
  }, []);

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
                src={footerData.brandLogo || '/assets/brand_logo_gold.webp'}
                alt="Aamadappetti (Amadapetti) Panchaloham Temple Jewellery"
                title="Aamadappetti (Amadapetti) Panchaloham Temple Jewellery"
                className="footer-logo-img"
                width={180}
                height={48}
              />
            </Link>
            <p className="footer-tagline-text">
              {footerData.brandTagline || t('footer.tagline', 'Faith. Tradition. Timeless Beauty.')}
            </p>

            <div className="social-links" aria-label="Social Media Links">
              <a
                href={footerData.socialLinks?.instagram || siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href={footerData.socialLinks?.facebook || siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="Facebook"
              >
                <Facebook size={17} />
              </a>
              <a
                href={footerData.socialLinks?.youtube || siteConfig.socials.youtube || 'https://www.youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="YouTube"
              >
                <Youtube size={17} />
              </a>
              <a
                href={footerData.socialLinks?.pinterest || siteConfig.socials.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn"
                aria-label="Pinterest"
              >
                <Flower2 size={17} />
              </a>
              {footerData.whatsapp && (
                <a
                  href={`https://wa.me/${footerData.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-btn"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={17} />
                </a>
              )}
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
                <Link href="/collections/pooja-items">Ritual Essentials</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/blog">Blog &amp; Journal</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div>
            <h3 className="footer-col-title">Customer Care &amp; Policies</h3>
            <ul className="footer-links">
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/refunds-and-cancellations">Refunds &amp; Cancellations</Link>
              </li>
              <li>
                <Link href="/shipping-policy">Shipping Policy</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/#faq-section">FAQs</Link>
              </li>
              <li>
                <Link href="/about#size-guide">Size Guide</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="footer-col-title">Contact Us</h3>
            <div className="footer-contact-item">
              <MapPin size={18} className="footer-contact-icon" />
              <span>{footerData.address || 'Ships Worldwide · India'}</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} className="footer-contact-icon" />
              <a href={`mailto:${footerData.email || 'support@aamadappetti.com'}`} style={{ color: 'inherit' }}>
                {footerData.email || 'support@aamadappetti.com'}
              </a>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} className="footer-contact-icon" />
              <a href={`tel:${footerData.phone || '+919600000000'}`} style={{ color: 'inherit' }}>
                {footerData.phone || '+91 96000 00000'}
              </a>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} className="footer-contact-icon" />
              <span>{footerData.sanctumHours || 'Mon - Sat, 9 AM - 6 PM'}</span>
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

        {/* SEO Brand Narrative & Keyword Context (Aamadappetti & Amadapetti) */}
        <div
          className="footer-seo-narrative"
          style={{
            marginTop: '36px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(212, 175, 55, 0.15)',
            fontSize: '0.8rem',
            lineHeight: '1.7',
            color: 'rgba(255, 255, 255, 0.65)',
          }}
        >
          <h4
            style={{
              fontSize: '0.88rem',
              color: 'var(--gold, #d4af37)',
              marginBottom: '8px',
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              letterSpacing: '0.04em',
              fontWeight: 600,
            }}
          >
            About Aamadappetti (Amadapetti) Panchaloham Temple Jewellery
          </h4>
          <p style={{ margin: 0 }}>
            Aamadappetti (also searched as Amadapetti or ஆமடைப்பெட்டி) is India’s premier sanctum for authentic Agamic <strong>Panchaloham temple jewellery</strong>. Cast in the canonical five-metal sacred alloy (Gold, Silver, Copper, Zinc, and Iron), each consecrated piece is crafted under traditional Vedic metallurgical guidelines. Devotees seeking genuine <em>Aamadappetti</em> or <em>Amadapetti jewellery</em> can explore our sanctum-energized Lord Ganesha pendants, Lord Murugan Vel lockets, Shiva Trishul pendants, Mahalakshmi talismans, Ayurvedic Panchaloham kadas, and custom temple wedding thali collections. Every creation is certified, consecrated with Vedic mantras, and delivered securely across India and worldwide.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>{footerData.copyrightText || '© 2026 Aamadappetti. All rights reserved.'}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(212, 175, 55, 0.85)' }}>
              Aamadappetti is owned and operated by <strong>Janki Design</strong>.
            </div>
          </div>
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
