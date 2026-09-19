import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 'What is Panchaloham and why is it spiritually significant?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'Panchaloham is an ancient sacred Vedic alloy...' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({ example: 'spirituality', default: 'general' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
