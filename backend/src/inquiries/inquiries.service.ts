import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string, search?: string) {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { referenceId: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrRef: string) {
    const clean = idOrRef.trim();
    const withHash = clean.startsWith('#') ? clean : `#${clean}`;
    const withoutHash = clean.replace(/^#+/, '');

    const item = await this.prisma.inquiry.findFirst({
      where: {
        OR: [
          { id: clean },
          { referenceId: clean },
          { referenceId: withHash },
          { referenceId: withoutHash },
        ],
      },
    });

    if (!item) {
      throw new NotFoundException(`Inquiry with ID or reference ${idOrRef} not found`);
    }

    return item;
  }

  async create(dto: CreateInquiryDto) {
    let referenceId = dto.referenceId?.trim();
    if (!referenceId) {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      referenceId = `#AAP-${randomSuffix}`;
    } else if (!referenceId.startsWith('#')) {
      referenceId = `#${referenceId}`;
    }

    const created = await this.prisma.inquiry.create({
      data: {
        referenceId,
        name: dto.name.trim(),
        email: dto.email?.trim() || null,
        phone: dto.phone?.trim() || null,
        inquiryType: dto.inquiryType || 'Custom Deity Pendant',
        preferredContact: dto.preferredContact || 'WhatsApp',
        message: dto.message.trim(),
        budget: dto.budget?.trim() || '25000',
        status: dto.status || 'NEW',
        notes: dto.notes?.trim() || null,
      },
    });

    this.logger.log(`Created new Inquiry: ${created.referenceId} for ${created.name}`);
    return created;
  }

  async update(idOrRef: string, dto: UpdateInquiryDto) {
    const existing = await this.findOne(idOrRef);

    const updated = await this.prisma.inquiry.update({
      where: { id: existing.id },
      data: {
        status: dto.status ?? undefined,
        notes: dto.notes ?? undefined,
        budget: dto.budget ?? undefined,
      },
    });

    this.logger.log(`Updated Inquiry ${existing.referenceId}: status=${dto.status}`);
    return updated;
  }

  async remove(idOrRef: string) {
    const clean = idOrRef.trim();
    const withHash = clean.startsWith('#') ? clean : `#${clean}`;
    const withoutHash = clean.replace(/^#+/, '');

    const deleted = await this.prisma.inquiry.deleteMany({
      where: {
        OR: [
          { id: clean },
          { referenceId: clean },
          { referenceId: withHash },
          { referenceId: withoutHash },
        ],
      },
    });

    this.logger.log(`Deleted Inquiry ${idOrRef}, count: ${deleted.count}`);
    return {
      success: true,
      deletedCount: deleted.count,
      deletedId: idOrRef,
    };
  }
}
