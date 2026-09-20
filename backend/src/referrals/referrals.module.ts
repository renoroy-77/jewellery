import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReferralRetryJob } from '../jobs/referral-retry.job';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralRetryJob],
  exports: [ReferralsService],
})
export class ReferralsModule {}
