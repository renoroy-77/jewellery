import { NextResponse } from 'next/server';
import { PRODUCTS } from '@/data/products';
import { productsService } from '@/services/productsService';
import { siteConfig } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const liveProducts = await productsService.getAll().catch(() => []);
  const products = liveProducts.length > 0 ? liveProducts : PRODUCTS;

  const itemsXml = products
    .map((product) => {
      const fullUrl = `${siteConfig.url}/products/${product.slug}`;
      const rawImg = product.images?.[0] || '/assets/prod_ganesha_hq.webp';
      const imgUrl = rawImg.startsWith('http')
        ? rawImg
        : `${siteConfig.url}${rawImg.startsWith('/') ? rawImg : `/${rawImg}`}`;

      const price = Number(product.price || 0);
      const isFreeShipping = price >= 999;
      const cleanDesc = (product.description || 'Authentic Panchaloham consecrated temple jewellery.').slice(0, 500);

      return `    <item>
      <g:id>${escapeXml(String(product.id))}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(cleanDesc)}</g:description>
      <g:link>${escapeXml(fullUrl)}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
      <g:availability>${product.inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${price}.00 INR</g:price>
      <g:brand>Aamadappetti</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>188</g:google_product_category>
      <g:product_type>Jewellery &gt; ${escapeXml(product.category || 'Pendants')}</g:product_type>
      <g:material>Panchaloham Five-Metal Alloy</g:material>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Sanctum Delivery</g:service>
        <g:price>${isFreeShipping ? '0.00' : '99.00'} INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
