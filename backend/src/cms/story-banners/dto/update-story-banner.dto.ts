import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStoryBannerDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  desc?: string;

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
  image?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
