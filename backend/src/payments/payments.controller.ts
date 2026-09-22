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
import { CreateCashfreeOrderDto } from './dto/create-cashfree-order.dto';
import { VerifyCashfreePaymentDto } from './dto/verify-cashfree-payment.dto';

@ApiTags('Payments & Cashfree')
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 1. Cashfree Order Creation
  @Post('cashfree/create-order')
  @ApiOperation({ summary: 'Create Cashfree payment order with session ID for checkout' })
  @ApiResponse({ status: 201, description: 'Cashfree order created with orderId and paymentSessionId' })
  async createCashfreeOrder(@Body() dto: CreateCashfreeOrderDto) {
    return this.paymentsService.createCashfreeOrder(dto);
  }

  @Post('razorpay/create-order')
  @ApiOperation({ summary: 'Legacy alias for create-order' })
  async createLegacyOrder(@Body() dto: CreateCashfreeOrderDto) {
    return this.paymentsService.createCashfreeOrder(dto);
  }

  @Post('create-order')
  @ApiOperation({ summary: 'Universal create-order endpoint' })
  async createUniversalOrder(@Body() dto: CreateCashfreeOrderDto) {
    return this.paymentsService.createCashfreeOrder(dto);
  }

  // 2. Cashfree Payment Verification
  @Post('cashfree/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Cashfree payment status and commit order to database' })
  @ApiResponse({ status: 200, description: 'Payment verified and order confirmed' })
  async verifyCashfreePayment(@Body() dto: VerifyCashfreePaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Post('razorpay/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Legacy alias for verify' })
  async verifyLegacyPayment(@Body() dto: VerifyCashfreePaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal verify payment endpoint' })
  async verifyUniversalPayment(@Body() dto: VerifyCashfreePaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  // 3. Cashfree Webhook Handler
  @Post('cashfree/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cashfree webhook endpoint for real-time payment notifications' })
  @ApiHeader({ name: 'x-webhook-signature', required: false, description: 'HMAC SHA-256 Base64 signature' })
  @ApiHeader({ name: 'x-webhook-timestamp', required: false, description: 'Unix epoch timestamp in seconds/ms' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleCashfreeWebhook(
    @Headers('x-webhook-signature') cfSignature: string,
    @Headers('x-webhook-timestamp') cfTimestamp: string,
    @Headers('x-razorpay-signature') legacySignature: string,
    @Req() req: Request,
    @Body() payload: any,
  ) {
    const signature = cfSignature || legacySignature;
    const timestamp = cfTimestamp || '';
    const rawBody = (req as any).rawBody || JSON.stringify(payload);
    return this.paymentsService.handleWebhook(rawBody, signature, timestamp, payload);
  }

  @Post('razorpay/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Legacy alias for webhook' })
  async handleLegacyWebhook(
    @Headers('x-webhook-signature') cfSignature: string,
    @Headers('x-webhook-timestamp') cfTimestamp: string,
    @Headers('x-razorpay-signature') legacySignature: string,
    @Req() req: Request,
    @Body() payload: any,
  ) {
    const signature = cfSignature || legacySignature;
    const timestamp = cfTimestamp || '';
    const rawBody = (req as any).rawBody || JSON.stringify(payload);
    return this.paymentsService.handleWebhook(rawBody, signature, timestamp, payload);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal webhook endpoint' })
  async handleUniversalWebhook(
    @Headers('x-webhook-signature') cfSignature: string,
    @Headers('x-webhook-timestamp') cfTimestamp: string,
    @Headers('x-razorpay-signature') legacySignature: string,
    @Req() req: Request,
    @Body() payload: any,
  ) {
    const signature = cfSignature || legacySignature;
    const timestamp = cfTimestamp || '';
    const rawBody = (req as any).rawBody || JSON.stringify(payload);
    return this.paymentsService.handleWebhook(rawBody, signature, timestamp, payload);
  }
}
