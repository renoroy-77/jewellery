'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Flower2, ShieldCheck, Truck, Gift } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cmsService } from '@/services/cmsService';

const HERO_SLIDES = [
  {
    id: 1,
    kicker: 'DIVINE BEAUTY, TIMELESS TRADITION',
    titleLine1: 'Adorn',
    titleLine2: 'Your Faith',
    subtitle: 'Authentic Panchaloham jewellery, crafted for every spiritual journey.',
    ctaText: 'Shop Now',
    ctaLink: '/collections',
    tag: 'FAITH IN EVERY DETAIL',
    image: '/assets/hero_slide_1.webp',
    mobileImage: '/assets/hero_slide_1_mobile.webp',
  },
  {
    id: 2,
    kicker: 'SACRED FIVE-METAL ALLOY',
    titleLine1: 'Consecrated',
    titleLine2: 'Divine Purity',
    subtitle: 'Infused with Vedic mantras and temple sanctum blessings.',
    ctaText: 'Explore Deities',
    ctaLink: '/collections/ganesha-jewellery',
    tag: 'VEDIC TEMPLE CRAFT',
    image: '/assets/hero_slide_2.webp',
    mobileImage: '/assets/hero_slide_2_mobile.webp',
  },
  {
    id: 3,
    kicker: 'SACRED TEMPLE ARTISAN HEIRLOOMS',
    titleLine1: 'Generational',
    titleLine2: 'Agamic Art',
    subtitle: 'Crafted by master sthapatis preserving ancient metallurgy.',
    ctaText: 'Discover Heritage',
    ctaLink: '/about',
    tag: 'HALLMARKED PURITY',
    image: '/assets/hero_slide_3.webp',
    mobileImage: '/assets/hero_slide_3_mobile.webp',
  },
];

const AUTO_PLAY_INTERVAL = 4000; // 4 seconds per slide

export default function Hero() {
  const { t } = useTranslation();
  const [slides, setSlides] = useState(HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    cmsService
      .getHeroSlides()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic hero slides from backend:', err);
      });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Automatic slide rotation
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, currentSlide, slides.length]);

  const slide = slides[currentSlide] || slides[0];

  return (
    <section
      className="hero-banner-section"
      aria-label="Aamadappetti Hero Spotlight"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Background Image Layers with Smooth Cinematic Crossfade */}
      <div className="hero-bg-carousel">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`hero-bg-slide ${idx === currentSlide ? 'active' : ''}`}
            aria-hidden={idx !== currentSlide}
          >
            <picture className="hero-picture">
              <source media="(max-width: 768px)" srcSet={s.mobileImage} />
              <img
                src={s.image}
                alt={`${s.titleLine1} ${s.titleLine2}`}
                className="hero-slide-img"
                loading="eager"
              />
            </picture>
          </div>
        ))}
        {/* Subtle Vignette Overlay to ensure text readability while keeping the imagery full-size & vibrant */}
        <div className="hero-vignette-overlay" />
      </div>

      <div className="container hero-inner-container">
        {/* Left Column: Typography, CTAs & Trust Badges */}
        <div className="hero-left-content" key={slide.id}>
          <div className="hero-tagline-kicker">
            <span className="kicker-gem">✦</span>
            <span>{t(`hero.slide${slide.id}.kicker`, slide.kicker)}</span>
          </div>

          <h1 className="hero-main-title">
            <span className="hero-title-word1">{t(`hero.slide${slide.id}.title1`, slide.titleLine1)}</span>{' '}
            <span className="hero-title-word2">{t(`hero.slide${slide.id}.title2`, slide.titleLine2)}</span>
          </h1>

          <p className="hero-lead-subtitle">{t(`hero.slide${slide.id}.subtitle`, slide.subtitle)}</p>

          <div className="hero-cta-wrapper">
            <Link href={slide.ctaLink} className="hero-action-btn" id="hero-cta-btn">
              <span>{t(`hero.slide${slide.id}.cta`, slide.ctaText)}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* 4 Trust Indicators in a clean row */}
          <div className="hero-trust-bar">
            <div className="hero-trust-pill">
              <Flower2 className="hero-trust-icon" size={20} />
              <span className="hero-trust-label">{t('hero.trust.authentic', '100% Authentic Panchaloham')}</span>
            </div>
            <div className="hero-trust-pill">
              <ShieldCheck className="hero-trust-icon" size={20} />
              <span className="hero-trust-label">{t('hero.trust.trusted', 'Trusted by Thousands')}</span>
            </div>
            <div className="hero-trust-pill">
              <Truck className="hero-trust-icon" size={20} />
              <span className="hero-trust-label">{t('hero.trust.delivery', 'Secure & Fast Delivery')}</span>
            </div>
            <div className="hero-trust-pill">
              <Gift className="hero-trust-icon" size={20} />
              <span className="hero-trust-label">{t('hero.trust.packaging', 'Beautiful Gift Packaging')}</span>
            </div>
          </div>
        </div>

        {/* Right Side Vertical Faith Badge */}
        <div className="hero-right-accent">
          <div className="faith-detail-seal">
            <Flower2 size={26} className="faith-lotus-mark" />
            <div className="faith-seal-text">
              <span>FAITH</span>
              <span>IN EVERY</span>
              <span>DETAIL</span>
            </div>
            <div className="faith-vertical-line" />
          </div>
        </div>

        {/* Bottom Right Slide Indicators & Navigation Controls */}
        <div className="hero-controls-corner">
          <div className="hero-slide-counter">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`slide-num ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>

          {/* Animated active progress bar indicator */}
          <div className="hero-progress-track">
            <div
              key={currentSlide}
              className={`hero-progress-fill ${isPaused ? 'paused' : ''}`}
              style={{
                animationDuration: `${AUTO_PLAY_INTERVAL}ms`,
              }}
            />
          </div>

          {/* Circular Navigation Buttons */}
          <div className="hero-nav-arrows">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="hero-arrow-btn prev-btn"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="hero-arrow-btn next-btn"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
