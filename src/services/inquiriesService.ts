import { InquiryItem, InquiryStatus } from '@/types/inquiries';
import { INITIAL_INQUIRIES } from '@/data/cmsData';

const STORAGE_KEY = 'aamadappetti_inquiries';

function getLocalInquiries(): InquiryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item: any) =>
            !['#AAP-84920', '#AAP-84919', '#AAP-84918', 'inq-101', 'inq-102', 'inq-103'].includes(
              item.id || item.referenceId,
            ),
        );
      }
    }
  } catch (e) {
    console.warn('Error reading local inquiries', e);
  }
  return [];
}

function saveLocalInquiries(items: InquiryItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving local inquiries', e);
  }
}

export const inquiriesService = {
  async getAll(): Promise<InquiryItem[]> {
    try {
      const res = await fetch('/api/inquiries', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          saveLocalInquiries(data);
          return data;
        }
      }
    } catch {
      // fallback to local storage
    }
    return getLocalInquiries();
  },

  async create(data: {
    name: string;
    email: string;
    phone: string;
    inquiryType: string;
    preferredContact: 'WhatsApp' | 'Phone Call' | 'Email';
    message: string;
  }): Promise<InquiryItem> {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const referenceId = `#AAP-${randomSuffix}`;
    const newItem: InquiryItem = {
      id: `inq-${Date.now()}`,
      referenceId,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      inquiryType: data.inquiryType,
      preferredContact: data.preferredContact,
      message: data.message.trim(),
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const serverItem = await res.json();
        const current = getLocalInquiries();
        saveLocalInquiries([serverItem, ...current]);
        return serverItem;
      }
    } catch (e) {
      console.warn('Failed to reach /api/inquiries, storing locally', e);
    }

    const current = getLocalInquiries();
    saveLocalInquiries([newItem, ...current]);
    return newItem;
  },

  async updateStatus(id: string, status: InquiryStatus, notes?: string): Promise<boolean> {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
    } catch {
      // offline fallback
    }

    const current = getLocalInquiries();
    const updated = current.map((item) =>
      item.id === id ? { ...item, status, ...(notes !== undefined ? { notes } : {}) } : item
    );
    saveLocalInquiries(updated);
    return true;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // offline fallback
    }

    const current = getLocalInquiries();
    const filtered = current.filter((item) => item.id !== id);
    saveLocalInquiries(filtered);
    return true;
  },
};
