import { Controller, Post, Get, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PushNotificationService } from './push-notification.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@ApiTags('FCM Push Notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly pushService: PushNotificationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Firebase Cloud Messaging service status and active device count' })
  getStatus() {
    return this.pushService.getStatus();
  }

  @Post('register-token')
  @ApiOperation({ summary: 'Register an Admin device FCM token for push notifications' })
  registerToken(
    @Body() dto: { token: string; deviceName?: string; platform?: string },
  ) {
    return this.pushService.registerAdminToken(dto.token, {
      deviceName: dto.deviceName,
      platform: dto.platform,
    });
  }

  @Delete('register-token')
  @ApiOperation({ summary: 'Deregister an Admin device FCM token' })
  deregisterToken(@Body() dto: { token: string }) {
    return this.pushService.removeAdminToken(dto.token);
  }

  @Post('test')
  @ApiOperation({ summary: 'Send test FCM notification to registered admin devices' })
  sendTest(@Body() dto: { title?: string; body?: string }) {
    return this.pushService.sendTestNotification(dto.title, dto.body);
  }
}
