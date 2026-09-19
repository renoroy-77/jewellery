import { OrderCMS, INITIAL_ORDERS, UserRecord, INITIAL_USERS } from '@/data/cmsData';
import { CATEGORIES } from '@/data/products';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface DashboardStatsResponse {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    consecratedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    totalProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    totalUsers: number;
    totalCategories: number;
    totalBlogPosts: number;
  };
  recentOrders: OrderCMS[];
  recentUsers: UserRecord[];
  categories: { id: string; name: string; itemCount: number; slug: string }[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStatsResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      // Fallback
      return {
        metrics: {
          totalRevenue: INITIAL_ORDERS.reduce((s, o) => s + o.totalAmount, 0),
          totalOrders: INITIAL_ORDERS.length,
          pendingOrders: INITIAL_ORDERS.filter((o) => o.status === 'Pending').length,
          consecratedOrders: INITIAL_ORDERS.filter((o) => o.status === 'Consecrated').length,
          shippedOrders: INITIAL_ORDERS.filter((o) => o.status === 'Shipped').length,
          deliveredOrders: INITIAL_ORDERS.filter((o) => o.status === 'Delivered').length,
          totalProducts: 9,
          inStockProducts: 9,
          outOfStockProducts: 0,
          totalUsers: INITIAL_USERS.length,
          totalCategories: CATEGORIES.length,
          totalBlogPosts: 2,
        },
        recentOrders: INITIAL_ORDERS,
        recentUsers: INITIAL_USERS,
        categories: CATEGORIES.map((c) => ({
          id: c.id,
          name: c.name,
          itemCount: c.itemCount,
          slug: c.slug,
        })),
      };
    }
  },
};
