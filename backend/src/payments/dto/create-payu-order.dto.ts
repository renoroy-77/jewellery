import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsObject } from 'class-validator';

export class CustomerDetailsDto {
  @ApiPropertyOptional({ example: 'cust_12345' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Karthik Ramanathan' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: 'karthik@temple.org' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '9840123456' })
  @IsOptional()
  @IsString()
  customerPhone?: string;
}

export class CreatePayUOrderDto {
  @ApiProperty({ example: 1899, description: 'Order amount in INR' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'rcpt_1001' })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiPropertyOptional({ example: 'order_12345' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ type: CustomerDetailsDto })
  @IsOptional()
  @IsObject()
  customerDetails?: CustomerDetailsDto;

  @ApiPropertyOptional({ example: 'https://aamadappetti.com/order-success' })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({ example: { devoteeName: 'Karthik', email: 'karthik@temple.org' } })
  @IsOptional()
  @IsObject()
  notes?: Record<string, any>;
}
