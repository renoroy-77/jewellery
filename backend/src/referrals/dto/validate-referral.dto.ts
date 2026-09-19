import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ValidateReferralDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  buyerEmail?: string;

  @IsString()
  @IsOptional()
  buyerPhone?: string;

  @IsNumber()
  @IsOptional()
  subtotal?: number;
}
