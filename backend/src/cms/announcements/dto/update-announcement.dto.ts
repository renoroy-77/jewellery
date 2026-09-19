import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ example: 'Free Shipping on Orders Above ₹999' })
  @IsString()
  @IsOptional()
  freeShippingText?: string;

  @ApiPropertyOptional({ example: 'Authentic Panchaloham' })
  @IsString()
  @IsOptional()
  authenticityText?: string;

  @ApiPropertyOptional({ example: 'Blessings Delivered Worldwide' })
  @IsString()
  @IsOptional()
  worldwideText?: string;

  @ApiPropertyOptional({ example: 'Special Navaratri Consecration: Free Sanctum Prasadam with every order' })
  @IsString()
  @IsOptional()
  activePromoAlert?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
