import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const user = await this.authService.resolveTokenUser(token);
      if (user) {
        req.user = user;
        req.isAdmin = user.role === 'SUPERADMIN' || user.role === 'ADMIN';
        return true;
      }
    }

    // No token or invalid/expired token → treat as unauthenticated guest.
    // Wallet and referral endpoints must check req.user !== null before acting.
    req.user = null;
    req.isAdmin = false;
    return true;
  }
}
