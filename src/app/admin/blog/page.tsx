'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  X,
  Search,
  FileText,
  Upload,
  Loader2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '@/data/blog';
import { blogService } from '@/services/blogService';
import { cmsService } from '@/services/cmsService';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';

export default function AdminBlogPage() {
  const { confirm } = useConfirm();
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    blogService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) setPosts(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Form states for Edit / Create
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState('VEDIC METALLURGY');
  const [formReadTime, setFormReadTime] = useState('6 min');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formAuthor, setFormAuthor] = useState('Master Sthapati R. Shanmugam');
  const [formAuthorRole, setFormAuthorRole] = useState('Sacred Metallurgy & Agama Scholar');
  const [formImage, setFormImage] = useState('/assets/blog_vedic_metallurgy.jpg');
  const [formBody, setFormBody] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error' || msg.toLowerCase().includes('warning') || msg.toLowerCase().includes('failed')) {
      toast.error(msg);
    } else {
      toast.success(msg);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await cmsService.uploadMedia(file);
      if (res && res.url) {
        setFormImage(res.url);
        showToast('Cover image uploaded successfully!');
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed. Backend media server may be offline.', 'error');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const openCreate = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory('VEDIC METALLURGY');
    setFormReadTime('5 min');
    setFormExcerpt('');
    setFormAuthor('Master Sthapati R. Shanmugam');
    setFormAuthorRole('Sacred Metallurgy & Agama Scholar');
    setFormImage('/assets/blog_vedic_metallurgy.jpg');
    setFormBody('This sacred treatise explores the timeless wisdom of traditional Panchaloham crafting.\n\nPassed down through generations of sthapatis, every piece created carries the resonance of divine geometry and Vedic craftsmanship.');
    setFormFeatured(false);
    setIsCreateModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSubtitle(post.subtitle);
    setFormCategory(post.category);
    setFormReadTime(post.readTime);
    setFormExcerpt(post.excerpt);
    setFormAuthor(post.author.name);
    setFormAuthorRole(post.author.role);
    setFormImage(post.image || '/assets/blog_vedic_metallurgy.jpg');
    setFormFeatured(Boolean(post.featured));

    const paragraphs = post.content?.sections?.[0]?.body;
    if (Array.isArray(paragraphs) && paragraphs.length > 0) {
      setFormBody(paragraphs.join('\n\n'));
    } else {
      setFormBody(post.content?.lead || post.excerpt);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const slug = formTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const bodyParagraphs = formBody
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const newArticle: BlogPost = {
      id: `post-${Date.now().toString().slice(-4)}`,
      slug: slug || `article-${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || formTitle.trim(),
      excerpt: formExcerpt.trim() || formSubtitle.trim(),
      image: formImage.trim() || '/assets/blog_vedic_metallurgy.jpg',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: formReadTime,
      tag: formCategory.toUpperCase(),
      category: formCategory,
      author: {
        name: formAuthor,
        role: formAuthorRole,
      },
      featured: formFeatured,
      likes: 18,
      content: {
        lead: formExcerpt.trim() || formSubtitle.trim(),
        sections: [
          {
            heading: formTitle.trim(),
            body: bodyParagraphs.length > 0 ? bodyParagraphs : [formExcerpt.trim()],
          },
        ],
        takeaways: [
          'Handcrafted with authentic 5-metal Panchaloham',
          'Consecrated according to Agamic tenets',
        ],
        relatedProductSlugs: ['lord-shiva-panchaloham-pendant', 'lord-murugan-vel-panchaloham-pendant'],
      },
    };

    try {
      const created = await blogService.create(newArticle);
      setPosts((prev) => [created, ...prev]);
      showToast(`Published article "${created.title}" successfully!`);
    } catch {
      setPosts((prev) => [newArticle, ...prev]);
      showToast(`Published article "${newArticle.title}" (local)`);
    }
    setIsCreateModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const bodyParagraphs = formBody
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const updated: BlogPost = {
      ...editingPost,
      title: formTitle,
      subtitle: formSubtitle,
      category: formCategory,
      readTime: formReadTime,
      excerpt: formExcerpt,
      image: formImage.trim() || editingPost.image,
      featured: formFeatured,
      author: {
        name: formAuthor,
        role: formAuthorRole,
      },
      content: {
        ...editingPost.content,
        lead: formExcerpt,
        sections: [
          {
            heading: formTitle,
            body: bodyParagraphs.length > 0 ? bodyParagraphs : [formExcerpt],
          },
        ],
      },
    };

    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPost(null);
    showToast(`Updated blog article "${updated.title}"`);

    blogService.update(updated.id, updated).catch(() => {
      showToast('Warning: Could not sync update to database');
    });
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: 'Delete Blog Article',
      message: `Are you sure you want to delete article "${title}"?`,
      description: 'This will remove the publication from the live knowledge portal.',
      confirmText: 'Yes, Delete Article',
      cancelText: 'No, Keep Article',
      isDanger: true,
      icon: 'trash',
    });
    if (!ok) return;

    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Deleted article "${title}"`);
    blogService.delete(id).catch(() => {});
  };

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Hidden file input for cover image upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadImage}
      />

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', fontSize: '1.75rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
            Sacred Metallurgy Journal &amp; Blog CMS
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Articles on Vedic metallurgical science, temple consecration traditions, and Agamic wisdom.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <Link
            href="/blog"
            target="_blank"
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <span>View Public Journal</span>
            <ExternalLink size={14} />
          </Link>

          <button
            type="button"
            onClick={openCreate}
            className="admin-btn admin-btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>+ New Article</span>
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <BookOpen size={20} color="#0d5438" />
            Published Journal Articles ({filteredPosts.length})
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className="admin-btn admin-btn-sm admin-btn-gold"
          >
            <Plus size={14} />
            <span>Add Article</span>
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Article Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Read Time</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No blog articles found matching your search term.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td style={{ width: '60px' }}>
                      <img
                        src={post.image || '/assets/blog_vedic_metallurgy.jpg'}
                        alt={post.title}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{post.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{post.subtitle.slice(0, 75)}...</div>
                    </td>
                    <td>
                      <span className="admin-status-badge admin-status-blue">{post.category}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#334155' }}>{post.author.name}</td>
                    <td style={{ color: '#475569' }}>{post.readTime}</td>
                    <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{post.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          title="View published post"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-gold"
                          onClick={() => openEdit(post)}
                          title="Edit article"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          onClick={() => handleDelete(post.id, post.title)}
                          title="Delete article"
                          style={{ color: '#b91c1c' }}
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

      {/* Create Article Modal */}
      {isCreateModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#0d5438', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="admin-modal-title" style={{ margin: 0 }}>Create Journal Article</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Publish a new article to the sacred knowledge journal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sacred Vedic Ratios in Five-Metal Casting"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Subtitle</label>
                  <input
                    type="text"
                    placeholder="Brief compelling hook for devotees"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="admin-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="admin-form-label" style={{ margin: 0 }}>Cover Image Asset</label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isUploadingImage ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="admin-form-input"
                    placeholder="/assets/blog_vedic_metallurgy.jpg or https://..."
                  />
                  {formImage && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={formImage}
                        alt="Preview"
                        style={{ height: '70px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="admin-form-input"
                    >
                      <option value="VEDIC METALLURGY">VEDIC METALLURGY</option>
                      <option value="TEMPLE RITUALS">TEMPLE RITUALS</option>
                      <option value="JEWELLERY SYMBOLISM">JEWELLERY SYMBOLISM</option>
                      <option value="CARE & PURITY">CARE & PURITY</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Estimated Read Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 min"
                      value={formReadTime}
                      onChange={(e) => setFormReadTime(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Author Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Sthapati R. Shanmugam"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Author Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Sacred Metallurgy & Agama Scholar"
                      value={formAuthorRole}
                      onChange={(e) => setFormAuthorRole(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Excerpt / Summary *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide a descriptive overview of this sacred article..."
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Full Article Content (Paragraphs separated by blank line)</label>
                  <textarea
                    rows={6}
                    placeholder="Write the complete article body here..."
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-gold">
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="admin-modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit Article: {editingPost.title}</h2>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Article Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Subtitle</label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="admin-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="admin-form-label" style={{ margin: 0 }}>Cover Image Asset</label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isUploadingImage ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="admin-form-input"
                  />
                  {formImage && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={formImage}
                        alt="Preview"
                        style={{ height: '70px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="admin-form-input"
                    >
                      <option value="VEDIC METALLURGY">VEDIC METALLURGY</option>
                      <option value="TEMPLE RITUALS">TEMPLE RITUALS</option>
                      <option value="JEWELLERY SYMBOLISM">JEWELLERY SYMBOLISM</option>
                      <option value="CARE & PURITY">CARE & PURITY</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Estimated Read Time</label>
                    <input
                      type="text"
                      value={formReadTime}
                      onChange={(e) => setFormReadTime(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Author Name</label>
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Author Role</label>
                    <input
                      type="text"
                      value={formAuthorRole}
                      onChange={(e) => setFormAuthorRole(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Excerpt / Summary</label>
                  <textarea
                    rows={2}
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Full Article Content (Paragraphs separated by blank line)</label>
                  <textarea
                    rows={6}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingPost(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-gold">
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
