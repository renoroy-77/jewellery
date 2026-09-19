import React from 'react';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import FeaturedProducts from '@/components/FeaturedProducts';
import StoryBanners from '@/components/StoryBanners';
import TrustBadges from '@/components/TrustBadges';
import FaqSection from '@/components/FaqSection';
import Newsletter from '@/components/Newsletter';
import JsonLd from '@/components/JsonLd';
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo';

export default function HomePage() {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <>
      {/* Schema.org Structured Data for SEO */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />

      {/* Hero Section */}
      <Hero />

      {/* Shop By Category (Divine Collections) */}
      <CategorySlider />

      {/* Featured Products with Category Tabs */}
      <FeaturedProducts />

      {/* Heritage Story Banners */}
      <StoryBanners />

      {/* Value Propositions & Guarantees */}
      <TrustBadges />

      {/* Frequently Asked Questions with FAQPage Schema */}
      <FaqSection />

      {/* Newsletter Subscription */}
      <Newsletter />
    </>
  );
}
