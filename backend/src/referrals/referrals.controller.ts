import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ValidateReferralDto } from './dto/validate-referral.dto';
import { UpdateReferralSettingsDto } from './dto/update-referral-settings.dto';

@Controller('api/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  /**
   * Public checkout settings endpoint
   */
  @Get('settings')
  async getPublicSettings() {
    return this.referralsService.getPublicSettings();
  }

  /**
   * Admin full settings endpoint
   */
  @Get('admin/settings')
  async getAdminSettings() {
    return this.referralsService.getSettings();
  }

  /**
   * Admin update settings endpoint
   */
  @Put('admin/settings')
  async updateAdminSettings(@Body() dto: UpdateReferralSettingsDto) {
    return this.referralsService.updateSettings(dto);
  }

  /**
   * Checkout validation endpoint
   */
  @Post('validate')
  async validateReferral(@Body() dto: ValidateReferralDto) {
    return this.referralsService.validateReferralCode(dto);
  }

  /**
   * Logged-in user / queried devotee referral statistics
   */
  @Get('me')
  async getUserReferrals(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    return this.referralsService.getUserReferrals(email);
  }

  /**
   * Admin audit list of all referrals
   */
  @Get('admin')
  async getAdminReferrals(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.referralsService.getAllReferrals({ search, status });
  }
}
