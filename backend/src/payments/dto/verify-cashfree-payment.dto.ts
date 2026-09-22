import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';

export class VerifyCashfreePaymentDto {
  @ApiProperty({ example: 'order_1727000000000_1234' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ example: '1453002795' })
  @IsString()
  @IsOptional()
  cfPaymentId?: string;

  @ApiPropertyOptional({ example: 'session_xyz123' })
  @IsString()
  @IsOptional()
  paymentSessionId?: string;

  // Backwards compatibility aliases
  @ApiPropertyOptional({ example: 'order_1727000000000_1234' })
  @IsString()
  @IsOptional()
  razorpayOrderId?: string;

  @ApiPropertyOptional({ example: 'pay_123456' })
  @IsString()
  @IsOptional()
  razorpayPaymentId?: string;

  @ApiPropertyOptional({ example: 'signature_xyz' })
  @IsString()
  @IsOptional()
  razorpaySignature?: string;

  @ApiPropertyOptional({ description: 'Order payload to persist upon verified payment' })
  @IsOptional()
  orderData?: Partial<CreateOrderDto>;
}

export { VerifyCashfreePaymentDto as VerifyPaymentDto };
