import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({ example: 'prod-010' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ example: 'sacred-devi-pendant' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Meenakshi Devi Temple Pendant' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Goddess Devi' })
  @IsString()
  deity: string;

  @ApiProperty({ example: 'pendants' })
  @IsString()
  category: string;

  @ApiProperty({ example: 2199 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 2799 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional({ example: 5.0, default: 5.0 })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  reviewsCount?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiProperty({ example: 'Exquisite hand-carved Devi talisman in 5-metal Panchaloham.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: '2.5%' })
  @IsString()
  @IsOptional()
  metalGold?: string;

  @ApiPropertyOptional({ example: '12.5%' })
  @IsString()
  @IsOptional()
  metalSilver?: string;

  @ApiPropertyOptional({ example: '65.0%' })
  @IsString()
  @IsOptional()
  metalCopper?: string;

  @ApiPropertyOptional({ example: '15.0%' })
  @IsString()
  @IsOptional()
  metalZinc?: string;

  @ApiPropertyOptional({ example: '5.0%' })
  @IsString()
  @IsOptional()
  metalIron?: string;

  @ApiPropertyOptional({ example: 'Government Assay Certified' })
  @IsString()
  @IsOptional()
  purityCertificate?: string;

  @ApiPropertyOptional({ example: '3.5 cm x 2.2 cm' })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiPropertyOptional({ example: '14.5 grams' })
  @IsString()
  @IsOptional()
  weight?: string;

  @ApiPropertyOptional({ example: 'Consecrated during Chithirai festival puja.' })
  @IsString()
  @IsOptional()
  consecrationDetails?: string;

  @ApiPropertyOptional({ type: [String], example: ['/assets/prod_ganesha_hq.webp'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Removes obstacles', 'Shields aura'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];

  @ApiPropertyOptional({ type: [String], example: ['devi', 'pendant', 'panchaloham'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
