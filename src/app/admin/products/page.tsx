'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Filter,
  Check,
  Loader2,
  Database,
  Upload,
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '@/data/products';
import { Product } from '@/types';
import { productsService } from '@/services/productsService';
import { cmsService } from '@/services/cmsService';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDeity, setFormDeity] = useState('');
  const [formCategory, setFormCategory] = useState<Product['category']>('pendants');
  const [formPrice, setFormPrice] = useState(2499);
  const [formOriginalPrice, setFormOriginalPrice] = useState(2999);
  const [formInStock, setFormInStock] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/assets/prod_ganesha_hq.webp');
  const [formGoldComp, setFormGoldComp] = useState('2.5%');
  const [formSilverComp, setFormSilverComp] = useState('12.5%');
  const [formCopperComp, setFormCopperComp] = useState('65.0%');
  const [formZincComp, setFormZincComp] = useState('15.0%');
  const [formIronComp, setFormIronComp] = useState('5.0%');
  const [formDimensions, setFormDimensions] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formConsecration, setFormConsecration] = useState('Consecrated with Vedic mantras in temple sanctum.');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsService.getAll();
      if (data && data.length > 0) {
        setProducts(data);
        setBackendOnline(true);
      } else {
        setProducts(PRODUCTS);
        setBackendOnline(false);
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setProducts(PRODUCTS);
      setBackendOnline(false);
      showToast('Could not load from PostgreSQL. Fallback catalog loaded.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDeity = p.deity.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        return matchName || matchDeity || matchCategory;
      }
      return true;
    });
  }, [products, categoryFilter, searchQuery]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDeity('Lord Ganesha');
    setFormCategory('pendants');
    setFormPrice(2499);
    setFormOriginalPrice(2999);
    setFormInStock(true);
    setFormFeatured(false);
    setFormDescription('Authentic consecrated Panchaloham jewellery handcrafted by temple sthapatis.');
    setFormImageUrl('/assets/prod_ganesha_hq.webp');
    setFormGoldComp('2.5%');
    setFormSilverComp('12.5%');
    setFormCopperComp('65.0%');
    setFormZincComp('15.0%');
    setFormIronComp('5.0%');
    setFormDimensions('3.5 cm x 2.2 cm');
    setFormWeight('14.5 grams');
    setFormConsecration('Consecrated with Vedic mantras in temple sanctum.');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDeity(product.deity);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormOriginalPrice(product.originalPrice || product.price + 500);
    setFormInStock(product.inStock);
    setFormFeatured(product.featured || false);
    setFormDescription(product.description);
    setFormImageUrl(product.images?.[0] || '/assets/prod_ganesha_hq.webp');
    setFormGoldComp(product.metalComposition?.gold || '2.5%');
    setFormSilverComp(product.metalComposition?.silver || '12.5%');
    setFormCopperComp(product.metalComposition?.copper || '65.0%');
    setFormZincComp(product.metalComposition?.zinc || '15.0%');
    setFormIronComp(product.metalComposition?.iron || '5.0%');
    setFormDimensions(product.dimensions || '');
    setFormWeight(product.weight || '');
    setFormConsecration(product.consecrationDetails || 'Consecrated in temple sanctum.');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct) {
        // Update existing product
        const updatedPayload: Partial<Product> = {
          name: formName.trim(),
          deity: formDeity.trim(),
          category: formCategory,
          price: Number(formPrice),
          originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
          inStock: formInStock,
          featured: formFeatured,
          description: formDescription.trim(),
          images: [formImageUrl.trim()],
          dimensions: formDimensions.trim(),
          weight: formWeight.trim(),
          consecrationDetails: formConsecration.trim(),
          metalComposition: {
            gold: formGoldComp,
            silver: formSilverComp,
            copper: formCopperComp,
            zinc: formZincComp,
            iron: formIronComp,
            purityCertificate: editingProduct.metalComposition?.purityCertificate || 'Government Assay Certified',
          },
        };

        const result = await productsService.update(editingProduct.id, updatedPayload);
        setProducts((prev) => prev.map((p) => (p.id === result.id ? result : p)));
        setIsModalOpen(false);
        showToast(`Saved changes for "${result.name}" in PostgreSQL!`);
      } else {
        // Add new product
        const newPayload: Partial<Product> = {
          name: formName.trim(),
          deity: formDeity.trim(),
          category: formCategory,
          price: Number(formPrice),
          originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
          inStock: formInStock,
          featured: formFeatured,
          description: formDescription.trim(),
          images: [formImageUrl.trim()],
          dimensions: formDimensions.trim(),
          weight: formWeight.trim(),
          consecrationDetails: formConsecration.trim(),
          benefits: ['Bestows divine grace and energy harmony.'],
          tags: ['panchaloham', formDeity.toLowerCase(), formCategory],
          metalComposition: {
            gold: formGoldComp,
            silver: formSilverComp,
            copper: formCopperComp,
            zinc: formZincComp,
            iron: formIronComp,
            purityCertificate: 'Government Assay Certified',
          },
        };

        const created = await productsService.create(newPayload);
        setProducts((prev) => [created, ...prev]);
        setIsModalOpen(false);
        showToast(`Added new product "${created.name}" to PostgreSQL!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from PostgreSQL?`)) return;

    try {
      await productsService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Deleted "${name}" from database.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      const updated = await productsService.toggleStock(product.id);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showToast(`Stock updated: ${updated.name} is now ${updated.inStock ? 'In Stock' : 'Out of Stock'}`);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to toggle stock status', 'error');
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Uploading image to media server...');
      const res = await cmsService.uploadMedia(file);
      setFormImageUrl(res.url);
      showToast('Uploaded image and updated URL!');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    }
  };

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

      {/* Header */}
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
              Sacred Products Catalogue
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
                {backendOnline ? 'PostgreSQL Connected (Neon Cloud)' : 'Demo Catalog (Offline)'}
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage consecrated five-metal Panchaloham items, deity classifications, alloy percentages, and live inventory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadProducts}
            disabled={isLoading}
          >
            <Loader2 size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync Database'}</span>
          </button>
          <button type="button" className="admin-btn admin-btn-gold" onClick={openAddModal}>
            <Plus size={16} />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '280px', maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by deity, name, or description..."
                className="admin-form-input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Filter size={15} color="#64748b" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-form-select"
              style={{ width: 'auto', minWidth: '170px' }}
            >
              <option value="all">All Categories ({products.length})</option>
              <option value="pendants">Pendants</option>
              <option value="chains">Chains &amp; Necklaces</option>
              <option value="bracelets">Bracelets &amp; Kadas</option>
              <option value="rings">Temple Rings</option>
              <option value="pooja-items">Pooja Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Image</th>
                <th>Product Details</th>
                <th>Deity / Category</th>
                <th>Price</th>
                <th>Inventory Status</th>
                <th>Panchaloham Alloy Matrix</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <Loader2 size={28} className="animate-spin" color="#d4af37" style={{ margin: '0 auto 10px' }} />
                    <div>Loading Products from PostgreSQL database...</div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <Package size={32} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                    <div>No matching Panchaloham products found.</div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.images?.[0] || '/assets/prod_ganesha_hq.webp'}
                        alt={p.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Slug: <code>{p.slug}</code> {p.featured && <span className="admin-status-badge admin-status-gold" style={{ marginLeft: '6px' }}>FEATURED</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.85rem' }}>{p.deity}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                        {p.category}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0d5438' }}>
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                      {p.originalPrice && (
                        <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                          ₹{p.originalPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStock(p)}
                        className={`admin-status-badge ${p.inStock ? 'admin-status-green' : 'admin-status-amber'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle In-Stock / Out-of-Stock"
                      >
                        {p.inStock ? '● In Stock' : '○ Sold Out'}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                        Cu {p.metalComposition?.copper || '65%'} · Zn {p.metalComposition?.zinc || '15%'} · Ag {p.metalComposition?.silver || '12.5%'} · Au {p.metalComposition?.gold || '2.5%'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          title="View on storefront"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          onClick={() => openEditModal(p)}
                          title="Edit product"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          title="Delete product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-modal-card"
            style={{
              maxWidth: '780px',
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="admin-modal-header"
              style={{
                background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                borderBottom: '1px solid #f1f5f9',
                padding: '20px 24px',
              }}
            >
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
                  <Package size={16} />
                </div>
                <div>
                  <h2
                    className="admin-modal-title"
                    style={{
                      fontFamily: 'var(--font-cinzel, serif)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      margin: 0,
                    }}
                  >
                    {editingProduct ? 'Edit Sacred Jewellery Item' : 'Add New Panchaloham Item'}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Directly saves to Neon PostgreSQL and synchronizes with the live catalog.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-modal-close"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="admin-modal-body" style={{ padding: '24px', gap: '18px' }}>
                {/* Product Name */}
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Lord Ganesha Panchaloham Pendant"
                    className="admin-form-input"
                    style={{ height: '42px', fontSize: '0.95rem' }}
                  />
                </div>

                {/* Deity & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Deity / Spiritual Form *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDeity}
                      onChange={(e) => setFormDeity(e.target.value)}
                      placeholder="e.g. Lord Ganesha, Shiva, Murugan, Lakshmi"
                      className="admin-form-input"
                      style={{ height: '42px' }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Collection / Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Product['category'])}
                      className="admin-form-select"
                      style={{ height: '42px' }}
                    >
                      <option value="pendants">Pendants</option>
                      <option value="chains">Chains &amp; Necklaces</option>
                      <option value="bracelets">Bracelets &amp; Kadas</option>
                      <option value="rings">Temple Rings</option>
                      <option value="pooja-items">Pooja Items</option>
                    </select>
                  </div>
                </div>

                {/* Price, MRP, Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="admin-form-input"
                      style={{ height: '42px', fontWeight: 600 }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                      className="admin-form-input"
                      style={{ height: '42px' }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                      Stock Status
                    </label>
                    <select
                      value={formInStock ? 'true' : 'false'}
                      onChange={(e) => setFormInStock(e.target.value === 'true')}
                      className="admin-form-select"
                      style={{ height: '42px', fontWeight: 600, color: formInStock ? '#047857' : '#b91c1c' }}
                    >
                      <option value="true">In Stock (Available)</option>
                      <option value="false">Sold Out / Backorder</option>
                    </select>
                  </div>
                </div>

                {/* Image URL & Upload */}
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
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>Product Image URL or Path</span>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageFileUpload}
                      />
                      <span
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Upload size={13} />
                        <span>Upload File</span>
                      </span>
                    </label>
                  </label>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {formImageUrl && (
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
                          src={formImageUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="e.g. /assets/prod_ganesha_hq.webp or https://..."
                      className="admin-form-input"
                      style={{ flexGrow: 1, height: '40px' }}
                    />
                  </div>
                </div>

                {/* Sacred Description */}
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                    Sacred Consecration Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide consecration details and Agamic metallurgy significance..."
                    className="admin-form-textarea"
                    style={{ fontSize: '0.88rem', lineHeight: '1.5' }}
                  />
                </div>

                {/* 5 Metals Composition Matrix */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0d5438',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Panchaloham Five-Metal Ratio Matrix</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                      (Agamic tradition)
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Gold (Au)
                      </label>
                      <input
                        type="text"
                        value={formGoldComp}
                        onChange={(e) => setFormGoldComp(e.target.value)}
                        className="admin-form-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Silver (Ag)
                      </label>
                      <input
                        type="text"
                        value={formSilverComp}
                        onChange={(e) => setFormSilverComp(e.target.value)}
                        className="admin-form-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Copper (Cu)
                      </label>
                      <input
                        type="text"
                        value={formCopperComp}
                        onChange={(e) => setFormCopperComp(e.target.value)}
                        className="admin-form-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Zinc (Zn)
                      </label>
                      <input
                        type="text"
                        value={formZincComp}
                        onChange={(e) => setFormZincComp(e.target.value)}
                        className="admin-form-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Iron (Fe)
                      </label>
                      <input
                        type="text"
                        value={formIronComp}
                        onChange={(e) => setFormIronComp(e.target.value)}
                        className="admin-form-input"
                        style={{ padding: '6px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="admin-modal-footer"
                style={{
                  padding: '16px 24px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="admin-btn admin-btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>{editingProduct ? 'Save Changes' : 'Create in PostgreSQL'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
