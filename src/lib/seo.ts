import { Metadata } from 'next';
import { Product, BreadcrumbItem, FAQItem } from '@/types';

export const siteConfig = {
  name: 'Aamadappetti | Authentic Panchaloham Temple Jewellery',
  shortName: 'Aamadappetti',
  alternateNames: ['Amadapetti', 'Amadappetti', 'Aamadapetti', 'ஆமடைப்பெட்டி', 'ஆமடப்பெட்டி'],
  tagline: 'Divine Beauty, Timeless Tradition - Adorn Your Faith',
  description:
    'Aamadappetti (Amadapetti) – Authentic Panchaloham temple jewellery, sacred deity pendants, consecration chains & kadas crafted in pure 5 metals.',
  url: 'https://aamadappetti.com',
  ogImage: '/assets/brand_logo_gold.png',
  locale: 'en_IN',
  telephone: '+91 96000 00000',
  email: 'support@aamadappetti.com',
  address: {
    streetAddress: 'Temple Road, Heritage Lane',
    addressLocality: 'Madurai & Paravur',
    addressRegion: 'Tamil Nadu & Kerala',
    postalCode: '625001',
    addressCountry: 'IN',
  },
  socials: {
    instagram: 'https://instagram.com/aamadappetti',
    facebook: 'https://facebook.com/aamadappetti',
    youtube: 'https://www.youtube.com',
    pinterest: 'https://pinterest.com/aamadappetti',
  },
  currenciesAccepted: 'INR, USD, AED, GBP, EUR',
  paymentAccepted: 'Credit Card, Debit Card, UPI, Net Banking',
  priceRange: '₹999 - ₹25,000',
};

export const TARGET_KEYWORDS = [
  // Core Brand Queries (Primary & Phonetic Variations)
  'aamadappetti',
  'amadapetti',
  'amadappetti',
  'aamadapetti',
  'aamadappetti jewellery',
  'amadapetti jewellery',
  'aamadappetti panchaloham',
  'amadapetti panchaloham',
  'aamadappetti online',
  'amadapetti online store',
  'aamadappetti website',
  'amadapetti shop',
  'ஆமடைப்பெட்டி',
  'ஆமடப்பெட்டி',

  // High-Volume Category & Temple Jewellery Queries (Ubersuggest Verified)
  'south indian temple jewellery',
  'south indian temple jewellery set',
  'Panchaloham jewellery',
  'authentic panchaloha idols',
  'temple jewellery online',
  'consecration chains and kadas',
  'sanctified rings',
  'pooja essentials',
  'spiritual jewellery India',
  'sanctum consecrated jewellery',

  // Ganesha High-Volume Queries (3.6K+ Volume)
  'ganesha pendant gold',
  'ganpati pendant gold',
  'ganesh locket gold',
  'gold locket ganesh',
  'ganesh pendant silver',
  'ganpati locket gold',
  '22k gold ganesh pendant',
  'Lord Ganesha gold pendant',

  // Lakshmi High-Volume Queries (2.4K+ Volume)
  'lakshmi pendant gold',
  'laxmi pendant gold',
  'gold laxmi pendant',
  'lakshmi dollar chain',
  'female lakshmi pendant designs in gold',
  '5 gram gold lakshmi pendant',
  '8 gram gold lakshmi pendant',
  'lakshmi devi lockets gold',
  'lakshmi pendant necklace',
  'laxmi pendant necklace',
  'mangalsutra with lakshmi pendant',
  'Lakshmi deity pendant',

  // Murugan & Shiva Sacred Queries
  'Murugan Vel pendant',
  'vel locket gold',
  'Shiva Lingam panchaloham',
  'five metal gold pendant',
  'sacred gifts',
];

export function constructMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  canonicalUrl,
  noIndex = false,
  keywords = TARGET_KEYWORDS,
}: {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  keywords?: string[];
} = {}): Metadata {
  let fullTitle = title || 'Aamadappetti (Amadapetti) | Panchaloham Temple Jewellery';
  if (title && !title.includes('Aamadappetti') && !title.includes('Amadapetti')) {
    fullTitle = `${title} | Aamadappetti`;
  }

  // Keep meta descriptions within 70 to 155 characters for optimal Google & Screaming Frog SERP display
  let cleanDescription = description;
  if (cleanDescription.length > 155) {
    cleanDescription = `${cleanDescription.slice(0, 152).trim()}...`;
  }
  
  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${siteConfig.url}${image.startsWith('/') ? image : `/${image}`}`;

  const canonical = canonicalUrl
    ? `${siteConfig.url}${canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`}`
    : siteConfig.url;

  return {
    title: fullTitle,
    description: cleanDescription,
    keywords,
    authors: [{ name: 'Aamadappetti Sanctum Goldsmiths' }],
    creator: 'Aamadappetti',
    publisher: 'Aamadappetti Panchaloham Jewellery',
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical,
      languages: {
        'en-IN': canonical,
        'en': canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: 'Aamadappetti (Amadapetti) Panchaloham Jewellery',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: `${fullTitle} - Aamadappetti / Amadapetti`,
        },
      ],
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteImageUrl],
      creator: '@aamadappetti',
      site: '@aamadappetti',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      ],
      shortcut: '/favicon.ico',
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['JewelryStore', 'OnlineStore', 'Organization'],
    '@id': `${siteConfig.url}#organization`,
    name: 'Aamadappetti Panchaloham Jewellery',
    legalName: 'Aamadappetti Panchaloham Crafts Private Limited',
    alternateName: siteConfig.alternateNames,
    url: siteConfig.url,
    logo: `${siteConfig.url}/assets/brand_logo_gold.png`,
    image: `${siteConfig.url}/assets/brand_logo_gold.png`,
    description: siteConfig.description,
    telephone: siteConfig.telephone,
    email: siteConfig.email,
    priceRange: siteConfig.priceRange,
    currenciesAccepted: 'INR',
    paymentAccepted: siteConfig.paymentAccepted,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '9.9252',
      longitude: '78.1198',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      siteConfig.socials.instagram,
      siteConfig.socials.facebook,
      siteConfig.socials.youtube,
      siteConfig.socials.pinterest,
    ],
  };
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}#website`,
    name: 'Aamadappetti',
    alternateName: siteConfig.alternateNames,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/collections?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) =>
      img.startsWith('http') ? img : `${siteConfig.url}${img.startsWith('/') ? img : `/${img}`}`
    ),
    description: product.description,
    sku: product.id,
    mpn: `AAP-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Aamadappetti',
      alternateName: 'Amadapetti',
    },
    material: 'Panchaloham (Gold, Silver, Copper, Zinc, Iron alloy)',
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Aamadappetti Panchaloham Jewellery',
        alternateName: 'Amadapetti',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewsCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Metal Purity',
        value: product.metalComposition?.purityCertificate || 'Panchaloham Consecrated Alloy',
      },
      {
        '@type': 'PropertyValue',
        name: 'Deity Association',
        value: product.deity,
      },
      {
        '@type': 'PropertyValue',
        name: 'Dimensions',
        value: product.dimensions || 'Standard',
      },
      {
        '@type': 'PropertyValue',
        name: 'Weight',
        value: product.weight || 'Approx. 18g',
      },
    ],
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http')
        ? item.url
        : `${siteConfig.url}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

export function getFaqSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

