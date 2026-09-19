import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { TelegramService } from '../telegram/telegram.service';
import { ReferralsService } from '../referrals/referrals.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly referralsService: ReferralsService,
  ) {}

  async findAll(params?: { status?: string; search?: string }) {
    const { status, search } = params || {};
    const where: any = {};

    if (status && status !== 'all') {
      where.status = { equals: status, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { devoteeName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { referralCodeUsed: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  async create(dto: CreateOrderDto) {
    const orderId = dto.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const formattedDate =
      dto.date ||
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    // Compute base subtotal securely from items or provided subtotal
    const computedSubtotal =
      dto.subtotal !== undefined
        ? dto.subtotal
        : Array.isArray(dto.items)
        ? dto.items.reduce(
            (acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1),
            0,
          )
        : dto.totalAmount;

    // Determine shipping fee
    const shippingFee =
      dto.shippingFee !== undefined
        ? dto.shippingFee
        : computedSubtotal >= 999
        ? 0
        : 99;

    // Backend-verified referral discount: Recompute and never trust arbitrary client amounts
    let appliedReferralDiscount = 0;
    let finalReferralCode: string | null = null;
    const isConfirmed =
      dto.status === 'Confirmed' ||
      dto.status === 'Processing' ||
      dto.status === 'Delivered';

    if (dto.referralCodeUsed && dto.referralCodeUsed.trim()) {
      const referralResult = await this.referralsService.processOrderReferral({
        orderId,
        referralCode: dto.referralCodeUsed,
        buyerEmail: dto.email,
        buyerPhone: dto.phone,
        subtotal: computedSubtotal,
        isPaymentConfirmed: isConfirmed,
      });

      if (referralResult.discount > 0) {
        appliedReferralDiscount = referralResult.discount;
        finalReferralCode = referralResult.referralCodeUsed || dto.referralCodeUsed.trim().toUpperCase();
      }
    }

    const calculatedGrandTotal = Math.max(
      0,
      computedSubtotal + shippingFee - appliedReferralDiscount,
    );

    const order = await this.prisma.order.create({
      data: {
        id: orderId,
        devoteeName: dto.devoteeName,
        email: dto.email,
        phone: dto.phone,
        items: dto.items,
        subtotal: computedSubtotal,
        shippingFee: shippingFee,
        referralCodeUsed: finalReferralCode,
        referralDiscount: appliedReferralDiscount,
        totalAmount: calculatedGrandTotal,
        status: dto.status || 'Pending',
        shippingAddress: dto.shippingAddress,
        date: formattedDate,
        trackingNumber: dto.trackingNumber || null,
        paymentMethod: dto.paymentMethod,
      },
    });

    // Send instant Telegram notification to store owner (non-blocking)
    this.telegramService.sendOrderNotification(order).catch((err) => {
      this.logger.warn(`Failed to dispatch Telegram order alert: ${err.message}`);
    });

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    const data: any = { status: dto.status };
    if (dto.trackingNumber !== undefined) {
      data.trackingNumber = dto.trackingNumber;
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data,
    });

    // Manage referral rewards upon status change
    if (dto.status && dto.status !== existing.status) {
      if (
        dto.status === 'Confirmed' ||
        dto.status === 'Processing' ||
        dto.status === 'Delivered'
      ) {
        await this.referralsService.confirmOrderReferral(id).catch((err) => {
          this.logger.warn(`Failed to confirm referral for order #${id}: ${err.message}`);
        });
      } else if (dto.status === 'Cancelled') {
        await this.referralsService.reverseOrderReferral(id).catch((err) => {
          this.logger.warn(`Failed to reverse referral for order #${id}: ${err.message}`);
        });
      }

      // Notify on status transition
      this.telegramService
        .sendOrderStatusUpdate(
          updated,
          existing.status,
          dto.cancellationReason,
        )
        .catch((err) => {
          this.logger.warn(
            `Failed to dispatch Telegram status update alert: ${err.message}`,
          );
        });
    }

    return updated;
  }

  async testTelegram() {
    return this.telegramService.sendTestPing();
  }

  async remove(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
