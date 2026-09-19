import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'pendants' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'pendants' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Sacred Pendants' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'பதக்கங்கள்' })
  @IsString()
  @IsOptional()
  tamilName?: string;

  @ApiProperty({ example: '/images/categories/pendants.jpg' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: 24, default: 0 })
  @IsNumber()
  @IsOptional()
  itemCount?: number;

  @ApiProperty({ example: 'Handcrafted Panchaloham pendants charged with Agamic mantras.' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
