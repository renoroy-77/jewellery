import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInquiryDto {
  @ApiPropertyOptional({ example: 'IN_PROGRESS' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Discussed with artisan; preparing brass mold.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '35000' })
  @IsOptional()
  @IsString()
  budget?: string;
}
