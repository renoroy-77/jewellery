import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInquiryDto {
  @ApiPropertyOptional({ example: '#AAP-84920' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiProperty({ example: 'Ramesh Iyer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'devotee@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+91 98400 12345' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Custom Deity Idol Consecration' })
  @IsOptional()
  @IsString()
  inquiryType?: string;

  @ApiPropertyOptional({ example: 'WhatsApp' })
  @IsOptional()
  @IsString()
  preferredContact?: string;

  @ApiProperty({ example: 'Looking for a 6-inch Panchaloham Murugan idol.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: '25000' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ example: 'NEW' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Preferred delivery before Tamil New Year.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
