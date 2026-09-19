'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Edit, Plus, Trash2, CheckCircle2, ExternalLink, X, Search, FileText } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '@/data/blog';
import { blogService } from '@/services/blogService';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openCreate = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory('VEDIC METALLURGY');
    setFormReadTime('5 min');
    setFormExcerpt('');
    setFormAuthor('Master Sthapati R. Shanmugam');
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
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const slug = formTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newArticle: BlogPost = {
      id: `post-${Date.now().toString().slice(-4)}`,
      slug: slug || `article-${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || formTitle.trim(),
      excerpt: formExcerpt.trim() || formSubtitle.trim(),
      image: '/assets/blog_vedic_metallurgy.jpg',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: formReadTime,
      tag: formCategory.toUpperCase(),
      category: formCategory,
      author: {
        name: formAuthor,
        role: 'Sacred Metallurgy & Agama Scholar',
      },
      likes: 12,
      content: {
        lead: formExcerpt.trim() || formSubtitle.trim(),
        sections: [
          {
            heading: formTitle.trim(),
            body: [
              formExcerpt.trim() || 'This sacred treatise explores the timeless wisdom of traditional Panchaloham crafting.',
              'Passed down through generations of sthapatis, every piece created carries the resonance of divine geometry and Vedic craftsmanship.',
            ],
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

    const updated: BlogPost = {
      ...editingPost,
      title: formTitle,
      subtitle: formSubtitle,
      category: formCategory,
      readTime: formReadTime,
      excerpt: formExcerpt,
      author: {
        ...editingPost.author,
        name: formAuthor,
      },
    };

    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPost(null);
    showToast(`Updated blog article "${updated.title}"`);

    blogService.update(updated.id, updated).catch(() => {
      showToast('Warning: Could not sync update to database');
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete article "${title}"?`)) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Deleted article "${title}"`);
      blogService.delete(id).catch(() => {});
    }
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
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif, "Cinzel", serif)', fontSize: '1.75rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
            Sacred Metallurgy Journal &amp; Blog
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
                <th>Article Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Read Time</th>
                <th>Date</th>
                <th>Likes</th>
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
                    <td style={{ color: '#b45309', fontWeight: 600 }}>❤️ {post.likes}</td>
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
          <div className="admin-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
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
                  <label className="admin-form-label">Excerpt / Summary *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide a descriptive overview of this sacred article..."
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
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
          <div className="admin-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
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
                  <label className="admin-form-label">Excerpt / Summary</label>
                  <textarea
                    rows={4}
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
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
