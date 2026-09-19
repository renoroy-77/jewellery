import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(idOrSlug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${idOrSlug} not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const rawSlug = dto.slug || dto.id || dto.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = rawSlug || `collection-${Date.now()}`;
    const id = dto.id || slug;
    const image = dto.image || '/assets/cat_ganesha.png';
    const description = dto.description || `${dto.name} consecrated Panchaloham temple collection.`;

    return this.prisma.category.upsert({
      where: { id },
      update: {
        slug,
        name: dto.name,
        tamilName: dto.tamilName,
        image,
        itemCount: dto.itemCount ?? undefined,
        description,
      },
      create: {
        id,
        slug,
        name: dto.name,
        tamilName: dto.tamilName || null,
        image,
        itemCount: dto.itemCount ?? 0,
        description,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
