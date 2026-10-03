import { Product, Category } from '@/types';
import { PRODUCTS } from './products';

export interface HeroSlideCMS {
  id: number;
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  tag: string;
  image: string;
  mobileImage: string;
}

export interface StoryBannerCMS {
  id: string;
  title: string;
  desc: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

export interface OrderCMS {
  id: string;
  devoteeName: string;
  email: string;
  phone: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  subtotal?: number;
  shippingFee?: number;
  referralCodeUsed?: string;
  referralDiscount?: number;
  walletDiscount?: number;
  totalAmount: number;
  status: 'Pending' | 'Consecrated' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  date: string;
  trackingNumber?: string;
  paymentMethod: string;
}

export interface AnnouncementCMS {
  freeShippingText: string;
  authenticityText: string;
  worldwideText: string;
  activePromoAlert?: string;
}

export interface FooterCMS {
  brandTagline: string;
  brandLogo: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  sanctumHours: string;
  assuranceNote: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
    pinterest: string;
  };
  copyrightText: string;
}

export interface SacredMetalItem {
  name: string;
  element: string;
  planet: string;
  symbol: string;
  color: string;
  desc: string;
}

export interface CraftStepItem {
  step: string;
  title: string;
  desc: string;
}

export interface AboutPageCMS {
  heroKicker: string;
  heroTitle: string;
  heroLead: string;
  establishedYear: string;
  legacyTitle: string;
  legacyParagraph1: string;
  legacyParagraph2: string;
  metals: SacredMetalItem[];
  craftSteps: CraftStepItem[];
  sanctumQuote: string;
  sanctumQuoteAuthor: string;
}

export const INITIAL_HERO_SLIDES: HeroSlideCMS[] = [
  {
    id: 1,
    kicker: 'DIVINE BEAUTY, TIMELESS TRADITION',
    titleLine1: 'Adorn Your Faith',
    titleLine2: 'Sacred Panchaloham',
    subtitle: 'Authentic Panchaloham jewellery, crafted for every spiritual journey.',
    ctaText: 'Shop Now',
    ctaLink: '/collections',
    tag: 'FAITH IN EVERY DETAIL',
    image: '/assets/hero_slide_1.webp',
    mobileImage: '/assets/hero_slide_1_mobile.webp',
  },
  {
    id: 2,
    kicker: 'SACRED FIVE-METAL ALLOY',
    titleLine1: 'Consecrated',
    titleLine2: 'Divine Purity',
    subtitle: 'Infused with Vedic mantras and temple sanctum blessings.',
    ctaText: 'Explore Deities',
    ctaLink: '/collections/ganesha-jewellery',
    tag: 'VEDIC TEMPLE CRAFT',
    image: '/assets/hero_slide_2.webp',
    mobileImage: '/assets/hero_slide_2_mobile.webp',
  },
  {
    id: 3,
    kicker: 'SACRED TEMPLE ARTISAN HEIRLOOMS',
    titleLine1: 'Generational',
    titleLine2: 'Agamic Art',
    subtitle: 'Crafted by master sthapatis preserving ancient metallurgy.',
    ctaText: 'Discover Heritage',
    ctaLink: '/about',
    tag: 'HALLMARKED PURITY',
    image: '/assets/hero_slide_3.webp',
    mobileImage: '/assets/hero_slide_3_mobile.webp',
  },
];

