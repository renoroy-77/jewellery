import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

const disallowedPaths = [
  '/admin',
  '/admin/*',
  '/checkout',
  '/checkout/*',
  '/cart',
  '/account',
  '/account/*',
  '/profile',
  '/profile/*',
  '/order-success',
  '/login',
  '/api/admin/orders',
  '/api/admin/users',
  '/api/admin/bookings',
  '/api/inquiries',
];

const allowedPublicApis = [
  '/',
  '/api/products',
  '/api/categories',
  '/api/cms/*',
  '/api/admin/content',
  '/api/admin/translations',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: allowedPublicApis,
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Googlebot',
        allow: allowedPublicApis,
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: 'aamadappetti.com',
  };
}

