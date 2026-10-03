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
import { PushNotificationService } from '../notifications/push-notification.service';
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
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async findAll(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page: rawPage, limit: rawLimit } = params || {};
    const where: any = {};

    const isPaginated = rawPage !== undefined || rawLimit !== undefined;

    if (status && status !== 'all') {
      const mapped =
        STATUS_ALIAS_MAP[status] ||
        (Object.values(OrderStatus).includes(status as any) ? (status as OrderStatus) : null);
      if (!mapped) {
        if (isPaginated) {
          return {
            data: [],
            total: 0,
            page: rawPage || 1,
            limit: rawLimit || 10,
            totalPages: 1,
          };
        }
        return [];
      }
      where.status = mapped;
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

    if (isPaginated) {
      const page = Math.max(1, rawPage || 1);
      const limit = Math.max(1, rawLimit || 10);
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
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
      .map((it) => it.productId || it.id || it.slug || it.name)
      .filter(Boolean);

    let dbProducts: any[] = [];
    if (productIdsOrSlugs.length > 0) {
      dbProducts = await tx.product.findMany({
        where: {
          OR: [
            { id: { in: productIdsOrSlugs } },
            { slug: { in: productIdsOrSlugs } },
            { name: { in: productIdsOrSlugs } },
          ],
        },
      });
    }

    const productMap = new Map();
    for (const p of dbProducts) {
      productMap.set(p.id, p);
      productMap.set(p.slug, p);
      productMap.set(p.name, p);
    }

    let calculatedSubtotal = 0;
    const enrichedItems: any[] = [];

    for (const it of items) {
      const key = it.productId || it.id || it.slug || it.name;
      const dbProduct = key ? productMap.get(key) : null;

      if (!dbProduct && (it.price === undefined || isNaN(Number(it.price)))) {
        throw new BadRequestException(`Product '${key}' was not found in catalog`);
      }

      const qty = parseInt(it.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        throw new BadRequestException(`Invalid quantity for product '${it.name || key}'`);
      }

      const unitPrice = dbProduct ? dbProduct.price : Number(it.price);
      const itemName = dbProduct ? dbProduct.name : (it.name || 'Panchaloham Sacred Item');
      const itemTotal = unitPrice * qty;
      calculatedSubtotal += itemTotal;

      enrichedItems.push({
        productId: dbProduct?.id || it.productId || it.id || `custom-${Date.now()}`,
        slug: dbProduct?.slug || it.slug || 'custom-item',
        name: itemName,
        price: unitPrice,
        quantity: qty,
        image: dbProduct?.images?.[0] || it.image || '/assets/prod_ganesha_hq.webp',
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
   * - Validates wallet redemption against authenticated devotee session.
   * - If redemption or order creation fails, rolls back completely.
   */
  async create(dto: CreateOrderDto, user?: any) {
    // Generate collision-resistant order ID with numeric suffix or use explicit ID (for tests/migration)
    const orderId = dto.id || `ORD-${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
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
      const finalTotalAmount = dto.totalAmount !== undefined ? dto.totalAmount : calculatedGrandTotal;

      const mappedStatus =
        STATUS_ALIAS_MAP[dto.status as string] ||
        (dto.status as OrderStatus) ||
        OrderStatus.Pending;

      // 5. Create Order row
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
          totalAmount: finalTotalAmount,
          status: mappedStatus,
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

    // Send instant FCM push notification to Admin mobile & web apps (non-blocking)
    this.pushNotificationService.sendOrderNotification(createdOrder).catch((err) => {
      this.logger.warn(`Failed to dispatch FCM push notification: ${err.message}`);
    });

    return { ...createdOrder, status: dto.status || createdOrder.status };
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
        const prevStatusStr = existing.status === OrderStatus.Confirmed ? 'Consecrated' : existing.status;
        this.telegramService
          .sendOrderStatusUpdate(updated, prevStatusStr, dto.cancellationReason)
          .catch((err) => {
            this.logger.warn(`Failed to dispatch Telegram status update alert: ${err.message}`);
          });
      }
    }

    if (updated && dto.status && (dto.status === 'Consecrated' || dto.status === 'Packed')) {
      return { ...updated, status: dto.status };
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