export const INITIAL_STORY_BANNERS: StoryBannerCMS[] = [
  {
    id: 'banner-1',
    title: 'A Sacred Gift for Your Loved Ones',
    desc: 'Perfect for festivals, weddings and special occasions.',
    ctaText: 'Explore Gifts',
    ctaLink: '/collections',
    image: '/assets/banner_sacred_gift.webp',
  },
  {
    id: 'banner-2',
    title: 'Crafted in Panchaloham',
    desc: 'A divine blend of five sacred metals for positive energy and well-being.',
    ctaText: 'Our Story',
    ctaLink: '/about',
    image: '/assets/banner_panchaloham.webp',
  },
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementCMS = {
  freeShippingText: 'Free Shipping on Orders Above ₹999',
  authenticityText: 'Authentic Panchaloham',
  worldwideText: 'Blessings Delivered Worldwide',
  activePromoAlert: 'Special Navaratri Consecration: Free Sanctum Prasadam with every order',
};

export const INITIAL_ORDERS: OrderCMS[] = [];

export const CONSULTATION_SERVICES = [
  {
    id: 'custom-craft',
    title: 'Custom Agamic Temple Jewellery Crafting',
    subtitle: 'Direct 1-on-1 design consultation with our Master Sthapati',
    duration: '45 mins',
    mode: 'video' as const,
    specialist: 'Master Sthapati R. Shanmugam',
    icon: 'Sparkles',
    badge: 'MOST POPULAR',
    description: 'Collaborate directly with generational temple metallurgists to custom-cast sacred deities, thali chains, wedding rings, or family heirlooms following Karanagama specifications.',
  },
  {
    id: 'consecration',
    title: 'Talisman Consecration & Sanctum Prana Pratishtha',
    subtitle: 'Personalized temple energization with your Janma Nakshatra & Gotra',
    duration: '30 mins',
    mode: 'video' as const,
    specialist: 'Temple Chief Priest Sri Narayana Bhattar',
    icon: 'Flame',
    badge: 'SACRED BLESSING',
    description: 'Have your purchased or existing Panchaloham talisman sanctified in an authentic temple sanctum ceremony chanted with specialized Vedic suktams dedicated to your chosen deity.',
  },
  {
    id: 'astrological',
    title: 'Nakshatra & Panchaloham Astrological Guidance',
    subtitle: 'Identify the ideal deity, alloy ratio & planetary harmony for you',
    duration: '30 mins',
    mode: 'phone' as const,
    specialist: 'Vedic Astrologer & Gemologist Acharya Venkat',
    icon: 'Compass',
    badge: 'VEDIC GUIDANCE',
    description: 'A deep dive into your astrological birth chart (Horoscope/Kundli) to recommend whether Gold-heavy or Copper-heavy Panchaloham is best tuned to your energetic field.',
  },
  {
    id: 'showroom-visit',
    title: 'VIP Heritage Showroom Private Viewing & Trial',
    subtitle: 'Exclusive in-person private trial in our Madurai / Chennai atelier',
    duration: '60 mins',
    mode: 'in-person' as const,
    specialist: 'Senior Temple Jewellery Curator',
    icon: 'Building2',
    badge: 'PRIVATE ATELIER',
    description: 'Experience the weight, luster, and craftsmanship of authentic five-metal Panchaloham pieces in person. Private trial with custom size measurements.',
  },
];

export const INITIAL_BOOKINGS = [
  {
    id: 'BK-89412',
    referenceCode: 'BK-89412',
    serviceId: 'custom-craft',
    serviceName: 'Custom Agamic Temple Jewellery Crafting',
    devoteeName: 'Karthik Sivakumar',
    email: 'karthik.s@example.com',
    phone: '+91 98401 23456',
    deity: 'Lord Murugan',
    nakshatra: 'Krittika',
    mode: 'video' as const,
    date: '2026-09-22',
    timeSlot: '11:30 AM (Uchikalam Muhurtham)',
    status: 'Confirmed' as const,
    notes: 'Looking to cast a heavy 54-gram solid Panchaloham Vel pendant with emerald inlay.',
    meetingLink: 'https://meet.google.com/aam-bless-murugan',
    assignedConsultant: 'Master Sthapati R. Shanmugam',
    createdAt: '2026-09-17',
  },
  {
    id: 'BK-89413',
    referenceCode: 'BK-89413',
    serviceId: 'consecration',
    serviceName: 'Talisman Consecration & Sanctum Prana Pratishtha',
    devoteeName: 'Smt. Radhika Sundaram',
    email: 'radhika.s@example.com',
    phone: '+91 94443 89100',
    deity: 'Goddess Mahalakshmi',
    nakshatra: 'Rohini',
    mode: 'video' as const,
    date: '2026-09-24',
    timeSlot: '09:30 AM (Morning Sanctum Ushakkalam)',
    status: 'Requested' as const,
    notes: 'Consecration for daughter’s wedding pendant on auspicious Friday morning.',
    assignedConsultant: 'Temple Chief Priest Sri Narayana Bhattar',
    createdAt: '2026-09-18',
  },
  {
    id: 'BK-89414',
    referenceCode: 'BK-89414',
    serviceId: 'astrological',
    serviceName: 'Nakshatra & Panchaloham Astrological Guidance',
    devoteeName: 'Ramesh Krishnan',
    email: 'ramesh.k@example.com',
    phone: '+91 97908 11223',
    deity: 'Lord Shiva',
    nakshatra: 'Ardra',
    mode: 'phone' as const,
    date: '2026-09-21',
    timeSlot: '05:30 PM (Evening Sandhya Deepam)',
    status: 'Completed' as const,
    notes: 'Consultation completed. Devotee recommended to wear Shiva Lingam Panchaloham ring.',
    assignedConsultant: 'Acharya Venkat',
    createdAt: '2026-09-15',
  },
  {
    id: 'BK-89415',
    referenceCode: 'BK-89415',
    serviceId: 'showroom-visit',
    serviceName: 'VIP Heritage Showroom Private Viewing & Trial',
    devoteeName: 'Venkatesh Raghavan',
    email: 'v.raghavan@example.com',
    phone: '+91 98840 55667',
    deity: 'Lord Ganesha',
    nakshatra: 'Hastham',
    mode: 'in-person' as const,
    date: '2026-09-26',
    timeSlot: '03:30 PM (Afternoon Pradosham)',
    status: 'Confirmed' as const,
    notes: 'Family showroom visit for custom wedding jewellery trial.',
    assignedConsultant: 'Senior Curator Madhavan',
    createdAt: '2026-09-18',
  },
];

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  memberSince: string;
  referralCode?: string;
  referredBy?: string;
}

