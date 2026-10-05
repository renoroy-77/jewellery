import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class VerifyPayUPaymentDto {
  @ApiPropertyOptional({ example: 'txnid_1728139482910' })
  @IsOptional()
  @IsString()
  txnid?: string;

  @ApiPropertyOptional({ example: 'payu_pay_123456' })
  @IsOptional()
  @IsString()
  payuPaymentId?: string;

  @ApiPropertyOptional({ example: 'mihpayid_123456' })
  @IsOptional()
  @IsString()
  mihpayid?: string;

  @ApiPropertyOptional({ example: 'success' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'sha512_hash...' })
  @IsOptional()
  @IsString()
  hash?: string;

  @ApiPropertyOptional({ description: 'Order payload to commit to Postgres' })
  @IsOptional()
  @IsObject()
  orderData?: any;

  // Compatibility aliases
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cfPaymentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentSessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}
