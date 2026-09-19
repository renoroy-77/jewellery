import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ReorderFaqsDto } from './dto/reorder-faqs.dto';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = false) {
    return this.prisma.faq.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException(`FAQ with ID ${id} not found`);
    return faq;
  }

  async create(dto: CreateFaqDto) {
    const maxOrder = await this.prisma.faq.aggregate({ _max: { orderIndex: true } });
    const orderIndex = dto.orderIndex ?? ((maxOrder._max.orderIndex ?? 0) + 1);

    return this.prisma.faq.create({
      data: {
        ...dto,
        orderIndex,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateFaqDto) {
    await this.findOne(id);
    return this.prisma.faq.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.faq.delete({ where: { id } });
  }

  async reorder(dto: ReorderFaqsDto) {
    const updates = dto.faqIds.map((id, index) =>
      this.prisma.faq.update({
        where: { id },
        data: { orderIndex: index + 1 },
      }),
    );
    await this.prisma.$transaction(updates);
    return this.findAll();
  }
}
