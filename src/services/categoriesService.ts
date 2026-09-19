import { Category } from '@/types';
import { CATEGORIES } from '@/data/products';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  },

  async getById(idOrSlug: string): Promise<Category | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${idOrSlug}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      return CATEGORIES.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
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
