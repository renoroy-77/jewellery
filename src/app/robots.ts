import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

const disallowedPaths = [
  '/admin',
  '/admin/*',
  '/api/*',
  '/checkout',
  '/checkout/*',
  '/cart',
  '/account',
  '/account/*',
  '/profile',
  '/profile/*',
  '/order-success',
  '/login',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: 'aamadappetti.com',
  };
}
