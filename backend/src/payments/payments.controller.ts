import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('Payments & Razorpay')
@Controller('api/payments/razorpay')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay payment order for checkout' })
  @ApiResponse({ status: 201, description: 'Razorpay order created with order_id and keyId' })
  async createOrder(@Body() dto: CreateRazorpayOrderDto) {
    return this.paymentsService.createRazorpayOrder(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment signature and persist order' })
  @ApiResponse({ status: 200, description: 'Payment verified and order confirmed' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook endpoint for async payment events' })
  @ApiHeader({ name: 'x-razorpay-signature', required: false, description: 'HMAC signature for webhook verification' })
  @ApiResponse({ status: 200, description: 'Webhook acknowledged' })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
    @Body() payload: any,
  ) {
    const rawBody = (req as any).rawBody || JSON.stringify(payload);
    return this.paymentsService.handleWebhook(rawBody, signature, payload);
  }
}
