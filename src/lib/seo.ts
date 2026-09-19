import { Metadata } from 'next';
import { Product, BreadcrumbItem, FAQItem } from '@/types';

export const siteConfig = {
  name: 'Aamaclappetti | Panchaloham Temple Jewellery',
  shortName: 'AamaClappetti',
  tagline: 'Divine Beauty, Timeless Tradition - Adorn Your Faith',
  description:
    'Discover authentic handcrafted Panchaloham temple jewellery, sacred deity pendants (Ganesha, Murugan, Shiva, Lakshmi), consecration-grade divine chains, bracelets & pooja essentials.',
  url: 'https://aamaclappetti.in',
  ogImage: '/assets/imagetressary.png',
  locale: 'en_IN',
  telephone: '+91 96000 00000',
  email: 'support@aamaclapetti.in',
  address: {
    streetAddress: 'Temple Road, Heritage Lane',
    addressLocality: 'North Paravoor',
    addressRegion: 'Kerala',
    postalCode: '683513',
    addressCountry: 'IN',
  },
  socials: {
    instagram: 'https://instagram.com/aamaclappetti',
    facebook: 'https://facebook.com/aamaclappetti',
    youtube: 'https://youtube.com/@aamaclappetti',
    pinterest: 'https://pinterest.com/aamaclappetti',
  },
  currenciesAccepted: 'INR, USD, AED, GBP, EUR',
  paymentAccepted: 'Credit Card, Debit Card, UPI, Net Banking',
  priceRange: '₹999 - ₹25,000',
};

export function constructMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  canonicalUrl,
  noIndex = false,
  keywords = [
    'Panchaloham jewellery',
    'temple jewellery online',
    'five metal gold pendant',
    'Lord Ganesha gold pendant',
    'Murugan Vel pendant',
    'Shiva Lingam panchaloham',
    'Lakshmi deity pendant',
    'authentic panchaloha idols',
    'spiritual jewellery India',
    'sacred gifts',
    'Aamaclappetti jewellery',
  ],
}: {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  keywords?: string[];
} = {}): Metadata {
  const fullTitle = title
    ? `${title} | Aamaclappetti Panchaloham Jewellery`
    : `${siteConfig.name} - ${siteConfig.tagline}`;
  
  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${siteConfig.url}${image}`;

  const canonical = canonicalUrl
    ? `${siteConfig.url}${canonicalUrl}`
    : siteConfig.url;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: 'AamaClappetti Artisans' }],
    creator: 'AamaClappetti',
    publisher: 'Aamaclappetti Panchaloham Jewellery',
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
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
      creator: '@aamaclappetti',
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
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: siteConfig.name,
    legalName: 'Aamaclappetti Panchaloham Crafts Private Limited',
    alternateName: 'AamaClappetti',
    url: siteConfig.url,
    logo: `${siteConfig.url}/assets/imagetressary.png`,
    image: `${siteConfig.url}/assets/imagetressary.png`,
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
      latitude: '10.1437',
      longitude: '76.2298',
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
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
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
      img.startsWith('http') ? img : `${siteConfig.url}${img}`
    ),
    description: product.description,
    sku: product.id,
    mpn: `ACP-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Aamaclappetti',
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
        name: 'Aamaclappetti Panchaloham Jewellery',
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
        value: product.metalComposition.purityCertificate,
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
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
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
