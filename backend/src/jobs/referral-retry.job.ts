import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralsService } from '../referrals/referrals.service';

/**
 * Scheduled retry job for failed referral rewards and wallet refunds.
 *
 * Why this exists:
 * - rewardOnDelivery and refundWalletBalance are called in a .catch() after the
 *   order status update. If they fail transiently, the order is already
 *   Delivered/Cancelled and nothing re-runs them.
 * - Both functions are fully idempotent (ledger unique constraint + CAS on referral
 *   status), so re-running them is safe.
 *
 * Runs every 5 minutes. Logs a count each run so silent failures become visible.
 */
@Injectable()
export class ReferralRetryJob {
  private readonly logger = new Logger(ReferralRetryJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly referralsService: ReferralsService,
  ) {}

  /**
   * Retry PENDING referrals whose order is already Delivered.
   * Covers: transient failure in rewardOnDelivery at the time of status update.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryPendingRewards() {
    const stuckReferrals = await this.prisma.referral.findMany({
      where: {
        status: 'PENDING',
        walletCredited: false,
      },
      take: 50,
    });

    if (stuckReferrals.length === 0) return;

    const orderIds = stuckReferrals.map((r) => r.orderId);
    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        id: { in: orderIds },
        status: 'Delivered',
      },
      select: { id: true },
    });

    const deliveredSet = new Set(deliveredOrders.map((o) => o.id));
    const eligibleReferrals = stuckReferrals.filter((r) => deliveredSet.has(r.orderId));

    if (eligibleReferrals.length === 0) return;

    this.logger.log(
      `[RetryJob] Found ${eligibleReferrals.length} PENDING referral(s) with Delivered orders. Retrying rewards...`,
    );

    let succeeded = 0;
    let failed = 0;

    for (const ref of eligibleReferrals) {
      try {
        await this.referralsService.rewardOnDelivery(ref.orderId);
        succeeded++;
      } catch (err: any) {
        failed++;
        this.logger.error(
          `[RetryJob] Failed to reward Order #${ref.orderId}: ${err.message}`,
        );
      }
    }

    this.logger.log(
      `[RetryJob] Reward retry complete: ${succeeded} succeeded, ${failed} failed out of ${eligibleReferrals.length}.`,
    );
  }

  /**
   * Retry wallet refunds for Cancelled/Returned orders with walletDiscount > 0
   * but no ORDER_CANCEL_REFUND ledger row (refund call failed transiently).
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryPendingRefunds() {
    const ordersNeedingRefund = await this.prisma.order.findMany({
      where: {
        status: { in: ['Cancelled', 'Returned'] },
        walletDiscount: { gt: 0 },
        devoteeId: { not: null },
      },
      select: { id: true, devoteeId: true, walletDiscount: true },
      take: 50,
    });

    if (ordersNeedingRefund.length === 0) return;

    const orderIds = ordersNeedingRefund.map((o) => o.id);
    const completedRefunds = await this.prisma.walletTransaction.findMany({
      where: { type: 'ORDER_CANCEL_REFUND', referenceId: { in: orderIds } },
      select: { referenceId: true },
    });

    const completedSet = new Set(completedRefunds.map((r) => r.referenceId));
    const pendingRefunds = ordersNeedingRefund.filter((o) => !completedSet.has(o.id));

    if (pendingRefunds.length === 0) return;

    this.logger.log(
      `[RetryJob] Found ${pendingRefunds.length} order(s) missing wallet refund. Retrying...`,
    );

    let succeeded = 0;
    let failed = 0;

    for (const order of pendingRefunds) {
      try {
        await this.referralsService.refundWalletBalance(
          order.devoteeId!,
          order.walletDiscount!,
          order.id,
        );
        succeeded++;
      } catch (err: any) {
        failed++;
        this.logger.error(
          `[RetryJob] Failed to refund wallet for Order #${order.id}: ${err.message}`,
        );
      }
    }

    this.logger.log(
      `[RetryJob] Refund retry complete: ${succeeded} succeeded, ${failed} failed out of ${pendingRefunds.length}.`,
    );
  }
}
