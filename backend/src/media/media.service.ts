import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMedia(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }

    const publicUrl = `/uploads/${file.filename}`;

    const mediaAsset = await this.prisma.mediaAsset.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: publicUrl,
      },
    });

    return {
      success: true,
      asset: mediaAsset,
      url: publicUrl,
    };
  }

  async getAllMedia() {
    return this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
