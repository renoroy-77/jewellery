import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateHeroSlideDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  kicker?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleLine1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleLine2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mobileImage?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
