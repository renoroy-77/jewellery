'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/data/products';
import { useTranslation } from '@/context/LanguageContext';

const CATEGORY_IMAGES: Record<string, string> = {
  ganesha: '/assets/cat_ganesha_hq.webp',
  murugan: '/assets/cat_murugan_hq.webp',
  shiva: '/assets/cat_shiva_hq.webp',
  lakshmi: '/assets/cat_lakshmi_hq.webp',
  devi: '/assets/cat_devi_hq.webp',
  spiritual: '/assets/prod_om.png',
  chains: '/assets/prod_chain_hq.webp',
};

// Filter out bracelets, rings, and pooja-essentials as requested
const EXCLUDED_IDS = ['bracelets', 'rings', 'pooja'];
const FEATURED_COLLECTIONS = CATEGORIES.filter((c) => !EXCLUDED_IDS.includes(c.id));

// Timing intervals: auto-slide every 3.2s, pause for 4s on manual click/swipe
const CAROUSEL_INTERVAL_MS = 3200;
const USER_CLICK_PAUSE_MS = 4000;

export default function CategorySlider() {
  const { t, locale } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Total items in carousel (7 collections + 1 "View All" card)
  const totalSlides = FEATURED_COLLECTIONS.length + 1;

  // Track scroll position to update active indicator
  const handleScroll = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const scrollLeft = slider.scrollLeft;
    const firstCard = slider.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth + 48 : 200;
    const index = Math.round(scrollLeft / cardWidth);
    const clampedIndex = Math.min(Math.max(0, index), totalSlides - 1);
    setActiveIndex(clampedIndex);
  }, [totalSlides]);

  // Smoothly scroll to a specific slide
  const scrollToSlide = useCallback((index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cards = slider.children;
    if (cards[index]) {
      const card = cards[index] as HTMLElement;
      const isDesktop = slider.offsetWidth > 900;
      const targetScroll = isDesktop
        ? card.offsetLeft - 12
        : card.offsetLeft;
      slider.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setActiveIndex(index);
    }
  }, []);

  // Pause auto-sliding on manual click/swipe and give full interval before resuming
  const pauseAutoPlay = useCallback(() => {
    setIsInteracting(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, USER_CLICK_PAUSE_MS);
  }, []);

  const handleNextClick = useCallback(() => {
    pauseAutoPlay();
    const nextIndex = (activeIndexRef.current + 1) % totalSlides;
    scrollToSlide(nextIndex);
  }, [pauseAutoPlay, scrollToSlide, totalSlides]);

  const handlePrevClick = useCallback(() => {
    pauseAutoPlay();
    const prevIndex = (activeIndexRef.current - 1 + totalSlides) % totalSlides;
    scrollToSlide(prevIndex);
  }, [pauseAutoPlay, scrollToSlide, totalSlides]);

  const handleDotClick = (index: number) => {
    pauseAutoPlay();
    scrollToSlide(index);
  };

  // Automatic slide rotation: 01 -> 02 -> 03 -> ...
  useEffect(() => {
    if (isHovered || isInteracting) return;
    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % totalSlides;
      scrollToSlide(nextIndex);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isHovered, isInteracting, scrollToSlide, totalSlides]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const handleTouchStart = () => {
    pauseAutoPlay();
  };

  const handleTouchEnd = () => {
    pauseAutoPlay();
  };

  return (
    <section className="categories-section section-padding" aria-labelledby="collections-heading">
      <div className="container">
        <div className="categories-header-row">
          <div>
            <div className="section-kicker">{t('categories.kicker', 'SHOP BY JEWELLERY')}</div>
            <h2 id="collections-heading" className="section-title">
              {t('categories.title', 'Sacred Jewellery Collections')}
            </h2>
          </div>

          {/* Desktop Only: View All Categories link */}
          <Link href="/collections" className="view-all-link category-view-all-desktop">
            <span>{t('categories.view_all', 'View All Categories')}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile Swipe Hint Cue */}
        <div className="category-mobile-cue" aria-hidden="true">
          <Sparkles size={13} className="cue-sparkle" />
          <span>Swipe to explore collections</span>
          <span className="cue-arrow">→</span>
        </div>

        {/* Carousel Container */}
        <div
          className="category-slider-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Desktop Navigation Arrows */}
          <button
            type="button"
            className="slider-arrow-btn slider-arrow-prev"
            onClick={handlePrevClick}
            aria-label="Previous categories"
          >
            <ChevronLeft size={22} />
          </button>

          <div
            ref={sliderRef}
            className="category-row-five"
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
          >
            {FEATURED_COLLECTIONS.map((cat, index) => {
              const isActive = index === activeIndex;

              return (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  className={`category-card-five ${isActive ? 'active-card' : ''}`}
                  title={`Explore ${cat.name}`}
                  onClick={pauseAutoPlay}
                >
                  <div className="category-circle-wrapper-five">
                    <div className="category-circle-inner-five">
                      <img
                        src={CATEGORY_IMAGES[cat.id] || cat.image}
                        alt={cat.name}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <span className="category-name-five">{cat.name}</span>
                </Link>
              );
            })}

            {/* "View All" circle at the end of the carousel */}
            <Link
              href="/collections"
              className="category-card-five category-card-viewall"
              title="Explore All Jewellery Collections"
              onClick={pauseAutoPlay}
            >
              <div className="category-circle-wrapper-five viewall-circle">
                <div className="category-circle-inner-five viewall-inner">
                  <ArrowRight size={24} className="viewall-icon" />
                </div>
              </div>
              <span className="category-name-five viewall-name">View All</span>
            </Link>
          </div>

          <button
            type="button"
            className="slider-arrow-btn slider-arrow-next"
            onClick={handleNextClick}
            aria-label="Next categories"
          >
            <ChevronRight size={22} />
          </button>

          {/* Carousel Indicator Dots */}
          <div className="category-carousel-dots" aria-label="Category slides">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`category-dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to category slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

