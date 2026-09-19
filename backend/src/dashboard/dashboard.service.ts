import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      consecratedOrders,
      shippedOrders,
      deliveredOrders,
      allOrders,
      totalUsers,
      totalCategories,
      totalBlogPosts,
      recentOrders,
      recentUsers,
      categories,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { inStock: true } }),
      this.prisma.product.count({ where: { inStock: false } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: { equals: 'Pending', mode: 'insensitive' } } }),
      this.prisma.order.count({ where: { status: { equals: 'Consecrated', mode: 'insensitive' } } }),
      this.prisma.order.count({ where: { status: { equals: 'Shipped', mode: 'insensitive' } } }),
      this.prisma.order.count({ where: { status: { equals: 'Delivered', mode: 'insensitive' } } }),
      this.prisma.order.findMany({ select: { totalAmount: true } }),
      this.prisma.devoteeUser.count(),
      this.prisma.category.count(),
      this.prisma.blogPost.count(),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.devoteeUser.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.findMany({
        select: { id: true, name: true, itemCount: true, slug: true },
      }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      metrics: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        consecratedOrders,
        shippedOrders,
        deliveredOrders,
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        totalUsers,
        totalCategories,
        totalBlogPosts,
      },
      recentOrders,
      recentUsers,
      categories,
    };
  }
}
