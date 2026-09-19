import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRazorpayOrderDto {
  @ApiProperty({ example: 2499, description: 'Order amount in INR (Rupees)' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'ORD-12345' })
  @IsString()
  @IsOptional()
  receipt?: string;

  @ApiPropertyOptional({ example: { devoteeName: 'Ananya Sundaram', email: 'ananya@temple.org' } })
  @IsOptional()
  notes?: Record<string, any>;
}
