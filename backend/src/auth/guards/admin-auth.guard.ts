import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Admin authorization header required');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await this.authService.resolveTokenUser(token);

    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      throw new UnauthorizedException('Valid admin authorization token required');
    }

    req.user = user;
    req.isAdmin = true;
    return true;
  }
}
