import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home / Puja Room', required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 'Rajesh Sharma' })
  @IsNotEmpty({ message: 'Recipient name is required' })
  @IsString()
  recipientName: string;

  @ApiProperty({ example: '+91 98450 12345' })
  @IsNotEmpty({ message: 'Contact phone number is required' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'No. 42, Sannathi Street, Mylapore' })
  @IsNotEmpty({ message: 'Street address is required' })
  @IsString()
  streetAddress: string;

  @ApiProperty({ example: 'Chennai' })
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Tamil Nadu', default: 'Tamil Nadu' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '600004' })
  @IsNotEmpty({ message: 'Pincode is required' })
  @IsString()
  pincode: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
