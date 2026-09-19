import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDevoteeUserDto {
  @ApiPropertyOptional({ example: 'USR-107' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Sowmya Krishnamoorthy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sowmya.k@templedevotee.org' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91 94441 55678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '12, North Car Street, Chidambaram, Tamil Nadu - 608001' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiPropertyOptional({ example: 'Sep 2026' })
  @IsString()
  @IsOptional()
  memberSince?: string;
}
