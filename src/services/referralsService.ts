const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface PublicReferralSettings {
  enabled: boolean;
  refereeDiscountRupees: number;
  minOrderSubtotal: number;
}

export interface AdminReferralSettings extends PublicReferralSettings {
  id: string;
  referrerRewardRupees: number;
  updatedAt?: string;
}

export interface ValidateReferralResult {
  valid: boolean;
  discount: number;
  referrerName?: string;
  referrerCode?: string;
  isRewardCoupon?: boolean;
  message?: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName?: string;
  referrerEmail?: string;
  referrerCode?: string;
  refereeEmail: string;
  refereePhone?: string | null;
  orderId: string;
  status: 'PENDING' | 'REWARDED' | 'REVERSED';
  rewardAmount: number;
  rewardCoupon?: string | null;
  rewardCouponUsed?: boolean;
  createdAt: string;
}

export interface UserReferralSummary {
  userId: string;
  name: string;
  email: string;
  referralCode: string;
  friendsReferred: number;
  rewardsEarned: number;
  activeRewardCoupons: Array<{
    coupon: string;
    amount: number;
    orderId: string;
  }>;
  refereeDiscount: number;
  referrerReward: number;
  referrals: Array<{
    id: string;
    refereeEmail: string;
    orderId: string;
    status: 'PENDING' | 'REWARDED' | 'REVERSED';
    rewardAmount: number;
    rewardCoupon?: string | null;
    rewardCouponUsed?: boolean;
    createdAt: string;
  }>;
}

export const referralsService = {
  /**
   * Fetch public referral settings for checkout
   */
  async getPublicSettings(): Promise<PublicReferralSettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/referrals/settings`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      return {
        enabled: true,
        refereeDiscountRupees: 100,
        minOrderSubtotal: 500,
      };
    }
  },

  /**
   * Fetch full admin referral settings
   */
  async getAdminSettings(): Promise<AdminReferralSettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/referrals/admin/settings`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      return {
        id: 'default',
        enabled: true,
        refereeDiscountRupees: 100,
        referrerRewardRupees: 200,
        minOrderSubtotal: 500,
      };
    }
  },

  /**
   * Update referral rules (Admin)
   */
  async updateAdminSettings(settings: Partial<AdminReferralSettings>): Promise<AdminReferralSettings> {
    const res = await fetch(`${API_BASE_URL}/api/referrals/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      throw new Error(`Failed to update referral settings: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Validate a referral code or reward coupon at checkout
   */
  async validateReferral(payload: {
    code: string;
    buyerEmail?: string;
    buyerPhone?: string;
    subtotal?: number;
  }): Promise<ValidateReferralResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/referrals/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return {
          valid: false,
          discount: 0,
          message: 'Unable to validate code. Please try again.',
        };
      }
      return await res.json();
    } catch {
      // Offline fallback: simulate validation for demo
      const cleanCode = payload.code.trim().toUpperCase();
      if (cleanCode.length >= 4) {
        return {
          valid: true,
          discount: 100,
          referrerCode: cleanCode,
          referrerName: 'Devotee Referral',
          message: 'Referral code applied! ₹100 welcome blessing applied.',
        };
      }
      return {
        valid: false,
        discount: 0,
        message: 'Invalid referral code.',
      };
    }
  },

  /**
   * Get user's referral code, share URL, friends referred, and referral rewards
   */
  async getUserReferrals(email: string): Promise<UserReferralSummary> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/referrals/me?email=${encodeURIComponent(email)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      const pseudoCode = `BHAKTI-${email.slice(0, 3).toUpperCase() || '7K9'}`;
      return {
        userId: 'USR-TEMP',
        name: email.split('@')[0] || 'Devotee',
        email,
        referralCode: pseudoCode,
        friendsReferred: 0,
        rewardsEarned: 0,
        activeRewardCoupons: [],
        refereeDiscount: 100,
        referrerReward: 200,
        referrals: [],
      };
    }
  },

  /**
   * Admin: List all referrals
   */
  async getAdminReferrals(params?: {
    search?: string;
    status?: string;
  }): Promise<ReferralRecord[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/referrals/admin`);
      if (params?.search) url.searchParams.set('search', params.search);
      if (params?.status && params.status !== 'all') {
        url.searchParams.set('status', params.status);
      }

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  },
};
