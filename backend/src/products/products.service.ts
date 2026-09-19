import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    category?: string;
    search?: string;
    inStock?: boolean;
    featured?: boolean;
  }) {
    const where: any = {};

    if (params?.category && params.category !== 'all') {
      where.category = params.category;
    }

    if (typeof params?.inStock === 'boolean') {
      where.inStock = params.inStock;
    }

    if (typeof params?.featured === 'boolean') {
      where.featured = params.featured;
    }

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { deity: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID or slug "${idOrSlug}" not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const slug =
      dto.slug?.trim() ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      // Append unique timestamp
      dto.slug = `${slug}-${Date.now()}`;
    } else {
      dto.slug = slug;
    }

    const id = dto.id?.trim() || `prod-${Date.now()}`;

    return this.prisma.product.create({
      data: {
        id,
        slug: dto.slug,
        name: dto.name,
        deity: dto.deity || 'Universal',
        category: dto.category || 'pendants',
        price: Number(dto.price),
        originalPrice: dto.originalPrice ? Number(dto.originalPrice) : null,
        rating: dto.rating ?? 5.0,
        reviewsCount: dto.reviewsCount ?? 1,
        inStock: dto.inStock !== false,
        featured: dto.featured === true,
        description: dto.description || '',
        metalGold: dto.metalGold || '2.5%',
        metalSilver: dto.metalSilver || '12.5%',
        metalCopper: dto.metalCopper || '65.0%',
        metalZinc: dto.metalZinc || '15.0%',
        metalIron: dto.metalIron || '5.0%',
        purityCertificate: dto.purityCertificate || 'Government Assay Certified',
        dimensions: dto.dimensions || '',
        weight: dto.weight || '',
        consecrationDetails: dto.consecrationDetails || 'Consecrated in authentic temple sanctum.',
        images: dto.images && dto.images.length > 0 ? dto.images : ['/assets/prod_ganesha_hq.webp'],
        benefits: dto.benefits && dto.benefits.length > 0 ? dto.benefits : ['Bestows divine grace and energy harmony.'],
        tags: dto.tags && dto.tags.length > 0 ? dto.tags : ['panchaloham', dto.category || 'jewellery'],
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        price: dto.price !== undefined ? Number(dto.price) : undefined,
        originalPrice: dto.originalPrice !== undefined ? Number(dto.originalPrice) : undefined,
      },
    });
  }

  async toggleStock(id: string) {
    const product = await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { inStock: !product.inStock },
    });
  }

  async toggleFeatured(id: string) {
    const product = await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { featured: !product.featured },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
