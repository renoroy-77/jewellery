import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDevoteeUserDto } from './dto/create-user.dto';
import { UpdateDevoteeUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveDevotee(idOrEmail: string) {
    const isEmail = idOrEmail.includes('@');
    const user = await this.prisma.devoteeUser.findFirst({
      where: isEmail
        ? { email: { equals: idOrEmail.trim(), mode: 'insensitive' } }
        : { id: idOrEmail },
    });

    if (!user) {
      throw new NotFoundException(`Devotee "${idOrEmail}" not found`);
    }
    return user;
  }

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
      include: {
        addresses: true,
      },
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
    const user = await this.prisma.devoteeUser.findFirst({
      where: id.includes('@') ? { email: id } : { id },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
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
      where: { email: dto.email.toLowerCase().trim() },
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
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        shippingAddress: dto.shippingAddress,
        memberSince,
      },
      include: {
        addresses: true,
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
      include: { addresses: true },
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

  // ==========================================
  // E-COMMERCE ADDRESS BOOK MANAGEMENT
  // ==========================================

  async getAddresses(idOrEmail: string) {
    const devotee = await this.resolveDevotee(idOrEmail);
    return this.prisma.devoteeAddress.findMany({
      where: { devoteeId: devotee.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addAddress(idOrEmail: string, dto: CreateAddressDto) {
    const devotee = await this.resolveDevotee(idOrEmail);

    // If this address is set to default or is the first address, clear existing defaults
    const existingCount = await this.prisma.devoteeAddress.count({
      where: { devoteeId: devotee.id },
    });

    const isDefault = dto.isDefault || existingCount === 0;

    if (isDefault) {
      await this.prisma.devoteeAddress.updateMany({
        where: { devoteeId: devotee.id },
        data: { isDefault: false },
      });
    }

    const created = await this.prisma.devoteeAddress.create({
      data: {
        devoteeId: devotee.id,
        label: dto.label || 'Home / Puja Room',
        recipientName: dto.recipientName,
        phone: dto.phone,
        streetAddress: dto.streetAddress,
        city: dto.city,
        state: dto.state || 'Tamil Nadu',
        pincode: dto.pincode,
        isDefault,
      },
    });

    // Also update devotee main contact phone/address if currently empty
    if (!devotee.phone && dto.phone) {
      await this.prisma.devoteeUser.update({
        where: { id: devotee.id },
        data: {
          phone: dto.phone,
          shippingAddress: `${dto.streetAddress}, ${dto.city}, ${dto.state || 'Tamil Nadu'} - ${dto.pincode}`,
        },
      });
    }

    return created;
  }

  async updateAddress(idOrEmail: string, addressId: string, dto: UpdateAddressDto) {
    const devotee = await this.resolveDevotee(idOrEmail);

    const address = await this.prisma.devoteeAddress.findFirst({
      where: { id: addressId, devoteeId: devotee.id },
    });

    if (!address) {
      throw new NotFoundException(`Address #${addressId} not found for this devotee`);
    }

    if (dto.isDefault) {
      await this.prisma.devoteeAddress.updateMany({
        where: { devoteeId: devotee.id },
        data: { isDefault: false },
      });
    }

    return this.prisma.devoteeAddress.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(idOrEmail: string, addressId: string) {
    const devotee = await this.resolveDevotee(idOrEmail);

    const address = await this.prisma.devoteeAddress.findFirst({
      where: { id: addressId, devoteeId: devotee.id },
    });

    if (!address) {
      throw new NotFoundException(`Address #${addressId} not found`);
    }

    await this.prisma.devoteeAddress.delete({
      where: { id: addressId },
    });

    // If deleted address was default, make the most recent remaining address default
    if (address.isDefault) {
      const nextRemaining = await this.prisma.devoteeAddress.findFirst({
        where: { devoteeId: devotee.id },
        orderBy: { createdAt: 'desc' },
      });
      if (nextRemaining) {
        await this.prisma.devoteeAddress.update({
          where: { id: nextRemaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true, message: 'Address removed successfully' };
  }

  async setDefaultAddress(idOrEmail: string, addressId: string) {
    const devotee = await this.resolveDevotee(idOrEmail);

    const address = await this.prisma.devoteeAddress.findFirst({
      where: { id: addressId, devoteeId: devotee.id },
    });

    if (!address) {
      throw new NotFoundException(`Address #${addressId} not found`);
    }

    await this.prisma.devoteeAddress.updateMany({
      where: { devoteeId: devotee.id },
      data: { isDefault: false },
    });

    return this.prisma.devoteeAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
