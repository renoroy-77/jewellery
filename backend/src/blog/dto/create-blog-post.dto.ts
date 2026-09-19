import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlogPostDto {
  @ApiPropertyOptional({ example: 'post-1' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ example: 'sacred-panchaloham-alchemy' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'The Sacred Alchemy of Panchaloham: Five Metals, Infinite Grace' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Ancient Metallurgical Wisdom from the Shilpa Shastras' })
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @ApiProperty({
    example:
      'For over three millennia, temple sthapatis of Tamil Nadu have forged sacred talismans using the divine five-metal alloy.',
  })
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    default: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: '12 Sep 2026' })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: '7 min read', default: '5 min read' })
  @IsString()
  @IsOptional()
  readTime?: string;

  @ApiPropertyOptional({ example: 'Vedic Metallurgy', default: 'Sacred Wisdom' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ example: 'VEDIC METALLURGY' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Master Sthapati R. Shanmugam' })
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @ApiPropertyOptional({
    example: 'Chief Shilpa Consultant, Swamimalai Heritage Guild',
    default: 'Temple Artisan',
  })
  @IsString()
  @IsOptional()
  authorRole?: string;

  @ApiPropertyOptional({ example: 42, default: 0 })
  @IsNumber()
  @IsOptional()
  likes?: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({
    example: [
      {
        heading: 'The Five Sacred Elements',
        body: 'Panchaloham embodies the cosmic balance of earth, water, fire, air, and ether.',
      },
    ],
  })
  @IsOptional()
  content?: any;
}