export const INITIAL_USERS: UserRecord[] = [];

export const INITIAL_FOOTER_CMS: FooterCMS = {
  brandTagline: 'Faith. Tradition. Timeless Beauty.',
  brandLogo: '/assets/brand_logo_gold.webp',
  address: 'Heritage Temple Goldsmith Atelier, Sanctum Jewellery Studios, India',
  email: 'support@aamadappetti.com',
  phone: '+91 96000 00000',
  whatsapp: '+91 96000 00000',
  sanctumHours: 'Monday – Saturday: 9:00 AM – 6:00 PM IST',
  assuranceNote: 'Every Panchaloham consultation is directly coordinated with master temple sthapatis and certified hallmark metal documentation.',
  socialLinks: {
    instagram: 'https://instagram.com/aamadappetti',
    facebook: 'https://facebook.com/aamadappetti',
    youtube: 'https://www.youtube.com',
    pinterest: 'https://pinterest.com/aamadappetti',
  },
  copyrightText: '© 2026 Aamadappetti Panchaloham Jewellery. All sacred rights reserved.',
};

export const INITIAL_ABOUT_CMS: AboutPageCMS = {
  heroKicker: 'ESTD. 1984 • SACRED JEWELLERY GOLDSMITHING',
  heroTitle: 'The Sacred Legacy of Aamadappetti',
  heroLead: 'For four decades, our sanctum artisans have guarded the timeless Vedic metallurgy of authentic Panchaloham — uniting cosmic energies, sacred heritage, and heirloom temple goldsmithing.',
  establishedYear: '1984',
  legacyTitle: 'Preserving Agamic Metallurgy & Temple Artisanship',
  legacyParagraph1: 'Founded four decades ago in the temple heartlands of South India, Aamadappetti was born out of deep devotion to authentic Agamic craftsmanship. While modern commercial markets replaced traditional methods with hollow flash-plating, our sanctum atelier vowed to protect the sacred Panchaloham science prescribed in the Shilpa Shastras.',
  legacyParagraph2: 'Every ring, pendant, and kada is cast using genuine five-metal alloy (Gold, Silver, Copper, Brass/Zinc, and Iron), blessed in traditional sanctums, and hallmarked for lifetime purity.',
  metals: [
    {
      name: 'Gold (Pon)',
      element: 'Fire / Agni',
      planet: 'Sun (Surya)',
      symbol: 'Au',
      color: '#dfba6c',
      desc: 'Infuses solar vitality, divine consciousness, and spiritual radiance into the aura.',
    },
    {
      name: 'Silver (Velli)',
      element: 'Water / Jala',
      planet: 'Moon (Chandra)',
      symbol: 'Ag',
      color: '#e2e8f0',
      desc: 'Cooling lunar vibrations that soothe emotional turmoil, providing peace and mental poise.',
    },
    {
      name: 'Copper (Chembu)',
      element: 'Earth / Prithvi',
      planet: 'Mars (Mangal)',
      symbol: 'Cu',
      color: '#d97736',
      desc: 'Grounds bio-electric energy, stimulates physical stamina, and dispels sluggish inertia.',
    },
    {
      name: 'Brass / Zinc (Pithalai)',
      element: 'Ether / Akasha',
      planet: 'Mercury (Budha)',
      symbol: 'Zn',
      color: '#e5c07b',
      desc: 'Enhances subtle communication, cognitive perception, and harmonic bio-rhythms.',
    },
    {
      name: 'Iron (Irumbu)',
      element: 'Air / Vayu',
      planet: 'Saturn (Shani)',
      symbol: 'Fe',
      color: '#94a3b8',
      desc: 'Forms an impermeable electromagnetic shield against psychic negativity and malefic evil eye.',
    },
  ],
  craftSteps: [
    {
      step: '01',
      title: 'Sacred Shilpa Shastra Dhyana',
      desc: 'Every design begins with scriptural meditation, ensuring the deity’s lakshanas (divine proportions) strictly align with temple Agama Shastras.',
    },
    {
      step: '02',
      title: 'Beeswax Master Sculpting',
      desc: 'Master Sthapatis hand-carve intricate details into pure forest beeswax mixed with Dammar tree resin, creating an irreplaceable bespoke prototype.',
    },
    {
      step: '03',
      title: 'Sacred Clay Mold Baking',
      desc: 'The wax model is enveloped in seven layers of alluvial clay sourced from holy riverbanks, dried under the sun, and baked in traditional kilns.',
    },
    {
      step: '04',
      title: 'Crucible Pouring at 1,080°C',
      desc: 'The five sacred metals are melted in exact proportions in graphite crucibles. As liquid gold alloy flows in, the wax melts away (Lost-Wax casting).',
    },
    {
      step: '05',
      title: 'Master Chiseling & Goldsmithing',
      desc: 'Once cooled, the clay is shattered. Artisans spend over 40 hours hand-chiseled each divine attribute with micro-tools to mirror temple icons.',
    },
    {
      step: '06',
      title: 'Prana Pratishtha Temple Consecration',
      desc: 'Before packing, each piece is energized before temple sanctums with holy theertham and Vedic chant invocations, awakening its spiritual resonance.',
    },
  ],
  sanctumQuote: 'Every jewel we forge is not mere metal; it is a consecrated vessel carrying the cosmic vibrations of Vedic mantras into your daily life.',
  sanctumQuoteAuthor: 'Master Sthapati R. Shanmugam, Chief Temple Goldsmith',
};

export const INITIAL_INQUIRIES: any[] = [];

export interface CheckoutSettingsCMS {
  id?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  giftPackagingFee: number;
  giftPackagingEnabled: boolean;
  giftPackagingText: string;
  expressShippingText: string;
  updatedAt?: string;
}

export const INITIAL_CHECKOUT_SETTINGS: CheckoutSettingsCMS = {
  shippingFee: 99.0,
  freeShippingThreshold: 999.0,
  giftPackagingFee: 0.0,
  giftPackagingEnabled: true,
  giftPackagingText: 'FREE',
  expressShippingText: 'Insured Express Shipping',
};
