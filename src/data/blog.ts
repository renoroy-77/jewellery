export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  tag: string;
  category: string;
  author: {
    name: string;
    role: string;
  };
  likes: number;
  featured?: boolean;
  content: {
    lead: string;
    sections: {
      heading: string;
      body: string[];
      highlight?: string;
    }[];
    sacredVerse?: {
      shloka: string;
      meaning: string;
      source: string;
    };
    takeaways: string[];
    relatedProductSlugs: string[];
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'alchemical-secrets-of-panchaloham',
    slug: 'alchemical-secrets-of-panchaloham',
    title: 'The Secret Vedic Ratios of 5-Metal Temple Metallurgy',
    subtitle: 'Why ancient Agamic treatises demand the exact fusion of Gold, Silver, Copper, Zinc, and Iron',
    excerpt:
      'Why ancient Agamic treatises strictly demand the exact fusion of Gold, Silver, Copper, Zinc, and Iron — and how this fivefold matrix balances subtle human electromagnetic fields.',
    image: '/assets/blog_vedic_metallurgy.jpg',
    date: 'September 15, 2026',
    readTime: '8 min',
    tag: 'VEDIC METALLURGY',
    category: 'Sacred Metallurgy',
    author: {
      name: 'Master Sthapati R. Shanmugam',
      role: 'Chief Temple Metallurgist & Heritage Sthapati',
    },
    likes: 348,
    featured: true,
    content: {
      lead:
        'In the temple metallurgy traditions codified in the Shilpa Shastras and Karanagama, Panchaloham (five-metal alloy) is not simply an ornamental composition. It is an alchemical energetic conductor engineered to stabilize, transmit, and resonate with cosmic electromagnetic frequencies.',
      sections: [
        {
          heading: 'The Pancha Bhootas: Elemental Blueprint of the Alloy',
          body: [
            'Each constituent metal in genuine Panchaloham corresponds directly to one of the five primordial elements (Pancha Bhootas) and its celestial planetary ruler: Gold (Surya - Agni/Fire), Silver (Chandra - Jala/Water), Copper (Mangala - Prithvi/Earth), Iron (Shani - Vayu/Air), and Zinc (Budha - Akasha/Ether).',
            'When fused in exact proportions under sacred fire while chanting metallurgical hymns (Loha Suktam), the crystalline lattice of the resulting alloy acquires exceptional vibrational conductivity. Unlike single metals, this multi-element matrix exhibits a harmonized resonance that resists electromagnetic dissipation.',
          ],
          highlight:
            'A true Panchaloham talisman is not dead matter; it acts as a subtle psychic capacitor tuned to the wearer’s bio-energy field.',
        },
        {
          heading: 'Why Machine-Cast Reproductions Fail',
          body: [
            'Commercial imitations commonly substitute cheap brass or pewter bathed in a micro-thin layer of electroplated gold. These factory replicas lack the essential trace elements of iron and silver mandated by the Agamas.',
            'Without the synergistic balance of all five metals, the energetic conductivity is broken. Genuine temple casting requires the lost-wax method (Cire Perdue), wherein molten metal is poured into a hand-carved clay mould baked in herbal charcoal furnaces.',
          ],
        },
        {
          heading: 'Bio-Magnetic Benefits for the Modern Wearer',
          body: [
            'Ayurvedic texts, including Charaka Samhita, document the therapeutic efficacy of contact metallurgy (Loha Chikitsa). Copper and zinc ions absorbed transdermally assist in balancing Pitta and Kapha doshas, while natural iron traces strengthen vital Prana.',
            'Devotees who wear consecrated Panchaloham report heightened focus during meditation, stabilized pulse harmony, and a palpable aura of calm protection against modern environmental stressors.',
          ],
        },
      ],
      sacredVerse: {
        shloka: 'सुवर्णं रजतं चैव ताम्रं कांस्यं तथाऽऽयसम् । पञ्चलोहमिति प्रोक्तं सर्वसिद्धिप्रदायकम् ॥',
        meaning:
          'Gold, silver, copper, bronze/brass (zinc), and iron together are proclaimed as Panchaloham — bestower of all spiritual and material accomplishments.',
        source: 'Kāraṇāgama, Kriyā Pāda, Chapter 14',
      },
      takeaways: [
        'Panchaloham unites Gold, Silver, Copper, Zinc, and Iron representing the 5 elements.',
        'Handcrafted lost-wax casting preserves electromagnetic integrity that electroplated jewellery lacks.',
        'Wearing five-metal sanctified jewellery provides transdermal ionic balance and spiritual serenity.',
      ],
      relatedProductSlugs: [
        'lord-ganesha-panchaloham-pendant',
        'traditional-panchaloham-chain',
        'panchaloham-ayurvedic-kada-bracelet',
      ],
    },
  },
  {
    id: 'temple-jewellery-care-rituals',
    slug: 'temple-jewellery-care-rituals',
    title: 'Traditional Cleansing & Care for Temple Gold Jewellery',
    subtitle: 'Sacred and natural preservation methods handed down through generations of temple custodians',
    excerpt:
      'Learn how consecrated Panchaloham and gold temple jewellery should be ritually bathed, gently polished with natural ingredients, and preserved for centuries.',
    image: '/assets/imagetressary.png',
    date: 'September 10, 2026',
    readTime: '5 min',
    tag: 'CARE & PURITY',
    category: 'Preservation & Rituals',
    author: {
      name: 'Dr. V. Kalyanasundaram',
      role: 'Agama Shastra Researcher',
    },
    likes: 215,
    content: {
      lead:
        'Because consecrated temple jewellery is infused with divine sankalpa, its care is considered both an artistic responsibility and an act of reverent devotion. Here is the authentic ritual cleansing regimen practiced in South Indian sanctums.',
      sections: [
        {
          heading: 'Natural Bathing: Reetba & Tamarind Lustration',
          body: [
            'Never subject your Panchaloham pendants or chains to harsh synthetic detergents or ammonia-based cleaners. These chemicals strip the natural protective patina developed over sacred casting.',
            'Instead, prepare a lukewarm infusion using natural soapnut (Reetha) pulp or aged tamarind paste diluted in pure spring or well water. Gently massage with a soft natural bristle brush to dislodge accumulated vibhuti, chandan, or kumkum residue.',
          ],
          highlight:
            'A weekly wipe with pure Gangajal or rosewater followed by anointing with sacred sesame oil restores the luminous bronze-gold luster.',
        },
        {
          heading: 'Storage in Sacred Silk & Teak',
          body: [
            'Store your jewellery wrapped in undyed raw silk or saffron velvet within a teak or brass box (Aamadappetti). Silk prevents static electromagnetic drain and insulates the metals from atmospheric oxidation.',
            'Placing a small pinch of natural dried camphor (Pachai Karpooram) inside the storage casket prevents moisture tarnishing while imbuing your ornaments with temple fragrance.',
          ],
        },
      ],
      takeaways: [
        'Avoid chemical detergents; use organic soapnut and aged tamarind infusions.',
        'Anoint occasionally with a drop of sesame or sandalwood oil for lasting radiance.',
        'Store wrapped in natural silk inside an authentic wooden jewellery casket.',
      ],
      relatedProductSlugs: [
        'goddess-lakshmi-pendant',
        'traditional-panchaloham-chain',
        'sacred-navagraha-ring',
      ],
    },
  },
  {
    id: 'murugan-vel-symbolism',
    slug: 'murugan-vel-symbolism',
    title: 'The Mystical Vel of Lord Murugan: Jewellery & Cosmic Clarity',
    subtitle: 'Understanding the spear of Gnana (wisdom) and why it protects the wearer from negative karmic vibrations',
    excerpt:
      'Explore the esoteric geometry of the divine Vel pendant — broad at the base, sharp at the edge, and penetrating deep into the mysteries of higher consciousness.',
    image: '/assets/prod_murugan_hq.webp',
    date: 'September 04, 2026',
    readTime: '6 min',
    tag: 'JEWELLERY SYMBOLISM',
    category: 'Spiritual Iconography',
    author: {
      name: 'Swami Nityananda Giri',
      role: 'Vedic Symbolism & Philosophy Scholar',
    },
    likes: 429,
    content: {
      lead:
        'The divine spear (Vel) presented to Lord Murugan by Mother Parvati represents the pinnacle of spiritual intellect (Gnana Shakthi). When crafted in Panchaloham and worn near the Anahata (heart) chakra, it serves as a metaphysical shield.',
      sections: [
        {
          heading: 'The Sacred Anatomy of the Vel',
          body: [
            'The form of the Vel is a profound spiritual diagram: broad at the bottom representing breadth of knowledge, slender along the stem representing focused discipline, and razor-sharp at the tip symbolizing penetrating discernment.',
            'By wearing a sanctified Vel pendant, the devotee is continuously reminded of discriminating wisdom (Viveka), enabling them to cut through illusions, self-doubt, and mental agitation.',
          ],
          highlight:
            'The Vel does not merely destroy demons in outer mythology; it eradicates the inner Asuras of lust, ego, jealousy, and fear.',
        },
      ],
      takeaways: [
        'The Vel symbolizes Gnana Shakthi — divine intellect and cosmic clarity.',
        'Worn close to the chest, it stabilizes the respiratory rhythm and heart energy.',
        'Authentic Panchaloham alloy intensifies the talismanic aura of Murugan protection.',
      ],
      relatedProductSlugs: [
        'murugan-vel-pendant',
        'traditional-panchaloham-chain',
        'panchaloham-ayurvedic-kada-bracelet',
      ],
    },
  },
  {
    id: 'prana-pratishtha-consecration',
    slug: 'prana-pratishtha-consecration',
    title: 'What Truly Happens During Temple Jewellery Consecration?',
    subtitle: 'Step into the sanctum sanctorum during the ancient Prana Pratishtha rituals',
    excerpt:
      'Discover the rigorous mantras, herb-infused purifications, and sacred yantras utilized by temple priests to transform inert metal into a living spiritual talisman.',
    image: '/assets/banner_sacred_gift.png',
    date: 'August 28, 2026',
    readTime: '7 min',
    tag: 'TEMPLE RITUALS',
    category: 'Vedic Consecration',
    author: {
      name: 'Master Sthapati R. Shanmugam',
      role: 'Chief Temple Metallurgist & Heritage Sthapati',
    },
    likes: 312,
    content: {
      lead:
        'A pendant purchased from a commercial storefront is decorative art; a consecrated pendant from Aamadappetti has undergone Prana Pratishtha — the Vedic invocation of life-breath and deity presence.',
      sections: [
        {
          heading: 'The Three Stages of Consecration',
          body: [
            'The process begins with Jaladhivasa (submersion in sacred river waters and herbs for 24 hours), purifying the metal of any lingering casting stress or negative metallurgical memory.',
            'Next, the ornament is placed on an active energized Yantra during Dhanyadhivasa (rest in grain beds), absorbing the nourishing vitality of fertile Mother Earth.',
            'Finally, Vedic pandits perform Netronmeelanam and Prana Pratishtha through rigorous Japa and fire offerings (Homa), breathing living divine consciousness into the form.',
          ],
          highlight:
            'Consecration transforms physical metal into a spiritual mirror reflecting and magnifying divine grace.',
        },
      ],
      takeaways: [
        'Prana Pratishtha purifies and energizes the 5-metal matrix through sacred Vedic rites.',
        'Submersion in consecrated waters clears residual casting memories.',
        'Consecrated jewellery should be treated with daily reverence and worn with clean intent.',
      ],
      relatedProductSlugs: [
        'lord-ganesha-panchaloham-pendant',
        'shiva-lingam-pendant',
        'goddess-lakshmi-pendant',
      ],
    },
  },
  {
    id: 'choosing-right-deity-pendant',
    slug: 'choosing-right-deity-pendant',
    title: 'How to Choose the Right Sacred Pendant for Your Family',
    subtitle: 'A practical Vedic guide to aligning with your Ishta Devata and Kuladevata',
    excerpt:
      'A practical guide to matching your family deity with the right Panchaloham jewellery for daily worship, inner peace, and generational blessings.',
    image: '/assets/cat_ganesha_hq.webp',
    date: 'August 20, 2026',
    readTime: '6 min',
    tag: "BUYER'S GUIDE",
    category: 'Sacred Guidance',
    author: {
      name: 'Dr. V. Kalyanasundaram',
      role: 'Agama Shastra Researcher',
    },
    likes: 189,
    content: {
      lead:
        'Selecting a deity pendant is more than choosing an aesthetic ornament; it is establishing a daily sacred conduit between your personal life and the divine guardian of your ancestry.',
      sections: [
        {
          heading: 'Distinguishing Ishta Devata from Kula Devata',
          body: [
            'Your Kula Devata (ancestral deity) preserves the karmic continuity and spiritual protection of your family lineage across generations. If your ancestry worships Lord Murugan or Goddess Devi, wearing their sacred emblem anchors that lineage blessing.',
            'Your Ishta Devata (chosen deity) is the divine form with whom your soul feels spontaneous spiritual affinity — whether Lord Ganesha for overcoming obstacles, or Lord Shiva for supreme inner peace.',
          ],
        },
      ],
      takeaways: [
        'Kula Devata jewellery strengthens ancestral blessings and family harmony.',
        'Ishta Devata jewellery deepens personal daily meditation and focused devotion.',
        'Panchaloham provides a neutral, highly receptive metal ground for any divine invocation.',
      ],
      relatedProductSlugs: [
        'lord-ganesha-panchaloham-pendant',
        'murugan-vel-pendant',
        'shiva-lingam-pendant',
      ],
    },
  },
  {
    id: 'panchaloham-vs-gold-plating',
    slug: 'panchaloham-vs-gold-plating',
    title: 'Panchaloham vs Gold-Plated: The Truth Nobody Tells You',
    subtitle: 'Comparing durability, skin health, and spiritual value across metallurgical choices',
    excerpt:
      'Why genuine five-metal sacred alloys outlast commercial gold plating by decades — and cost less in the long run while protecting your skin.',
    image: '/assets/banner_panchaloham.png',
    date: 'August 14, 2026',
    readTime: '5 min',
    tag: 'COMPARISON',
    category: 'Metallurgy Guide',
    author: {
      name: 'Master Sthapati R. Shanmugam',
      role: 'Chief Temple Metallurgist & Heritage Sthapati',
    },
    likes: 275,
    content: {
      lead:
        'Commercial gold plating applies a microscopic coating (often under 0.5 microns) over reactive base metals. Within months of daily wear, body heat, sweat, and perfumes dissolve this skin, exposing nickel that causes skin allergies and green discoloration.',
      sections: [
        {
          heading: 'Solid Fusion vs Superficial Sheen',
          body: [
            'Panchaloham is solid metal throughout. There is no outer skin to peel, flake, or wear down. When polished, the core reveals the identical rich, warm golden luster.',
            'Over decades of worship and daily contact, Panchaloham does not deteriorate; it matures, developing the revered temple bronze sheen cherished by collectors and heirloom custodians.',
          ],
          highlight:
            'A gold-plated chain lasts 6 months; a genuine Panchaloham chain lasts generations.',
        },
      ],
      takeaways: [
        'Gold plating wears off rapidly and exposes irritating base metals.',
        'Panchaloham is a solid homogeneous alloy that never peels or flakes.',
        'Natural antimicrobial copper and zinc maintain skin cleanliness and health.',
      ],
      relatedProductSlugs: [
        'traditional-panchaloham-chain',
        'panchaloham-ayurvedic-kada-bracelet',
        'sacred-navagraha-ring',
      ],
    },
  },
  {
    id: 'gifting-sacred-jewellery',
    slug: 'gifting-sacred-jewellery',
    title: 'The Art of Gifting Sacred Jewellery at Auspicious Occasions',
    subtitle: 'Festival muhurthams, naming ceremonies, and weddings: gifting divine heritage',
    excerpt:
      'Festival muhurthams, naming ceremonies, and weddings — how to select and present divine jewellery as an auspicious sacred gift that carries eternal prayers.',
    image: '/assets/banner_sacred_gift.png',
    date: 'August 08, 2026',
    readTime: '6 min',
    tag: 'GIFTING',
    category: 'Sacred Gifting',
    author: {
      name: 'Dr. V. Kalyanasundaram',
      role: 'Agama Shastra Researcher',
    },
    likes: 198,
    content: {
      lead:
        'In Vedic culture, gifting jewellery is a holy sacrament (Dana) that binds giver and receiver in mutual auspiciousness (Mangalam). Consecrated Panchaloham jewellery gifts convey blessings that far transcend ephemeral material presents.',
      sections: [
        {
          heading: 'Auspicious Muhurthams for Presentation',
          body: [
            'Present divine jewellery on auspicious Tithis such as Akshaya Tritiya, Dhanteras, Navratri, or personal birth Nakshatras. Accompany the gift with fresh betel leaves, unbroken supari, and sacred rice (Akshata).',
            'Because our jewellery arrives consecration-ready in a hand-crafted presentation casket, it can be placed directly on the recipient’s home altar for initial blessings.',
          ],
        },
      ],
      takeaways: [
        'Sacred jewellery gifts convey eternal blessings and protective grace.',
        'Ideal for weddings, child naming rituals, housewarmings, and festival milestones.',
        'Arrives in ceremonial presentation packaging ready for puja offering.',
      ],
      relatedProductSlugs: [
        'goddess-lakshmi-pendant',
        'lord-ganesha-panchaloham-pendant',
        'traditional-panchaloham-chain',
      ],
    },
  },
];
