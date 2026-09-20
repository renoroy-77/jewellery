import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { ValidateReferralDto } from './dto/validate-referral.dto';
import { UpdateReferralSettingsDto } from './dto/update-referral-settings.dto';
import { RedeemWalletDto } from './dto/redeem-wallet.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

@ApiTags('Referrals')
@Controller('api/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  /**
   * Public checkout settings endpoint (discount amounts, minimum order value)
   */
  @Get('settings')
  @ApiOperation({ summary: 'Get public referral program settings' })
  async getPublicSettings() {
    return this.referralsService.getPublicSettings();
  }

  /**
   * Admin full settings endpoint
   */
  @Get('admin/settings')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full referral settings (Admin Only)' })
  async getAdminSettings() {
    return this.referralsService.getSettings();
  }

  /**
   * Admin update settings endpoint
   */
  @Put('admin/settings')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update referral reward settings (Admin Only)' })
  async updateAdminSettings(@Body() dto: UpdateReferralSettingsDto) {
    return this.referralsService.updateSettings(dto);
  }

  /**
   * Checkout validation endpoint (public — validates a typed referral code)
   */
  @Post('validate')
  @ApiOperation({ summary: 'Validate a referral code at checkout' })
  async validateReferral(@Body() dto: ValidateReferralDto) {
    return this.referralsService.validateReferralCode(dto);
  }

  /**
   * Logged-in devotee's own referral dashboard.
   * Identity comes from the session token — NOT from a query parameter.
   */
  @Get('me')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated devotee's referral stats and wallet ledger" })
  async getUserReferrals(@Req() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException(
        'You must be signed in as a devotee to view your referral dashboard.',
      );
    }
    return this.referralsService.getUserReferrals(req.user.id);
  }

  /**
   * Redeem wallet balance at checkout.
   * Identity and amount come from the session — never from the request body.
   */
  @Post('wallet/redeem')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redeem wallet balance at checkout (Authenticated Devotee Only)' })
  async redeemWallet(
    @Req() req: any,
    @Body() dto: RedeemWalletDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException(
        'You must be signed in as a devotee to redeem Sanctum wallet balance.',
      );
    }
    return this.referralsService.redeemWalletBalance(req.user.id, dto.amount);
  }

  /**
   * Admin audit list of all referrals
   */
  @Get('admin')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all referrals with search and status filter (Admin Only)' })
  async getAdminReferrals(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.referralsService.getAllReferrals({ search, status });
  }
}
