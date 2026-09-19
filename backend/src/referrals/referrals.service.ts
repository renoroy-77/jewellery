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
import * as crypto from 'crypto';

@Injectable()
export class ReferralsService implements OnModuleInit {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultSettings();
    await this.ensureDevoteeReferralCodes();
  }

  /**
   * Ensure default singleton settings exist in database
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
          refereeDiscountRupees: 100,
          referrerRewardRupees: 200,
          minOrderSubtotal: 500,
        },
      });
      this.logger.log('Initialized default ReferralSettings in database');
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
   * Generate a unique, case-insensitive referral code with collision retry
   * Example: RAJESH-K7Q2 or DEVOTEE-9X2M
   */
  async generateUniqueReferralCode(name: string): Promise<string> {
    const cleanPrefix = name
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 6) || 'BHAKTI';

    let attempts = 0;
    while (attempts < 10) {
      const suffix = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars
      const candidate = `${cleanPrefix}-${suffix}`;
      const existing = await this.prisma.devoteeUser.findUnique({
        where: { referralCode: candidate },
      });
      if (!existing) {
        return candidate;
      }
      attempts++;
    }
    // Fallback with timestamp
    return `${cleanPrefix}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Public settings for checkout page (only exposes necessary configuration)
   */
  async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      enabled: settings.enabled,
      refereeDiscountRupees: settings.refereeDiscountRupees,
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
          refereeDiscountRupees: 100,
          referrerRewardRupees: 200,
          minOrderSubtotal: 500,
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
        ...(dto.refereeDiscountRupees !== undefined && { refereeDiscountRupees: dto.refereeDiscountRupees }),
        ...(dto.referrerRewardRupees !== undefined && { referrerRewardRupees: dto.referrerRewardRupees }),
        ...(dto.minOrderSubtotal !== undefined && { minOrderSubtotal: dto.minOrderSubtotal }),
      },
    });
  }

  /**
   * Validate a referral code or referrer reward coupon at checkout
   */
  async validateReferralCode(dto: ValidateReferralDto): Promise<{
    valid: boolean;
    discount: number;
    referrerName?: string;
    referrerCode?: string;
    isRewardCoupon?: boolean;
    message?: string;
  }> {
    const settings = await this.getSettings();
    if (!settings.enabled) {
      return {
        valid: false,
        discount: 0,
        message: 'The referral rewards program is currently disabled.',
      };
    }

    const trimmedCode = dto.code.trim().toUpperCase();
    if (!trimmedCode) {
      return { valid: false, discount: 0, message: 'Please enter a referral code.' };
    }

    // Check minimum order subtotal requirement
    if (dto.subtotal !== undefined && dto.subtotal < settings.minOrderSubtotal) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${settings.minOrderSubtotal.toLocaleString('en-IN')} required to apply referral blessings.`,
      };
    }

    // 1. Check if this is a Referrer's single-use Reward Coupon (e.g. REF-RWD-XXXX)
    if (trimmedCode.startsWith('REF-RWD-')) {
      const rewardRef = await this.prisma.referral.findFirst({
        where: { rewardCoupon: trimmedCode },
      });

      if (!rewardRef) {
        return { valid: false, discount: 0, message: 'Invalid reward coupon code.' };
      }
      if (rewardRef.rewardCouponUsed) {
        return { valid: false, discount: 0, message: 'This reward coupon has already been redeemed.' };
      }
      if (rewardRef.status !== 'REWARDED') {
        return { valid: false, discount: 0, message: 'This reward coupon is not active.' };
      }

      return {
        valid: true,
        discount: rewardRef.rewardAmount,
        referrerName: 'Referral Reward Coupon',
        referrerCode: trimmedCode,
        isRewardCoupon: true,
        message: `Reward Coupon applied! ₹${rewardRef.rewardAmount.toLocaleString('en-IN')} discount redeemed.`,
      };
    }

    // 2. Standard Friend Referral Code check
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

    // Prevent self-referral (same email or phone)
    if (dto.buyerEmail && referrer.email) {
      if (referrer.email.trim().toLowerCase() === dto.buyerEmail.trim().toLowerCase()) {
        return {
          valid: false,
          discount: 0,
          message: 'You cannot apply your own referral code.',
        };
      }
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

    // First order only check: Buyer must have NO prior confirmed/pending orders
    if (dto.buyerEmail) {
      const existingOrder = await this.prisma.order.findFirst({
        where: {
          email: { equals: dto.buyerEmail.trim(), mode: 'insensitive' },
          status: { not: 'Cancelled' },
        },
      });

      if (existingOrder) {
        return {
          valid: false,
          discount: 0,
          message: 'Referral welcome discount is applicable on your first order only.',
        };
      }
    }

    return {
      valid: true,
      discount: settings.refereeDiscountRupees,
      referrerName: referrer.name,
      referrerCode: referrer.referralCode || trimmedCode,
      isRewardCoupon: false,
      message: `Referral code applied! ₹${settings.refereeDiscountRupees.toLocaleString('en-IN')} welcome discount applied.`,
    };
  }

  /**
   * Get user's referral code, share link, and list of referrals
   */
  async getUserReferrals(email: string) {
    if (!email) throw new BadRequestException('Email is required');

    let devotee = await this.prisma.devoteeUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // If devotee does not exist in DB yet, auto-provision
    if (!devotee) {
      const name = email.split('@')[0] || 'Devotee';
      const code = await this.generateUniqueReferralCode(name);
      devotee = await this.prisma.devoteeUser.create({
        data: {
          id: `USR-${Math.floor(100 + Math.random() * 900)}`,
          name,
          email: email.trim().toLowerCase(),
          phone: '',
          shippingAddress: '',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          referralCode: code,
        },
      });
    } else if (!devotee.referralCode) {
      const code = await this.generateUniqueReferralCode(devotee.name);
      devotee = await this.prisma.devoteeUser.update({
        where: { id: devotee.id },
        data: { referralCode: code },
      });
    }

    // Get all referrals made by this user
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: devotee.id },
      orderBy: { createdAt: 'desc' },
    });

    const friendsReferred = referrals.length;
    const rewardsEarned = referrals
      .filter((r) => r.status === 'REWARDED')
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    const activeRewardCoupons = referrals
      .filter((r) => r.status === 'REWARDED' && !r.rewardCouponUsed && r.rewardCoupon)
      .map((r) => ({
        coupon: r.rewardCoupon,
        amount: r.rewardAmount,
        orderId: r.orderId,
      }));

    const settings = await this.getSettings();

    return {
      userId: devotee.id,
      name: devotee.name,
      email: devotee.email,
      referralCode: devotee.referralCode,
      friendsReferred,
      rewardsEarned,
      activeRewardCoupons,
      refereeDiscount: settings.refereeDiscountRupees,
      referrerReward: settings.referrerRewardRupees,
      referrals: referrals.map((r) => ({
        id: r.id,
        refereeEmail: r.refereeEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for privacy
        orderId: r.orderId,
        status: r.status,
        rewardAmount: r.rewardAmount,
        rewardCoupon: r.rewardCoupon,
        rewardCouponUsed: r.rewardCouponUsed,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Process and record referral on new order placement
   * Re-evaluates discount and creates PENDING referral
   */
  async processOrderReferral(params: {
    orderId: string;
    referralCode?: string;
    buyerEmail: string;
    buyerPhone?: string;
    subtotal: number;
    isPaymentConfirmed?: boolean;
  }): Promise<{ discount: number; referralCodeUsed?: string }> {
    const { orderId, referralCode, buyerEmail, buyerPhone, subtotal, isPaymentConfirmed } = params;

    if (!referralCode || !referralCode.trim()) {
      return { discount: 0 };
    }

    const validation = await this.validateReferralCode({
      code: referralCode,
      buyerEmail,
      buyerPhone,
      subtotal,
    });

    if (!validation.valid || validation.discount <= 0) {
      this.logger.warn(`Order #${orderId}: Referral code "${referralCode}" rejected: ${validation.message}`);
      return { discount: 0 };
    }

    // If it's a referrer's single-use reward coupon:
    if (validation.isRewardCoupon && validation.referrerCode) {
      await this.prisma.referral.updateMany({
        where: { rewardCoupon: validation.referrerCode },
        data: { rewardCouponUsed: true },
      });
      return {
        discount: validation.discount,
        referralCodeUsed: validation.referrerCode,
      };
    }

    // Normal friend referral code
    const referrer = await this.prisma.devoteeUser.findFirst({
      where: {
        referralCode: { equals: referralCode.trim(), mode: 'insensitive' },
      },
    });

    if (!referrer) {
      return { discount: 0 };
    }

    const settings = await this.getSettings();

    // Generate single-use reward coupon for referrer upon confirmation
    const rewardCouponCode = `REF-RWD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Create unique referral audit record
    try {
      await this.prisma.referral.upsert({
        where: { orderId },
        update: {
          referrerId: referrer.id,
          refereeEmail: buyerEmail.trim().toLowerCase(),
          refereePhone: buyerPhone || null,
          rewardAmount: settings.referrerRewardRupees,
          status: isPaymentConfirmed ? 'REWARDED' : 'PENDING',
          rewardCoupon: rewardCouponCode,
        },
        create: {
          orderId,
          referrerId: referrer.id,
          refereeEmail: buyerEmail.trim().toLowerCase(),
          refereePhone: buyerPhone || null,
          rewardAmount: settings.referrerRewardRupees,
          status: isPaymentConfirmed ? 'REWARDED' : 'PENDING',
          rewardCoupon: rewardCouponCode,
          rewardCouponUsed: false,
        },
      });

      this.logger.log(
        `Recorded referral for order #${orderId}: Referrer ${referrer.name} (${referrer.referralCode}), Reward ₹${settings.referrerRewardRupees}, Status: ${isPaymentConfirmed ? 'REWARDED' : 'PENDING'}`,
      );
    } catch (err: any) {
      this.logger.error(`Error saving referral for order #${orderId}: ${err.message}`);
    }

    return {
      discount: validation.discount,
      referralCodeUsed: referrer.referralCode || referralCode.trim().toUpperCase(),
    };
  }

  /**
   * Confirm referral reward when payment is captured
   */
  async confirmOrderReferral(orderId: string) {
    const existing = await this.prisma.referral.findUnique({
      where: { orderId },
    });

    if (existing && existing.status === 'PENDING') {
      const updated = await this.prisma.referral.update({
        where: { orderId },
        data: {
          status: 'REWARDED',
        },
      });
      this.logger.log(`Confirmed referral reward for order #${orderId}: Coupon ${updated.rewardCoupon}`);
      return updated;
    }
    return existing;
  }

  /**
   * Reverse referral if order cancelled or returned
   */
  async reverseOrderReferral(orderId: string) {
    const existing = await this.prisma.referral.findUnique({
      where: { orderId },
    });

    if (existing && existing.status !== 'REVERSED') {
      const updated = await this.prisma.referral.update({
        where: { orderId },
        data: {
          status: 'REVERSED',
          rewardCouponUsed: true, // Invalidate coupon
        },
      });
      this.logger.log(`Reversed referral reward for cancelled order #${orderId}`);
      return updated;
    }
    return existing;
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
        { rewardCoupon: { contains: search, mode: 'insensitive' } },
      ];
    }

    const referrals = await this.prisma.referral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Fetch referrer profiles for display
    const referrerIds = Array.from(new Set(referrals.map((r) => r.referrerId)));
    const referrers = await this.prisma.devoteeUser.findMany({
      where: { id: { in: referrerIds } },
      select: { id: true, name: true, email: true, phone: true, referralCode: true },
    });

    const referrerMap = new Map(referrers.map((r) => [r.id, r]));

    return referrals.map((r) => {
      const referrer = referrerMap.get(r.referrerId);
      return {
        ...r,
        referrerName: referrer?.name || 'Unknown Devotee',
        referrerEmail: referrer?.email || 'N/A',
        referrerCode: referrer?.referralCode || 'N/A',
      };
    });
  }
}
