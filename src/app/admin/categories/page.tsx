'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Edit,
  CheckCircle2,
  X,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Search,
  AlertCircle,
} from 'lucide-react';
import { CATEGORIES } from '@/data/products';
import { Category } from '@/types';
import { categoriesService } from '@/services/categoriesService';
import { cmsService } from '@/services/cmsService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states (shared for both Add and Edit)
  const [formName, setFormName] = useState('');
  const [formTamilName, setFormTamilName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImage, setFormImage] = useState('/assets/cat_ganesha.png');
  const [formDesc, setFormDesc] = useState('');
  const [formCount, setFormCount] = useState(0);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesService.getAll();
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch {
      // Fallback already returned by categoriesService
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormTamilName('');
    setFormSlug('');
    setFormImage('/assets/cat_ganesha.png');
    setFormDesc('');
    setFormCount(0);
    setIsAddModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormTamilName(cat.tamilName || '');
    setFormSlug(cat.slug);
    setFormImage(cat.image || '/assets/cat_ganesha.png');
    setFormDesc(cat.description);
    setFormCount(cat.itemCount);
  };

  const handleNameChange = (name: string, isNew: boolean) => {
    setFormName(name);
    if (isNew) {
      const autoSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(autoSlug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      showToast('Uploading collection artwork...');
      const res = await cmsService.uploadMedia(file);
      setFormImage(res.url);
      showToast('Artwork uploaded successfully!');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Collection Name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const rawSlug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const slug = rawSlug || `col-${Date.now()}`;
      const id = slug;

      const newCategory: Partial<Category> = {
        id,
        slug,
        name: formName.trim(),
        tamilName: formTamilName.trim() || undefined,
        image: formImage.trim() || '/assets/cat_ganesha.png',
        itemCount: Number(formCount) || 0,
        description: formDesc.trim() || `${formName} consecrated Panchaloham jewellery.`,
      };

      const created = await categoriesService.create(newCategory);
      setCategories((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setIsAddModalOpen(false);
      showToast(`Created collection "${created.name}" in database!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to save collection to database', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSaving(true);
    try {
      const updated: Category = {
        ...editingCategory,
        name: formName.trim(),
        tamilName: formTamilName.trim() || undefined,
        slug: formSlug.trim() || editingCategory.slug,
        image: formImage.trim() || editingCategory.image,
        description: formDesc.trim(),
        itemCount: Number(formCount),
      };

      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCategory(null);
      showToast(`Updated collection "${updated.name}"`);

      await categoriesService.update(updated.id, updated);
    } catch {
      showToast(`Warning: Failed to sync category update to database`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${cat.name}"? This action will remove the category from PostgreSQL and the live catalog.`
    );
    if (!confirmDelete) return;

    try {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      showToast(`Deleted collection "${cat.name}"`);
      await categoriesService.delete(cat.id);
    } catch {
      showToast(`Failed to delete collection from database`, 'error');
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.tamilName && c.tamilName.toLowerCase().includes(q)) ||
        c.slug.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className="admin-toast"
          style={{
            borderColor: toastMessage.type === 'error' ? '#ef4444' : '#10b981',
            background: toastMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: toastMessage.type === 'error' ? '#991b1b' : '#065f46',
          }}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle size={18} color="#ef4444" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              fontSize: '1.75rem',
              color: '#0f172a',
              margin: 0,
              fontWeight: 700,
            }}
          >
            Divine Collections &amp; Deities
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage collection categories, Tamil nomenclature, artwork, and deity spiritual descriptions.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-gold"
          onClick={openAddModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.9rem',
            boxShadow: '0 4px 6px -1px rgba(13, 84, 56, 0.2)',
          }}
        >
          <Plus size={16} />
          <span>Add New Collection</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        <div
          className="admin-card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <h2 className="admin-card-title">
            <Layers size={20} color="#0d5438" />
            Active Collections ({filteredCategories.length})
          </h2>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search collections or deities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-form-input"
              style={{ paddingLeft: '36px', height: '36px', fontSize: '0.84rem' }}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Collection Name</th>
                <th>Tamil Name (தமிழ்)</th>
                <th>URL Slug</th>
                <th>Item Count</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Loading collections from database...</span>
                      </div>
                    ) : (
                      <span>No collections found matching &quot;{searchQuery}&quot;.</span>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.image || '/assets/cat_ganesha.png'}
                        alt={cat.name}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          objectFit: 'cover',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{cat.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {cat.id}</span>
                    </td>
                    <td>
                      <span style={{ color: '#0d5438', fontWeight: 600 }}>{cat.tamilName || '—'}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem', color: '#64748b' }}>/collections/{cat.slug}</code>
                    </td>
                    <td>
                      <span className="admin-status-badge admin-status-blue">
                        {cat.itemCount} items
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
                      {cat.description}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Link
                          href={`/collections/${cat.slug}`}
                          target="_blank"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          title="View collection live"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-gold"
                          onClick={() => openEditModal(cat)}
                          title="Edit collection details"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => handleDelete(cat)}
                          title="Delete collection"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD NEW COLLECTION ================= */}
      {isAddModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#0d5438',
                    color: '#fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={16} />
                </div>
                <div>
                  <h2 className="admin-modal-title">Add New Divine Collection</h2>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                    Creates a category in Neon PostgreSQL and synchronizes with the live storefront.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                {/* Collection Name & Tamil Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Collection Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Murugan Jewellery"
                      value={formName}
                      onChange={(e) => handleNameChange(e.target.value, true)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Tamil Name (தமிழ்)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. முருகன் வேல் ஆபரணங்கள்"
                      value={formTamilName}
                      onChange={(e) => setFormTamilName(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {/* Slug & Item Count */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. murugan-jewellery"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Initial Item Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formCount}
                      onChange={(e) => setFormCount(Number(e.target.value))}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {/* Cover Image Upload / URL */}
                <div
                  className="admin-form-group"
                  style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <label
                    className="admin-form-label"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>Collection Artwork / Image</span>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <span
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                      </span>
                    </label>
                  </label>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {formImage && (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formImage}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="e.g. /assets/cat_murugan.png or https://..."
                      className="admin-form-input"
                      style={{ flexGrow: 1, height: '40px' }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                    Spiritual Description &amp; Deity Significance
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the divine energy, Agamic mantras, and deity symbolism of this collection..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="admin-btn admin-btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>{isSaving ? 'Creating...' : 'Create in PostgreSQL'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT COLLECTION ================= */}
      {editingCategory && (
        <div className="admin-modal-overlay" onClick={() => setEditingCategory(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#0d5438',
                    color: '#fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit size={16} />
                </div>
                <div>
                  <h2 className="admin-modal-title">Edit Collection: {editingCategory.name}</h2>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                    Updates category details in Neon PostgreSQL and the live storefront.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                {/* Collection Name & Tamil Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Collection Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Tamil Name (தமிழ்)
                    </label>
                    <input
                      type="text"
                      value={formTamilName}
                      onChange={(e) => setFormTamilName(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {/* Slug & Item Count */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Item Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formCount}
                      onChange={(e) => setFormCount(Number(e.target.value))}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {/* Cover Image Upload / URL */}
                <div
                  className="admin-form-group"
                  style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <label
                    className="admin-form-label"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>Collection Artwork / Image</span>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <span
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                      </span>
                    </label>
                  </label>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {formImage && (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formImage}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="admin-form-input"
                      style={{ flexGrow: 1, height: '40px' }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                    Description &amp; Divine Significance
                  </label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="admin-btn admin-btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
