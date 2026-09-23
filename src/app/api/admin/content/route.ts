import { NextResponse } from 'next/server';
import {
  INITIAL_HERO_SLIDES,
  INITIAL_STORY_BANNERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_FOOTER_CMS,
  INITIAL_ABOUT_CMS,
  INITIAL_CHECKOUT_SETTINGS,
  HeroSlideCMS,
  StoryBannerCMS,
  AnnouncementCMS,
  FooterCMS,
  AboutPageCMS,
  CheckoutSettingsCMS,
} from '@/data/cmsData';
import { STORE_FAQS } from '@/data/products';
import { FAQItem } from '@/types';

// In-memory cache
let heroSlides: HeroSlideCMS[] = [...INITIAL_HERO_SLIDES];
let storyBanners: StoryBannerCMS[] = [...INITIAL_STORY_BANNERS];
let announcements: AnnouncementCMS = { ...INITIAL_ANNOUNCEMENTS };
let faqs: FAQItem[] = [...STORE_FAQS];
let footer: FooterCMS = { ...INITIAL_FOOTER_CMS };
let about: AboutPageCMS = { ...INITIAL_ABOUT_CMS };
let checkoutSettings: CheckoutSettingsCMS = { ...INITIAL_CHECKOUT_SETTINGS };

export async function GET() {
  return NextResponse.json({
    heroSlides,
    storyBanners,
    announcements,
    faqs,
    footer,
    about,
    checkoutSettings,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'heroSlides' && Array.isArray(data)) {
      heroSlides = data;
    } else if (type === 'storyBanners' && Array.isArray(data)) {
      storyBanners = data;
    } else if (type === 'announcements' && data) {
      announcements = data;
    } else if (type === 'faqs' && Array.isArray(data)) {
      faqs = data;
    } else if (type === 'footer' && data) {
      footer = { ...footer, ...data };
    } else if (type === 'about' && data) {
      about = { ...about, ...data };
    } else if (type === 'checkoutSettings' && data) {
      checkoutSettings = { ...checkoutSettings, ...data };
    } else {
      return NextResponse.json({ error: 'Invalid content type or data' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${type} updated successfully`,
      data,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CMS content' }, { status: 500 });
  }
}
