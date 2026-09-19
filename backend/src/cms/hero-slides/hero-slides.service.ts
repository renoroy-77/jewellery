import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { ReorderHeroSlidesDto } from './dto/reorder-hero-slides.dto';

@Injectable()
export class HeroSlidesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = false) {
    return this.prisma.heroSlide.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(id: number) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException(`Hero slide with ID ${id} not found`);
    return slide;
  }

  async create(dto: CreateHeroSlideDto) {
    const maxOrder = await this.prisma.heroSlide.aggregate({ _max: { orderIndex: true } });
    const orderIndex = dto.orderIndex ?? ((maxOrder._max.orderIndex ?? 0) + 1);

    return this.prisma.heroSlide.create({
      data: {
        ...dto,
        orderIndex,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateHeroSlideDto) {
    await this.findOne(id);
    return this.prisma.heroSlide.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.heroSlide.delete({ where: { id } });
  }

  async reorder(dto: ReorderHeroSlidesDto) {
    const updates = dto.slideIds.map((id, index) =>
      this.prisma.heroSlide.update({
        where: { id },
        data: { orderIndex: index + 1 },
      }),
    );
    await this.prisma.$transaction(updates);
    return this.findAll();
  }
}
