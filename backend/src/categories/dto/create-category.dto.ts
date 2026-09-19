import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiPropertyOptional({ example: 'pendants' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ example: 'pendants' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Sacred Pendants' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'பதக்கங்கள்' })
  @IsString()
  @IsOptional()
  tamilName?: string;

  @ApiPropertyOptional({ example: '/assets/cat_ganesha.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 24, default: 0 })
  @IsNumber()
  @IsOptional()
  itemCount?: number;

  @ApiPropertyOptional({ example: 'Handcrafted Panchaloham pendants charged with Agamic mantras.' })
  @IsString()
  @IsOptional()
  description?: string;
}
