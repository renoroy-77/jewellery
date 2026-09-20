import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidateReferralDto } from './dto/validate-referral.dto';
import { UpdateReferralSettingsDto } from './dto/update-referral-settings.dto';

@Injectable()
export class ReferralsService implements OnModuleInit {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultSettings();
    await this.ensureDevoteeReferralCodes();
  }

  /**
   * Ensure default singleton settings exist in database:
   * ₹50 discount for friend, ₹100 wallet credit for referrer upon successful delivery.
   */
  async ensureDefaultSettings() {
    const existing = await this.prisma.referralSettings.findUnique({
      where: { id: 'default' },
    });

    if (!existing) {
      await this.prisma.referralSettings.create({
        data: {
          id: 'default',
          enabled: true,
          refereeDiscountRupees: 50.0,
          referrerRewardRupees: 100.0,
          minOrderSubtotal: 500.0,
        },
      });
      this.logger.log('Initialized default ReferralSettings in database (₹50 discount / ₹100 wallet reward)');
    }
  }

  /**
   * Backfill unique referral codes for any devotee without one
   */
  async ensureDevoteeReferralCodes() {
    try {
      const usersWithoutCode = await this.prisma.devoteeUser.findMany({
        where: { referralCode: null },
      });

      for (const u of usersWithoutCode) {
        const code = await this.generateUniqueReferralCode(u.name);
        await this.prisma.devoteeUser.update({
          where: { id: u.id },
          data: { referralCode: code },
        });
      }
      if (usersWithoutCode.length > 0) {
        this.logger.log(`Backfilled referral codes for ${usersWithoutCode.length} devotees`);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to backfill referral codes: ${err.message}`);
    }
  }

  /**
   * Generate a clean, memorable uppercase referral code
   * Example: DIVINE123, RAMAN108, LAKSHMI542
   */
  async generateUniqueReferralCode(name: string): Promise<string> {
    const cleanPrefix = name
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 6) || 'DIVINE';

    let attempts = 0;
    while (attempts < 15) {
      const suffix = Math.floor(100 + Math.random() * 900).toString();
      const candidate = `${cleanPrefix}${suffix}`;
      const existing = await this.prisma.devoteeUser.findUnique({
        where: { referralCode: candidate },
      });
      if (!existing) {
        return candidate;
      }
      attempts++;
    }
    return `${cleanPrefix}${Date.now().toString().slice(-4)}`;
  }

  /**
   * Lock a newly registered devotee to their first referrer
   * Condition: The referral should be locked to the first referrer on signup.
   */
  async lockReferral(
    devoteeIdOrEmail: string,
    referralCode?: string,
  ): Promise<{ locked: boolean; message: string; referrerName?: string }> {
    if (!referralCode || !referralCode.trim()) {
      return { locked: false, message: 'No referral code provided' };
    }

    if (!devoteeIdOrEmail) {
      return { locked: false, message: 'Devotee identifier is required' };
    }

    const devotee = await this.prisma.devoteeUser.findFirst({
      where: devoteeIdOrEmail.includes('@')
        ? { email: { equals: devoteeIdOrEmail.trim(), mode: 'insensitive' } }
        : { id: devoteeIdOrEmail },
    });

    if (!devotee) {
      return { locked: false, message: 'Devotee not found' };
    }

    const cleanCode = referralCode.trim().toUpperCase();

    // Find referrer by code
    const referrer = await this.prisma.devoteeUser.findFirst({
      where: { referralCode: { equals: cleanCode, mode: 'insensitive' } },
    });

    if (!referrer) {
      return { locked: false, message: 'Referral code does not exist' };
    }

    // Fraud prevention: Prevent self-referral
    if (referrer.id === devotee.id) {
      return { locked: false, message: 'Devotee cannot refer themselves' };
    }

    if (
      referrer.email &&
      devotee.email &&
      referrer.email.trim().toLowerCase() === devotee.email.trim().toLowerCase()
    ) {
      return { locked: false, message: 'Devotee cannot refer themselves with the same email' };
    }

    if (referrer.phone && devotee.phone) {
      const cleanDevoteePhone = devotee.phone.replace(/\D/g, '').slice(-10);
      const cleanReferrerPhone = referrer.phone.replace(/\D/g, '').slice(-10);
      if (cleanDevoteePhone && cleanDevoteePhone === cleanReferrerPhone) {
        return { locked: false, message: 'Devotee cannot refer themselves with the same phone' };
      }
    }

    // Conditional updateMany: only succeeds if referredBy is still null (race-safe)
    const { count } = await this.prisma.devoteeUser.updateMany({
      where: { id: devotee.id, referredBy: null },
      data: { referredBy: referrer.id },
    });

    if (count === 0) {
      return { locked: false, message: 'Devotee is already locked to a referrer' };
    }

    this.logger.log(
      `Devotee ${devotee.name} (${devotee.id}) locked to referrer ${referrer.name} (${referrer.referralCode})`,
    );

    return {
      locked: true,
      message: `Locked to referrer ${referrer.name}`,
      referrerName: referrer.name,
    };
  }

  /**
   * Public settings for checkout and landing pages
   */
  async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      enabled: settings.enabled,
      refereeDiscountRupees: settings.refereeDiscountRupees,
      referrerRewardRupees: settings.referrerRewardRupees,
      minOrderSubtotal: settings.minOrderSubtotal,
    };
  }

  /**
   * Full settings record for admin
   */
  async getSettings() {
    let settings = await this.prisma.referralSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      settings = await this.prisma.referralSettings.create({
        data: {
          id: 'default',
          enabled: true,
          refereeDiscountRupees: 50.0,
          referrerRewardRupees: 100.0,
          minOrderSubtotal: 500.0,
        },
      });
    }
    return settings;
  }

  /**
   * Admin update referral rules
   */
  async updateSettings(dto: UpdateReferralSettingsDto) {
    await this.ensureDefaultSettings();
    return this.prisma.referralSettings.update({
      where: { id: 'default' },
      data: {
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.refereeDiscountRupees !== undefined && {
          refereeDiscountRupees: dto.refereeDiscountRupees,
        }),
        ...(dto.referrerRewardRupees !== undefined && {
          referrerRewardRupees: dto.referrerRewardRupees,
        }),
        ...(dto.minOrderSubtotal !== undefined && {
          minOrderSubtotal: dto.minOrderSubtotal,
        }),
      },
    });
  }

  /**
   * Validate a referral code at checkout
   * Conditions:
   * - Program enabled
   * - Subtotal meets minimum threshold
   * - Referrer exists
   * - Self-referral blocked (email, phone, devotee ID)
   * - First successful order check (prior cancelled orders do NOT disqualify referee)
   * - One customer can be referred/rewarded only once
   */
  async validateReferralCode(dto: ValidateReferralDto): Promise<{
    valid: boolean;
    discount: number;
    referrerName?: string;
    referrerCode?: string;
    message?: string;
  }> {
    const settings = await this.getSettings();
    if (!settings.enabled) {
      return {
        valid: false,
        discount: 0,
        message: 'The referral rewards program is currently inactive.',
      };
    }

    const trimmedCode = dto.code ? dto.code.trim().toUpperCase() : '';
    if (!trimmedCode) {
      return { valid: false, discount: 0, message: 'Please enter a referral code.' };
    }

    // Check minimum order subtotal requirement
    if (dto.subtotal !== undefined && dto.subtotal < settings.minOrderSubtotal) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${settings.minOrderSubtotal.toLocaleString(
          'en-IN',
        )} required for referral discount.`,
      };
    }

    // Find referrer
    const referrer = await this.prisma.devoteeUser.findFirst({
      where: {
        referralCode: { equals: trimmedCode, mode: 'insensitive' },
      },
    });

    if (!referrer) {
      return {
        valid: false,
        discount: 0,
        message: 'Invalid referral code. Please check and try again.',
      };
    }

    // 1. Prevent Self-Referral (Email, Phone, Devotee ID)
    const normalizedBuyerEmail = dto.buyerEmail?.trim().toLowerCase();
    const normalizedReferrerEmail = referrer.email?.trim().toLowerCase();
    if (normalizedBuyerEmail && normalizedReferrerEmail && normalizedBuyerEmail === normalizedReferrerEmail) {
      return {
        valid: false,
        discount: 0,
        message: 'You cannot use your own referral code.',
      };
    }

    if (dto.buyerPhone && referrer.phone) {
      const cleanBuyerPhone = dto.buyerPhone.replace(/\D/g, '').slice(-10);
      const cleanReferrerPhone = referrer.phone.replace(/\D/g, '').slice(-10);
      if (cleanBuyerPhone && cleanBuyerPhone === cleanReferrerPhone) {
        return {
          valid: false,
          discount: 0,
          message: 'You cannot use your own phone number to self-refer.',
        };
      }
    }

    // 2. Condition: One customer can be referred/rewarded only once
    // A prior CANCELLED order does not disqualify the user.
    if (normalizedBuyerEmail) {
      const activePriorOrder = await this.prisma.order.findFirst({
        where: {
          email: { equals: normalizedBuyerEmail, mode: 'insensitive' },
          status: { not: 'Cancelled' },
        },
      });

      if (activePriorOrder) {
        return {
          valid: false,
          discount: 0,
          message: 'Referral discount is applicable on your first order only.',
        };
      }

      // Check if this referee already rewarded anyone in an active/delivered referral
      const rewardedReferral = await this.prisma.referral.findFirst({
        where: {
          refereeEmail: { equals: normalizedBuyerEmail, mode: 'insensitive' },
          status: { in: ['DELIVERED', 'PENDING'] },
        },
      });

      if (rewardedReferral) {
        return {
          valid: false,
          discount: 0,
          message: 'This account has already utilized a referral blessing.',
        };
      }
    }

    return {
      valid: true,
      discount: settings.refereeDiscountRupees,
      referrerName: referrer.name,
      referrerCode: referrer.referralCode || trimmedCode,
      message: `Referral code applied! You get ₹${settings.refereeDiscountRupees.toLocaleString(
        'en-IN',
      )} off your first order.`,
    };
  }

  /**
   * Apply referral to order inside an active Prisma transaction (tx).
   * Enforces:
   * 1. If buyer has referredBy set, the locked referrer is used and typed code is ignored.
   * 2. If buyer has no referredBy, uses validated typed code and locks buyer to that referrer.
   * 3. Reward amount is locked to current settings snapshot.
   * 4. Returns discount and referrerId to record referral row.
   */
  async applyToOrderInTx(
    tx: any,
    params: {
      orderId: string;
      devoteeId?: string;
      buyerEmail: string;
      buyerPhone?: string;
      referralCode?: string;
      subtotal: number;
    },
  ): Promise<{
    discount: number;
    referrerId?: string;
    referralCodeUsed?: string;
    reason?: string;
  }> {
    const { orderId, devoteeId, buyerEmail, buyerPhone, referralCode, subtotal } = params;

    const settings = await this.getSettings();
    if (!settings.enabled) {
      return { discount: 0, reason: 'Program inactive' };
    }

    if (subtotal < settings.minOrderSubtotal) {
      return { discount: 0, reason: `Subtotal below ₹${settings.minOrderSubtotal}` };
    }

    // 1. Resolve Buyer
    let buyer: any = null;
    if (devoteeId) {
      buyer = await tx.devoteeUser.findUnique({ where: { id: devoteeId } });
    } else if (buyerEmail) {
      buyer = await tx.devoteeUser.findUnique({
        where: { email: buyerEmail.trim().toLowerCase() },
      });
    }

    let targetReferrer: any = null;

    // 2. CRITICAL RULE: If buyer is already locked to a referrer, USE THAT REFERRER!
    // Typed code is completely ignored when locked.
    if (buyer?.referredBy) {
      targetReferrer = await tx.devoteeUser.findUnique({
        where: { id: buyer.referredBy },
      });
      if (targetReferrer) {
        this.logger.log(
          `Order #${orderId}: Buyer ${buyer.email} locked to referrer ${targetReferrer.name} (${targetReferrer.referralCode}). Typed code ignored.`,
        );
      }
    }

    // 3. If NOT locked and referral code provided:
    if (!targetReferrer && referralCode && referralCode.trim()) {
      const cleanCode = referralCode.trim().toUpperCase();
      targetReferrer = await tx.devoteeUser.findFirst({
        where: { referralCode: { equals: cleanCode, mode: 'insensitive' } },
      });
    }

    if (!targetReferrer) {
      return { discount: 0 };
    }

    // 4. Fraud checks: Prevent self-referral
    const normalizedBuyerEmail = (buyer?.email || buyerEmail)?.trim().toLowerCase();
    const normalizedReferrerEmail = targetReferrer.email?.trim().toLowerCase();
    if (
      normalizedBuyerEmail &&
      normalizedReferrerEmail &&
      normalizedBuyerEmail === normalizedReferrerEmail
    ) {
      this.logger.warn(`Order #${orderId}: Blocked self-referral via matching email`);
      return { discount: 0, reason: 'Self-referral blocked' };
    }

    const checkPhone = buyer?.phone || buyerPhone;
    if (checkPhone && targetReferrer.phone) {
      const cleanBuyerPhone = checkPhone.replace(/\D/g, '').slice(-10);
      const cleanReferrerPhone = targetReferrer.phone.replace(/\D/g, '').slice(-10);
      if (cleanBuyerPhone && cleanBuyerPhone === cleanReferrerPhone) {
        this.logger.warn(`Order #${orderId}: Blocked self-referral via matching phone`);
        return { discount: 0, reason: 'Self-referral blocked' };
      }
    }

    // 5. First-order only check (prior cancelled orders do NOT disqualify referee)
    if (normalizedBuyerEmail) {
      // Advisory transaction lock on referee email serializes concurrent first-orders
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${normalizedBuyerEmail}))`;

      const priorOrder = await tx.order.findFirst({
        where: {
          email: { equals: normalizedBuyerEmail, mode: 'insensitive' },
          status: { not: 'Cancelled' },
        },
      });

      if (priorOrder) {
        return { discount: 0, reason: 'First order only' };
      }

      const rewardedReferral = await tx.referral.findFirst({
        where: {
          refereeEmail: { equals: normalizedBuyerEmail, mode: 'insensitive' },
          status: { in: ['DELIVERED', 'PENDING'] },
        },
      });

      if (rewardedReferral) {
        return { discount: 0, reason: 'Referral already utilized' };
      }
    }

    // If buyer exists but had no referredBy set, lock them to this referrer now!
    if (buyer && !buyer.referredBy) {
      await tx.devoteeUser.update({
        where: { id: buyer.id },
        data: { referredBy: targetReferrer.id },
      });
    }

    // Cap discount at subtotal
    const discount = Math.min(settings.refereeDiscountRupees, subtotal);

    return {
      discount,
      referrerId: targetReferrer.id,
      referralCodeUsed: targetReferrer.referralCode,
    };
  }

  /**
   * Record PENDING referral row inside an active Prisma transaction.
   * Create-only — does NOT upsert to avoid reviving cancelled referrals.
   * Silently ignores P2002 (duplicate orderId) so re-runs are idempotent.
   */
  async recordOrderReferralInTx(
    tx: any,
    params: {
      orderId: string;
      referrerId: string;
      refereeEmail: string;
      refereePhone?: string;
    },
  ) {
    const normalizedEmail = params.refereeEmail.trim().toLowerCase();
    const existingRef = await tx.referral.findFirst({
      where: {
        refereeEmail: normalizedEmail,
        status: { in: ['PENDING', 'DELIVERED'] },
      },
    });
    if (existingRef) {
      this.logger.warn(
        `Referee ${normalizedEmail} already has active referral #${existingRef.id}; skipping duplicate referral creation.`,
      );
      return null;
    }

    const settings = await this.getSettings();
    try {
      return await tx.referral.create({
        data: {
          orderId: params.orderId,
          referrerId: params.referrerId,
          refereeEmail: normalizedEmail,
          refereePhone: params.refereePhone || null,
          rewardAmount: settings.referrerRewardRupees,
          status: 'PENDING',
          rewardType: 'WALLET_CREDIT',
          walletCredited: false,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Referral row already exists for this order — idempotent, do not revive status
        this.logger.warn(`Referral for Order #${params.orderId} already exists; skipping create (idempotent).`);
        return null;
      }
      throw err;
    }
  }

  /**
   * Redeem wallet balance inside active Prisma transaction.
   * Throws BadRequestException if balance insufficient, causing whole order creation to roll back.
   */
  async redeemInTx(
    tx: any,
    devoteeId: string,
    amount: number,
    orderId: string,
  ): Promise<{ newBalance: number }> {
    if (amount <= 0) return { newBalance: 0 };

    // Atomic conditional debit: only succeeds if walletBalance >= amount.
    // Prevents concurrent checkout race conditions where two orders try to spend the same balance.
    const { count } = await tx.devoteeUser.updateMany({
      where: { id: devoteeId, walletBalance: { gte: amount } },
      data: { walletBalance: { decrement: amount } },
    });

    if (count === 0) {
      const devotee = await tx.devoteeUser.findUnique({ where: { id: devoteeId } });
      if (!devotee) {
        throw new NotFoundException('Authenticated devotee account not found for wallet redemption');
      }
      throw new BadRequestException(
        `Insufficient Sanctum wallet balance. Available: ₹${devotee.walletBalance}, requested: ₹${amount}`,
      );
    }

    const fresh = await tx.devoteeUser.findUnique({ where: { id: devoteeId } });

    await tx.walletTransaction.create({
      data: {
        devoteeId,
        amount: -amount,
        type: 'ORDER_REDEMPTION',
        referenceId: orderId,
        description: `Redemption on Order #${orderId}`,
        balanceAfter: fresh!.walletBalance,
      },
    });

    this.logger.log(
      `Devotee (${devoteeId}) redeemed ₹${amount} for Order #${orderId}. Remaining: ₹${fresh!.walletBalance}`,
    );

    return { newBalance: fresh!.walletBalance };
  }

  /**
   * Process and record referral when an order is created (standalone helper).
   */
  async processOrderReferral(params: {
    orderId: string;
    referralCode?: string;
    buyerEmail: string;
    buyerPhone?: string;
    subtotal: number;
    isPaymentConfirmed?: boolean;
  }): Promise<{ discount: number; referralCodeUsed?: string }> {
    return this.prisma.$transaction(async (tx) => {
      const result = await this.applyToOrderInTx(tx, {
        orderId: params.orderId,
        buyerEmail: params.buyerEmail,
        buyerPhone: params.buyerPhone,
        referralCode: params.referralCode,
        subtotal: params.subtotal,
      });

      if (result.discount > 0 && result.referrerId) {
        await this.recordOrderReferralInTx(tx, {
          orderId: params.orderId,
          referrerId: result.referrerId,
          refereeEmail: params.buyerEmail,
          refereePhone: params.buyerPhone,
        });
      }

      return {
        discount: result.discount,
        referralCodeUsed: result.referralCodeUsed,
      };
    });
  }

  /**
   * REWARD ON DELIVERY (Ledger-Backed with DB-Level Idempotency)
   * - "Referral reward is given only after the first successful order"
   * - "Order must be successfully delivered. Cancelled/refunded orders don't qualify."
   * - "Give the referrer wallet credit / store credit. Wallet can be used for their next purchase."
   * - Writes an immutable WalletTransaction row with unique constraint [type, referenceId].
   */
  async rewardOnDelivery(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const referral = await tx.referral.findUnique({
        where: { orderId },
      });

      if (!referral) {
        return null;
      }

      if (referral.status === 'CANCELLED') {
        this.logger.warn(`Order #${orderId}: Referral was cancelled; cannot reward on delivery`);
        return referral;
      }

      // 1. Ledger idempotency: if REFERRAL_REWARD already exists, just mark delivered and return
      const existingTx = await tx.walletTransaction.findUnique({
        where: { type_referenceId: { type: 'REFERRAL_REWARD', referenceId: orderId } },
      });

      if (existingTx) {
        this.logger.log(`Order #${orderId}: WalletTransaction REFERRAL_REWARD already exists. Skipping duplicate.`);
        await tx.referral.updateMany({
          where: { orderId, status: { not: 'CANCELLED' } },
          data: { status: 'DELIVERED', walletCredited: true },
        });
        return referral;
      }

      // 2. One referee rewarded only once (across all referrals for same email)
      const alreadyRewardedCount = await tx.referral.count({
        where: {
          refereeEmail: referral.refereeEmail,
          status: 'DELIVERED',
          walletCredited: true,
          orderId: { not: orderId },
        },
      });

      if (alreadyRewardedCount > 0) {
        this.logger.warn(
          `Order #${orderId}: Referee ${referral.refereeEmail} already rewarded on a prior order. Cancelling this referral.`,
        );
        await tx.referral.updateMany({ where: { orderId }, data: { status: 'CANCELLED' } });
        return null;
      }

      // 3. Compare-and-Set: atomically claim PENDING → DELIVERED
      // This prevents a concurrent call from also crediting the wallet.
      const { count: claimedCount } = await tx.referral.updateMany({
        where: { orderId, status: 'PENDING', walletCredited: false },
        data: { status: 'DELIVERED', walletCredited: true },
      });

      if (claimedCount === 0) {
        // Already delivered or cancelled by a concurrent request
        this.logger.log(`Order #${orderId}: Referral already processed by concurrent request (CAS miss). Skipping.`);
        return null;
      }

      // 4. Atomic wallet credit using increment (no read-then-write race)
      const updatedReferrer = await tx.devoteeUser.update({
        where: { id: referral.referrerId },
        data: { walletBalance: { increment: referral.rewardAmount } },
      });

      if (!updatedReferrer) {
        this.logger.error(`Order #${orderId}: Referrer devotee ${referral.referrerId} not found — rolling back`);
        throw new Error(`Referrer ${referral.referrerId} not found`);
      }

      // 5. Audit ledger entry (unique constraint @@unique([type, referenceId]) is DB-level guard)
      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          devoteeId: referral.referrerId,
          amount: referral.rewardAmount,
          type: 'REFERRAL_REWARD',
          referenceId: orderId,
          description: `Referral reward for Order #${orderId}`,
          balanceAfter: updatedReferrer.walletBalance,
        },
      });

      this.logger.log(
        `🎉 Order #${orderId} Delivered! Referrer (${referral.referrerId}) credited ₹${referral.rewardAmount}. New Balance: ₹${updatedReferrer.walletBalance}. Ledger: ${ledgerEntry.id}`,
      );

      return {
        referral,
        referrer: updatedReferrer,
        transaction: ledgerEntry,
      };
    });
  }

  /**
   * Reverse referral if order is cancelled or refunded
   * - Pre-delivery cancellation: Cancels referral, no wallet deduction needed.
   * - Post-delivery cancellation / return: Claws back reward, floors wallet at 0, logs CLAWBACK ledger transaction.
   */
  async reverseOrderReferral(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const referral = await tx.referral.findUnique({
        where: { orderId },
      });

      if (!referral || referral.status === 'CANCELLED') {
        return referral;
      }

      // Post-delivery cancellation / return: claw back the reward
      if (referral.walletCredited) {
        // Idempotency: skip if clawback already recorded
        const existingClawback = await tx.walletTransaction.findUnique({
          where: { type_referenceId: { type: 'CLAWBACK', referenceId: orderId } },
        });

        if (!existingClawback) {
          // Atomic decrement — allow balance to go negative temporarily rather than
          // silently forgiving the difference (avoids free credit on Math.max(0, …))
          const updatedReferrer = await tx.devoteeUser.update({
            where: { id: referral.referrerId },
            data: { walletBalance: { decrement: referral.rewardAmount } },
          });

          await tx.walletTransaction.create({
            data: {
              devoteeId: referral.referrerId,
              amount: -referral.rewardAmount,
              type: 'CLAWBACK',
              referenceId: orderId,
              description: `Reward clawback for returned/cancelled Order #${orderId}`,
              balanceAfter: updatedReferrer.walletBalance,
            },
          });

          this.logger.log(
            `Order #${orderId}: Clawed back ₹${referral.rewardAmount} from referrer (${referral.referrerId}). New Balance: ₹${updatedReferrer.walletBalance}`,
          );
        }
      }

      const updated = await tx.referral.update({
        where: { orderId },
        data: { status: 'CANCELLED', walletCredited: false },
      });

      this.logger.log(`Order #${orderId}: Referral marked CANCELLED.`);
      return updated;
    });
  }

  /**
   * Deduct wallet balance when devotee uses wallet credit at checkout
   * Recorded into WalletTransaction ledger with type: ORDER_REDEMPTION
   */
  async redeemWalletBalance(
    devoteeId: string,
    amount: number,
    orderId?: string,
  ): Promise<{ success: boolean; newBalance: number }> {
    if (amount <= 0) return { success: true, newBalance: 0 };

    return this.prisma.$transaction(async (tx) => {
      // Atomic conditional debit: only succeeds if walletBalance >= amount.
      // This prevents the read-then-write race where two concurrent debits
      // both see the same starting balance and both succeed.
      const { count } = await tx.devoteeUser.updateMany({
        where: { id: devoteeId, walletBalance: { gte: amount } },
        data: { walletBalance: { decrement: amount } },
      });

      if (count === 0) {
        // Either devotee not found, or insufficient balance
        const devotee = await tx.devoteeUser.findUnique({ where: { id: devoteeId } });
        if (!devotee) {
          throw new NotFoundException('Devotee account not found for wallet redemption');
        }
        throw new BadRequestException(
          `Insufficient Sanctum wallet balance. Available: ₹${devotee.walletBalance}, requested: ₹${amount}`,
        );
      }

      // Fetch fresh balance for the audit ledger
      const fresh = await tx.devoteeUser.findUnique({ where: { id: devoteeId } });

      await tx.walletTransaction.create({
        data: {
          devoteeId,
          amount: -amount,
          type: 'ORDER_REDEMPTION',
          referenceId: orderId || null,
          description: orderId ? `Redemption on Order #${orderId}` : `Wallet credit redemption`,
          balanceAfter: fresh!.walletBalance,
        },
      });

      this.logger.log(
        `Devotee (${devoteeId}) redeemed ₹${amount} wallet credit. Remaining: ₹${fresh!.walletBalance} (Order: ${orderId || 'N/A'})`,
      );

      return { success: true, newBalance: fresh!.walletBalance };
    });
  }

  /**
   * Refund wallet balance if an order with wallet discount is cancelled
   * Exactly-once refund with idempotency via ORDER_CANCEL_REFUND ledger entry
   */
  async refundWalletBalance(
    devoteeId: string,
    amount: number,
    orderId: string,
  ): Promise<{ refunded: boolean; newBalance: number }> {
    if (amount <= 0) return { refunded: false, newBalance: 0 };

    return this.prisma.$transaction(async (tx) => {
      // Idempotency: skip if this exact refund was already issued
      const existingRefund = await tx.walletTransaction.findUnique({
        where: { type_referenceId: { type: 'ORDER_CANCEL_REFUND', referenceId: orderId } },
      });

      if (existingRefund) {
        this.logger.log(`Order #${orderId}: Wallet refund already processed. Skipping duplicate.`);
        return { refunded: false, newBalance: existingRefund.balanceAfter };
      }

      // Atomic increment — no read-then-write race
      const updated = await tx.devoteeUser.update({
        where: { id: devoteeId },
        data: { walletBalance: { increment: amount } },
      });

      if (!updated) {
        this.logger.warn(`Devotee (${devoteeId}) not found for wallet refund (Order #${orderId})`);
        return { refunded: false, newBalance: 0 };
      }

      await tx.walletTransaction.create({
        data: {
          devoteeId,
          amount,
          type: 'ORDER_CANCEL_REFUND',
          referenceId: orderId,
          description: `Refund of redeemed wallet discount for cancelled/returned Order #${orderId}`,
          balanceAfter: updated.walletBalance,
        },
      });

      this.logger.log(
        `Order #${orderId}: Restored ₹${amount} wallet balance to devotee (${devoteeId}). New Balance: ₹${updated.walletBalance}`,
      );

      return { refunded: true, newBalance: updated.walletBalance };
    });
  }

  /**
   * Get user's referral code, shareable link, wallet credit balance, referral history, and audit ledger
   */
  /**
   * Authenticated devotee's referral dashboard.
   * Parameter is a devoteeId from the session — never a client-supplied email.
   * Does NOT create accounts; throws NotFoundException if devotee is not found.
   */
  async getUserReferrals(devoteeId: string) {
    if (!devoteeId) throw new BadRequestException('Devotee ID is required');

    let devotee = await this.prisma.devoteeUser.findUnique({
      where: { id: devoteeId },
    });

    if (!devotee) {
      throw new NotFoundException('Devotee account not found');
    }

    // Backfill referral code if missing (should not happen on new accounts)
    if (!devotee.referralCode) {
      const code = await this.generateUniqueReferralCode(devotee.name);
      devotee = await this.prisma.devoteeUser.update({
        where: { id: devotee.id },
        data: { referralCode: code },
      });
    }

    // Get all referrals made by this devotee
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: devotee.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get wallet transactions ledger
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { devoteeId: devotee.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const friendsReferred = referrals.length;
    const deliveredCount = referrals.filter((r) => r.status === 'DELIVERED').length;
    const pendingCount = referrals.filter((r) => r.status === 'PENDING').length;
    const totalEarnedWallet = referrals
      .filter((r) => r.status === 'DELIVERED')
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    const settings = await this.getSettings();

    return {
      userId: devotee.id,
      name: devotee.name,
      email: devotee.email,
      referralCode: devotee.referralCode,
      shareUrl: `https://aamadappetti.com/?ref=${devotee.referralCode}`,
      walletBalance: devotee.walletBalance || 0.0,
      friendsReferred,
      deliveredCount,
      pendingCount,
      rewardsEarned: totalEarnedWallet,
      totalEarnedWallet,
      refereeDiscount: settings.refereeDiscountRupees,
      referrerReward: settings.referrerRewardRupees,
      referrals: referrals.map((r) => ({
        id: r.id,
        refereeEmail: r.refereeEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Privacy mask
        orderId: r.orderId,
        status: r.status, // 'PENDING' or 'DELIVERED'
        rewardAmount: r.rewardAmount,
        walletCredited: r.walletCredited,
        createdAt: r.createdAt,
      })),
      ledger: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        referenceId: t.referenceId,
        description: t.description,
        balanceAfter: t.balanceAfter,
        createdAt: t.createdAt,
      })),
    };
  }

  /**
   * Admin: List all referrals with filters and search
   */
  async getAllReferrals(params?: { search?: string; status?: string }) {
    const { search, status } = params || {};
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { refereeEmail: { contains: search, mode: 'insensitive' } },
        { orderId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const referrals = await this.prisma.referral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const referrerIds = Array.from(new Set(referrals.map((r) => r.referrerId)));
    const referrers = await this.prisma.devoteeUser.findMany({
      where: { id: { in: referrerIds } },
      select: { id: true, name: true, email: true, phone: true, referralCode: true, walletBalance: true },
    });

    const referrerMap = new Map(referrers.map((r) => [r.id, r]));

    return referrals.map((r) => {
      const referrer = referrerMap.get(r.referrerId);
      return {
        ...r,
        referrerName: referrer?.name || 'Unknown Devotee',
        referrerEmail: referrer?.email || 'N/A',
        referrerCode: referrer?.referralCode || 'N/A',
        referrerWalletBalance: referrer?.walletBalance || 0,
      };
    });
  }
}
