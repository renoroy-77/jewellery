'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  Sparkles,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Shield,
  ChevronRight,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { cmsService } from '@/services/cmsService';
import { AboutPageCMS, INITIAL_ABOUT_CMS } from '@/data/cmsData';

const METAL_ICONS: Record<string, any> = {
  Gold: Flame,
  Silver: Droplets,
  Copper: Mountain,
  Brass: Wind,
  Zinc: Wind,
  Iron: Shield,
};

function getMetalIcon(name: string) {
  if (name.toLowerCase().includes('gold') || name.toLowerCase().includes('pon')) return Flame;
  if (name.toLowerCase().includes('silver') || name.toLowerCase().includes('velli')) return Droplets;
  if (name.toLowerCase().includes('copper') || name.toLowerCase().includes('chembu')) return Mountain;
  if (name.toLowerCase().includes('iron') || name.toLowerCase().includes('irumbu')) return Shield;
  return Wind;
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutPageCMS>(INITIAL_ABOUT_CMS);

  useEffect(() => {
    cmsService
      .getAbout()
      .then((data) => {
        if (data) setAboutData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="about-page-wrapper section-padding">
      <div className="container">
        {/* Top Navigation Bar */}
        <div className="pdp-top-bar" style={{ marginBottom: '24px' }}>
          <BackButton fallbackUrl="/" label="Back to Home" />

          <nav className="breadcrumb-nav pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span style={{ color: 'var(--gold-light)', fontWeight: 500 }}>
              Our Heritage &amp; Craft
            </span>
          </nav>
        </div>

        {/* Hero Section */}
        <div className="about-hero-card">
          <div className="about-hero-content">
            <span className="section-kicker">
              {aboutData.heroKicker || `ESTD. ${aboutData.establishedYear || '1984'} • SACRED JEWELLERY GOLDSMITHING`}
            </span>
            <h1 className="about-hero-title">
              {aboutData.heroTitle || 'The Sacred Legacy of Aamadappetti'}
            </h1>
            <p className="about-hero-lead">
              {aboutData.heroLead ||
                'For four decades, our sanctum artisans have guarded the timeless Vedic metallurgy of authentic Panchaloham — uniting cosmic energies, sacred heritage, and heirloom temple goldsmithing.'}
            </p>
          </div>
          <div className="about-hero-image-wrap">
            <img
              src="/assets/imagetressary.png"
              alt="Aamadappetti Master Sthapati Workshop"
              className="about-hero-img"
              loading="eager"
            />
          </div>
        </div>

        {/* Legacy Narrative Section */}
        {(aboutData.legacyParagraph1 || aboutData.legacyTitle) && (
          <section className="about-section" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
            <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
              <div className="section-kicker">GENERATIONAL LINEAGE</div>
              <h2 className="section-title" style={{ marginBottom: '18px' }}>
                {aboutData.legacyTitle || 'Preserving Agamic Metallurgy & Temple Artisanship'}
              </h2>
              {aboutData.legacyParagraph1 && (
                <p style={{ fontSize: '1.05rem', lineHeight: '1.75', color: '#e2e8f0', marginBottom: '14px' }}>
                  {aboutData.legacyParagraph1}
                </p>
              )}
              {aboutData.legacyParagraph2 && (
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#cbd5e1' }}>
                  {aboutData.legacyParagraph2}
                </p>
              )}
            </div>
          </section>
        )}

        {/* The 5 Metals Section */}
        <section className="about-section">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="section-kicker">VEDIC METALLURGY &amp; BIO-HARMONY</div>
            <h2 className="section-title">The Five Sacred Elements (Pancha Bhootas)</h2>
            <p style={{ maxWidth: '680px', margin: '10px auto 0', fontSize: '0.96rem' }}>
              Unlike ordinary commercial gold plating, authentic Panchaloham is a sacred bio-energetic conductor uniting five foundational cosmic metals.
            </p>
          </div>

          <div className="metals-grid">
            {aboutData.metals.map((metal, idx) => {
              const Icon = getMetalIcon(metal.name);
              return (
                <div key={idx} className="metal-card">
                  <div className="metal-icon-circle" style={{ borderColor: metal.color || '#dfba6c' }}>
                    <Icon size={24} style={{ color: metal.color || '#dfba6c' }} />
                  </div>
                  <h3 className="metal-name">{metal.name}</h3>
                  <div className="metal-meta">
                    <span>{metal.element}</span> • <span>{metal.planet}</span>
                  </div>
                  <p className="metal-desc">{metal.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Lost-Wax Craft Process */}
        <section className="about-section">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="section-kicker">TIMELESS CRAFTSMANSHIP</div>
            <h2 className="section-title">The 6-Step Sacred Crafting Journey</h2>
            <p style={{ maxWidth: '680px', margin: '10px auto 0', fontSize: '0.96rem' }}>
              Discover how ancient Madhuchhishtavidhana (Lost-Wax Casting) transforms raw consecrated metals into divine heirlooms.
            </p>
          </div>

          <div className="craft-steps-grid">
            {aboutData.craftSteps.map((step, idx) => (
              <div key={idx} className="craft-step-card">
                <div className="craft-step-num">{step.step}</div>
                <h3 className="craft-step-title">{step.title}</h3>
                <p className="craft-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sanctum Atelier Pledge / Quote */}
        {aboutData.sanctumQuote && (
          <div
            style={{
              margin: '40px auto',
              maxWidth: '820px',
              padding: '28px 32px',
              background: 'linear-gradient(135deg, rgba(13, 84, 56, 0.4) 0%, rgba(4, 29, 20, 0.8) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <Sparkles size={28} color="#dfba6c" style={{ margin: '0 auto 12px' }} />
            <blockquote
              style={{
                fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                fontSize: '1.25rem',
                fontStyle: 'italic',
                color: '#fffdf7',
                lineHeight: '1.6',
                margin: '0 0 12px',
              }}
            >
              &ldquo;{aboutData.sanctumQuote}&rdquo;
            </blockquote>
            {aboutData.sanctumQuoteAuthor && (
              <cite style={{ fontSize: '0.86rem', color: '#f5d382', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                — {aboutData.sanctumQuoteAuthor}
              </cite>
            )}
          </div>
        )}

        {/* Guarantees / Quality Pillars */}
        <section className="about-pillars-box">
          <div className="pillar-item">
            <Award size={36} className="pillar-icon" />
            <h4>Assay Hallmarked Authenticity</h4>
            <p>Every piece is certified with government-tested five-metal assay percentage documentation.</p>
          </div>
          <div className="pillar-item">
            <Sparkles size={36} className="pillar-icon" />
            <h4>Sanctum Energized (Prana Pratishtha)</h4>
            <p>Consecrated through ancient temple pooja rituals to channel divine protection and auspiciousness.</p>
          </div>
          <div className="pillar-item">
            <ShieldCheck size={36} className="pillar-icon" />
            <h4>Lifetime Heirloom Guarantee</h4>
            <p>Panchaloham will never peel or crack like fake gold plating; it matures into a lustrous temple patina.</p>
          </div>
        </section>

        {/* Sacred Sizing & Measurement Guide */}
        <section id="size-guide" className="about-section" style={{ paddingTop: '10px' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="section-kicker">PRECISION MEASUREMENT</div>
            <h2 className="section-title">Temple Jewellery Sizing Guide</h2>
            <p style={{ maxWidth: '680px', margin: '10px auto 0', fontSize: '0.96rem' }}>
              Ensure an auspicious, comfortable fit for your consecrated rings, temple chains, and bio-energy kadas.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            <div className="metal-card" style={{ textAlign: 'left' }}>
              <h3 style={{ color: '#f5d77f', fontSize: '1.15rem', marginBottom: '8px' }}>Panchaloham Rings</h3>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                Wrap a string or paper strip snugly around your intended sanctum finger. Measure the length in mm: <strong>52mm = Size 12</strong>, <strong>55mm = Size 15</strong>, <strong>58mm = Size 18</strong>, <strong>62mm = Size 22</strong>.
              </p>
            </div>

            <div className="metal-card" style={{ textAlign: 'left' }}>
              <h3 style={{ color: '#f5d77f', fontSize: '1.15rem', marginBottom: '8px' }}>Ayurvedic &amp; Temple Kadas</h3>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                Standard kada inner diameter is <strong>2.4 (57.2mm)</strong>, <strong>2.6 (60.3mm)</strong>, or <strong>2.8 (63.5mm)</strong>. Open-ended kada designs can be gently flexed for custom wrist contouring.
              </p>
            </div>

            <div className="metal-card" style={{ textAlign: 'left' }}>
              <h3 style={{ color: '#f5d77f', fontSize: '1.15rem', marginBottom: '8px' }}>Consecration Chains</h3>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                Standard lengths: <strong>20 inches</strong> (rests at collarbone), <strong>22 inches</strong> (rests mid-chest, ideal for deity lockets), and <strong>24 inches</strong> (traditional temple length).
              </p>
            </div>
          </div>
        </section>

        {/* Merchant & Legal Business Details Section */}
        <section
          className="about-section"
          style={{
            marginTop: '40px',
            padding: '32px',
            background: 'rgba(10, 36, 25, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="section-kicker">GOVERNANCE &amp; MERCHANT TRANSPARENCY</div>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              Legal Business &amp; Operational Disclosure
            </h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)' }}>
              Aamadappetti is committed to total merchant transparency and compliance with Indian regulatory and payment gateway guidelines.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              fontSize: '0.9rem',
              lineHeight: '1.7',
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            <div style={{ background: 'rgba(212, 175, 55, 0.06)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 600, marginBottom: '4px' }}>Legal Entity &amp; Ownership</div>
              <div>Legal Business Name: <strong style={{ color: '#fff9eb' }}>Athira Rajendran</strong></div>
              <div>Brand / Trade Name: <strong style={{ color: '#fff9eb' }}>Aamadappetti</strong></div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
                Solely operated &amp; managed under traditional artisanal governance.
              </div>
            </div>

            <div style={{ background: 'rgba(212, 175, 55, 0.06)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 600, marginBottom: '4px' }}>Business Category &amp; MCC</div>
              <div>Category: <strong style={{ color: '#fff9eb' }}>Precious &amp; Semi-Precious Jewellery</strong></div>
              <div>Merchant Category Code: <strong style={{ color: '#fff9eb' }}>MCC 5944</strong></div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
                Exclusively finished sacred temple ornaments. No loose/unset diamonds or commodity trading.
              </div>
            </div>

            <div style={{ background: 'rgba(212, 175, 55, 0.06)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 600, marginBottom: '4px' }}>Registered Atelier &amp; Contact</div>
              <div>Eazhaparambil, Edayar, Kannavam P.O.</div>
              <div>Koloyad, Kannur, Kerala – 670650, India</div>
              <div>Email: <a href="mailto:support@aamadappetti.com" style={{ color: '#d4af37' }}>support@aamadappetti.com</a></div>
              <div>Helpline: <a href="tel:+917012732880" style={{ color: '#d4af37' }}>+91 70127 32880</a></div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="about-cta-banner">
          <h2>Adorn Your Faith with Consecrated Gold</h2>
          <p>Explore our handcrafted Ganesha, Murugan, Shiva, and Lakshmi heirloom jewellery.</p>
          <div style={{ marginTop: '24px' }}>
            <Link href="/collections" className="banner-cta-btn">
              Explore All Jewellery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
