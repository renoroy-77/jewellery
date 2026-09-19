import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateFaqDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  answer?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
