import { BlogPost, BLOG_POSTS } from '@/data/blog';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function mapBackendToBlogPost(p: any): BlogPost {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    excerpt: p.excerpt,
    image: p.image,
    date: p.date,
    readTime: p.readTime,
    tag: p.tag,
    category: p.category,
    author: {
      name: p.authorName || p.author?.name || 'Master Sthapati',
      role: p.authorRole || p.author?.role || 'Temple Artisan',
    },
    likes: p.likes ?? 0,
    featured: p.featured ?? false,
    content: p.content || { lead: '', sections: [], takeaways: [], relatedProductSlugs: [] },
  };
}

function mapBlogPostToBackend(p: Partial<BlogPost>): any {
  const payload: any = { ...p };
  if (p.author) {
    payload.authorName = p.author.name;
    payload.authorRole = p.author.role;
  }
  return payload;
}

export const blogService = {
  async getAll(params?: { category?: string; search?: string }): Promise<BlogPost[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/blog`);
      if (params?.category && params.category !== 'all') {
        url.searchParams.set('category', params.category);
      }
      if (params?.search) {
        url.searchParams.set('search', params.search);
      }

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapBackendToBlogPost);
      }
      return BLOG_POSTS;
    } catch {
      return BLOG_POSTS;
    }
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return mapBackendToBlogPost(data);
    } catch {
      return BLOG_POSTS.find((b) => b.slug === slug || b.id === slug) || null;
    }
  },

  async create(post: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetch(`${API_BASE_URL}/api/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapBlogPostToBackend(post)),
    });
    if (!res.ok) {
      throw new Error(`Failed to publish blog post: ${res.statusText}`);
    }
    const data = await res.json();
    return mapBackendToBlogPost(data);
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapBlogPostToBackend(updates)),
    });
    if (!res.ok) {
      throw new Error(`Failed to update blog post: ${res.statusText}`);
    }
    const data = await res.json();
    return mapBackendToBlogPost(data);
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
