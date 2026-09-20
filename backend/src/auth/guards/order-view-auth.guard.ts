import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderViewAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const orderId = req.params.id;
    const authHeader = req.headers['authorization'];
    const devId = req.headers['x-devotee-id'];
    const devEmail = req.headers['x-devotee-email'];

    let user: any = null;

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      user = await this.authService.resolveTokenUser(token);
    } else if (devId || devEmail) {
      const dev = await this.authService.findDevoteeByIdentifier((devId || devEmail) as string);
      if (dev) user = { ...dev, role: 'DEVOTEE' };
    }

    if (!user) {
      throw new UnauthorizedException('Authentication required to access order details');
    }

    req.user = user;

    // Admins have universal read access
    if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
      return true;
    }

    // Devotee ownership check: prevent leaking other customers' PII
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, devoteeId: true, email: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    const isOwner =
      (order.devoteeId && order.devoteeId === user.id) ||
      (order.email && order.email.toLowerCase() === user.email?.toLowerCase());

    if (!isOwner) {
      throw new ForbiddenException('Access denied. You can only view your own sacred orders.');
    }

    return true;
  }
}
