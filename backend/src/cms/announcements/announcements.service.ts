import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive() {
    let announcement = await this.prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!announcement) {
      announcement = await this.prisma.announcement.create({
        data: {
          freeShippingText: 'Free Shipping on Orders Above ₹999',
          authenticityText: 'Authentic Panchaloham',
          worldwideText: 'Blessings Delivered Worldwide',
          activePromoAlert: 'Special Navaratri Consecration: Free Sanctum Prasadam with every order',
          isActive: true,
        },
      });
    }

    return announcement;
  }

  async update(dto: UpdateAnnouncementDto) {
    const current = await this.getActive();
    return this.prisma.announcement.update({
      where: { id: current.id },
      data: dto,
    });
  }
}
