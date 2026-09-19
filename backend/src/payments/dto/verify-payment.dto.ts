import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'order_DBJOWzybf0sJbb' })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({ example: 'pay_DBJOPgqqQjig8M' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({ example: '9a97d740c06ab8...' })
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;

  @ApiPropertyOptional({ description: 'Order payload to persist upon verified payment' })
  @IsOptional()
  orderData?: Partial<CreateOrderDto>;
}
