import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDevoteeUserDto } from './dto/create-user.dto';
import { UpdateDevoteeUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const devotees = await this.prisma.devoteeUser.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Also get order counts and total spent for each devotee by email
    const orders = await this.prisma.order.findMany({
      select: { email: true, totalAmount: true },
    });

    const emailStats = orders.reduce((acc, order) => {
      const email = order.email.toLowerCase();
      if (!acc[email]) acc[email] = { count: 0, total: 0 };
      acc[email].count += 1;
      acc[email].total += order.totalAmount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return devotees.map((user) => {
      const stats = emailStats[user.email.toLowerCase()] || { count: 0, total: 0 };
      return {
        ...user,
        ordersCount: stats.count,
        totalSpent: stats.total,
      };
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.devoteeUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Devotee #${id} not found`);
    }

    const devoteeOrders = await this.prisma.order.findMany({
      where: { email: { equals: user.email, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...user,
      orders: devoteeOrders,
    };
  }

  async create(dto: CreateDevoteeUserDto) {
    const existing = await this.prisma.devoteeUser.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(`Devotee with email ${dto.email} already exists`);
    }

    const userId = dto.id || `USR-${Math.floor(100 + Math.random() * 900)}`;
    const memberSince =
      dto.memberSince ||
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

    return this.prisma.devoteeUser.create({
      data: {
        id: userId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        shippingAddress: dto.shippingAddress,
        memberSince,
      },
    });
  }

  async update(id: string, dto: UpdateDevoteeUserDto) {
    const existing = await this.prisma.devoteeUser.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Devotee #${id} not found`);
    }

    return this.prisma.devoteeUser.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.devoteeUser.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Devotee #${id} not found`);
    }

    return this.prisma.devoteeUser.delete({
      where: { id },
    });
  }
}
