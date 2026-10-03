import { MetadataRoute } from 'next';
import { CATEGORIES, DEITY_COLLECTIONS, PRODUCTS } from '@/data/products';
import { BLOG_POSTS } from '@/data/blog';
import { siteConfig } from '@/lib/seo';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';

export const revalidate = 3600; // Cache sitemap for 1 hour for fast, stable crawler delivery


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Primary static indexable pages
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
      url: `${siteConfig.url}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/terms-and-conditions`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/refunds-and-cancellations`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Dynamic category & deity collection routes from live backend with fallback to static categories
  const liveCategories = await categoriesService.getAll().catch(() => []);
  const activeCategories = liveCategories.length > 0 ? liveCategories : CATEGORIES;
  const allCategorySlugs = [
    ...activeCategories.map((c) => c.slug || c.id),
    ...DEITY_COLLECTIONS.map((d) => d.slug),
  ];
  const uniqueCategorySlugs = Array.from(new Set(allCategorySlugs.filter(Boolean)));

  const categoryRoutes: MetadataRoute.Sitemap = uniqueCategorySlugs.map((slug) => ({
    url: `${siteConfig.url}/collections/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic product routes from live backend with fallback to static catalog
  const liveProducts = await productsService.getAll().catch(() => []);
  const activeProducts = liveProducts.length > 0 ? liveProducts : PRODUCTS;
  const productRoutes: MetadataRoute.Sitemap = activeProducts.map((product) => ({
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
