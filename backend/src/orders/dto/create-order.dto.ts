import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'ORD-98425' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Ananya Sundaram' })
  @IsString()
  @IsNotEmpty()
  devoteeName: string;

  @ApiProperty({ example: 'ananya.sundaram@templedevotee.org' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91 98401 23456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:(?:\+|0{0,2})91[\s\-]*)?[6789](?:[\s\-]*\d){9}$/, {
    message: 'Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9',
  })
  phone: string;

  @ApiProperty({
    example: [
      {
        productId: 'prod-01',
        name: 'Lord Ganesha Panchaloham Pendant',
        price: 2499,
        quantity: 1,
        image: '/images/products/ganesha-pendant-1.jpg',
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  items: any[];

  @ApiPropertyOptional({ example: 2499 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  subtotal?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingFee?: number;

  @ApiPropertyOptional({ example: 'RAJESH-K7Q2' })
  @IsString()
  @IsOptional()
  referralCodeUsed?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  walletDiscount?: number;

  @ApiPropertyOptional({ example: 2499 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional({ example: 'Pending', default: 'Pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '42, Sannathi Street, Mylapore, Chennai, Tamil Nadu - 600004' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiPropertyOptional({ example: '18 Sep 2026' })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'IND-98425-TN' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiProperty({ example: 'Razorpay UPI (Verified)', default: 'Razorpay UPI' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
