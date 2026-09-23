import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutSettingsService } from './checkout-settings.service';
import { UpdateCheckoutSettingsDto } from './dto/update-checkout-settings.dto';

@ApiTags('Checkout Settings')
@Controller('api/cms/checkout-settings')
export class CheckoutSettingsController {
  constructor(private readonly checkoutSettingsService: CheckoutSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current checkout shipping & gift packaging settings' })
  getSettings() {
    return this.checkoutSettingsService.getSettings();
  }

  @Put()
  @ApiOperation({ summary: 'Update checkout shipping & gift packaging settings' })
  updateSettings(@Body() dto: UpdateCheckoutSettingsDto) {
    return this.checkoutSettingsService.updateSettings(dto);
  }
}
