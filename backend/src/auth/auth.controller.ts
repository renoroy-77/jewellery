import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { SendDevoteeOtpDto } from './dto/send-otp.dto';
import { VerifyDevoteeOtpDto } from './dto/verify-otp.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================================
  // DEVOTEE PASSWORDLESS OTP AUTHENTICATION
  // ==========================================

  @Post('devotee/send-otp')
  @ApiOperation({ summary: 'Send 6-digit verification OTP to devotee email' })
  sendDevoteeOtp(@Body() dto: SendDevoteeOtpDto) {
    return this.authService.sendDevoteeOtp(dto);
  }

  @Post('devotee/verify-otp')
  @ApiOperation({ summary: 'Verify OTP, auto-create account if new, and return 29-day session' })
  verifyDevoteeOtp(@Body() dto: VerifyDevoteeOtpDto) {
    return this.authService.verifyDevoteeOtp(dto);
  }

  @Get('devotee/me')
  @ApiOperation({ summary: 'Validate devotee session and fetch profile & saved addresses' })
  getDevoteeProfile(@Query('email') email?: string) {
    if (!email) {
      throw new UnauthorizedException('Email query parameter is required');
    }
    return this.authService.validateDevoteeSession(email);
  }

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  @Post('admin-login')
  @ApiOperation({ summary: 'Admin login with username and password / passcode' })
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Get('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify admin session token' })
  verifySession(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    return this.authService.verifyToken(token);
  }
}
