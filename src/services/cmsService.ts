import {
  HeroSlideCMS,
  StoryBannerCMS,
  AnnouncementCMS,
  INITIAL_HERO_SLIDES,
  INITIAL_STORY_BANNERS,
  INITIAL_ANNOUNCEMENTS,
} from '@/data/cmsData';
import { STORE_FAQS } from '@/data/products';
import { FAQItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface BackendStatus {
  connected: boolean;
  message: string;
}

export const cmsService = {
  async checkHealth(): Promise<BackendStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/announcements`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        return { connected: true, message: 'Connected to NestJS & PostgreSQL' };
      }
      return { connected: false, message: 'Backend returned error' };
    } catch {
      return { connected: false, message: 'Offline (Fallback Mode)' };
    }
  },

  // ================= HERO SLIDES =================
  async getHeroSlides(): Promise<HeroSlideCMS[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/hero-slides`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch hero slides');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : INITIAL_HERO_SLIDES;
    } catch (err) {
      console.warn('Falling back to local hero slides:', err);
      try {
        const local = localStorage.getItem('aamadappetti_hero_slides');
        if (local) return JSON.parse(local);
      } catch {}
      return INITIAL_HERO_SLIDES;
    }
  },

  async createHeroSlide(slide: Omit<HeroSlideCMS, 'id'>): Promise<HeroSlideCMS> {
    const res = await fetch(`${API_BASE_URL}/api/cms/hero-slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create hero slide in PostgreSQL');
    }
    return res.json();
  },

  async updateHeroSlide(id: number, slide: Partial<HeroSlideCMS>): Promise<HeroSlideCMS> {
    const res = await fetch(`${API_BASE_URL}/api/cms/hero-slides/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide),
    });
    if (!res.ok) throw new Error(`Failed to update hero slide ${id}`);
    return res.json();
  },

  async deleteHeroSlide(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/cms/hero-slides/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  async reorderHeroSlides(slideIds: number[]): Promise<HeroSlideCMS[]> {
    const res = await fetch(`${API_BASE_URL}/api/cms/hero-slides/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideIds }),
    });
    if (!res.ok) throw new Error('Failed to reorder hero slides');
    return res.json();
  },

  // ================= STORY BANNERS =================
  async getStoryBanners(): Promise<StoryBannerCMS[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/story-banners`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch story banners');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : INITIAL_STORY_BANNERS;
    } catch {
      return INITIAL_STORY_BANNERS;
    }
  },

  async updateStoryBanner(id: string, data: Partial<StoryBannerCMS>): Promise<StoryBannerCMS> {
    const res = await fetch(`${API_BASE_URL}/api/cms/story-banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update story banner ${id}`);
    return res.json();
  },

  // ================= ANNOUNCEMENTS =================
  async getAnnouncement(): Promise<AnnouncementCMS> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/announcements`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch announcements');
      return await res.json();
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  async updateAnnouncement(data: Partial<AnnouncementCMS>): Promise<AnnouncementCMS> {
    const res = await fetch(`${API_BASE_URL}/api/cms/announcements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update announcements');
    return res.json();
  },

  // ================= FAQS =================
  async getFaqs(): Promise<(FAQItem & { id?: string })[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/faqs`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch FAQs');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : STORE_FAQS;
    } catch {
      return STORE_FAQS;
    }
  },

  async createFaq(faq: { question: string; answer: string; category?: string }) {
    const res = await fetch(`${API_BASE_URL}/api/cms/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faq),
    });
    if (!res.ok) throw new Error('Failed to create FAQ');
    return res.json();
  },

  async updateFaq(id: string, data: Partial<FAQItem>) {
    const res = await fetch(`${API_BASE_URL}/api/cms/faqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update FAQ ${id}`);
    return res.json();
  },

  async deleteFaq(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/cms/faqs/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // ================= MEDIA UPLOAD =================
  async uploadMedia(file: File): Promise<{ url: string; asset?: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/media/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload media file');
    }

    const data = await res.json();
    // Return absolute URL or path accessible from frontend
    const fullUrl = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url}`;
    return { url: fullUrl, asset: data.asset };
  },

  // ================= AGGREGATED STOREFRONT =================
  async getStorefrontContent() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/storefront`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch storefront content');
      return await res.json();
    } catch {
      return {
        heroSlides: INITIAL_HERO_SLIDES,
        storyBanners: INITIAL_STORY_BANNERS,
        announcement: INITIAL_ANNOUNCEMENTS,
        faqs: STORE_FAQS,
      };
    }
  },
};
