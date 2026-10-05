import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePayUOrderDto } from './dto/create-payu-order.dto';
import { VerifyPayUPaymentDto } from './dto/verify-payu-payment.dto';
import { CreateCashfreeOrderDto } from './dto/create-cashfree-order.dto';
import { VerifyCashfreePaymentDto } from './dto/verify-cashfree-payment.dto';

@ApiTags('Payments & PayU Gateway')
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ---------------------------------------------------------------------------
  // 1. PayU Primary Endpoints
  // ---------------------------------------------------------------------------
  @Post('payu/create-order')
  @ApiOperation({ summary: 'Create PayU payment order with hash and session for checkout' })
  @ApiResponse({ status: 201, description: 'PayU order created with hash, txnid, and actionUrl' })
  async createPayUOrder(@Body() dto: CreatePayUOrderDto) {
    return this.paymentsService.createPayUOrder(dto);
  }

  @Post('payu/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify PayU payment status and commit order to database' })
  @ApiResponse({ status: 200, description: 'Payment verified and order confirmed' })
  async verifyPayUPayment(@Body() dto: VerifyPayUPaymentDto) {
    return this.paymentsService.verifyPayUPayment(dto);
  }

  @Post('payu/response')
  @ApiOperation({ summary: 'Handle PayU HTTP POST callback from surl / furl redirect' })
  async handlePayUResponse(@Body() body: any, @Res() res: Response) {
    return this.paymentsService.handlePayUResponse(body, res);
  }

  @Post('payu/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayU webhook endpoint for real-time payment notifications' })
  async handlePayUWebhook(@Body() payload: any) {
    return this.paymentsService.handlePayUWebhook(payload);
  }

  // ---------------------------------------------------------------------------
  // 2. Universal Endpoints (Defaults to PayU)
  // ---------------------------------------------------------------------------
  @Post('create-order')
  @ApiOperation({ summary: 'Universal create-order endpoint (defaults to PayU)' })
  async createUniversalOrder(@Body() dto: any) {
    return this.paymentsService.createPayUOrder(dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal verify payment endpoint (defaults to PayU)' })
  async verifyUniversalPayment(@Body() dto: any) {
    return this.paymentsService.verifyPayUPayment(dto);
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

  // ---------------------------------------------------------------------------
  // 3. Backwards Compatibility Aliases (Cashfree & Razorpay)
  // ---------------------------------------------------------------------------
  @Post('cashfree/create-order')
  @ApiOperation({ summary: 'Legacy alias: Create payment order' })
  async createCashfreeOrder(@Body() dto: CreateCashfreeOrderDto) {
    return this.paymentsService.createPayUOrder(dto);
  }

  @Post('cashfree/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Legacy alias: Verify payment' })
  async verifyCashfreePayment(@Body() dto: VerifyCashfreePaymentDto) {
    return this.paymentsService.verifyPayUPayment(dto);
  }

  @Post('cashfree/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Legacy alias: Cashfree webhook' })
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

  @Post('razorpay/create-order')
  @ApiOperation({ summary: 'Legacy alias: Create payment order' })
  async createLegacyOrder(@Body() dto: CreateCashfreeOrderDto) {
    return this.paymentsService.createPayUOrder(dto);
  }

  @Post('razorpay/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Legacy alias: Verify payment' })
  async verifyLegacyPayment(@Body() dto: VerifyCashfreePaymentDto) {
    return this.paymentsService.verifyPayUPayment(dto);
  }

  @Post('razorpay/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Legacy alias: Webhook' })
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
}
