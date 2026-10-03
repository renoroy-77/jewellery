import { Module, Global } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { NotificationsController } from './notifications.controller';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class NotificationsModule {}
