import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('Admin Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
