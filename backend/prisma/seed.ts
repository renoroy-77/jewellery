import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding jewellery full platform database...');

  // 1. Admin User
  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    console.log('Seeding default Admin user...');
    await prisma.adminUser.create({
      data: {
        username: 'admin',
        email: 'admin@aamadappetti.com',
        passwordHash: 'admin123',
        name: 'Chief Sthapati',
        role: 'SUPERADMIN',
      },
    });
  }

  // 2. Categories
  const categoriesCount = await prisma.category.count();
  if (categoriesCount === 0) {
    console.log('Seeding 7 product categories...');
    await prisma.category.createMany({
      data: [
        {
          id: 'ganesha',
          slug: 'ganesha-jewellery',
          name: 'Ganesha Jewellery',
          tamilName: 'விநாயகர் ஆபரணங்கள்',
          image: '/assets/cat_ganesha.png',
          itemCount: 24,
          description: 'Auspicious Lord Ganesha pendants and lockets cast in sacred 5-metal Panchaloham for obstacle removal and prosperity.',
        },
        {
          id: 'murugan',
          slug: 'murugan-jewellery',
          name: 'Murugan Jewellery',
          tamilName: 'முருகன் வேல்',
          image: '/assets/cat_murugan.png',
          itemCount: 18,
          description: 'Divine Murugan Vel and peacock pendants symbolizing courage, spiritual victory, and protection.',
        },
        {
          id: 'shiva',
          slug: 'shiva-jewellery',
          name: 'Shiva Jewellery',
          tamilName: 'சிவ பெருமான்',
          image: '/assets/cat_shiva.png',
          itemCount: 16,
          description: 'Shiva Lingam, Trishul, and Rudraksha lockets imbued with cosmic energy and meditative peace.',
        },
        {
          id: 'lakshmi',
          slug: 'lakshmi-jewellery',
          name: 'Lakshmi Jewellery',
          tamilName: 'மகாலட்சுமி',
          image: '/assets/cat_lakshmi.png',
          itemCount: 22,
          description: 'Graceful Mahalakshmi pendants radiating abundance, fortune, and eternal feminine grace.',
        },
        {
          id: 'devi',
          slug: 'devi-jewellery',
          name: 'Devi Jewellery',
          tamilName: 'சக்தி ஆபரணங்கள்',
          image: '/assets/cat_devi.png',
          itemCount: 15,
          description: 'Sacred Shakthi, Durga, and Meenakshi Amman motifs offering divine protection and empowerment.',
        },
        {
          id: 'spiritual',
          slug: 'spiritual-symbols',
          name: 'Spiritual Symbols',
          tamilName: 'ஆன்மீக சின்னங்கள்',
          image: '/assets/cat_spiritual.png',
          itemCount: 30,
          description: 'Sacred Om, Sri Yantra, and Swastik symbols cast with traditional Vedic precision.',
        },
        {
          id: 'chains',
          slug: 'chains-necklaces',
          name: 'Chains & Necklaces',
          tamilName: 'மாலைகள் & சங்கிலிகள்',
          image: '/assets/cat_chains.png',
          itemCount: 14,
          description: 'Dense, hand-linked Panchaloham chains crafted with traditional south Indian links.',
        },
      ],
    });
  }

  // 3. Products
  const productsCount = await prisma.product.count();
  if (productsCount === 0) {
    console.log('Seeding 9 sacred Panchaloham jewellery products...');
    await prisma.product.createMany({
      data: [
        {
          id: 'prod-001',
          slug: 'lord-ganesha-panchaloham-pendant',
          name: 'Lord Ganesha Pendant',
          deity: 'Lord Ganesha',
          category: 'pendants',
          price: 1899,
          originalPrice: 2499,
          rating: 5.0,
          reviewsCount: 120,
          inStock: true,
          featured: true,
          description:
            'Impeccably detailed Lord Ganesha seated on a lotus throne inside a celestial halo. Hand-cast in traditional Panchaloham (Gold, Silver, Copper, Zinc, and Iron) by master temple silversmiths in Kerala. Infused with Vedic mantras for obstacle removal, wisdom, and auspicious beginnings.',
          metalGold: '2.5%',
          metalSilver: '12.5%',
          metalCopper: '65.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Govt. Approved Panchaloham Lab Certified',
          dimensions: '3.8 cm Height x 2.4 cm Width',
          weight: '14.8 grams',
          consecrationDetails: 'Prana Pratishtha performed at traditional temple shrine before packaging.',
          images: ['/assets/prod_ganesha_hq.webp', '/assets/imagetressary.png'],
          benefits: [
            'Removes obstacles in business, education, and career (Vighnaharta)',
            'Balances subtle body electromagnetic frequencies via the 5 sacred metals',
            'Resistant to tarnishing; retains radiant temple antique gold luster',
          ],
          tags: ['ganesha', 'pendant', 'panchaloham', 'bestseller', 'temple jewellery'],
        },
        {
          id: 'prod-002',
          slug: 'murugan-vel-pendant',
          name: 'Murugan Vel Pendant',
          deity: 'Lord Murugan',
          category: 'pendants',
          price: 1799,
          originalPrice: 2299,
          rating: 5.0,
          reviewsCount: 98,
          inStock: true,
          featured: true,
          description:
            'A majestic depiction of Lord Murugan holding the sacred Vel (spear of divine intellect and victory). Cast with intricate temple engraving and polished to a warm golden sheen.',
          metalGold: '2.5%',
          metalSilver: '12.5%',
          metalCopper: '65.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Temple Artisan Guild Hallmarked',
          dimensions: '4.2 cm Height x 1.8 cm Width',
          weight: '13.2 grams',
          consecrationDetails: 'Consecrated with Vel Maral and Skanda Sashti prayers.',
          images: ['/assets/prod_murugan_hq.webp', '/assets/imagetressary.png'],
          benefits: [
            'Inspires courage, willpower, and decisive clarity',
            'Shields against negative psychic vibrations and malefic Mars effects',
            'Comfortable lightweight daily wear for adults and youths',
          ],
          tags: ['murugan', 'vel', 'pendant', 'panchaloham'],
        },
        {
          id: 'prod-003',
          slug: 'shiva-lingam-pendant',
          name: 'Shiva Lingam Pendant',
          deity: 'Lord Shiva',
          category: 'pendants',
          price: 1599,
          originalPrice: 2099,
          rating: 5.0,
          reviewsCount: 76,
          inStock: true,
          featured: true,
          description:
            'Sanctified representation of the Shiva Lingam sheltered under the celestial multi-headed Sheshanaga cobra canopy. Exemplifies the formless infinity of Mahadeva.',
          metalGold: '2.5%',
          metalSilver: '12.5%',
          metalCopper: '65.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Certified 5-Metal Composition',
          dimensions: '3.5 cm Height x 2.0 cm Width',
          weight: '15.1 grams',
          consecrationDetails: 'Abhishekam performed with holy theertham and vibhuti.',
          images: ['/assets/prod_shiva.png', '/assets/imagetressary.png'],
          benefits: [
            'Promotes peace of mind, deep meditation, and emotional stability',
            'Grounds planetary Saturn and Rahu energies',
            'Heirloom craftsmanship that deepens in patina over decades',
          ],
          tags: ['shiva', 'lingam', 'pendant', 'panchaloham'],
        },
        {
          id: 'prod-004',
          slug: 'goddess-lakshmi-pendant',
          name: 'Lakshmi Pendant',
          deity: 'Goddess Lakshmi',
          category: 'pendants',
          price: 1999,
          originalPrice: 2599,
          rating: 5.0,
          reviewsCount: 112,
          inStock: true,
          featured: true,
          description:
            'Exquisitely carved Ashta Lakshmi avatar seated on blooming lotus petals, with twin celestial elephants showering blessings. Revered for invoking Sri (wealth, luck, and abundance).',
          metalGold: '3.0%',
          metalSilver: '14.0%',
          metalCopper: '63.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Hallmark Panchaloham Grade A',
          dimensions: '3.9 cm Height x 2.7 cm Width',
          weight: '16.4 grams',
          consecrationDetails: 'Blessed with Sri Suktam and Lakshmi Kubera homam chanting.',
          images: ['/assets/prod_lakshmi_hq.webp', '/assets/imagetressary.png'],
          benefits: [
            'Attracts abundance, business growth, and auspicious family harmony',
            'Infused with 5 sacred metals to ground stress and elevate aura',
            'Matches traditional sarees, silks, and everyday attire',
          ],
          tags: ['lakshmi', 'pendant', 'wealth', 'panchaloham', 'bestseller'],
        },
        {
          id: 'prod-005',
          slug: 'sacred-om-pendant',
          name: 'Om Pendant',
          deity: 'Universal Brahman',
          category: 'pendants',
          price: 1299,
          originalPrice: 1699,
          rating: 5.0,
          reviewsCount: 64,
          inStock: true,
          featured: true,
          description:
            'The primordial sound of creation encapsulated in solid Panchaloham. Framed by delicate beaded sunburst rays that reflect ambient light like temple sanctum gold.',
          metalGold: '2.5%',
          metalSilver: '12.5%',
          metalCopper: '65.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Vedic Metal Guild Certified',
          dimensions: '3.0 cm Diameter',
          weight: '10.5 grams',
          consecrationDetails: 'Chanted with Gayatri and Pranava Om 1008 times.',
          images: ['/assets/prod_om.png', '/assets/imagetressary.png'],
          benefits: [
            'Centering frequency for yoga, mantra meditation, and daily calm',
            'Unisex design ideal for all ages and spiritual traditions',
          ],
          tags: ['om', 'spiritual', 'pendant', 'panchaloham'],
        },
        {
          id: 'prod-006',
          slug: 'traditional-panchaloham-chain',
          name: 'Traditional Chain',
          deity: 'Universal',
          category: 'chains',
          price: 2499,
          originalPrice: 3199,
          rating: 5.0,
          reviewsCount: 89,
          inStock: true,
          featured: true,
          description:
            'A dense, meticulously hand-linked traditional Panchaloham rope chain designed to hold temple pendants or be worn as a stately standalone necklace.',
          metalGold: '2.5%',
          metalSilver: '12.5%',
          metalCopper: '65.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Guaranteed Panchaloham Assay Marked',
          dimensions: '24 inches length x 4.5 mm thickness',
          weight: '28.0 grams',
          consecrationDetails: 'Dipped in sacred herbal oils and blessed in temple sanctum.',
          images: ['/assets/prod_chain_hq.webp', '/assets/imagetressary.png'],
          benefits: [
            'Ultra-durable links with high tensile strength that will not stretch or break',
            'Hypoallergenic blend that naturally warms to skin temperature',
            'Authentic antique matte-gold hue',
          ],
          tags: ['chain', 'necklace', 'panchaloham', 'traditional'],
        },
        {
          id: 'prod-007',
          slug: 'panchaloham-ayurvedic-kada-bracelet',
          name: 'Panchaloham Ayurvedic Kada Bracelet',
          deity: 'Universal',
          category: 'bracelets',
          price: 2199,
          originalPrice: 2899,
          rating: 4.9,
          reviewsCount: 53,
          inStock: true,
          featured: false,
          description:
            'Traditional Ayurvedic Panchaloham bangle with elephant-head terminals. In classical Siddha medicine, continuous skin contact with the five metals helps balance Vata, Pitta, and Kapha doshas.',
          metalGold: '2.5%',
          metalSilver: '12.5%',
          metalCopper: '65.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Ayurvedic Metal Standards Certified',
          dimensions: 'Free size, gently adjustable',
          weight: '32.0 grams',
          consecrationDetails: 'Energized with Dhanvantari health mantras.',
          images: [
            'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
          ],
          benefits: [
            'Aids healthy blood circulation and joint comfort',
            'Acts as a natural bio-magnetic harmonizer',
            'Adjustable fit fits any wrist comfortably',
          ],
          tags: ['bracelet', 'kada', 'ayurveda', 'health'],
        },
        {
          id: 'prod-008',
          slug: 'sacred-navagraha-ring',
          name: 'Navagraha 9-Gem Panchaloham Ring',
          deity: 'Navagrahas',
          category: 'rings',
          price: 1499,
          originalPrice: 1999,
          rating: 4.8,
          reviewsCount: 67,
          inStock: true,
          featured: false,
          description:
            'A potent ring containing nine astrological stones set into a solid Panchaloham band to harmonize the nine celestial bodies and shield from planetary afflictions.',
          metalGold: '2.5%',
          metalSilver: '12.5%',
          metalCopper: '65.0%',
          metalZinc: '15.0%',
          metalIron: '5.0%',
          purityCertificate: 'Certified Astrological Metal Band',
          dimensions: 'Available in Indian ring sizes 12 to 24',
          weight: '8.5 grams',
          consecrationDetails: 'Consecrated during Navagraha Homam on Shukla Paksha Thursday.',
          images: [
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
          ],
          benefits: [
            'Pacifies planetary doshas and encourages good fortune',
            'Comfort-fit band engineered for continuous daily wear',
          ],
          tags: ['ring', 'navagraha', 'astrology', 'panchaloham'],
        },
        {
          id: 'prod-009',
          slug: 'brass-panchaloham-mayur-diya',
          name: 'Royal Mayur Peacock Temple Diya',
          deity: 'Universal',
          category: 'pooja-items',
          price: 1199,
          originalPrice: 1599,
          rating: 5.0,
          reviewsCount: 44,
          inStock: true,
          featured: false,
          description:
            'Hand-cast brass and Panchaloham sacred temple lamp crowned by an intricately fanned peacock motif. Creates an enchanting golden aura during morning and evening sandhya puja.',
          metalGold: '1.0%',
          metalSilver: '5.0%',
          metalCopper: '70.0%',
          metalZinc: '20.0%',
          metalIron: '4.0%',
          purityCertificate: 'Artisanal Brass & Panchaloham Guild Assured',
          dimensions: '22 cm Height x 11 cm Base Diameter',
          weight: '680 grams',
          consecrationDetails: 'Polished with natural tamarind paste and blessed in sanctum.',
          images: [
            'https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=800&q=80',
          ],
          benefits: [
            'Heavy weighted base prevents accidental tipping',
            'Burns sesame oil or pure cow ghee smoothly without excess smoke',
            'Brings radiant sattvic energy to any home prayer altar',
          ],
          tags: ['diya', 'lamp', 'pooja', 'brass'],
        },
      ],
    });
  }

  // 4. Orders
  const ordersCount = await prisma.order.count();
  if (ordersCount === 0) {
    console.log('Seeding 4 devotee orders...');
    await prisma.order.createMany({
      data: [
        {
          id: 'ORD-98421',
          devoteeName: 'Suresh Narayanan',
          email: 'suresh.n@example.com',
          phone: '+91 98410 44210',
          items: [
            { productId: 'prod-001', productName: 'Lord Ganesha Pendant', price: 2499, quantity: 1 },
            { productId: 'prod-007', productName: 'Traditional Panchaloham Rope Chain', price: 3299, quantity: 1 },
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
            { productId: 'prod-002', productName: 'Murugan Divine Vel Pendant', price: 2199, quantity: 1 },
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
            { productId: 'prod-004', productName: 'Mahalakshmi Ashtalakshmi Pendant', price: 2899, quantity: 2 },
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
            { productId: 'prod-003', productName: 'Shiva Trishul & Damru Locket', price: 2399, quantity: 1 },
            { productId: 'prod-008', productName: 'Ayurvedic Panchaloham Vala Kada', price: 2599, quantity: 1 },
          ],
          totalAmount: 4998,
          status: 'Delivered',
          shippingAddress: '23, Gandhi Nagar, Coimbatore - 641009',
          date: '2026-09-14',
          trackingNumber: 'DELHIVERY-7712390',
          paymentMethod: 'UPI (PhonePe)',
        },
      ],
    });
  }

  // 5. Devotee Users
  const devoteeCount = await prisma.devoteeUser.count();
  if (devoteeCount === 0) {
    console.log('Seeding 6 devotee users...');
    await prisma.devoteeUser.createMany({
      data: [
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
      ],
    });
  }

  // 6. Blog Posts
  const blogCount = await prisma.blogPost.count();
  if (blogCount === 0) {
    console.log('Seeding blog articles...');
    await prisma.blogPost.createMany({
      data: [
        {
          id: 'alchemical-secrets-of-panchaloham',
          slug: 'alchemical-secrets-of-panchaloham',
          title: 'The Secret Vedic Ratios of 5-Metal Temple Metallurgy',
          subtitle: 'Why ancient Agamic treatises demand the exact fusion of Gold, Silver, Copper, Zinc, and Iron',
          excerpt: 'Why ancient Agamic treatises strictly demand the exact fusion of Gold, Silver, Copper, Zinc, and Iron.',
          image: '/assets/blog_vedic_metallurgy.jpg',
          date: 'September 15, 2026',
          readTime: '8 min',
          tag: 'VEDIC METALLURGY',
          category: 'Sacred Metallurgy',
          authorName: 'Master Sthapati R. Shanmugam',
          authorRole: 'Chief Temple Metallurgist',
          likes: 348,
          featured: true,
          content: { lead: 'In temple metallurgy, Panchaloham is an alchemical energetic conductor.' },
        },
        {
          id: 'temple-jewellery-care-rituals',
          slug: 'temple-jewellery-care-rituals',
          title: 'Caring for Consecrated Panchaloham: Sacred Cleansing & Polishing Rituals',
          subtitle: 'How to preserve the radiant warm patina of your 5-metal talismans without stripping sacred consecration energy',
          excerpt: 'How to preserve the radiant warm patina of your 5-metal talismans without stripping consecration blessings.',
          image: '/assets/blog_cleaning_ritual.jpg',
          date: 'September 10, 2026',
          readTime: '6 min',
          tag: 'CARE GUIDE',
          category: 'Care & Maintenance',
          authorName: 'Senior Curator Madhavan',
          authorRole: 'Temple Jewellery Curator',
          likes: 219,
          featured: false,
          content: { lead: 'Preserving the mirror gold luster of authentic five-metal Panchaloham.' },
        },
      ],
    });
  }

  // 7. Hero Slides
  const heroSlidesCount = await prisma.heroSlide.count();
  if (heroSlidesCount === 0) {
    console.log('Seeding hero slides...');
    await prisma.heroSlide.createMany({
      data: [
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
          orderIndex: 1,
          isActive: true,
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
          orderIndex: 2,
          isActive: true,
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
          orderIndex: 3,
          isActive: true,
        },
      ],
    });

    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('hero_slides', 'id'), coalesce(max(id), 0) + 1, false) FROM hero_slides;`
    );
  }

  // 8. Story Banners
  const storyBannersCount = await prisma.storyBanner.count();
  if (storyBannersCount === 0) {
    console.log('Seeding story banners...');
    await prisma.storyBanner.createMany({
      data: [
        {
          id: 'banner-1',
          title: 'A Sacred Gift for Your Loved Ones',
          desc: 'Perfect for festivals, weddings and special occasions.',
          ctaText: 'Explore Gifts',
          ctaLink: '/collections',
          image: '/assets/banner_sacred_gift.png',
          orderIndex: 1,
          isActive: true,
        },
        {
          id: 'banner-2',
          title: 'Crafted in Panchaloham',
          desc: 'A divine blend of five sacred metals for positive energy and well-being.',
          ctaText: 'Our Story',
          ctaLink: '/about',
          image: '/assets/banner_panchaloham.png',
          orderIndex: 2,
          isActive: true,
        },
      ],
    });
  }

  // 9. Announcements
  const announcementCount = await prisma.announcement.count();
  if (announcementCount === 0) {
    console.log('Seeding announcements...');
    await prisma.announcement.create({
      data: {
        id: 'announcement-default',
        freeShippingText: 'Free Shipping on Orders Above ₹999',
        authenticityText: 'Authentic Panchaloham',
        worldwideText: 'Blessings Delivered Worldwide',
        activePromoAlert: 'Special Navaratri Consecration: Free Sanctum Prasadam with every order',
        isActive: true,
      },
    });
  }

  // 10. FAQs
  const faqsCount = await prisma.faq.count();
  if (faqsCount === 0) {
    console.log('Seeding FAQs...');
    await prisma.faq.createMany({
      data: [
        {
          question: 'What is Panchaloham and why is it spiritually significant?',
          answer:
            'Panchaloham (meaning five metals in Sanskrit: Pon/Gold, Velli/Silver, Chembu/Copper, Pithalai/Zinc, and Irumbu/Iron) is an ancient sacred Vedic alloy. Traditional temple agamas specify Panchaloham for deity murtis and personal talismans because the electromagnetic balance of these five metals absorbs and radiates divine cosmic vibrations, bringing health, mental calm, and spiritual vitality to the wearer.',
          category: 'spirituality',
          orderIndex: 1,
          isActive: true,
        },
        {
          question: 'Does your jewellery come with a certificate of authenticity?',
          answer:
            'Yes! Every piece from Aamaclappetti is accompanied by an authenticated Hallmark Metal Composition Certificate and an artisan origin seal from our heritage workshops in North Paravoor, Kerala.',
          category: 'authenticity',
          orderIndex: 2,
          isActive: true,
        },
        {
          question: 'Will Panchaloham jewellery tarnish or rust over time?',
          answer:
            'Unlike cheap fashion jewellery, authentic Panchaloham develops an exquisite, warm antique patina that deepens in elegance. It never flakes or peels. If you wish to restore its brilliant gold-like mirror shine, simply polish it gently with natural lemon juice or pitambari powder.',
          category: 'care',
          orderIndex: 3,
          isActive: true,
        },
        {
          question: 'Are the pendants consecrated (Prana Pratishtha)?',
          answer:
            'All our sacred deity pendants and lockets are placed before sanctified temple shrines in Kerala and chanted with traditional Vedic shlokas before being carefully packed in sacred velvet and brass gift boxes.',
          category: 'consecration',
          orderIndex: 4,
          isActive: true,
        },
        {
          question: 'How long does shipping take?',
          answer:
            'We provide free express insured shipping across India on orders above ₹999 (delivered within 3 to 5 business days). For international devotees (USA, UK, UAE, Singapore, Europe), delivery is handled via DHL Express within 5 to 7 business days.',
          category: 'shipping',
          orderIndex: 5,
          isActive: true,
        },
      ],
    });
  }

  console.log('Complete database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
