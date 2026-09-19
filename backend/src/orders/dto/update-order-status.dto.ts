import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'Consecrated' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ example: 'DTDC-774921-IN' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'Devotee requested address change' })
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
