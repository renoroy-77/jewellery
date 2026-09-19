'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Edit, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { CATEGORIES } from '@/data/products';
import { Category } from '@/types';
import { categoriesService } from '@/services/categoriesService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    categoriesService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) setCategories(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Form states
  const [formName, setFormName] = useState('');
  const [formTamilName, setFormTamilName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCount, setFormCount] = useState(20);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormTamilName(cat.tamilName || '');
    setFormDesc(cat.description);
    setFormCount(cat.itemCount);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const updated: Category = {
      ...editingCategory,
      name: formName,
      tamilName: formTamilName,
      description: formDesc,
      itemCount: Number(formCount),
    };

    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCategory(null);
    showToast(`Updated collection "${updated.name}"`);

    categoriesService.update(updated.id, updated).catch(() => {
      showToast(`Warning: Failed to sync category update to database`);
    });
  };

  return (
    <div>
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', fontSize: '1.75rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
          Divine Collections &amp; Deities
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Manage collection categories, Tamil nomenclature, and deity spiritual descriptions.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <Layers size={20} color="#0d5438" />
            Active Collections ({categories.length})
          </h2>
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
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{cat.name}</strong>
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
                  <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: '#475569' }}>
                    {cat.description}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link
                        href={`/collections/${cat.slug}`}
                        target="_blank"
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        title="View collection"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit Collection: {editingCategory.name}</h2>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                style={{ background: 'none', border: 'none', color: '#b8c7bf', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">English Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    required
                    value={formTamilName}
                    onChange={(e) => setFormTamilName(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Catalog Item Count</label>
                  <input
                    type="number"
                    value={formCount}
                    onChange={(e) => setFormCount(Number(e.target.value))}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description &amp; Divine Signification</label>
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
                <button type="submit" className="admin-btn admin-btn-gold">
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
