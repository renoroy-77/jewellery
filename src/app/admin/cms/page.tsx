'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
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
import { cmsService } from '@/services/cmsService';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';

export default function AdminCMSPage() {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'hero' | 'banners' | 'announcements' | 'faqs'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // CMS Data States
  const [heroSlides, setHeroSlides] = useState<HeroSlideCMS[]>(INITIAL_HERO_SLIDES);
  const [storyBanners, setStoryBanners] = useState<StoryBannerCMS[]>(INITIAL_STORY_BANNERS);
  const [announcements, setAnnouncements] = useState<AnnouncementCMS>(INITIAL_ANNOUNCEMENTS);
  const [faqs, setFaqs] = useState<(FAQItem & { id?: string })[]>(STORE_FAQS);

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

      const [slidesData, bannersData, announcementData, faqsData] = await Promise.all([
        cmsService.getHeroSlides(),
        cmsService.getStoryBanners(),
        cmsService.getAnnouncement(),
        cmsService.getFaqs(),
      ]);

      if (slidesData?.length) setHeroSlides(slidesData);
      if (bannersData?.length) setStoryBanners(bannersData);
      if (announcementData) setAnnouncements(announcementData);
      if (faqsData?.length) setFaqs(faqsData);
    } catch (err) {
      console.error('Error fetching CMS data:', err);
      showToast('Using local fallback data. NestJS server may be offline.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

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
          onClick={() => setActiveTab('hero')}
        >
          Hero Carousel ({heroSlides.length} Slides)
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
          onClick={() => setActiveTab('banners')}
        >
          Story Banners ({storyBanners.length})
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcement Bar &amp; Alerts
        </button>
        <button
          type="button"
          className={`translation-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >
          FAQs Management ({faqs.length})
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
