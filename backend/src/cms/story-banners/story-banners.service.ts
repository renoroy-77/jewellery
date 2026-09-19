import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoryBannerDto } from './dto/create-story-banner.dto';
import { UpdateStoryBannerDto } from './dto/update-story-banner.dto';
import { ReorderStoryBannersDto } from './dto/reorder-story-banners.dto';

@Injectable()
export class StoryBannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = false) {
    return this.prisma.storyBanner.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.storyBanner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException(`Story banner with ID ${id} not found`);
    return banner;
  }

  async create(dto: CreateStoryBannerDto) {
    const maxOrder = await this.prisma.storyBanner.aggregate({ _max: { orderIndex: true } });
    const orderIndex = dto.orderIndex ?? ((maxOrder._max.orderIndex ?? 0) + 1);

    return this.prisma.storyBanner.create({
      data: {
        ...dto,
        orderIndex,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateStoryBannerDto) {
    await this.findOne(id);
    return this.prisma.storyBanner.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.storyBanner.delete({ where: { id } });
  }

  async reorder(dto: ReorderStoryBannersDto) {
    const updates = dto.bannerIds.map((id, index) =>
      this.prisma.storyBanner.update({
        where: { id },
        data: { orderIndex: index + 1 },
      }),
    );
    await this.prisma.$transaction(updates);
    return this.findAll();
  }
}
