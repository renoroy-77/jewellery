'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  Loader2,
  Database,
  X,
  Truck,
  Gift,
  Package,
} from 'lucide-react';
import {
  HeroSlideCMS,
  StoryBannerCMS,
  AnnouncementCMS,
  FooterCMS,
  AboutPageCMS,
  CheckoutSettingsCMS,
  INITIAL_HERO_SLIDES,
  INITIAL_STORY_BANNERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_FOOTER_CMS,
  INITIAL_ABOUT_CMS,
  INITIAL_CHECKOUT_SETTINGS,
} from '@/data/cmsData';
import { STORE_FAQS } from '@/data/products';
import { FAQItem } from '@/types';
import { cmsService } from '@/services/cmsService';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';

function AdminCMSContent() {
  const { confirm } = useConfirm();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'hero' | 'banners' | 'announcements' | 'faqs' | 'shipping' | 'footer' | 'about'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // CMS Data States
  const [heroSlides, setHeroSlides] = useState<HeroSlideCMS[]>(INITIAL_HERO_SLIDES);
  const [storyBanners, setStoryBanners] = useState<StoryBannerCMS[]>(INITIAL_STORY_BANNERS);
  const [announcements, setAnnouncements] = useState<AnnouncementCMS>(INITIAL_ANNOUNCEMENTS);
  const [faqs, setFaqs] = useState<(FAQItem & { id?: string })[]>(STORE_FAQS);
  const [footerData, setFooterData] = useState<FooterCMS>(INITIAL_FOOTER_CMS);
  const [aboutData, setAboutData] = useState<AboutPageCMS>(INITIAL_ABOUT_CMS);
  const [checkoutSettings, setCheckoutSettings] = useState<CheckoutSettingsCMS>(INITIAL_CHECKOUT_SETTINGS);
  const [simulatedSubtotal, setSimulatedSubtotal] = useState<number>(1);

  // Create Hero Slide Modal State
  const [isCreateSlideModalOpen, setIsCreateSlideModalOpen] = useState(false);
  const [newSlideKicker, setNewSlideKicker] = useState('DIVINE BEAUTY, TIMELESS TRADITION');
  const [newSlideTitle1, setNewSlideTitle1] = useState('');
  const [newSlideTitle2, setNewSlideTitle2] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideCtaText, setNewSlideCtaText] = useState('Shop Collections');
  const [newSlideCtaLink, setNewSlideCtaLink] = useState('/collections');
  const [newSlideTag, setNewSlideTag] = useState('NEW ARRIVAL');
  const [newSlideImage, setNewSlideImage] = useState('/assets/hero_vel_consecration.png');
  const [newSlideMobileImage, setNewSlideMobileImage] = useState('/assets/hero_vel_consecration.png');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [bannerTargetIdx, setBannerTargetIdx] = useState<number | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
    }
  };

  // Fetch all CMS data from NestJS + PostgreSQL
  const loadCmsData = async () => {
    setIsLoading(true);
    try {
      const health = await cmsService.checkHealth();
      setBackendOnline(health.connected);

      const [slidesData, bannersData, announcementData, faqsData, footerRes, aboutRes, settingsRes] = await Promise.all([
        cmsService.getHeroSlides(),
        cmsService.getStoryBanners(),
        cmsService.getAnnouncement(),
        cmsService.getFaqs(),
        cmsService.getFooter(),
        cmsService.getAbout(),
        cmsService.getCheckoutSettings(),
      ]);

      if (slidesData?.length) setHeroSlides(slidesData);
      if (bannersData?.length) setStoryBanners(bannersData);
      if (announcementData) setAnnouncements(announcementData);
      if (faqsData?.length) setFaqs(faqsData);
      if (footerRes) setFooterData(footerRes);
      if (aboutRes) setAboutData(aboutRes);
      if (settingsRes) setCheckoutSettings(settingsRes);
    } catch (err) {
      console.error('Error fetching CMS data:', err);
      showToast('Using local fallback data. NestJS server may be offline.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= CHECKOUT SHIPPING & PACKAGING HANDLER =================
  const handleSaveCheckoutSettings = async () => {
    setIsSaving(true);
    try {
      const updated = await cmsService.updateCheckoutSettings(checkoutSettings);
      setCheckoutSettings(updated);
      showToast('Shipping & Packaging settings saved successfully to PostgreSQL database!');
    } catch (err) {
      console.error('Failed to save checkout settings:', err);
      showToast('Failed to save checkout settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  // Reactively sync activeTab with URL search parameter whenever ?tab= changes
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['hero', 'banners', 'announcements', 'faqs', 'shipping', 'footer', 'about'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'hero' | 'banners' | 'announcements' | 'faqs' | 'shipping' | 'footer' | 'about') => {
    setActiveTab(tab);
    try {
      router.replace(`/admin/cms?tab=${tab}`, { scroll: false });
    } catch {}
  };

  // ================= HERO SLIDES HANDLERS =================
  const handleSaveHeroSlides = async () => {
    setIsSaving(true);
    try {
      for (const slide of heroSlides) {
        if (slide.id) {
          await cmsService.updateHeroSlide(slide.id, slide);
        }
      }
      showToast('Saved all Hero Carousel slides to PostgreSQL!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save slides to backend', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle1.trim()) return;

    setIsSaving(true);
    try {
      const newSlidePayload = {
        kicker: newSlideKicker.trim() || 'DIVINE COLLECTION',
        titleLine1: newSlideTitle1.trim(),
        titleLine2: newSlideTitle2.trim(),
        subtitle: newSlideSubtitle.trim() || 'Authentic Panchaloham jewellery crafted for sacred journeys.',
        ctaText: newSlideCtaText.trim() || 'Shop Collections',
        ctaLink: newSlideCtaLink.trim() || '/collections',
        tag: newSlideTag.trim() || 'COLLECTION',
        image: newSlideImage.trim() || '/assets/hero_vel_consecration.png',
        mobileImage: newSlideMobileImage.trim() || '/assets/hero_vel_consecration.png',
        isActive: true,
      };

      const created = await cmsService.createHeroSlide(newSlidePayload);
      setHeroSlides((prev) => [...prev, created]);

      setNewSlideTitle1('');
      setNewSlideTitle2('');
      setNewSlideSubtitle('');
      setIsCreateSlideModalOpen(false);

      showToast(`Added new Hero Slide "${created.titleLine1} ${created.titleLine2}" in PostgreSQL!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create slide', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHeroSlide = async (id: number) => {
    if (heroSlides.length <= 1) {
      toast.error('You must maintain at least one active hero slide.');
      return;
    }
    const ok = await confirm({
      title: 'Delete Hero Slide',
      message: 'Are you sure you want to permanently delete this hero slide from PostgreSQL?',
      description: 'This will remove the carousel artwork and messaging from the storefront homepage.',
      confirmText: 'Yes, Delete Slide',
      cancelText: 'No, Keep Slide',
      isDanger: true,
      icon: 'trash',
    });
    if (!ok) return;

    try {
      await cmsService.deleteHeroSlide(id);
      setHeroSlides((prev) => prev.filter((s) => s.id !== id));
      toast.success('Deleted hero slide from database.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete slide from backend');
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroSlides.length) return;

    const reordered = [...heroSlides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setHeroSlides(reordered);

    try {
      const slideIds = reordered.map((s) => s.id);
      await cmsService.reorderHeroSlides(slideIds);
      showToast('Updated slide sequence!');
    } catch (err) {
      console.error('Failed to persist reordering:', err);
    }
  };

  const updateSlideField = (index: number, field: keyof HeroSlideCMS, val: any) => {
    setHeroSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // ================= STORY BANNERS HANDLERS =================
  const handleSaveBanners = async () => {
    setIsSaving(true);
    try {
      for (const banner of storyBanners) {
        await cmsService.updateStoryBanner(banner.id, banner);
      }
      showToast('Saved Heritage Story Banners to PostgreSQL!');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to save banners', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBannerField = (index: number, field: keyof StoryBannerCMS, val: any) => {
    setStoryBanners((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // ================= ANNOUNCEMENTS HANDLERS =================
  const handleSaveAnnouncements = async () => {
    setIsSaving(true);
    try {
      await cmsService.updateAnnouncement(announcements);
      showToast('Saved Announcement Bar settings in PostgreSQL!');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to save announcements', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ================= FAQS HANDLERS =================
  const handleSaveFaqs = async () => {
    setIsSaving(true);
    try {
      for (const faq of faqs) {
        if (faq.id) {
          await cmsService.updateFaq(faq.id, faq);
        } else {
          await cmsService.createFaq(faq);
        }
      }
      showToast('Saved FAQs list to PostgreSQL!');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to save FAQs', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = async () => {
    try {
      const newFaqData = {
        question: 'New Question About Panchaloham & Consecration?',
        answer: 'Provide detailed authentic explanation here.',
        category: 'general',
      };
      const created = await cmsService.createFaq(newFaqData);
      setFaqs((prev) => [...prev, created]);
      showToast('Added new FAQ item in PostgreSQL!');
    } catch (err) {
      const fallbackFaq: FAQItem = {
        question: 'New Question About Panchaloham?',
        answer: 'Provide details here.',
      };
      setFaqs((prev) => [...prev, fallbackFaq]);
    }
  };

  const handleDeleteFaq = async (idx: number, id?: string) => {
    const ok = await confirm({
      title: 'Delete FAQ Item',
      message: 'Are you sure you want to remove this FAQ question?',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      isDanger: true,
      icon: 'trash',
    });
    if (!ok) return;

    if (id) {
      try {
        await cmsService.deleteFaq(id);
      } catch (err) {
        console.error('Delete FAQ failed on backend:', err);
      }
    }
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
    toast.success('Removed FAQ item.');
  };

  // ================= FILE UPLOAD HANDLERS =================
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: 'newSlide' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await cmsService.uploadMedia(file);
      if (target === 'newSlide') {
        setNewSlideImage(res.url);
        setNewSlideMobileImage(res.url);
        showToast('Uploaded image asset successfully!');
      } else if (target === 'banner' && bannerTargetIdx !== null) {
        updateBannerField(bannerTargetIdx, 'image', res.url);
        showToast('Banner image uploaded and attached!');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast(err.message || 'Image upload failed. Ensure backend is running.', 'error');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // ================= FOOTER CMS HANDLERS =================
  const handleSaveFooter = async () => {
    setIsSaving(true);
    try {
      await cmsService.updateFooter(footerData);
      showToast('Saved Footer & Contact Information to CMS!');
    } catch {
      showToast('Failed to save footer settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ================= ABOUT US CMS HANDLERS =================
  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      await cmsService.updateAbout(aboutData);
      showToast('Saved About Us Page content to CMS!');
    } catch {
      showToast('Failed to save About Us settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>


      {/* Header with Live Backend Indicator */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif, "Cinzel", serif)',
                fontSize: '1.75rem',
                color: '#0f172a',
                margin: 0,
                fontWeight: 700,
              }}
            >
              CMS &amp; Promotional Media Management
            </h1>
            {backendOnline !== null && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: backendOnline ? '#ecfdf5' : '#fffbeb',
                  color: backendOnline ? '#047857' : '#b45309',
                  border: `1px solid ${backendOnline ? '#a7f3d0' : '#fde68a'}`,
                }}
              >
                <Database size={12} />
                {backendOnline ? 'PostgreSQL Connected (NestJS :4000)' : 'Offline (Local Fallback)'}
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage homepage hero slides, heritage banners, store alerts, and sacred FAQs with live PostgreSQL persistence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadCmsData}
            disabled={isLoading}
            title="Reload from PostgreSQL"
          >
            <Loader2 size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync Database'}</span>
          </button>
          <Link href="/" target="_blank" className="admin-btn admin-btn-secondary">
            <span>View Live Store</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="translation-section-tabs" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => handleTabChange('hero')}
        >
          Hero Carousel ({heroSlides.length} Slides)
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
          onClick={() => handleTabChange('banners')}
        >
          Story Banners ({storyBanners.length})
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => handleTabChange('announcements')}
        >
          Announcement Bar &amp; Alerts
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => handleTabChange('faqs')}
        >
          FAQs Management ({faqs.length})
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          onClick={() => handleTabChange('shipping')}
        >
          Shipping &amp; Packaging
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
          onClick={() => handleTabChange('footer')}
        >
          Footer &amp; Contact Info
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => handleTabChange('about')}
        >
          About Us Page
        </button>
      </div>

      {/* Hidden file input for banner upload */}
      <input
        type="file"
        ref={bannerFileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => handleUploadImage(e, 'banner')}
      />

      {/* ================= TAB 1: HERO SLIDES ================= */}
      {activeTab === 'hero' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                }}
              >
                Hero Carousel Slides ({heroSlides.length} Active Slides)
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Reorder or modify slides. Changes persist directly to the NestJS PostgreSQL database.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-btn admin-btn-gold"
                onClick={() => setIsCreateSlideModalOpen(true)}
              >
                <Plus size={15} />
                <span>+ Add Hero Slide</span>
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleSaveHeroSlides}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save Hero Slides</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {heroSlides.map((slide, idx) => (
              <div key={slide.id || idx} className="admin-card" style={{ padding: '24px', margin: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="admin-status-badge admin-status-blue">Slide 0{idx + 1}</span>
                    <strong style={{ color: '#0f172a' }}>
                      {slide.titleLine1} {slide.titleLine2}
                    </strong>
                    {slide.id && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(DB ID: {slide.id})</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === heroSlides.length - 1}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    {heroSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteHeroSlide(slide.id)}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        style={{ color: '#b91c1c' }}
                        title="Delete this hero slide"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kicker Tagline</label>
                    <input
                      type="text"
                      value={slide.kicker || ''}
                      onChange={(e) => updateSlideField(idx, 'kicker', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Title Line 1</label>
                    <input
                      type="text"
                      value={slide.titleLine1 || ''}
                      onChange={(e) => updateSlideField(idx, 'titleLine1', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Title Line 2</label>
                    <input
                      type="text"
                      value={slide.titleLine2 || ''}
                      onChange={(e) => updateSlideField(idx, 'titleLine2', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Button Label</label>
                    <input
                      type="text"
                      value={slide.ctaText || ''}
                      onChange={(e) => updateSlideField(idx, 'ctaText', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Destination URL</label>
                    <input
                      type="text"
                      value={slide.ctaLink || ''}
                      onChange={(e) => updateSlideField(idx, 'ctaLink', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Desktop Image Asset Path / URL</label>
                    <input
                      type="text"
                      value={slide.image || ''}
                      onChange={(e) => updateSlideField(idx, 'image', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginTop: '16px' }}>
                  <label className="admin-form-label">Lead Subtitle</label>
                  <textarea
                    rows={2}
                    value={slide.subtitle || ''}
                    onChange={(e) => updateSlideField(idx, 'subtitle', e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: STORY BANNERS ================= */}
      {activeTab === 'banners' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                }}
              >
                Heritage Story Banners
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Promotional narrative banners highlighting sacred traditions and five-metal metallurgy.
              </p>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-gold"
              onClick={handleSaveBanners}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Banners</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
            {storyBanners.map((banner, idx) => (
              <div key={banner.id} className="admin-card" style={{ padding: '24px', margin: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '10px',
                  }}
                >
                  <span className="admin-status-badge admin-status-blue">Banner {idx + 1} ({banner.id})</span>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                    onClick={() => {
                      setBannerTargetIdx(idx);
                      bannerFileInputRef.current?.click();
                    }}
                  >
                    <Upload size={13} />
                    <span>Upload Image</span>
                  </button>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Banner Headline</label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => updateBannerField(idx, 'title', e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description Text</label>
                  <textarea
                    rows={2}
                    value={banner.desc}
                    onChange={(e) => updateBannerField(idx, 'desc', e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Label</label>
                    <input
                      type="text"
                      value={banner.ctaText}
                      onChange={(e) => updateBannerField(idx, 'ctaText', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Link</label>
                    <input
                      type="text"
                      value={banner.ctaLink}
                      onChange={(e) => updateBannerField(idx, 'ctaLink', e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Banner Image Asset URL</label>
                  <input
                    type="text"
                    value={banner.image}
                    onChange={(e) => updateBannerField(idx, 'image', e.target.value)}
                    className="admin-form-input"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ANNOUNCEMENTS ================= */}
      {activeTab === 'announcements' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                }}
              >
                Storefront Top Header Announcement &amp; Promo Alert
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Displayed across the very top bar on every page of the jewellery store.
              </p>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-gold"
              onClick={handleSaveAnnouncements}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Announcements</span>
            </button>
          </div>

          <div className="admin-card" style={{ padding: '24px', margin: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Free Shipping Header Text</label>
                <input
                  type="text"
                  value={announcements.freeShippingText}
                  onChange={(e) => setAnnouncements({ ...announcements, freeShippingText: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Authenticity Badge Text</label>
                <input
                  type="text"
                  value={announcements.authenticityText}
                  onChange={(e) => setAnnouncements({ ...announcements, authenticityText: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Global Delivery Badge Text</label>
                <input
                  type="text"
                  value={announcements.worldwideText}
                  onChange={(e) => setAnnouncements({ ...announcements, worldwideText: e.target.value })}
                  className="admin-form-input"
                />
              </div>
            </div>

            <div className="admin-form-group" style={{ marginTop: '20px' }}>
              <label className="admin-form-label">
                Active Promo / Special Occasion Banner (e.g. Navaratri / Diwali Blessing)
              </label>
              <textarea
                rows={2}
                value={announcements.activePromoAlert || ''}
                onChange={(e) => setAnnouncements({ ...announcements, activePromoAlert: e.target.value })}
                className="admin-form-textarea"
                placeholder="Enter alert text to display at the top bar or leave blank"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: FAQS ================= */}
      {activeTab === 'faqs' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                }}
              >
                Store FAQs &amp; Sacred Consecration Knowledge
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Helps devotees understand Panchaloham composition, certificates, care, and temple blessing procedures.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="admin-btn admin-btn-gold" onClick={handleAddFaq}>
                <Plus size={15} />
                <span>+ Add FAQ</span>
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleSaveFaqs}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save All FAQs</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {faqs.map((faq, idx) => (
              <div key={faq.id || idx} className="admin-card" style={{ padding: '20px', margin: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span className="admin-status-badge admin-status-blue">Question 0{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(idx, faq.id)}
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                    style={{ color: '#b91c1c' }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const copy = [...faqs];
                      copy[idx] = { ...copy[idx], question: e.target.value };
                      setFaqs(copy);
                    }}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Answer Explanation</label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => {
                      const copy = [...faqs];
                      copy[idx] = { ...copy[idx], answer: e.target.value };
                      setFaqs(copy);
                    }}
                    className="admin-form-textarea"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: FOOTER & CONTACT DETAILS ================= */}
      {activeTab === 'footer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: 600 }}>
                  Footer &amp; Customer Support Configuration
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: '4px' }}>
                  Update brand tagline, atelier addresses, direct contact helplines, WhatsApp support, and social media channels.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveFooter}
                disabled={isSaving}
                className="admin-btn admin-btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save Footer CMS</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Brand Tagline */}
              <div className="admin-form-group">
                <label className="admin-form-label">Brand Tagline</label>
                <input
                  type="text"
                  value={footerData.brandTagline}
                  onChange={(e) => setFooterData({ ...footerData, brandTagline: e.target.value })}
                  className="admin-form-input"
                  placeholder="e.g. Faith. Tradition. Timeless Beauty."
                />
              </div>

              {/* Logo Path */}
              <div className="admin-form-group">
                <label className="admin-form-label">Brand Logo Asset</label>
                <input
                  type="text"
                  value={footerData.brandLogo}
                  onChange={(e) => setFooterData({ ...footerData, brandLogo: e.target.value })}
                  className="admin-form-input"
                  placeholder="/assets/brand_logo_gold.png"
                />
              </div>

              {/* Atelier Address */}
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Atelier &amp; Studio Address</label>
                <input
                  type="text"
                  value={footerData.address}
                  onChange={(e) => setFooterData({ ...footerData, address: e.target.value })}
                  className="admin-form-input"
                  placeholder="Eazhaparambil, Edayar, Kannavam P.O., Koloyad, Kannur, Kerala – 670650"
                />
              </div>

              {/* Support Email */}
              <div className="admin-form-group">
                <label className="admin-form-label">Customer Support Email</label>
                <input
                  type="email"
                  value={footerData.email}
                  onChange={(e) => setFooterData({ ...footerData, email: e.target.value })}
                  className="admin-form-input"
                  placeholder="support@aamaclappetti.in"
                />
              </div>

              {/* Helpline Phone */}
              <div className="admin-form-group">
                <label className="admin-form-label">Helpline Phone Number</label>
                <input
                  type="text"
                  value={footerData.phone}
                  onChange={(e) => setFooterData({ ...footerData, phone: e.target.value })}
                  className="admin-form-input"
                  placeholder="+91 70127 32880"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="admin-form-group">
                <label className="admin-form-label">Direct WhatsApp Business Number</label>
                <input
                  type="text"
                  value={footerData.whatsapp}
                  onChange={(e) => setFooterData({ ...footerData, whatsapp: e.target.value })}
                  className="admin-form-input"
                  placeholder="+91 70127 32880"
                />
              </div>

              {/* Sanctum Operating Hours */}
              <div className="admin-form-group">
                <label className="admin-form-label">Sanctum Consulting Hours</label>
                <input
                  type="text"
                  value={footerData.sanctumHours}
                  onChange={(e) => setFooterData({ ...footerData, sanctumHours: e.target.value })}
                  className="admin-form-input"
                  placeholder="Monday – Saturday: 9:00 AM – 6:00 PM IST"
                />
              </div>

              {/* Assurance Note */}
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Sacred Artisan Assurance Note</label>
                <textarea
                  rows={2}
                  value={footerData.assuranceNote}
                  onChange={(e) => setFooterData({ ...footerData, assuranceNote: e.target.value })}
                  className="admin-form-textarea"
                />
              </div>

              {/* Copyright Text */}
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Copyright Notice</label>
                <input
                  type="text"
                  value={footerData.copyrightText}
                  onChange={(e) => setFooterData({ ...footerData, copyrightText: e.target.value })}
                  className="admin-form-input"
                />
              </div>
            </div>

            {/* Social Links Section */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '14px', fontWeight: 600 }}>
                Official Social Media Channels
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Instagram Profile URL</label>
                  <input
                    type="url"
                    value={footerData.socialLinks.instagram}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        socialLinks: { ...footerData.socialLinks, instagram: e.target.value },
                      })
                    }
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Facebook Page URL</label>
                  <input
                    type="url"
                    value={footerData.socialLinks.facebook}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        socialLinks: { ...footerData.socialLinks, facebook: e.target.value },
                      })
                    }
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">YouTube Channel URL</label>
                  <input
                    type="url"
                    value={footerData.socialLinks.youtube}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        socialLinks: { ...footerData.socialLinks, youtube: e.target.value },
                      })
                    }
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Pinterest / Alternate URL</label>
                  <input
                    type="url"
                    value={footerData.socialLinks.pinterest}
                    onChange={(e) =>
                      setFooterData({
                        ...footerData,
                        socialLinks: { ...footerData.socialLinks, pinterest: e.target.value },
                      })
                    }
                    className="admin-form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: ABOUT US PAGE ================= */}
      {activeTab === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: 600 }}>
                  About Us &amp; Temple Heritage Content
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: '4px' }}>
                  Manage the narrative of our 40-year legacy, the 5 Sacred Metals breakdown, and the 6 Agamic Craft Steps.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  href="/about"
                  target="_blank"
                  className="admin-btn admin-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <span>Preview Page</span>
                  <ExternalLink size={14} />
                </Link>

                <button
                  type="button"
                  onClick={handleSaveAbout}
                  disabled={isSaving}
                  className="admin-btn admin-btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>Save About CMS</span>
                </button>
              </div>
            </div>

            {/* Hero Section Fields */}
            <h4 style={{ fontSize: '1rem', color: '#0d5438', marginBottom: '14px', fontWeight: 600 }}>
              1. Hero Spotlight &amp; Establishment
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Hero Kicker Tag</label>
                <input
                  type="text"
                  value={aboutData.heroKicker}
                  onChange={(e) => setAboutData({ ...aboutData, heroKicker: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Hero Main Title</label>
                <input
                  type="text"
                  value={aboutData.heroTitle}
                  onChange={(e) => setAboutData({ ...aboutData, heroTitle: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Hero Lead Narrative</label>
                <textarea
                  rows={2}
                  value={aboutData.heroLead}
                  onChange={(e) => setAboutData({ ...aboutData, heroLead: e.target.value })}
                  className="admin-form-textarea"
                />
              </div>
            </div>

            {/* Legacy & History Section */}
            <h4 style={{ fontSize: '1rem', color: '#0d5438', marginBottom: '14px', fontWeight: 600 }}>
              2. Heritage Story &amp; Agamic Metallurgy
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Legacy Section Headline</label>
                <input
                  type="text"
                  value={aboutData.legacyTitle}
                  onChange={(e) => setAboutData({ ...aboutData, legacyTitle: e.target.value })}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Story Paragraph 1 (Tradition &amp; Origins)</label>
                <textarea
                  rows={3}
                  value={aboutData.legacyParagraph1}
                  onChange={(e) => setAboutData({ ...aboutData, legacyParagraph1: e.target.value })}
                  className="admin-form-textarea"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Story Paragraph 2 (Sanctum Hallmarking)</label>
                <textarea
                  rows={3}
                  value={aboutData.legacyParagraph2}
                  onChange={(e) => setAboutData({ ...aboutData, legacyParagraph2: e.target.value })}
                  className="admin-form-textarea"
                />
              </div>
            </div>

            {/* 5 Sacred Metals */}
            <h4 style={{ fontSize: '1rem', color: '#0d5438', marginBottom: '14px', fontWeight: 600 }}>
              3. The 5 Sacred Metals (Panchaloham Energy Attributes)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {aboutData.metals.map((metal, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label className="admin-form-label">Metal Name</label>
                      <input
                        type="text"
                        value={metal.name}
                        onChange={(e) => {
                          const copy = [...aboutData.metals];
                          copy[idx] = { ...copy[idx], name: e.target.value };
                          setAboutData({ ...aboutData, metals: copy });
                        }}
                        className="admin-form-input"
                      />
                    </div>

                    <div>
                      <label className="admin-form-label">Vedic Element</label>
                      <input
                        type="text"
                        value={metal.element}
                        onChange={(e) => {
                          const copy = [...aboutData.metals];
                          copy[idx] = { ...copy[idx], element: e.target.value };
                          setAboutData({ ...aboutData, metals: copy });
                        }}
                        className="admin-form-input"
                      />
                    </div>

                    <div>
                      <label className="admin-form-label">Ruling Planetary Force</label>
                      <input
                        type="text"
                        value={metal.planet}
                        onChange={(e) => {
                          const copy = [...aboutData.metals];
                          copy[idx] = { ...copy[idx], planet: e.target.value };
                          setAboutData({ ...aboutData, metals: copy });
                        }}
                        className="admin-form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-form-label">Spiritual &amp; Bio-electric Resonance</label>
                    <textarea
                      rows={2}
                      value={metal.desc}
                      onChange={(e) => {
                        const copy = [...aboutData.metals];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        setAboutData({ ...aboutData, metals: copy });
                      }}
                      className="admin-form-textarea"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 6 Agamic Craft Steps */}
            <h4 style={{ fontSize: '1rem', color: '#0d5438', marginBottom: '14px', fontWeight: 600 }}>
              4. The 6 Lost-Wax Agamic Craft Steps
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {aboutData.craftSteps.map((step, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label className="admin-form-label">Step</label>
                      <input
                        type="text"
                        value={step.step}
                        onChange={(e) => {
                          const copy = [...aboutData.craftSteps];
                          copy[idx] = { ...copy[idx], step: e.target.value };
                          setAboutData({ ...aboutData, craftSteps: copy });
                        }}
                        className="admin-form-input"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label className="admin-form-label">Step Title</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const copy = [...aboutData.craftSteps];
                          copy[idx] = { ...copy[idx], title: e.target.value };
                          setAboutData({ ...aboutData, craftSteps: copy });
                        }}
                        className="admin-form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-form-label">Step Description</label>
                    <textarea
                      rows={2}
                      value={step.desc}
                      onChange={(e) => {
                        const copy = [...aboutData.craftSteps];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        setAboutData({ ...aboutData, craftSteps: copy });
                      }}
                      className="admin-form-textarea"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sanctum Pledge & Quote */}
            <h4 style={{ fontSize: '1rem', color: '#0d5438', marginBottom: '14px', fontWeight: 600 }}>
              5. Sanctum Atelier Quote &amp; Artisan Signature
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Artisan Quote</label>
                <textarea
                  rows={2}
                  value={aboutData.sanctumQuote}
                  onChange={(e) => setAboutData({ ...aboutData, sanctumQuote: e.target.value })}
                  className="admin-form-textarea"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Quote Attributed To</label>
                <input
                  type="text"
                  value={aboutData.sanctumQuoteAuthor}
                  onChange={(e) => setAboutData({ ...aboutData, sanctumQuoteAuthor: e.target.value })}
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: SHIPPING & GIFT PACKAGING ================= */}
      {activeTab === 'shipping' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={22} color="#b45309" />
                <h2
                  style={{
                    fontSize: '1.25rem',
                    color: '#0f172a',
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                  }}
                >
                  Checkout Shipping &amp; Gift Packaging Master
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Live controls for delivery charges, free delivery thresholds, and gift packaging options across the checkout portal.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <Database size={13} />
                <span>PostgreSQL DB Synced</span>
              </div>

              <button
                type="button"
                onClick={handleSaveCheckoutSettings}
                disabled={isSaving}
                className="admin-btn admin-btn-gold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save Settings</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }}>
            {/* Left Column: Form Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Card 1: Gift Packaging Control */}
              <div className="admin-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gift size={18} color="#059669" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                      Gift Packaging Controls
                    </h3>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={checkoutSettings.giftPackagingEnabled}
                      onChange={(e) =>
                        setCheckoutSettings({
                          ...checkoutSettings,
                          giftPackagingEnabled: e.target.checked,
                        })
                      }
                      style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                    />
                    <span>{checkoutSettings.giftPackagingEnabled ? 'Enabled at Checkout' : 'Disabled'}</span>
                  </label>
                </div>

                <div className="admin-card-body" style={{ padding: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Badge / Display Label
                      </label>
                      <input
                        type="text"
                        value={checkoutSettings.giftPackagingText || 'FREE'}
                        placeholder="e.g. FREE, Complimentary"
                        onChange={(e) =>
                          setCheckoutSettings({
                            ...checkoutSettings,
                            giftPackagingText: e.target.value,
                          })
                        }
                        className="admin-form-input"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Displayed on checkout row when fee is ₹0 (e.g. FREE)
                      </span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Gift Packaging Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={checkoutSettings.giftPackagingFee}
                        onChange={(e) =>
                          setCheckoutSettings({
                            ...checkoutSettings,
                            giftPackagingFee: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="admin-form-input"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Set to 0 for 100% complimentary packaging
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Insured Express Shipping Control */}
              <div className="admin-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Truck size={18} color="#b45309" />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                    Insured Express Shipping Controls
                  </h3>
                </div>

                <div className="admin-card-body" style={{ padding: '18px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Shipping Display Label
                    </label>
                    <input
                      type="text"
                      value={checkoutSettings.expressShippingText || 'Insured Express Shipping'}
                      placeholder="e.g. Insured Express Shipping"
                      onChange={(e) =>
                        setCheckoutSettings({
                          ...checkoutSettings,
                          expressShippingText: e.target.value,
                        })
                      }
                      className="admin-form-input"
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Shown on checkout and order confirmation
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Standard Shipping Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={checkoutSettings.shippingFee}
                        onChange={(e) =>
                          setCheckoutSettings({
                            ...checkoutSettings,
                            shippingFee: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="admin-form-input"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Default delivery fee (e.g. ₹99)
                      </span>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Free Shipping Min. Subtotal (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={checkoutSettings.freeShippingThreshold}
                        onChange={(e) =>
                          setCheckoutSettings({
                            ...checkoutSettings,
                            freeShippingThreshold: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="admin-form-input"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Orders equal to or above this amount get ₹0 delivery
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '16px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '0.82rem',
                      color: '#92400e',
                      lineHeight: '1.5',
                    }}
                  >
                    <strong>Pricing rule active: </strong>
                    If cart subtotal is under ₹{checkoutSettings.freeShippingThreshold.toLocaleString('en-IN')}, customers are charged <strong>₹{checkoutSettings.shippingFee}</strong>.
                    Cart totals of ₹{checkoutSettings.freeShippingThreshold.toLocaleString('en-IN')} or more automatically get <strong>FREE delivery</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Storefront Preview */}
            <div>
              <div
                style={{
                  background: '#041c14',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '16px',
                  padding: '24px',
                  color: '#ffffff',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                  position: 'sticky',
                  top: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d4af37', fontWeight: 600 }}>
                      Live Storefront Simulation
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#b0c4b8' }}>
                    /checkout preview
                  </span>
                </div>

                {/* Subtotal Simulator Controls */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#b0c4b8', margin: 0 }}>
                      Simulate Cart Subtotal:
                    </label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef08a' }}>
                      ₹{simulatedSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[1, 500, 999, 1499].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSimulatedSubtotal(val)}
                        style={{
                          background: simulatedSubtotal === val ? '#d4af37' : 'rgba(255,255,255,0.1)',
                          color: simulatedSubtotal === val ? '#041c14' : '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Replicated Order Summary UI */}
                <h4
                  style={{
                    fontSize: '1rem',
                    fontFamily: 'var(--font-serif)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Order Summary</span>
                  <span style={{ fontSize: '0.75rem', color: '#b0c4b8' }}>1 Item</span>
                </h4>

                {/* Simulated Product Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '6px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}
                  >
                    🪔
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                      Lord Ganesha Pendant
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: 1 × ₹{simulatedSubtotal.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#d4af37' }}>
                    ₹{simulatedSubtotal.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Summary Lines */}
                {(() => {
                  const simIsFreeShipping =
                    checkoutSettings.freeShippingThreshold > 0 &&
                    simulatedSubtotal >= checkoutSettings.freeShippingThreshold;
                  const simShippingFee = simIsFreeShipping ? 0 : Number(checkoutSettings.shippingFee || 0);
                  const simGiftFee = checkoutSettings.giftPackagingEnabled
                    ? Number(checkoutSettings.giftPackagingFee || 0)
                    : 0;
                  const simTotal = simulatedSubtotal + simShippingFee + simGiftFee;

                  return (
                    <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#b0c4b8', marginBottom: '10px' }}>
                        <span>Items Subtotal</span>
                        <span>₹{simulatedSubtotal.toLocaleString('en-IN')}</span>
                      </div>

                      {checkoutSettings.giftPackagingEnabled && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#b0c4b8', marginBottom: '10px' }}>
                          <span>Gift Packaging</span>
                          {simGiftFee === 0 ? (
                            <span style={{ color: '#4ade80', fontWeight: 600 }}>
                              {checkoutSettings.giftPackagingText || 'FREE'}
                            </span>
                          ) : (
                            <span>₹{simGiftFee.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#b0c4b8', marginBottom: '14px' }}>
                        <span>{checkoutSettings.expressShippingText || 'Insured Express Shipping'}</span>
                        {simShippingFee === 0 ? (
                          <span style={{ color: '#4ade80', fontWeight: 600 }}>
                            FREE {checkoutSettings.freeShippingThreshold > 0 ? `(Above ₹${checkoutSettings.freeShippingThreshold.toLocaleString('en-IN')})` : ''}
                          </span>
                        ) : (
                          <span>₹{simShippingFee}</span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          borderTop: '1px solid rgba(212, 175, 55, 0.25)',
                          paddingTop: '14px',
                          marginBottom: '20px',
                        }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>Total Payable</span>
                        <span style={{ fontSize: '1.45rem', fontWeight: 700, color: '#d4af37', fontFamily: 'var(--font-serif)' }}>
                          ₹{simTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div
                        style={{
                          background: 'linear-gradient(135deg, #d4af37, #b45309)',
                          color: '#041c14',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'not-allowed',
                          opacity: 0.9,
                        }}
                      >
                        <span>Proceed to Pay ₹{simTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={13} color="#4ade80" />
                    <span>100% Certified Panchaloham (Govt Assay)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={13} color="#4ade80" />
                    <span>Tamper-Proof Insured All-India Transit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ================= MODAL: CREATE HERO SLIDE ================= */}
      {isCreateSlideModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: '680px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={20} color="#b45309" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Add New Hero Slide</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateSlideModalOpen(false)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHeroSlide}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Kicker Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. SACRED TRADITIONS, TIMELESS ELEGANCE"
                    value={newSlideKicker}
                    onChange={(e) => setNewSlideKicker(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Title Line 1 *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Consecrated"
                      value={newSlideTitle1}
                      onChange={(e) => setNewSlideTitle1(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Title Line 2</label>
                    <input
                      type="text"
                      placeholder="e.g. Panchaloham Jewels"
                      value={newSlideTitle2}
                      onChange={(e) => setNewSlideTitle2(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Lead Subtitle</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Authentic five-metal sacred talismans cast strictly according to Agama Shastras."
                    value={newSlideSubtitle}
                    onChange={(e) => setNewSlideSubtitle(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Button Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Shop Collections"
                      value={newSlideCtaText}
                      onChange={(e) => setNewSlideCtaText(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Destination URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /collections"
                      value={newSlideCtaLink}
                      onChange={(e) => setNewSlideCtaLink(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {/* Upload Image Section */}
                <div className="admin-form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Slide Artwork / Image</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                    </button>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleUploadImage(e, 'newSlide')}
                  />
                  <input
                    type="text"
                    placeholder="e.g. /assets/hero_vel_consecration.png or https://..."
                    value={newSlideImage}
                    onChange={(e) => {
                      setNewSlideImage(e.target.value);
                      setNewSlideMobileImage(e.target.value);
                    }}
                    className="admin-form-input"
                    style={{ marginTop: '6px' }}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsCreateSlideModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-gold"
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Create in PostgreSQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCMSPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" color="#d4af37" style={{ margin: '0 auto 12px' }} />
          <div>Loading CMS Management Console...</div>
        </div>
      }
    >
      <AdminCMSContent />
    </Suspense>
  );
}

