import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TelegramModule } from '../telegram/telegram.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [TelegramModule, ReferralsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
