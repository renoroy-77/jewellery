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
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '@/data/products';
import { Category, Product } from '@/types';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import { cmsService } from '@/services/cmsService';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';

export default function AdminProductsPage() {
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDeity, setFormDeity] = useState('');
  const [formCategory, setFormCategory] = useState<string>('pendants');
  const [formPrice, setFormPrice] = useState(2499);
  const [formOriginalPrice, setFormOriginalPrice] = useState(2999);
  const [formInStock, setFormInStock] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>(['/assets/prod_ganesha_hq.webp']);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formGoldComp, setFormGoldComp] = useState('2.5%');
  const [formSilverComp, setFormSilverComp] = useState('12.5%');
  const [formCopperComp, setFormCopperComp] = useState('65.0%');
  const [formZincComp, setFormZincComp] = useState('15.0%');
  const [formIronComp, setFormIronComp] = useState('5.0%');
  const [formDimensions, setFormDimensions] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formConsecration, setFormConsecration] = useState('Consecrated with Vedic mantras in temple sanctum.');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
    }
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
    categoriesService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'all') {
        const cat = categoryFilter.toLowerCase();
        const prodCat = (p.category || '').toLowerCase();
        const prodDeity = (p.deity || '').toLowerCase();
        const prodSlug = (p.slug || '').toLowerCase();
        if (prodCat !== cat && !prodDeity.includes(cat) && !prodSlug.includes(cat)) {
          return false;
        }
      }
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
    setFormCategory(categories.length > 0 ? (categories[0].slug || categories[0].id) : 'pendants');
    setFormPrice(2499);
    setFormOriginalPrice(2999);
    setFormInStock(true);
    setFormFeatured(false);
    setFormDescription('Authentic consecrated Panchaloham jewellery handcrafted by temple sthapatis.');
    setFormImages(['/assets/prod_ganesha_hq.webp']);
    setNewImageUrl('');
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
    // Intelligently match existing product.category against categories list
    const matchedCategory = categories.find(
      (c) =>
        c.id === product.category ||
        c.slug === product.category ||
        c.name.toLowerCase() === product.category?.toLowerCase() ||
        c.slug.includes(product.category)
    );
    setFormCategory(matchedCategory ? (matchedCategory.slug || matchedCategory.id) : (product.category || 'pendants'));
    setFormPrice(product.price);
    setFormOriginalPrice(product.originalPrice || product.price + 500);
    setFormInStock(product.inStock);
    setFormFeatured(product.featured || false);
    setFormDescription(product.description);
    const initialImages = Array.isArray(product.images) && product.images.length > 0
      ? [...product.images]
      : ['/assets/prod_ganesha_hq.webp'];
    setFormImages(initialImages);
    setNewImageUrl('');
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

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (formImages.includes(url)) {
      showToast('This image is already in the list', 'error');
      return;
    }
    setFormImages((prev) => {
      const filtered = prev.filter(img => img !== '/assets/prod_ganesha_hq.webp' || prev.length > 1);
      return [...filtered, url];
    });
    setNewImageUrl('');
    showToast('Added image to list!');
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setFormImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    showToast('Set as main product photo!');
  };

  const handleRemoveImage = (index: number) => {
    if (formImages.length <= 1) {
      showToast('Product must have at least one photo', 'error');
      return;
    }
    setFormImages((prev) => prev.filter((_, i) => i !== index));
    showToast('Photo removed');
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      showToast(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}...`);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await cmsService.uploadMedia(file);
        if (res && res.url) {
          newUrls.push(res.url);
        }
      }

      if (newUrls.length > 0) {
        setFormImages((prev) => {
          const filtered = prev.filter(img => img !== '/assets/prod_ganesha_hq.webp' || prev.length > 1);
          return [...filtered, ...newUrls];
        });
        showToast(`Uploaded ${newUrls.length} photo${newUrls.length > 1 ? 's' : ''}!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    const validImages = formImages.map((s) => s.trim()).filter(Boolean);
    const finalImages = validImages.length > 0 ? validImages : ['/assets/prod_ganesha_hq.webp'];

    setIsSaving(true);
    try {
      if (editingProduct) {
        // Update existing product
        const purity =
          editingProduct.metalComposition?.purityCertificate &&
          editingProduct.metalComposition.purityCertificate !== 'Govt. Approved Panchaloham Lab Certified'
            ? editingProduct.metalComposition.purityCertificate
            : 'Authentic Temple Guild Certified';

        const updatedPayload: Partial<Product> = {
          name: formName.trim(),
          deity: formDeity.trim(),
          category: formCategory,
          price: Number(formPrice),
          originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
          inStock: formInStock,
          featured: formFeatured,
          description: formDescription.trim(),
          images: finalImages,
          dimensions: formDimensions.trim(),
          weight: formWeight.trim(),
          consecrationDetails: formConsecration.trim(),
          metalComposition: {
            gold: formGoldComp,
            silver: formSilverComp,
            copper: formCopperComp,
            zinc: formZincComp,
            iron: formIronComp,
            purityCertificate: purity,
          },
        };

        const result = await productsService.update(editingProduct.id, updatedPayload);
        setProducts((prev) => prev.map((p) => (p.id === result.id ? result : p)));
        setIsModalOpen(false);
        showToast(`Saved changes for "${result.name}" with ${finalImages.length} photos in PostgreSQL!`);
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
          images: finalImages,
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
            purityCertificate: 'Authentic Temple Guild Certified',
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
    const ok = await confirm({
      title: 'Delete Sacred Product',
      message: `Are you sure you want to permanently delete "${name}" from PostgreSQL?`,
      description: 'This will remove the consecrated piece from the live catalogue and database.',
      confirmText: 'Yes, Delete',
      cancelText: 'No, Keep Product',
      isDanger: true,
      icon: 'trash',
    });
    if (!ok) return;

    try {
      await productsService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Deleted "${name}" from database.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete product');
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>


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
              <option value="all">All Collections &amp; Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug || c.id}>
                  {c.name}
                </option>
              ))}
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
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
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
                flexShrink: 0,
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

            <form
              onSubmit={handleSaveProduct}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <div
                className="admin-modal-body"
                style={{
                  padding: '24px',
                  gap: '18px',
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                }}
              >
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
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="admin-form-select"
                      style={{ height: '42px' }}
                    >
                      {/* If current formCategory doesn't match any option, include it so it's not lost */}
                      {formCategory && !categories.some((c) => (c.slug || c.id) === formCategory || c.name.toLowerCase() === formCategory.toLowerCase()) && (
                        <option value={formCategory}>
                          Current: {formCategory}
                        </option>
                      )}
                      {categories.map((cat) => (
                        <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                          {cat.name} {cat.tamilName ? `(${cat.tamilName})` : ''}
                        </option>
                      ))}
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

                {/* Featured Showcase Toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: formFeatured ? '#f0fdf4' : '#f8fafc',
                    border: formFeatured ? '1px solid #86efac' : '1px solid #e2e8f0',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    id="featured-product-toggle"
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d5438', cursor: 'pointer' }}
                  />
                  <label htmlFor="featured-product-toggle" style={{ cursor: 'pointer', margin: 0 }}>
                    <span style={{ fontWeight: 700, color: formFeatured ? '#166534' : '#1e293b', fontSize: '0.9rem' }}>
                      ⭐ Feature on Homepage (Consecrated Creations showcase)
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      When enabled, this consecrated piece is showcased in the &quot;Blessings for Every Occasion / Consecrated Creations&quot; homepage grid.
                    </p>
                  </label>
                </div>

                {/* Multiple Product Photos & Upload */}
                <div
                  className="admin-form-group"
                  style={{
                    background: '#f8fafc',
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                          Product Photos ({formImages.length})
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            background: '#ecfdf5',
                            color: '#065f46',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          First photo is Main Photo
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        Add multiple photos for the customer gallery. You can set any photo as the main photo.
                      </p>
                    </div>

                    <label style={{ cursor: isUploadingImages ? 'not-allowed' : 'pointer' }}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploadingImages}
                        style={{ display: 'none' }}
                        onChange={handleImageFileUpload}
                      />
                      <span
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: isUploadingImages ? 0.7 : 1,
                        }}
                      >
                        {isUploadingImages ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>{isUploadingImages ? 'Uploading...' : 'Upload Photos'}</span>
                      </span>
                    </label>
                  </div>

                  {/* Add Image by URL row */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Paste image URL (e.g. /assets/prod_ganesha_hq.webp or https://...)"
                      className="admin-form-input"
                      style={{ height: '38px', fontSize: '0.84rem', flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="admin-btn admin-btn-sm admin-btn-gold"
                      style={{ height: '38px', padding: '0 14px', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={14} />
                      <span>Add Photo</span>
                    </button>
                  </div>

                  {/* Visual Grid of Images */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    {formImages.map((imgUrl, index) => {
                      const isMain = index === 0;
                      return (
                        <div
                          key={`${imgUrl}-${index}`}
                          style={{
                            position: 'relative',
                            borderRadius: '10px',
                            border: isMain ? '2px solid #0d5438' : '1px solid #e2e8f0',
                            background: '#ffffff',
                            overflow: 'hidden',
                            boxShadow: isMain ? '0 4px 10px rgba(13, 84, 56, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              paddingTop: '100%',
                              background: '#04140d',
                            }}
                          >
                            <img
                              src={imgUrl}
                              alt={`Photo ${index + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/prod_ganesha_hq.webp';
                              }}
                            />
                            {isMain && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  left: '6px',
                                  background: '#0d5438',
                                  color: '#fcd34d',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                }}
                              >
                                <Star size={10} fill="#fcd34d" />
                                <span>Main</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              title="Delete photo"
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: '#ffffff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div
                            style={{
                              padding: '8px',
                              background: '#f8fafc',
                              borderTop: '1px solid #f1f5f9',
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            {isMain ? (
                              <span style={{ fontSize: '0.72rem', color: '#0d5438', fontWeight: 700 }}>
                                Primary Photo
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(index)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#2563eb',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  padding: 0,
                                  textDecoration: 'underline',
                                }}
                              >
                                Set as Main
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  flexShrink: 0,
                  zIndex: 10,
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
