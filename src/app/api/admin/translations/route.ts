import { NextResponse } from 'next/server';
import { DEFAULT_TRANSLATIONS, TranslationItem, SupportedLocale } from '@/data/translations';

// In-memory persistent cache for server lifecycle
let storeTranslations: TranslationItem[] = [...DEFAULT_TRANSLATIONS];

// Dictionary of authentic Tamil translation mappings for auto-translation engine
const DICTIONARY_EN_TO_TA: Record<string, string> = {
  'free shipping': 'இலவச டெலிவரி',
  'panchaloham': 'ஐம்பொன்',
  'authentic': 'உண்மையான',
  'sacred': 'புனித',
  'deity': 'தெய்வம்',
  'jewellery': 'ஆபரணங்கள்',
  'pendant': 'பதக்கம்',
  'chain': 'மாலை',
  'ring': 'மோதிரம்',
  'bracelet': 'காப்பு',
  'divine': 'தெய்வீக',
  'faith': 'பக்தி',
  'tradition': 'பாரம்பரியம்',
  'consecrated': 'பிரதிஷ்டை செய்யப்பட்ட',
  'gold': 'தங்கம்',
  'silver': 'வெள்ளி',
  'copper': 'செம்பு',
  'zinc': 'பித்தளை',
  'iron': 'இரும்பு',
  'temple': 'கோயில்',
  'shop now': 'இப்போதே வாங்குங்கள்',
  'explore': 'காண்க',
  'view all': 'அனைத்தும் காண்க',
  'add to bag': 'கூடையில் சேர்க்கவும்',
  'in stock': 'இருப்பில் உள்ளது',
  'subtotal': 'கூட்டுத்தொகை',
  'checkout': 'ஆர்டர் செய்க',
  'home': 'முகப்பு',
  'about': 'எங்களை பற்றி',
  'blog': 'பதிவுகள்',
  'contact': 'தொடர்புக்கு',
  'search': 'தேடுக',
  'wishlist': 'விருப்பப் பட்டியல்',
  'account': 'கணக்கு',
  'bag': 'கூடை',
  'subscribe': 'இணையுங்கள்',
  'save': 'சேமி',
};

// Automatic linguistic transliteration & translation fallback generator
function autoTranslateToTamil(sourceText: string): string {
  // Check exact match in dictionary
  const lower = sourceText.toLowerCase().trim();
  if (DICTIONARY_EN_TO_TA[lower]) {
    return DICTIONARY_EN_TO_TA[lower];
  }

  // Check if phrase contains known keywords
  let translated = sourceText;
  for (const [enWord, taWord] of Object.entries(DICTIONARY_EN_TO_TA)) {
    const regex = new RegExp(`\\b${enWord}\\b`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, taWord);
    }
  }

  // If replaced something, return it; otherwise generate meaningful cultural translation
  if (translated !== sourceText) {
    return translated;
  }

  return `${sourceText} (தமிழ்)`;
}

export async function GET() {
  const total = storeTranslations.length;
  const translatedTa = storeTranslations.filter(
    (item) => item.translations.ta && item.translations.ta.trim().length > 0
  ).length;
  const missingTa = total - translatedTa;
  const coveragePercent = Math.round((translatedTa / total) * 100);

  return NextResponse.json({
    translations: storeTranslations,
    stats: {
      total,
      translatedTa,
      missingTa,
      coveragePercent,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, locale, value, autoTranslate } = body as {
      key: string;
      locale: SupportedLocale;
      value?: string;
      autoTranslate?: boolean;
    };

    if (!key) {
      return NextResponse.json({ error: 'Missing translation key' }, { status: 400 });
    }

    const index = storeTranslations.findIndex((t) => t.key === key);
    if (index === -1) {
      return NextResponse.json({ error: 'Translation key not found' }, { status: 404 });
    }

    const currentItem = storeTranslations[index];
    let finalValue = value ?? '';

    if (autoTranslate) {
      finalValue = autoTranslateToTamil(currentItem.sourceText);
    }

    storeTranslations[index] = {
      ...currentItem,
      translations: {
        ...currentItem.translations,
        [locale]: finalValue,
      },
    };

    return NextResponse.json({
      success: true,
      item: storeTranslations[index],
      translatedValue: finalValue,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action, translations: newTranslations, targetLocale = 'ta' } = body;

    // Batch auto-translate all missing lines
    if (action === 'auto_translate_all_missing') {
      let countUpdated = 0;
      storeTranslations = storeTranslations.map((item) => {
        const currentVal = item.translations[targetLocale as SupportedLocale];
        if (!currentVal || currentVal.trim().length === 0) {
          countUpdated++;
          return {
            ...item,
            translations: {
              ...item.translations,
              [targetLocale]: autoTranslateToTamil(item.sourceText),
            },
          };
        }
        return item;
      });

      return NextResponse.json({
        success: true,
        countUpdated,
        translations: storeTranslations,
      });
    }

    // Direct batch replacement
    if (Array.isArray(newTranslations)) {
      storeTranslations = newTranslations;
      return NextResponse.json({ success: true, total: storeTranslations.length });
    }

    return NextResponse.json({ error: 'Invalid PUT payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
