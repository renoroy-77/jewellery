import { MetadataRoute } from 'next';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { BLOG_POSTS } from '@/data/blog';
import { siteConfig } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Primary static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/collections`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/authenticity`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${siteConfig.url}/collections/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic product routes
  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic blog routes
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
