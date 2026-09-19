import { OrderCMS, INITIAL_ORDERS } from '@/data/cmsData';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const ordersService = {
  async getAll(params?: { status?: string; search?: string }): Promise<OrderCMS[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/orders`);
      if (params?.status && params.status !== 'all') {
        url.searchParams.set('status', params.status);
      }
      if (params?.search) {
        url.searchParams.set('search', params.search);
      }

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  async getById(id: string): Promise<OrderCMS | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      return INITIAL_ORDERS.find((o) => o.id === id) || null;
    }
  },

  async create(order: Partial<OrderCMS>): Promise<OrderCMS> {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      throw new Error(`Failed to create order: ${res.statusText}`);
    }
    return res.json();
  },

  async updateStatus(
    id: string,
    status: OrderCMS['status'],
    trackingNumber?: string,
    cancellationReason?: string,
  ): Promise<OrderCMS> {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingNumber, cancellationReason }),
    });
    if (!res.ok) {
      throw new Error(`Failed to update order status: ${res.statusText}`);
    }
    return res.json();
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  async testTelegram(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/test-telegram`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to connect to Telegram bot',
      };
    }
  },
};
