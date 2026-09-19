import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHeroSlideDto {
  @ApiProperty({ example: 'DIVINE BEAUTY, TIMELESS TRADITION' })
  @IsString()
  @IsNotEmpty()
  kicker: string;

  @ApiProperty({ example: 'Adorn' })
  @IsString()
  @IsNotEmpty()
  titleLine1: string;

  @ApiProperty({ example: 'Your Faith' })
  @IsString()
  @IsNotEmpty()
  titleLine2: string;

  @ApiProperty({ example: 'Authentic Panchaloham jewellery, crafted for every spiritual journey.' })
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @ApiPropertyOptional({ example: 'Shop Now', default: 'Shop Now' })
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiPropertyOptional({ example: '/collections', default: '/collections' })
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiPropertyOptional({ example: 'FAITH IN EVERY DETAIL', default: 'FAITH IN EVERY DETAIL' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ example: '/assets/hero_slide_1.webp' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: '/assets/hero_slide_1_mobile.webp' })
  @IsString()
  @IsNotEmpty()
  mobileImage: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
