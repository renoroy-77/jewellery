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
    return this.prisma.category.create({
      data: {
        id: dto.id,
        slug: dto.slug || dto.id,
        name: dto.name,
        tamilName: dto.tamilName,
        image: dto.image,
        itemCount: dto.itemCount ?? 0,
        description: dto.description,
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
