import { Product, Category } from '@/types';
import { PRODUCTS, CATEGORIES } from './products';

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

export const INITIAL_HERO_SLIDES: HeroSlideCMS[] = [
  {
    id: 1,
    kicker: 'DIVINE BEAUTY, TIMELESS TRADITION',
    titleLine1: 'Adorn',
    titleLine2: 'Your Faith',
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
    image: '/assets/banner_sacred_gift.png',
  },
  {
    id: 'banner-2',
    title: 'Crafted in Panchaloham',
    desc: 'A divine blend of five sacred metals for positive energy and well-being.',
    ctaText: 'Our Story',
    ctaLink: '/about',
    image: '/assets/banner_panchaloham.png',
  },
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementCMS = {
  freeShippingText: 'Free Shipping on Orders Above ₹999',
  authenticityText: 'Authentic Panchaloham',
  worldwideText: 'Blessings Delivered Worldwide',
  activePromoAlert: 'Special Navaratri Consecration: Free Sanctum Prasadam with every order',
};

export const INITIAL_ORDERS: OrderCMS[] = [
  {
    id: 'ORD-98421',
    devoteeName: 'Suresh Narayanan',
    email: 'suresh.n@example.com',
    phone: '+91 98410 44210',
    items: [
      {
        productId: 'prod-001',
        productName: 'Lord Ganesha Pendant',
        price: 2499,
        quantity: 1,
      },
      {
        productId: 'prod-007',
        productName: 'Traditional Panchaloham Rope Chain',
        price: 3299,
        quantity: 1,
      },
    ],
    totalAmount: 5798,
    status: 'Consecrated',
    shippingAddress: 'Flat 402, Sai Sannidhi Apartments, T. Nagar, Chennai - 600017',
    date: '2026-09-17',
    trackingNumber: 'DTDC-IN-8891240',
    paymentMethod: 'UPI (Google Pay)',
  },
  {
    id: 'ORD-98422',
    devoteeName: 'Ananya Raghavan',
    email: 'ananya.r@example.com',
    phone: '+91 97890 32111',
    items: [
      {
        productId: 'prod-002',
        productName: 'Murugan Divine Vel Pendant',
        price: 2199,
        quantity: 1,
      },
    ],
    totalAmount: 2199,
    status: 'Shipped',
    shippingAddress: '14, Temple View Road, Malleshwaram, Bengaluru - 560003',
    date: '2026-09-16',
    trackingNumber: 'BLUEDART-992014',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ORD-98423',
    devoteeName: 'Dr. K. Balasubramanian',
    email: 'kbala@example.com',
    phone: '+91 94440 12890',
    items: [
      {
        productId: 'prod-004',
        productName: 'Mahalakshmi Ashtalakshmi Pendant',
        price: 2899,
        quantity: 2,
      },
    ],
    totalAmount: 5798,
    status: 'Pending',
    shippingAddress: '88, North Car Street, Madurai - 625001',
    date: '2026-09-18',
    paymentMethod: 'Net Banking (HDFC)',
  },
  {
    id: 'ORD-98424',
    devoteeName: 'Meera Vijayakumar',
    email: 'meera.v@example.com',
    phone: '+91 98840 99882',
    items: [
      {
        productId: 'prod-003',
        productName: 'Shiva Trishul & Damru Locket',
        price: 2399,
        quantity: 1,
      },
      {
        productId: 'prod-008',
        productName: 'Ayurvedic Panchaloham Vala Kada',
        price: 2599,
        quantity: 1,
      },
    ],
    totalAmount: 4998,
    status: 'Delivered',
    shippingAddress: '23, Gandhi Nagar, Coimbatore - 641009',
    date: '2026-09-14',
    trackingNumber: 'DELHIVERY-7712390',
    paymentMethod: 'UPI (PhonePe)',
  },
];

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

export const INITIAL_USERS: UserRecord[] = [
  {
    id: 'USR-101',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98450 12345',
    shippingAddress: 'Flat 402, Sai Sannidhi Apartments, T. Nagar, Chennai - 600017',
    memberSince: 'January 2025',
  },
  {
    id: 'USR-102',
    name: 'S. Ramachandran',
    email: 'ramachandran@example.com',
    phone: '+91 98401 23456',
    shippingAddress: '42, V.O.C. Street, R.S. Puram, Coimbatore - 641002',
    memberSince: 'March 2025',
  },
  {
    id: 'USR-103',
    name: 'Smt. Radhika Sundaram',
    email: 'radhika.s@example.com',
    phone: '+91 94443 89100',
    shippingAddress: '88, North Car Street, Madurai - 625001',
    memberSince: 'May 2025',
  },
  {
    id: 'USR-104',
    name: 'Ramesh Krishnan',
    email: 'ramesh.k@example.com',
    phone: '+91 97908 11223',
    shippingAddress: '12, Srirangam Mada Street, Tiruchirappalli - 620006',
    memberSince: 'June 2025',
  },
  {
    id: 'USR-105',
    name: 'Ananya Raghavan',
    email: 'ananya.r@example.com',
    phone: '+91 97890 32111',
    shippingAddress: '14, Temple View Road, Malleshwaram, Bengaluru - 560003',
    memberSince: 'August 2025',
  },
  {
    id: 'USR-106',
    name: 'Venkatesh Raghavan',
    email: 'v.raghavan@example.com',
    phone: '+91 98840 55667',
    shippingAddress: '204, Brigade Lotus, Jayanagar, Bengaluru - 560011',
    memberSince: 'September 2025',
  },
];
