import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OrdersModule } from '../orders/orders.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [OrdersModule, TelegramModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
