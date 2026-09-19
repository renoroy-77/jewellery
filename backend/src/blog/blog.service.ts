import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { category?: string; search?: string }) {
    const { category, search } = params || {};
    const where: any = {};

    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!post) {
      throw new NotFoundException(`Blog post ${idOrSlug} not found`);
    }

    return post;
  }

  async create(dto: CreateBlogPostDto) {
    const id = dto.id || `post-${Date.now().toString().slice(-6)}`;
    const slug =
      dto.slug ||
      dto.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const formattedDate =
      dto.date ||
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    return this.prisma.blogPost.create({
      data: {
        id,
        slug,
        title: dto.title,
        subtitle: dto.subtitle,
        excerpt: dto.excerpt,
        image:
          dto.image ||
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
        date: formattedDate,
        readTime: dto.readTime || '5 min read',
        tag: dto.tag || 'Sacred Wisdom',
        category: dto.category,
        authorName: dto.authorName,
        authorRole: dto.authorRole || 'Temple Artisan',
        likes: dto.likes ?? 0,
        featured: dto.featured ?? false,
        content: dto.content || [],
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Blog post ${id} not found`);
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Blog post ${id} not found`);
    }

    return this.prisma.blogPost.delete({
      where: { id },
    });
  }
}
