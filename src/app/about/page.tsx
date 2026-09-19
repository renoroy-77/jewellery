import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Award, ShieldCheck, Sparkles, Flame, Droplets, Mountain, Wind, Shield, ChevronRight } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = constructMetadata({
  title: 'Our Heritage & The Panchaloham Craft | Aamaclappetti',
  description:
    'Discover the ancient history of five-metal Panchaloham temple jewellery handcrafted by generational sthapatis. Sacred jewellery for every devotee.',
  canonicalUrl: '/about',
});

export default function AboutPage() {
  const METALS = [
    {
      name: 'Gold (Pon)',
      element: 'Fire / Agni',
      planet: 'Sun (Surya)',
      symbol: 'Au',
      icon: Flame,
      color: '#dfba6c',
      desc: 'Infuses solar vitality, divine consciousness, and spiritual radiance into the aura.',
    },
    {
      name: 'Silver (Velli)',
      element: 'Water / Jala',
      planet: 'Moon (Chandra)',
      symbol: 'Ag',
      icon: Droplets,
      color: '#e2e8f0',
      desc: 'Cooling lunar vibrations that soothe emotional turmoil, providing peace and mental poise.',
    },
    {
      name: 'Copper (Chembu)',
      element: 'Earth / Prithvi',
      planet: 'Mars (Mangal)',
      symbol: 'Cu',
      icon: Mountain,
      color: '#d97736',
      desc: 'Grounds bio-electric energy, stimulates physical stamina, and dispels sluggish inertia.',
    },
    {
      name: 'Brass / Zinc (Pithalai)',
      element: 'Ether / Akasha',
      planet: 'Mercury (Budha)',
      symbol: 'Zn',
      icon: Wind,
      color: '#e5c07b',
      desc: 'Enhances subtle communication, cognitive perception, and harmonic bio-rhythms.',
    },
    {
      name: 'Iron (Irumbu)',
      element: 'Air / Vayu',
      planet: 'Saturn (Shani)',
      symbol: 'Fe',
      icon: Shield,
      color: '#94a3b8',
      desc: 'Forms an impermeable electromagnetic shield against psychic negativity and malefic evil eye.',
    },
  ];

  const CRAFT_STEPS = [
    {
      step: '01',
      title: 'Sacred Shilpa Shastra Dhyana',
      desc: 'Every design begins with scriptural meditation, ensuring the deity’s lakshanas (divine proportions) strictly align with temple Agama Shastras.',
    },
    {
      step: '02',
      title: 'Beeswax Master Sculpting',
      desc: 'Master Sthapatis hand-carve intricate details into pure forest beeswax mixed with Dammar tree resin, creating an irreplaceable bespoke prototype.',
    },
    {
      step: '03',
      title: 'Sacred Clay Mold Baking',
      desc: 'The wax model is enveloped in seven layers of alluvial clay sourced from holy riverbanks, dried under the sun, and baked in traditional kilns.',
    },
    {
      step: '04',
      title: 'Crucible Pouring at 1,080°C',
      desc: 'The five sacred metals are melted in exact proportions in graphite crucibles. As liquid gold alloy flows in, the wax melts away (Lost-Wax casting).',
    },
    {
      step: '05',
      title: 'Master Chiseling & Goldsmithing',
      desc: 'Once cooled, the clay is shattered. Artisans spend over 40 hours hand-chiseled each divine attribute with micro-tools to mirror temple icons.',
    },
    {
      step: '06',
      title: 'Prana Pratishtha Temple Consecration',
      desc: 'Before packing, each piece is energized before temple sanctums with holy theertham and Vedic chant invocations, awakening its spiritual resonance.',
    },
  ];

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
            <span className="section-kicker">ESTD. 1984 • SACRED JEWELLERY GOLDSMITHING</span>
            <h1 className="about-hero-title">The Sacred Legacy of Aamaclappetti</h1>
            <p className="about-hero-lead">
              For four decades, our sanctum artisans have guarded the timeless Vedic metallurgy of authentic <strong>Panchaloham</strong> — uniting cosmic energies, sacred heritage, and heirloom temple goldsmithing.
            </p>
          </div>
          <div className="about-hero-image-wrap">
            <img
              src="/assets/imagetressary.png"
              alt="Aamaclappetti Master Sthapati Workshop"
              className="about-hero-img"
              loading="eager"
            />
          </div>
        </div>

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
            {METALS.map((metal, idx) => {
              const Icon = metal.icon;
              return (
                <div key={idx} className="metal-card">
                  <div className="metal-icon-circle" style={{ borderColor: metal.color }}>
                    <Icon size={24} style={{ color: metal.color }} />
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
            {CRAFT_STEPS.map((step, idx) => (
              <div key={idx} className="craft-step-card">
                <div className="craft-step-num">{step.step}</div>
                <h3 className="craft-step-title">{step.title}</h3>
                <p className="craft-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

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
