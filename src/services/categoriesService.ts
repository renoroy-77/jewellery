import { Category } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch categories from backend API:', err);
      return [];
    }
  },

  async getById(idOrSlug: string): Promise<Category | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${idOrSlug}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
      // If direct route by slug or id didn't match directly, check full list from backend
      const all = await categoriesService.getAll();
      const target = (idOrSlug || '').toLowerCase().trim();
      return (
        all.find((c) => {
          const catId = (c.id || '').toLowerCase().trim();
          const catSlug = (c.slug || '').toLowerCase().trim();
          const catName = (c.name || '').toLowerCase().trim();
          return catId === target || catSlug === target || catName === target;
        }) || null
      );
    } catch {
      return null;
    }
  },

  async create(category: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      throw new Error(`Failed to create category: ${res.statusText}`);
    }
    return res.json();
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error(`Failed to update category: ${res.statusText}`);
    }
    return res.json();
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
