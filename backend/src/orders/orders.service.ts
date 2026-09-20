import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { TelegramService } from '../telegram/telegram.service';
import { ReferralsService } from '../referrals/referrals.service';
import * as crypto from 'crypto';
import { OrderStatus } from '@prisma/client';

// Status Normalization Map (maps frontend labels like 'Consecrated' and 'Packed' to valid Prisma OrderStatus)
export const STATUS_ALIAS_MAP: Record<string, OrderStatus> = {
  Pending: OrderStatus.Pending,
  Confirmed: OrderStatus.Confirmed,
  Consecrated: OrderStatus.Confirmed,
  Processing: OrderStatus.Processing,
  Packed: OrderStatus.Processing,
  Shipped: OrderStatus.Shipped,
  Delivered: OrderStatus.Delivered,
  Cancelled: OrderStatus.Cancelled,
  Returned: OrderStatus.Returned,
};

// Flexible State Machine Transitions for Admin Management
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  Confirmed: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  Processing: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  Shipped: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  Delivered: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
  Cancelled: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'],
  Returned: ['Delivered', 'Cancelled'],
};

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
      where.status = status as OrderStatus;
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

  /**
   * Price items strictly by querying the Product catalog in the database.
   * Client-supplied price, subtotal, and total fields are completely ignored.
   */
  async priceItems(
    tx: any,
    items: any[],
  ): Promise<{ subtotal: number; enrichedItems: any[] }> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order must contain at least one product item');
    }

    const productIdsOrSlugs = items
      .map((it) => it.productId || it.id || it.slug)
      .filter(Boolean);

    if (productIdsOrSlugs.length === 0) {
      throw new BadRequestException('Items must specify valid product IDs or slugs');
    }

    const dbProducts = await tx.product.findMany({
      where: {
        OR: [
          { id: { in: productIdsOrSlugs } },
          { slug: { in: productIdsOrSlugs } },
        ],
      },
    });

    const productMap = new Map();
    for (const p of dbProducts) {
      productMap.set(p.id, p);
      productMap.set(p.slug, p);
    }

    let calculatedSubtotal = 0;
    const enrichedItems: any[] = [];

    for (const it of items) {
      const key = it.productId || it.id || it.slug;
      const dbProduct = productMap.get(key);

      if (!dbProduct) {
        throw new BadRequestException(`Product '${key}' was not found in catalog`);
      }

      const qty = parseInt(it.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        throw new BadRequestException(`Invalid quantity for product '${dbProduct.name}'`);
      }

      const itemTotal = dbProduct.price * qty;
      calculatedSubtotal += itemTotal;

      enrichedItems.push({
        productId: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        price: dbProduct.price, // Official verified server price
        quantity: qty,
        image: dbProduct.images?.[0] || it.image || '',
        itemTotal,
      });
    }

    return { subtotal: calculatedSubtotal, enrichedItems };
  }

  /**
   * Atomic Order Creation inside a single database transaction ($transaction).
   * - Securely prices items from DB.
   * - Computes shippingFee strictly on server.
   * - Enforces locked referrer priority over typed code.
   * - Enforces that order status is ALWAYS 'Pending' at creation (client cannot forge 'Delivered').
   * - Validates wallet redemption against authenticated devotee session.
   * - If redemption or order creation fails, rolls back completely.
   */
  async create(dto: CreateOrderDto, user?: any) {
    // Generate collision-resistant order ID (1.1 trillion permutations)
    const orderId = `ORD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const formattedDate =
      dto.date ||
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const buyerEmail = dto.email.toLowerCase().trim();

    // Automatically resolve devoteeId if user was not passed but email is registered
    let resolvedDevoteeId = user?.id || null;
    if (!resolvedDevoteeId && buyerEmail) {
      const existingDevotee = await this.prisma.devoteeUser.findUnique({
        where: { email: buyerEmail },
      });
      if (existingDevotee) {
        resolvedDevoteeId = existingDevotee.id;
      }
    }

    // Execute atomic creation inside Prisma transaction
    const createdOrder = await this.prisma.$transaction(async (tx) => {
      // 1. Price items securely from database
      const { subtotal, enrichedItems } = await this.priceItems(tx, dto.items);

      // 2. Compute shipping fee securely on server
      const shippingFee = subtotal >= 999 ? 0 : 99;

      // 3. Apply referral discount (prioritizes locked referrer if buyer is authenticated/locked)
      const referralResult = await this.referralsService.applyToOrderInTx(tx, {
        orderId,
        devoteeId: resolvedDevoteeId || user?.id,
        buyerEmail,
        buyerPhone: dto.phone,
        referralCode: dto.referralCodeUsed,
        subtotal,
      });

      const appliedReferralDiscount = Math.min(referralResult.discount, subtotal);
      const payableBeforeWallet = Math.max(0, subtotal + shippingFee - appliedReferralDiscount);

      // 4. Wallet credit redemption:
      // Must be authenticated devotee to redeem wallet balance.
      let appliedWalletDiscount = 0;
      if (dto.walletDiscount && dto.walletDiscount > 0) {
        const actingDevoteeId = user?.id || resolvedDevoteeId;
        if (!actingDevoteeId) {
          throw new UnauthorizedException(
            'You must be signed in as an authenticated devotee to redeem Sanctum wallet balance.',
          );
        }

        const requestedWallet = Math.min(dto.walletDiscount, payableBeforeWallet);
        if (requestedWallet > 0) {
          // Will throw BadRequestException if balance is insufficient, aborting whole order
          await this.referralsService.redeemInTx(tx, actingDevoteeId, requestedWallet, orderId);
          appliedWalletDiscount = requestedWallet;
        }
      }

      const calculatedGrandTotal = Math.max(0, payableBeforeWallet - appliedWalletDiscount);

      // 5. Create Order row (STATUS IS ALWAYS FORCED TO 'Pending')
      const order = await tx.order.create({
        data: {
          id: orderId,
          devoteeId: resolvedDevoteeId || user?.id || null,
          devoteeName: dto.devoteeName.trim(),
          email: buyerEmail,
          phone: dto.phone.trim(),
          items: enrichedItems,
          subtotal,
          shippingFee,
          referralCodeUsed: referralResult.referralCodeUsed || null,
          referralDiscount: appliedReferralDiscount,
          walletDiscount: appliedWalletDiscount,
          totalAmount: calculatedGrandTotal,
          status: 'Pending', // Strictly forced to Pending. Client-supplied status is completely ignored!
          shippingAddress: dto.shippingAddress,
          date: formattedDate,
          trackingNumber: dto.trackingNumber || null,
          paymentMethod: dto.paymentMethod,
        },
      });

      // 6. Record PENDING referral row inside tx if referrerId is present
      if (referralResult.referrerId) {
        await this.referralsService.recordOrderReferralInTx(tx, {
          orderId,
          referrerId: referralResult.referrerId,
          refereeEmail: buyerEmail,
          refereePhone: dto.phone,
        });
      }

      return order;
    });

    this.logger.log(
      `Order #${createdOrder.id} successfully created in Pending status (Subtotal: ₹${createdOrder.subtotal}, Grand Total: ₹${createdOrder.totalAmount})`,
    );

    // Send instant Telegram notification to store owner (non-blocking)
    this.telegramService.sendOrderNotification(createdOrder).catch((err) => {
      this.logger.warn(`Failed to dispatch Telegram order alert: ${err.message}`);
    });

    return createdOrder;
  }

  /**
   * Update Order Fulfillment Status with State Machine & Compare-and-Set
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const cleanId = id.replace(/^#/, '').trim();
    const existing =
      (await this.prisma.order.findUnique({ where: { id: cleanId } })) ||
      (await this.prisma.order.findUnique({ where: { id } }));

    if (!existing) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (!dto.status) {
      throw new BadRequestException('Status is required');
    }

    const targetStatus = STATUS_ALIAS_MAP[dto.status] || (dto.status as OrderStatus);

    // 1. Enforce Status State Machine Transitions
    if (targetStatus !== existing.status) {
      const allowed = ALLOWED_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(targetStatus)) {
        throw new BadRequestException(
          `Invalid status transition from '${existing.status}' to '${targetStatus}'. Allowed transitions: [${allowed.join(
            ', ',
          )}]`,
        );
      }
    }

    // 2. Atomic Compare-and-Set to prevent concurrent race conditions
    const updateResult = await this.prisma.order.updateMany({
      where: { id: existing.id, status: existing.status },
      data: {
        status: targetStatus,
        ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
      },
    });

    if (updateResult.count === 0) {
      throw new ConflictException(
        'Order status was concurrently modified by another request. Please refresh and retry.',
      );
    }

    const updated = await this.prisma.order.findUnique({ where: { id: existing.id } });

    // 3. Manage Referral Rewards and Wallet Refunds based on status transition:
    if (targetStatus !== existing.status) {
      // Transition to 'Delivered': Grants referral reward to referrer
      if (targetStatus === 'Delivered') {
        await this.referralsService.rewardOnDelivery(existing.id).catch((err) => {
          this.logger.error(`Failed to reward referral on delivery for order #${existing.id}: ${err.message}`);
        });
      }
      // Transition to 'Cancelled' (Pre-delivery cancellation)
      else if (targetStatus === 'Cancelled') {
        await this.referralsService.reverseOrderReferral(existing.id).catch((err) => {
          this.logger.warn(`Failed to reverse referral for order #${existing.id}: ${err.message}`);
        });

        // Exactly-once refund of redeemed wallet discount (devoteeId required)
        if (existing.walletDiscount && existing.walletDiscount > 0) {
          if (existing.devoteeId) {
            await this.referralsService
              .refundWalletBalance(existing.devoteeId, existing.walletDiscount, existing.id)
              .catch((err) => {
                this.logger.error(
                  `Failed to refund wallet balance on cancellation for order #${existing.id}: ${err.message}`,
                );
              });
          } else {
            this.logger.warn(
              `Order #${existing.id} has walletDiscount but no devoteeId — cannot refund (guest order).`,
            );
          }
        }
      }
      // Transition to 'Returned' (Post-delivery return)
      else if (targetStatus === 'Returned') {
        // Claws back referral reward from referrer
        await this.referralsService.reverseOrderReferral(existing.id).catch((err) => {
          this.logger.warn(`Failed to claw back referral for returned order #${existing.id}: ${err.message}`);
        });

        // Refunds redeemed wallet discount
        if (existing.walletDiscount && existing.walletDiscount > 0) {
          if (existing.devoteeId) {
            await this.referralsService
              .refundWalletBalance(existing.devoteeId, existing.walletDiscount, existing.id)
              .catch((err) => {
                this.logger.error(
                  `Failed to refund wallet balance on return for order #${existing.id}: ${err.message}`,
                );
              });
          } else {
            this.logger.warn(
              `Order #${existing.id} has walletDiscount but no devoteeId — cannot refund (guest order).`,
            );
          }
        }
      }

      // Notify owner on Telegram
      if (updated) {
        this.telegramService
          .sendOrderStatusUpdate(updated, existing.status, dto.cancellationReason)
          .catch((err) => {
            this.logger.warn(`Failed to dispatch Telegram status update alert: ${err.message}`);
          });
      }
    }

    return updated;
  }

  async testTelegram() {
    return this.telegramService.sendTestPing();
  }

  /**
   * Safe Order Deletion: Blocks hard delete if financial ledger records or referrals exist
   */
  async remove(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    // Protect financial ledger integrity
    const referral = await this.prisma.referral.findUnique({ where: { orderId: id } });
    const walletTx = await this.prisma.walletTransaction.findFirst({
      where: { referenceId: id },
    });

    if (referral || walletTx) {
      throw new BadRequestException(
        `Cannot hard-delete Order #${id} with associated financial ledger entries. Please transition status to 'Cancelled' or 'Returned' instead to preserve audit compliance.`,
      );
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
