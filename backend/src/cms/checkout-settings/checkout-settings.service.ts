import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCheckoutSettingsDto } from './dto/update-checkout-settings.dto';

@Injectable()
export class CheckoutSettingsService {
  private readonly logger = new Logger(CheckoutSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.checkoutSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.checkoutSettings.create({
        data: {
          id: 'default',
          shippingFee: 99.0,
          freeShippingThreshold: 999.0,
          giftPackagingFee: 0.0,
          giftPackagingEnabled: true,
          giftPackagingText: 'FREE',
          expressShippingText: 'Insured Express Shipping',
        },
      });
      this.logger.log('Initialized default CheckoutSettings in database');
    }

    return settings;
  }

  async updateSettings(dto: UpdateCheckoutSettingsDto) {
    // Ensure default record exists first
    await this.getSettings();

    const updated = await this.prisma.checkoutSettings.update({
      where: { id: 'default' },
      data: dto,
    });
    this.logger.log(`Updated CheckoutSettings: ${JSON.stringify(dto)}`);
    return updated;
  }
}
