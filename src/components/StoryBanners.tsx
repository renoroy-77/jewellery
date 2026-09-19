'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cmsService } from '@/services/cmsService';
import { INITIAL_STORY_BANNERS, StoryBannerCMS } from '@/data/cmsData';

export default function StoryBanners() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<StoryBannerCMS[]>(INITIAL_STORY_BANNERS);

  useEffect(() => {
    cmsService
      .getStoryBanners()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic story banners from backend:', err);
      });
  }, []);

  return (
    <section className="story-banners-section section-padding" aria-label="Heritage and Gifting Stories">
      <div className="container">
        <div className="story-grid">
          {banners.map((banner, idx) => (
            <div key={banner.id || idx} className="story-card">
              <img
                src={banner.image}
                alt={banner.title}
                className="story-bg-img"
              />
              <div className="story-content">
                <h2 className="story-card-title">{banner.title}</h2>
                <p className="story-card-desc">{banner.desc}</p>
                <Link href={banner.ctaLink || '/collections'} className="banner-cta-btn">
                  <span>{banner.ctaText || 'Explore'}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
