import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoryBannerDto {
  @ApiPropertyOptional({ example: 'banner-1' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'A Sacred Gift for Your Loved Ones' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Perfect for festivals, weddings and special occasions.' })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiPropertyOptional({ example: 'Explore Gifts', default: 'Explore' })
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiPropertyOptional({ example: '/collections', default: '/collections' })
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiProperty({ example: '/assets/banner_sacred_gift.png' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
