import React from 'react';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import FeaturedProducts from '@/components/FeaturedProducts';
import StoryBanners from '@/components/StoryBanners';
import HeritageOverview from '@/components/HeritageOverview';
import TrustBadges from '@/components/TrustBadges';
import FaqSection from '@/components/FaqSection';
import Newsletter from '@/components/Newsletter';
import JsonLd from '@/components/JsonLd';
import { constructMetadata, getOrganizationSchema, getWebsiteSchema } from '@/lib/seo';
import { categoriesService } from '@/services/categoriesService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = constructMetadata();

export default async function HomePage() {
  const initialCategories = await categoriesService.getAll().catch(() => []);
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
      <CategorySlider initialCategories={initialCategories} />

      {/* Featured Products with Category Tabs */}
      <FeaturedProducts />

      {/* Heritage Metallurgy & Panchaloham Sanctuary */}
      <HeritageOverview />

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
