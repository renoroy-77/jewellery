import { UserRecord, INITIAL_USERS } from '@/data/cmsData';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface DevoteeWithOrders extends UserRecord {
  ordersCount?: number;
  totalSpent?: number;
  orders?: any[];
}

export const devoteesService = {
  async getAll(search?: string): Promise<DevoteeWithOrders[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/users`);
      if (search) {
        url.searchParams.set('search', search);
      }

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  async getById(id: string): Promise<DevoteeWithOrders | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      return INITIAL_USERS.find((u) => u.id === id) || null;
    }
  },

  async create(devotee: Partial<UserRecord>): Promise<UserRecord> {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(devotee),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Failed to create devotee profile');
    }
    return res.json();
  },

  async update(id: string, updates: Partial<UserRecord>): Promise<UserRecord> {
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error(`Failed to update devotee: ${res.statusText}`);
    }
    return res.json();
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
