import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CustomerDetailsDto {
  @ApiPropertyOptional({ example: 'cust_12345' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Ananya Sundaram' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: 'ananya@temple.org' })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '9840123456' })
  @IsString()
  @IsOptional()
  customerPhone?: string;
}

export class CreateCashfreeOrderDto {
  @ApiProperty({ example: 2499, description: 'Order amount in INR' })
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
  orderId?: string;

  @ApiPropertyOptional({ example: 'test_rcpt_101' })
  @IsString()
  @IsOptional()
  receipt?: string;

  @ApiPropertyOptional({ type: CustomerDetailsDto })
  @IsOptional()
  customerDetails?: CustomerDetailsDto;

  @ApiPropertyOptional({ example: { devoteeName: 'Ananya Sundaram', email: 'ananya@temple.org' } })
  @IsOptional()
  notes?: Record<string, any>;
}

export { CreateCashfreeOrderDto as CreateRazorpayOrderDto };
