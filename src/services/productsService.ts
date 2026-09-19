import { Product } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function mapBackendToProduct(p: any): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    deity: p.deity,
    category: p.category as any,
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    inStock: p.inStock,
    featured: p.featured,
    description: p.description,
    metalComposition: {
      gold: p.metalGold || '2.5%',
      silver: p.metalSilver || '12.5%',
      copper: p.metalCopper || '65.0%',
      zinc: p.metalZinc || '15.0%',
      iron: p.metalIron || '5.0%',
      purityCertificate: p.purityCertificate || 'Government Assay Certified',
    },
    dimensions: p.dimensions || undefined,
    weight: p.weight || undefined,
    consecrationDetails: p.consecrationDetails || undefined,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['/assets/prod_ganesha_hq.webp'],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
  };
}

function mapProductToBackend(p: Partial<Product>): any {
  return {
    ...p,
    metalGold: p.metalComposition?.gold,
    metalSilver: p.metalComposition?.silver,
    metalCopper: p.metalComposition?.copper,
    metalZinc: p.metalComposition?.zinc,
    metalIron: p.metalComposition?.iron,
    purityCertificate: p.metalComposition?.purityCertificate,
  };
}

export const productsService = {
  async getAll(params?: {
    category?: string;
    search?: string;
    inStock?: boolean;
    featured?: boolean;
  }): Promise<Product[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/products`);
      if (params?.category && params.category !== 'all') {
        url.searchParams.set('category', params.category);
      }
      if (params?.search) {
        url.searchParams.set('search', params.search);
      }
      if (typeof params?.inStock === 'boolean') {
        url.searchParams.set('inStock', String(params.inStock));
      }
      if (typeof params?.featured === 'boolean') {
        url.searchParams.set('featured', String(params.featured));
      }

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.map(mapBackendToProduct) : [];
    } catch (err) {
      console.error('Error fetching products from backend:', err);
      return [];
    }
  },

  async getById(idOrSlug: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${idOrSlug}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return mapBackendToProduct(data);
    } catch {
      return null;
    }
  },

  async create(product: Partial<Product>): Promise<Product> {
    const payload = mapProductToBackend(product);
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create product in PostgreSQL');
    }

    const data = await res.json();
    return mapBackendToProduct(data);
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const payload = mapProductToBackend(product);
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to update product ${id}`);
    }

    const data = await res.json();
    return mapBackendToProduct(data);
  },

  async toggleStock(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}/toggle-stock`, {
      method: 'PATCH',
    });

    if (!res.ok) throw new Error(`Failed to toggle stock for product ${id}`);
    const data = await res.json();
    return mapBackendToProduct(data);
  },

  async toggleFeatured(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}/toggle-featured`, {
      method: 'PATCH',
    });

    if (!res.ok) throw new Error(`Failed to toggle featured status for product ${id}`);
    const data = await res.json();
    return mapBackendToProduct(data);
  },

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
