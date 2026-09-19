export type SupportedLocale = 'en' | 'ta';

export interface TranslationItem {
  key: string;
  section: string;
  sourceText: string; // English source
  translations: {
    en: string;
    ta: string;
    [locale: string]: string;
  };
  contextNote?: string;
}

export const DEFAULT_TRANSLATIONS: TranslationItem[] = [
  // --- ANNOUNCEMENT BAR ---
  {
    key: 'announcement.free_shipping',
    section: 'Announcement Bar',
    sourceText: 'Free Shipping on Orders Above ₹999',
    translations: {
      en: 'Free Shipping on Orders Above ₹999',
      ta: '₹999க்கு மேற்பட்ட ஆர்டர்களுக்கு இலவச டெலிவரி',
    },
    contextNote: 'Top header announcement message',
  },
  {
    key: 'announcement.panchaloham_purity',
    section: 'Announcement Bar',
    sourceText: 'Authentic Panchaloham',
    translations: {
      en: 'Authentic Panchaloham',
      ta: 'உண்மையான ஐம்பொன்',
    },
    contextNote: 'Highlighting five-metal authenticity',
  },
  {
    key: 'announcement.worldwide_blessings',
    section: 'Announcement Bar',
    sourceText: 'Blessings Delivered Worldwide',
    translations: {
      en: 'Blessings Delivered Worldwide',
      ta: 'உலகெங்கிலும் புனித ஆசிகள் வழங்கப்படுகிறது',
    },
    contextNote: 'Global international shipping note',
  },

  // --- NAVIGATION & HEADER ---
  {
    key: 'nav.home',
    section: 'Header & Navigation',
    sourceText: 'Home',
    translations: {
      en: 'Home',
      ta: 'முகப்பு',
    },
  },
  {
    key: 'nav.jewellery',
    section: 'Header & Navigation',
    sourceText: 'Jewellery',
    translations: {
      en: 'Jewellery',
      ta: 'ஆபரணங்கள்',
    },
  },
  {
    key: 'nav.collections',
    section: 'Header & Navigation',
    sourceText: 'Collections',
    translations: {
      en: 'Collections',
      ta: 'தொகுப்புகள்',
    },
  },
  {
    key: 'nav.about',
    section: 'Header & Navigation',
    sourceText: 'About',
    translations: {
      en: 'About',
      ta: 'எங்களை பற்றி',
    },
  },
  {
    key: 'nav.blog',
    section: 'Header & Navigation',
    sourceText: 'Blog',
    translations: {
      en: 'Blog',
      ta: 'பதிவுகள்',
    },
  },
  {
    key: 'nav.contact',
    section: 'Header & Navigation',
    sourceText: 'Contact',
    translations: {
      en: 'Contact',
      ta: 'தொடர்புக்கு',
    },
  },
  {
    key: 'header.search_placeholder',
    section: 'Header & Navigation',
    sourceText: 'Search for jewellery, deity or occasion...',
    translations: {
      en: 'Search for jewellery, deity or occasion...',
      ta: 'ஆபரணம், தெய்வம் அல்லது விசேஷங்களை தேடுங்கள்...',
    },
  },
  {
    key: 'header.wishlist',
    section: 'Header & Navigation',
    sourceText: 'Wishlist',
    translations: {
      en: 'Wishlist',
      ta: 'விருப்பப் பட்டியல்',
    },
  },
  {
    key: 'header.sacred_bag',
    section: 'Header & Navigation',
    sourceText: 'Sacred Bag',
    translations: {
      en: 'Sacred Bag',
      ta: 'புனித கூடை',
    },
  },
  {
    key: 'header.account',
    section: 'Header & Navigation',
    sourceText: 'Account',
    translations: {
      en: 'Account',
      ta: 'கணக்கு',
    },
  },

  // --- HERO SLIDE 1 ---
  {
    key: 'hero.slide1.kicker',
    section: 'Hero Carousel',
    sourceText: 'DIVINE BEAUTY, TIMELESS TRADITION',
    translations: {
      en: 'DIVINE BEAUTY, TIMELESS TRADITION',
      ta: 'தெய்வீக அழகு, காலத்தால் அழியாத பாரம்பரியம்',
    },
  },
  {
    key: 'hero.slide1.title1',
    section: 'Hero Carousel',
    sourceText: 'Adorn',
    translations: {
      en: 'Adorn',
      ta: 'அலங்கரியுங்கள்',
    },
  },
  {
    key: 'hero.slide1.title2',
    section: 'Hero Carousel',
    sourceText: 'Your Faith',
    translations: {
      en: 'Your Faith',
      ta: 'உங்கள் பக்தியை',
    },
  },
  {
    key: 'hero.slide1.subtitle',
    section: 'Hero Carousel',
    sourceText: 'Authentic Panchaloham jewellery, crafted for every spiritual journey.',
    translations: {
      en: 'Authentic Panchaloham jewellery, crafted for every spiritual journey.',
      ta: 'ஒவ்வொரு ஆன்மீக பயணத்திற்கும் உருவாக்கப்பட்ட உண்மையான ஐம்பொன் ஆபரணங்கள்.',
    },
  },
  {
    key: 'hero.slide1.cta',
    section: 'Hero Carousel',
    sourceText: 'Shop Now',
    translations: {
      en: 'Shop Now',
      ta: 'இப்போதே வாங்குங்கள்',
    },
  },

  // --- HERO SLIDE 2 ---
  {
    key: 'hero.slide2.kicker',
    section: 'Hero Carousel',
    sourceText: 'SACRED FIVE-METAL ALLOY',
    translations: {
      en: 'SACRED FIVE-METAL ALLOY',
      ta: 'புனித ஐந்து உலோகக் கலவை',
    },
  },
  {
    key: 'hero.slide2.title1',
    section: 'Hero Carousel',
    sourceText: 'Consecrated',
    translations: {
      en: 'Consecrated',
      ta: 'பிரதிஷ்டை செய்யப்பட்ட',
    },
  },
  {
    key: 'hero.slide2.title2',
    section: 'Hero Carousel',
    sourceText: 'Divine Purity',
    translations: {
      en: 'Divine Purity',
      ta: 'தெய்வீக தூய்மை',
    },
  },
  {
    key: 'hero.slide2.subtitle',
    section: 'Hero Carousel',
    sourceText: 'Infused with Vedic mantras and temple sanctum blessings.',
    translations: {
      en: 'Infused with Vedic mantras and temple sanctum blessings.',
      ta: 'வேத மந்திரங்கள் மற்றும் கோயில் கருவறை ஆசிகளுடன் கூடியது.',
    },
  },
  {
    key: 'hero.slide2.cta',
    section: 'Hero Carousel',
    sourceText: 'Explore Deities',
    translations: {
      en: 'Explore Deities',
      ta: 'தெய்வங்களை காண்க',
    },
  },

  // --- HERO SLIDE 3 ---
  {
    key: 'hero.slide3.kicker',
    section: 'Hero Carousel',
    sourceText: 'SACRED TEMPLE ARTISAN HEIRLOOMS',
    translations: {
      en: 'SACRED TEMPLE ARTISAN HEIRLOOMS',
      ta: 'பாரம்பரிய கோயில் சிற்பிகளின் கலைப்படைப்புகள்',
    },
  },
  {
    key: 'hero.slide3.title1',
    section: 'Hero Carousel',
    sourceText: 'Generational',
    translations: {
      en: 'Generational',
      ta: 'தலைமுறை தலைமுறையான',
    },
  },
  {
    key: 'hero.slide3.title2',
    section: 'Hero Carousel',
    sourceText: 'Agamic Art',
    translations: {
      en: 'Agamic Art',
      ta: 'ஆகமக் கலை',
    },
  },
  {
    key: 'hero.slide3.subtitle',
    section: 'Hero Carousel',
    sourceText: 'Crafted by master sthapatis preserving ancient metallurgy.',
    translations: {
      en: 'Crafted by master sthapatis preserving ancient metallurgy.',
      ta: 'பண்டைய உலோக அறிவியலை பாதுகாக்கும் தலைசிறந்த சிற்பிகளால் வடிவமைக்கப்பட்டது.',
    },
  },
  {
    key: 'hero.slide3.cta',
    section: 'Hero Carousel',
    sourceText: 'Discover Heritage',
    translations: {
      en: 'Discover Heritage',
      ta: 'பாரம்பரியத்தை அறிக',
    },
  },

  // --- HERO TRUST PILLS ---
  {
    key: 'hero.trust.authentic',
    section: 'Hero Carousel',
    sourceText: '100% Authentic Panchaloham',
    translations: {
      en: '100% Authentic Panchaloham',
      ta: '100% உண்மையான ஐம்பொன்',
    },
  },
  {
    key: 'hero.trust.trusted',
    section: 'Hero Carousel',
    sourceText: 'Trusted by Thousands',
    translations: {
      en: 'Trusted by Thousands',
      ta: 'ஆயிரக்கணக்கான பக்தர்களின் நம்பிக்கை',
    },
  },
  {
    key: 'hero.trust.delivery',
    section: 'Hero Carousel',
    sourceText: 'Secure & Fast Delivery',
    translations: {
      en: 'Secure & Fast Delivery',
      ta: 'பாதுகாப்பான & விரைவான விநியோகம்',
    },
  },
  {
    key: 'hero.trust.packaging',
    section: 'Hero Carousel',
    sourceText: 'Beautiful Gift Packaging',
    translations: {
      en: 'Beautiful Gift Packaging',
      ta: 'அழகான பரிசு பெட்டி பேக்கிங்',
    },
  },

  // --- CATEGORIES SECTION ---
  {
    key: 'categories.kicker',
    section: 'Divine Collections',
    sourceText: 'SACRED SELECTIONS',
    translations: {
      en: 'SACRED SELECTIONS',
      ta: 'புனித தேர்வுகள்',
    },
  },
  {
    key: 'categories.title',
    section: 'Divine Collections',
    sourceText: 'Shop By Sacred Deity',
    translations: {
      en: 'Shop By Sacred Deity',
      ta: 'புனித தெய்வங்களின்படி தேர்வு செய்யுங்கள்',
    },
  },
  {
    key: 'categories.subtitle',
    section: 'Divine Collections',
    sourceText: 'Explore handcrafted Panchaloham pieces infused with divine spiritual presence',
    translations: {
      en: 'Explore handcrafted Panchaloham pieces infused with divine spiritual presence',
      ta: 'தெய்வீக ஆற்றல் நிறைந்த கைவினை ஐம்பொன் ஆபரணங்களை பாருங்கள்',
    },
  },
  {
    key: 'categories.view_all',
    section: 'Divine Collections',
    sourceText: 'View All Collections',
    translations: {
      en: 'View All Collections',
      ta: 'அனைத்து தொகுப்புகளையும் காண்க',
    },
  },

  // --- FEATURED PRODUCTS ---
  {
    key: 'featured.kicker',
    section: 'Featured Products',
    sourceText: 'DIVINE CRAFTSMANSHIP',
    translations: {
      en: 'DIVINE CRAFTSMANSHIP',
      ta: 'தெய்வீக கைவினைத்திறன்',
    },
  },
  {
    key: 'featured.title',
    section: 'Featured Products',
    sourceText: 'Consecrated Creations',
    translations: {
      en: 'Consecrated Creations',
      ta: 'பிரதிஷ்டை செய்யப்பட்ட ஆபரணங்கள்',
    },
  },
  {
    key: 'featured.subtitle',
    section: 'Featured Products',
    sourceText: 'Handcrafted five-metal talismans, energized under traditional temple rituals',
    translations: {
      en: 'Handcrafted five-metal talismans, energized under traditional temple rituals',
      ta: 'பாரம்பரிய கோயில் சடங்குகளுடன் உயிர்ப்பிக்கப்பட்ட ஐந்து உலோகக் காப்புகள்',
    },
  },
  {
    key: 'featured.add_to_bag',
    section: 'Featured Products',
    sourceText: 'Add to Bag',
    translations: {
      en: 'Add to Bag',
      ta: 'கூடையில் சேர்க்கவும்',
    },
  },
  {
    key: 'featured.view_details',
    section: 'Featured Products',
    sourceText: 'View Details',
    translations: {
      en: 'View Details',
      ta: 'விவரங்களை காண்க',
    },
  },
  {
    key: 'featured.in_stock',
    section: 'Featured Products',
    sourceText: 'In Stock',
    translations: {
      en: 'In Stock',
      ta: 'இருப்பில் உள்ளது',
    },
  },
  {
    key: 'featured.purity_tag',
    section: 'Featured Products',
    sourceText: '5-Metal Panchaloham',
    translations: {
      en: '5-Metal Panchaloham',
      ta: '5-உலோக ஐம்பொன்',
    },
  },

  // --- STORY BANNERS ---
  {
    key: 'story.banner1.title',
    section: 'Heritage Story Banners',
    sourceText: 'A Sacred Gift for Your Loved Ones',
    translations: {
      en: 'A Sacred Gift for Your Loved Ones',
      ta: 'உங்கள் அன்புக்குரியவர்களுக்கு ஒரு புனிதமான பரிசு',
    },
  },
  {
    key: 'story.banner1.desc',
    section: 'Heritage Story Banners',
    sourceText: 'Perfect for festivals, weddings and special occasions.',
    translations: {
      en: 'Perfect for festivals, weddings and special occasions.',
      ta: 'திருவிழாக்கள், திருமணங்கள் மற்றும் விஷேசங்களுக்கு ஏற்றது.',
    },
  },
  {
    key: 'story.banner1.cta',
    section: 'Heritage Story Banners',
    sourceText: 'Explore Gifts',
    translations: {
      en: 'Explore Gifts',
      ta: 'பரிசுகளை காண்க',
    },
  },
  {
    key: 'story.banner2.title',
    section: 'Heritage Story Banners',
    sourceText: 'Crafted in Panchaloham',
    translations: {
      en: 'Crafted in Panchaloham',
      ta: 'ஐம்பொன்னில் உருவாக்கப்பட்டது',
    },
  },
  {
    key: 'story.banner2.desc',
    section: 'Heritage Story Banners',
    sourceText: 'A divine blend of five sacred metals for positive energy and well-being.',
    translations: {
      en: 'A divine blend of five sacred metals for positive energy and well-being.',
      ta: 'நேர்மறை ஆற்றல் மற்றும் நல்வாழ்விற்கான ஐந்து புனித உலோகங்களின் கலவை.',
    },
  },
  {
    key: 'story.banner2.cta',
    section: 'Heritage Story Banners',
    sourceText: 'Our Story',
    translations: {
      en: 'Our Story',
      ta: 'எங்கள் வரலாறு',
    },
  },

  // --- TRUST BADGES ---
  {
    key: 'trust.shipping.title',
    section: 'Value Propositions',
    sourceText: 'Worldwide Shipping',
    translations: {
      en: 'Worldwide Shipping',
      ta: 'உலகளாவிய டெலிவரி',
    },
  },
  {
    key: 'trust.shipping.desc',
    section: 'Value Propositions',
    sourceText: 'Doorstep blessing delivery across 45+ countries',
    translations: {
      en: 'Doorstep blessing delivery across 45+ countries',
      ta: '45க்கும் மேற்பட்ட நாடுகளுக்கு வாசல் வரை விநியோகம்',
    },
  },
  {
    key: 'trust.returns.title',
    section: 'Value Propositions',
    sourceText: 'Easy Returns',
    translations: {
      en: 'Easy Returns',
      ta: 'எளிதான பரிமாற்றம்',
    },
  },
  {
    key: 'trust.returns.desc',
    section: 'Value Propositions',
    sourceText: '7-day hassle-free exchange guarantee',
    translations: {
      en: '7-day hassle-free exchange guarantee',
      ta: '7 நாட்கள் எளிய மாற்று உத்தரவாதம்',
    },
  },
  {
    key: 'trust.payments.title',
    section: 'Value Propositions',
    sourceText: 'Secure Payments',
    translations: {
      en: 'Secure Payments',
      ta: 'பாதுகாப்பான கட்டணம்',
    },
  },
  {
    key: 'trust.payments.desc',
    section: 'Value Propositions',
    sourceText: '256-bit encrypted UPI & card gateways',
    translations: {
      en: '256-bit encrypted UPI & card gateways',
      ta: 'பாதுகாப்பான UPI மற்றும் கார்டு பரிவர்த்தனைகள்',
    },
  },
  {
    key: 'trust.authenticity.title',
    section: 'Value Propositions',
    sourceText: 'Certified Authenticity',
    translations: {
      en: 'Certified Authenticity',
      ta: 'சான்றளிக்கப்பட்ட உண்மைத்தன்மை',
    },
  },
  {
    key: 'trust.authenticity.desc',
    section: 'Value Propositions',
    sourceText: 'Government lab tested Panchaloham assay certificate',
    translations: {
      en: 'Government lab tested Panchaloham assay certificate',
      ta: 'அரசு ஆய்வக சோதனை செய்யப்பட்ட ஐம்பொன் சான்றிதழ்',
    },
  },
  {
    key: 'trust.support.title',
    section: 'Value Propositions',
    sourceText: 'Dedicated Support',
    translations: {
      en: 'Dedicated Support',
      ta: 'நேரடி வாடிக்கையாளர் சேவை',
    },
  },
  {
    key: 'trust.support.desc',
    section: 'Value Propositions',
    sourceText: 'Direct consultation with temple jewellery experts',
    translations: {
      en: 'Direct consultation with temple jewellery experts',
      ta: 'கோயில் நகை நிபுணர்களுடன் நேரடி ஆலோசனை',
    },
  },

  // --- FAQ SECTION ---
  {
    key: 'faq.kicker',
    section: 'FAQ Accordions',
    sourceText: 'HERITAGE & KNOWLEDGE',
    translations: {
      en: 'HERITAGE & KNOWLEDGE',
      ta: 'பாரம்பரியம் & அறிவு',
    },
  },
  {
    key: 'faq.title',
    section: 'FAQ Accordions',
    sourceText: 'Frequently Asked Questions',
    translations: {
      en: 'Frequently Asked Questions',
      ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    },
  },
  {
    key: 'faq.subtitle',
    section: 'FAQ Accordions',
    sourceText: 'Everything you need to know about consecrated five-metal Panchaloham jewellery.',
    translations: {
      en: 'Everything you need to know about consecrated five-metal Panchaloham jewellery.',
      ta: 'பிரதிஷ்டை செய்யப்பட்ட ஐம்பொன் ஆபரணங்கள் பற்றி நீங்கள் தெரிந்து கொள்ள வேண்டியவை.',
    },
  },

  // --- NEWSLETTER ---
  {
    key: 'newsletter.kicker',
    section: 'Newsletter',
    sourceText: 'DIVINE BLESSINGS IN YOUR INBOX',
    translations: {
      en: 'DIVINE BLESSINGS IN YOUR INBOX',
      ta: 'தெய்வீக ஆசிகள் உங்கள் மின்னஞ்சலில்',
    },
  },
  {
    key: 'newsletter.title',
    section: 'Newsletter',
    sourceText: 'Join the Aamadappetti Devotee Circle',
    translations: {
      en: 'Join the Aamadappetti Devotee Circle',
      ta: 'ஆமடப்பெட்டி பக்தர் வட்டத்தில் இணையுங்கள்',
    },
  },
  {
    key: 'newsletter.subtitle',
    section: 'Newsletter',
    sourceText: 'Receive auspicious temple calendar updates, Panchaloham care guides, and exclusive devotee offers.',
    translations: {
      en: 'Receive auspicious temple calendar updates, Panchaloham care guides, and exclusive devotee offers.',
      ta: 'புனித கோயில் விசேஷ நாட்காட்டி, ஐம்பொன் பராமரிப்பு வழிகாட்டிகள் மற்றும் சிறப்பு சலுகைகளை பெறுங்கள்.',
    },
  },
  {
    key: 'newsletter.placeholder',
    section: 'Newsletter',
    sourceText: 'Enter your email address...',
    translations: {
      en: 'Enter your email address...',
      ta: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்...',
    },
  },
  {
    key: 'newsletter.button',
    section: 'Newsletter',
    sourceText: 'Subscribe',
    translations: {
      en: 'Subscribe',
      ta: 'இணையுங்கள்',
    },
  },

  // --- FOOTER ---
  {
    key: 'footer.tagline',
    section: 'Footer',
    sourceText: 'Faith. Tradition. Timeless Beauty.',
    translations: {
      en: 'Faith. Tradition. Timeless Beauty.',
      ta: 'பக்தி. பாரம்பரியம். காலத்தால் அழியாத அழகு.',
    },
  },
  {
    key: 'footer.quick_links',
    section: 'Footer',
    sourceText: 'Quick Links',
    translations: {
      en: 'Quick Links',
      ta: 'முக்கிய இணைப்புகள்',
    },
  },
  {
    key: 'footer.sacred_jewellery',
    section: 'Footer',
    sourceText: 'Sacred Jewellery',
    translations: {
      en: 'Sacred Jewellery',
      ta: 'புனித ஆபரணங்கள்',
    },
  },
  {
    key: 'footer.ritual_essentials',
    section: 'Footer',
    sourceText: 'Ritual Essentials',
    translations: {
      en: 'Ritual Essentials',
      ta: 'பூஜை பொருட்கள்',
    },
  },
  {
    key: 'footer.temple_timings',
    section: 'Footer',
    sourceText: 'Temple Craft Hours: 9:00 AM – 8:00 PM IST',
    translations: {
      en: 'Temple Craft Hours: 9:00 AM – 8:00 PM IST',
      ta: 'பணி நேரம்: காலை 9:00 – இரவு 8:00',
    },
  },
  {
    key: 'footer.copyright',
    section: 'Footer',
    sourceText: '© 2026 Aamadappetti Panchaloham Jewellery. All rights reserved.',
    translations: {
      en: '© 2026 Aamadappetti Panchaloham Jewellery. All rights reserved.',
      ta: '© 2026 ஆமடப்பெட்டி ஐம்பொன் ஆபரணங்கள். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    },
  },

  // --- CART DRAWER ---
  {
    key: 'cart.title',
    section: 'Cart Drawer',
    sourceText: 'Your Sacred Bag',
    translations: {
      en: 'Your Sacred Bag',
      ta: 'உங்கள் புனித கூடை',
    },
  },
  {
    key: 'cart.empty_message',
    section: 'Cart Drawer',
    sourceText: 'Your sacred bag is currently empty.',
    translations: {
      en: 'Your sacred bag is currently empty.',
      ta: 'உங்கள் புனித கூடை தற்போது காலியாக உள்ளது.',
    },
  },
  {
    key: 'cart.subtotal',
    section: 'Cart Drawer',
    sourceText: 'Subtotal',
    translations: {
      en: 'Subtotal',
      ta: 'கூட்டுத்தொகை',
    },
  },
  {
    key: 'cart.checkout_cta',
    section: 'Cart Drawer',
    sourceText: 'Proceed to Divine Checkout',
    translations: {
      en: 'Proceed to Divine Checkout',
      ta: 'புனித ஆர்டரை உறுதி செய்க',
    },
  },
  {
    key: 'cart.free_shipping_eligible',
    section: 'Cart Drawer',
    sourceText: 'You have qualified for Free Sacred Shipping!',
    translations: {
      en: 'You have qualified for Free Sacred Shipping!',
      ta: 'இலவச புனித டெலிவரிக்கான தகுதியை பெற்றுள்ளீர்கள்!',
    },
  },

  // --- CATALOG & FILTERS ---
  {
    key: 'catalog.filter_title',
    section: 'Catalog & Filters',
    sourceText: 'Refine Sacred Pieces',
    translations: {
      en: 'Refine Sacred Pieces',
      ta: 'ஆபரணங்களை வடிகட்டுக',
    },
  },
  {
    key: 'catalog.all_jewellery',
    section: 'Catalog & Filters',
    sourceText: 'All Sacred Jewellery',
    translations: {
      en: 'All Sacred Jewellery',
      ta: 'அனைத்து புனித ஆபரணங்கள்',
    },
  },
  {
    key: 'catalog.in_stock_only',
    section: 'Catalog & Filters',
    sourceText: 'In Stock Only',
    translations: {
      en: 'In Stock Only',
      ta: 'இருப்பில் உள்ளவை மட்டும்',
    },
  },
  {
    key: 'catalog.sort_by',
    section: 'Catalog & Filters',
    sourceText: 'Sort By',
    translations: {
      en: 'Sort By',
      ta: 'வரிசைப்படுத்துக',
    },
  },

  // --- SACRED BOOKINGS & CONSULTATIONS ---
  {
    key: 'nav.booking',
    section: 'Header & Navigation',
    sourceText: 'Book Consultation',
    translations: {
      en: 'Book Consultation',
      ta: 'கலந்தாய்வு முன்பதிவு',
    },
  },
  {
    key: 'booking.kicker',
    section: 'Sacred Bookings',
    sourceText: 'DIVINE GUIDANCE & APPOINTMENTS',
    translations: {
      en: 'DIVINE GUIDANCE & APPOINTMENTS',
      ta: 'தெய்வீக வழிகாட்டல் & முன்பதிவுகள்',
    },
  },
  {
    key: 'booking.title',
    section: 'Sacred Bookings',
    sourceText: 'Sacred Temple Consultations & Consecrations',
    translations: {
      en: 'Sacred Temple Consultations & Consecrations',
      ta: 'புனித கோயில் கலந்தாய்வு & பிராண பிரதிஷ்டை',
    },
  },
  {
    key: 'booking.subtitle',
    section: 'Sacred Bookings',
    sourceText: 'Schedule a 1-on-1 session with generational master sthapatis and temple priests.',
    translations: {
      en: 'Schedule a 1-on-1 session with generational master sthapatis and temple priests.',
      ta: 'தலைமுறை கோயில் சிற்பிகள் மற்றும் தலைமை அர்ச்சகர்களுடன் நேரடி ஆலோசனை பெறுங்கள்.',
    },
  },
  {
    key: 'booking.step1',
    section: 'Sacred Bookings',
    sourceText: 'Select Consultation Service',
    translations: {
      en: 'Select Consultation Service',
      ta: 'சேவையை தேர்வு செய்க',
    },
  },
  {
    key: 'booking.step2',
    section: 'Sacred Bookings',
    sourceText: 'Choose Auspicious Date & Muhurtham Slot',
    translations: {
      en: 'Choose Auspicious Date & Muhurtham Slot',
      ta: 'சுப நாள் & முகூர்த்த நேரத்தை தேர்வு செய்க',
    },
  },
  {
    key: 'booking.step3',
    section: 'Sacred Bookings',
    sourceText: 'Devotee & Spiritual Details',
    translations: {
      en: 'Devotee & Spiritual Details',
      ta: 'பக்தர் & ஆன்மீக விவரங்கள்',
    },
  },
  {
    key: 'booking.step4',
    section: 'Sacred Bookings',
    sourceText: 'Sacred Booking Confirmed',
    translations: {
      en: 'Sacred Booking Confirmed',
      ta: 'புனித முன்பதிவு உறுதி செய்யப்பட்டது',
    },
  },
  {
    key: 'booking.btn_next',
    section: 'Sacred Bookings',
    sourceText: 'Proceed to Next Step',
    translations: {
      en: 'Proceed to Next Step',
      ta: 'அடுத்த நிலைக்கு செல்க',
    },
  },
  {
    key: 'booking.btn_back',
    section: 'Sacred Bookings',
    sourceText: 'Back to Previous Step',
    translations: {
      en: 'Back to Previous Step',
      ta: 'முந்தைய நிலைக்கு செல்க',
    },
  },
  {
    key: 'booking.btn_confirm',
    section: 'Sacred Bookings',
    sourceText: 'Confirm Sacred Appointment',
    translations: {
      en: 'Confirm Sacred Appointment',
      ta: 'புனித சந்திப்பை உறுதி செய்க',
    },
  },
];
