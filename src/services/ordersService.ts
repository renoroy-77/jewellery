import { OrderCMS, INITIAL_ORDERS } from '@/data/cmsData';
import { adminAuthService } from './adminAuthService';
import { devoteeAuthService } from './devoteeAuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function getAuthHeaders(preferAdmin = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const adminToken = adminAuthService.getToken();
  const devoteeSession = devoteeAuthService.getSession();

  if (preferAdmin && adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  } else if (devoteeSession?.token) {
    headers['Authorization'] = `Bearer ${devoteeSession.token}`;
  } else if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  return headers;
}

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

      const res = await fetch(url.toString(), {
        headers: getAuthHeaders(true),
        cache: 'no-store',
      });
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
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        headers: getAuthHeaders(false),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      return INITIAL_ORDERS.find((o) => o.id === id) || null;
    }
  },

  async create(order: Partial<OrderCMS>): Promise<OrderCMS> {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create order: ${res.statusText}`);
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
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status, trackingNumber, cancellationReason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to update order status: ${res.statusText}`);
    }
    return res.json();
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true),
    });
    return res.ok;
  },

  async testTelegram(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/test-telegram`, {
        method: 'POST',
        headers: getAuthHeaders(true),
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
