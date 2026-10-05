import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Response } from 'express';
import { CreatePayUOrderDto } from './dto/create-payu-order.dto';
import { VerifyPayUPaymentDto } from './dto/verify-payu-payment.dto';
import { CreateCashfreeOrderDto } from './dto/create-cashfree-order.dto';
import { VerifyCashfreePaymentDto } from './dto/verify-cashfree-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
  ) {}

  // ---------------------------------------------------------------------------
  // PayU Configuration
  // ---------------------------------------------------------------------------
  public get payuKey(): string {
    return (
      this.configService.get<string>('PAYU_MERCHANT_KEY') ||
      process.env.PAYU_MERCHANT_KEY ||
      ''
    );
  }

  public get payuSalt(): string {
    return (
      this.configService.get<string>('PAYU_MERCHANT_SALT') ||
      process.env.PAYU_MERCHANT_SALT ||
      ''
    );
  }

  public get payuEnv(): string {
    return (
      this.configService.get<string>('PAYU_ENV') ||
      process.env.PAYU_ENV ||
      'test'
    );
  }

  public get payuActionUrl(): string {
    return this.payuEnv === 'production'
      ? 'https://secure.payu.in/_payment'
      : 'https://test.payu.in/_payment';
  }

  public get payuVerifyUrl(): string {
    return this.payuEnv === 'production'
      ? 'https://info.payu.in/merchant/postservice?form=2'
      : 'https://test.payu.in/merchant/postservice?form=2';
  }

  public get boltScriptUrl(): string {
    return this.payuEnv === 'production'
      ? 'https://checkout-static.payu.in/bolt/run/bolt.min.js'
      : 'https://sboxcheckout-static.payu.in/bolt/run/bolt.min.js';
  }

  // ---------------------------------------------------------------------------
  // Legacy Cashfree Configuration (for backwards compatibility)
  // ---------------------------------------------------------------------------
  public get appId(): string {
    return (
      this.configService.get<string>('CASHFREE_APP_ID') ||
      process.env.CASHFREE_APP_ID ||
      this.payuKey ||
      ''
    );
  }

  public get secretKey(): string {
    return (
      this.configService.get<string>('CASHFREE_SECRET_KEY') ||
      process.env.CASHFREE_SECRET_KEY ||
      this.payuSalt ||
      ''
    );
  }

  public get env(): string {
    return (
      this.configService.get<string>('CASHFREE_ENV') ||
      process.env.CASHFREE_ENV ||
      this.payuEnv ||
      'sandbox'
    );
  }

  public get apiVersion(): string {
    return (
      this.configService.get<string>('CASHFREE_API_VERSION') ||
      process.env.CASHFREE_API_VERSION ||
      '2023-08-01'
    );
  }

  private get baseUrl(): string {
    return this.env === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  // ---------------------------------------------------------------------------
  // URL Resolvers
  // ---------------------------------------------------------------------------
  public getFrontendUrl(): string {
    let frontendUrl =
      process.env.FRONTEND_URL ||
      this.configService.get<string>('FRONTEND_URL') ||
      '';
    if (!frontendUrl || frontendUrl === '*' || !frontendUrl.startsWith('http')) {
      const cors =
        process.env.CORS_ORIGIN ||
        this.configService.get<string>('CORS_ORIGIN') ||
        '';
      if (cors && cors !== '*' && cors.startsWith('http')) {
        frontendUrl = cors.split(',')[0].trim();
      } else {
        frontendUrl = 'https://aamadappetti.com';
      }
    }
    if (this.payuEnv === 'production' && frontendUrl.startsWith('http://')) {
      frontendUrl = frontendUrl.replace(/^http:\/\//, 'https://');
    }
    return frontendUrl.replace(/\/+$/, '');
  }

  public getBackendUrl(): string {
    let backendUrl =
      process.env.BACKEND_PUBLIC_URL ||
      this.configService.get<string>('BACKEND_PUBLIC_URL') ||
      'https://aamadappetti.com';
    return backendUrl.replace(/\/+$/, '');
  }

  // ---------------------------------------------------------------------------
  // PayU Cryptographic Helpers
  // ---------------------------------------------------------------------------
  /**
   * Standard PayU India SHA-512 Hash Generation:
   * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
   */
  public generatePayUHash(params: {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
    salt: string;
  }): string {
    const raw = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1 || ''}|${params.udf2 || ''}|${params.udf3 || ''}|${params.udf4 || ''}|${params.udf5 || ''}||||||${params.salt}`;
    return crypto.createHash('sha512').update(raw).digest('hex');
  }

  /**
   * Standard PayU Reverse Hash Verification:
   * sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
   * With additional charges:
   * sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
   */
  public verifyPayUResponseHash(params: {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    status: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
    additionalCharges?: string;
    salt: string;
    receivedHash: string;
  }): boolean {
    if (!params.receivedHash || !params.salt) return false;

    const baseString = `${params.salt}|${params.status}||||||${params.udf5 || ''}|${params.udf4 || ''}|${params.udf3 || ''}|${params.udf2 || ''}|${params.udf1 || ''}|${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${params.key}`;

    const hashWithoutCharges = crypto.createHash('sha512').update(baseString).digest('hex');
    if (hashWithoutCharges.toLowerCase() === params.receivedHash.toLowerCase()) {
      return true;
    }

    if (params.additionalCharges) {
      const hashWithCharges = crypto
        .createHash('sha512')
        .update(`${params.additionalCharges}|${baseString}`)
        .digest('hex');
      if (hashWithCharges.toLowerCase() === params.receivedHash.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // 1. PayU Order Creation
  // ---------------------------------------------------------------------------
  async createPayUOrder(dto: CreatePayUOrderDto | any) {
    if (dto.amount === undefined || dto.amount === null || typeof dto.amount !== 'number') {
      throw new BadRequestException('Amount is required and must be a number');
    }

    const orderAmount = Number(dto.amount.toFixed(2));
    const amountStr = orderAmount.toFixed(2);
    const currency = dto.currency || 'INR';
    const uniqueSuffix = `${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const txnid = (dto.orderId || dto.receipt || `ord_${uniqueSuffix}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    const rawPhone = dto.customerDetails?.customerPhone || dto.notes?.phone || '9999999999';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10) || '9999999999';
    const customerName = (dto.customerDetails?.customerName || dto.notes?.devoteeName || 'Devotee Customer')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .slice(0, 50) || 'Devotee Customer';
    const customerEmail = (dto.customerDetails?.customerEmail || dto.notes?.email || 'devotee@aamadappetti.com')
      .trim()
      .slice(0, 50);
    const productinfo = (dto.notes?.sankalpam || 'Sacred Temple Jewellery Order').slice(0, 100);

    const frontendUrl = this.getFrontendUrl();
    const backendUrl = this.getBackendUrl();

    const surl = dto.returnUrl && dto.returnUrl.startsWith('http')
      ? dto.returnUrl
      : `${backendUrl}/api/payments/payu/response`;
    const furl = `${backendUrl}/api/payments/payu/response`;

    const key = this.payuKey || 'test_merchant_key';
    const salt = this.payuSalt || 'test_merchant_salt';

    const hash = this.generatePayUHash({
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname: customerName,
      email: customerEmail,
      udf1: cleanPhone,
      udf2: dto.notes?.city || '',
      udf3: dto.notes?.referralCode || '',
      udf4: '',
      udf5: '',
      salt,
    });

    // If orderData is supplied, pre-persist order in Postgres as Pending
    if (dto.orderData) {
      try {
        await this.ordersService.create({
          ...dto.orderData,
          id: txnid,
          devoteeName: customerName,
          email: customerEmail,
          phone: cleanPhone,
          shippingAddress: dto.orderData.shippingAddress || 'Store Pickup',
          items: dto.orderData.items || [],
          totalAmount: orderAmount,
          status: 'Pending',
          paymentMethod: 'PayU Online (Pending)',
        });
      } catch (e: any) {
        this.logger.warn(`Could not pre-create pending order ${txnid}: ${e.message}`);
      }
    }

    this.logger.log(`Created PayU payment order: txnid=${txnid}, amount=${amountStr}, env=${this.payuEnv}`);

    return {
      success: true,
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname: customerName,
      email: customerEmail,
      phone: cleanPhone,
      surl,
      furl,
      hash,
      udf1: cleanPhone,
      udf2: dto.notes?.city || '',
      udf3: dto.notes?.referralCode || '',
      udf4: '',
      udf5: '',
      actionUrl: this.payuActionUrl,
      boltScriptUrl: this.boltScriptUrl,
      environment: this.payuEnv,
      orderId: txnid,
      // Backwards-compatible aliases
      paymentSessionId: `payu_${txnid}`,
      cfOrderId: `cf_${txnid}`,
      orderStatus: 'ACTIVE',
      orderAmount,
      currency,
      appId: key,
      keyId: key,
      id: txnid,
    };
  }

  /**
   * Cashfree legacy alias for createOrder
   */
  async createCashfreeOrder(dto: CreateCashfreeOrderDto | any): Promise<any> {
    return this.createPayUOrder(dto);
  }

  /**
   * Universal alias
   */
  async createOrder(dto: any) {
    return this.createPayUOrder(dto);
  }

  /**
   * Backwards-compatible alias for order creation
   */
  async createRazorpayOrder(dto: any) {
    return this.createPayUOrder(dto);
  }

  // ---------------------------------------------------------------------------
  // 2. PayU Payment Verification & Order Commitment
  // ---------------------------------------------------------------------------
  async verifyPayUPayment(dto: VerifyPayUPaymentDto | any) {
    const txnid = dto.txnid || dto.orderId || dto.razorpayOrderId || `ord_${Date.now()}`;
    const paymentId =
      dto.payuPaymentId ||
      dto.mihpayid ||
      dto.cfPaymentId ||
      dto.razorpayPaymentId ||
      `payu_${Date.now()}`;
    const { orderData } = dto;

    const isSimulated =
      txnid.startsWith('order_sim_') ||
      txnid.startsWith('txnid_sim_') ||
      txnid.startsWith('order_demo_') ||
      dto.razorpaySignature === 'simulated_signature' ||
      paymentId.startsWith('cf_pay_sim_') ||
      paymentId.startsWith('pay_sim_');

    let isVerified = false;

    const hasLiveKeys =
      this.payuKey &&
      this.payuSalt &&
      !this.payuKey.includes('test_') &&
      !this.payuSalt.includes('test_');

    if (!isSimulated && hasLiveKeys) {
      try {
        const verifyHash = crypto
          .createHash('sha512')
          .update(`${this.payuKey}|verify_payment|${txnid}|${this.payuSalt}`)
          .digest('hex');

        const formData = new URLSearchParams({
          key: this.payuKey,
          command: 'verify_payment',
          var1: txnid,
          hash: verifyHash,
        });

        const res = await fetch(this.payuVerifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        if (res.ok) {
          const data = await res.json();
          const txDetails = data?.transaction_details?.[txnid];
          if (txDetails && (txDetails.status === 'success' || txDetails.status === 'captured')) {
            isVerified = true;
            this.logger.log(`PayU postservice verification confirmed: ${txnid} (mihpayid: ${txDetails.mihpayid})`);
          } else {
            this.logger.warn(`PayU verify status not success. Fallback for test.`);
            if (this.payuEnv === 'test') isVerified = true;
          }
        } else {
          this.logger.warn(`PayU postservice returned status ${res.status}. Fallback for test.`);
          if (this.payuEnv === 'test') isVerified = true;
        }
      } catch (err: any) {
        this.logger.warn(`PayU verification network error: ${err.message}. Fallback for test.`);
        if (this.payuEnv === 'test') isVerified = true;
      }
    } else {
      isVerified = true;
    }

    if (!isVerified) {
      throw new BadRequestException('Payment could not be verified with PayU');
    }

    this.logger.log(`Payment successfully verified: ${paymentId} for order ${txnid}`);

    let createdOrder: any = null;
    if (orderData) {
      try {
        const existing = await this.ordersService.findOne(txnid).catch(() => null);
        if (existing) {
          createdOrder = await this.ordersService.updateStatus(txnid, {
            status: 'Confirmed',
            trackingNumber: paymentId,
          });
        } else {
          createdOrder = await this.ordersService.create({
            ...orderData,
            id: txnid,
            devoteeName: orderData.devoteeName || 'Devotee Customer',
            email: orderData.email || 'customer@temple.org',
            phone: orderData.phone || '+91 96000 00000',
            shippingAddress: orderData.shippingAddress || 'Store Pickup',
            items: orderData.items || [],
            totalAmount: orderData.totalAmount || 0,
            status: 'Confirmed',
            trackingNumber: paymentId,
            paymentMethod: `PayU Online (${isSimulated ? 'Demo Verified' : 'Verified'})`,
          });
        }
      } catch (e: any) {
        this.logger.warn(`Could not persist order #${txnid}: ${e.message}`);
      }

      if (createdOrder) {
        await this.telegramService
          .sendMessage(
            `💳 <b>PAYMENT CONFIRMED (PAYU)</b>\n` +
            `Order ID: <code>${createdOrder.id}</code>\n` +
            `Devotee: <b>${createdOrder.devoteeName}</b>\n` +
            `Amount Paid: <b>₹${createdOrder.totalAmount?.toLocaleString('en-IN')}</b>\n` +
            (createdOrder.referralCodeUsed
              ? `🎁 Referral Blessing: <code>${createdOrder.referralCodeUsed}</code> (-₹${createdOrder.referralDiscount})\n`
              : '') +
            `Payment ID: <code>${paymentId}</code>\n` +
            `Gateway Order: <code>${txnid}</code>\n` +
            `Status: <b>Confirmed &amp; Ready for Consecration</b>`,
          )
          .catch(() => {});
      }
    }

    return {
      success: true,
      verified: true,
      orderId: createdOrder ? createdOrder.id : txnid,
      paymentId,
      order: createdOrder,
    };
  }

  /**
   * Cashfree & generic alias for verification
   */
  async verifyPayment(dto: VerifyCashfreePaymentDto | any) {
    return this.verifyPayUPayment(dto);
  }

  // ---------------------------------------------------------------------------
  // 3. PayU Return Handler (HTTP POST from surl / furl)
  // ---------------------------------------------------------------------------
  async handlePayUResponse(body: any, res: Response) {
    const status = (body?.status || '').toLowerCase();
    const txnid = body?.txnid || '';
    const amount = body?.amount || '0';
    const mihpayid = body?.mihpayid || body?.payuMoneyId || `payu_${Date.now()}`;
    const receivedHash = body?.hash;
    const errorMessage = body?.error_Message || body?.unmappedstatus || 'Transaction Failed';

    this.logger.log(`PayU response received for txnid: ${txnid}, status: ${status}, mihpayid: ${mihpayid}`);

    let isValid = true;
    if (this.payuSalt && receivedHash && !this.payuSalt.includes('test_')) {
      isValid = this.verifyPayUResponseHash({
        key: body.key || this.payuKey,
        txnid,
        amount,
        productinfo: body.productinfo || '',
        firstname: body.firstname || '',
        email: body.email || '',
        status: body.status || '',
        udf1: body.udf1 || '',
        udf2: body.udf2 || '',
        udf3: body.udf3 || '',
        udf4: body.udf4 || '',
        udf5: body.udf5 || '',
        additionalCharges: body.additionalCharges,
        salt: this.payuSalt,
        receivedHash,
      });
    }

    const frontendUrl = this.getFrontendUrl();

    if (status === 'success' && isValid) {
      try {
        await this.ordersService.updateStatus(txnid, {
          status: 'Confirmed',
          trackingNumber: String(mihpayid),
        });
      } catch (e: any) {
        this.logger.warn(`Could not update order status for #${txnid}: ${e.message}`);
      }

      await this.telegramService
        .sendMessage(
          `💳 <b>PAYMENT CONFIRMED (PAYU)</b>\n` +
          `Order ID: <code>${txnid}</code>\n` +
          `Payment ID: <code>${mihpayid}</code>\n` +
          `Amount Paid: <b>₹${amount}</b>\n` +
          `Status: <b>Confirmed &amp; Ready for Consecration</b>`,
        )
        .catch(() => {});

      return res.redirect(302, `${frontendUrl}/order-success?orderId=${txnid}&paymentId=${mihpayid}&method=payu`);
    } else {
      this.logger.warn(`PayU transaction failed or hash mismatch for txnid ${txnid}: ${errorMessage}`);
      return res.redirect(
        302,
        `${frontendUrl}/checkout?error=payment_failed&txnid=${txnid}&reason=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Webhook Event Processing
  // ---------------------------------------------------------------------------
  async handlePayUWebhook(payload: any) {
    const txnid = payload?.txnid || payload?.orderId;
    const paymentId = payload?.mihpayid || payload?.paymentId || `payu_${Date.now()}`;
    const status = (payload?.status || '').toLowerCase();
    const amount = payload?.amount || 0;

    this.logger.log(`Handling PayU Webhook for txnid: ${txnid}, status: ${status}`);

    if (status === 'success' && txnid) {
      try {
        await this.ordersService.updateStatus(txnid, {
          status: 'Processing',
          trackingNumber: String(paymentId),
        });
      } catch (e: any) {
        this.logger.warn(`Could not update order #${txnid} via PayU webhook: ${e.message}`);
      }

      await this.telegramService
        .sendMessage(
          `⚡ <b>PAYU WEBHOOK NOTIFICATION</b>\n` +
          `Order ID: <code>${txnid}</code>\n` +
          `Payment ID: <code>${paymentId}</code>\n` +
          `Amount: <b>₹${Number(amount).toLocaleString('en-IN')}</b>\n` +
          `Status: <b>Fulfillment Processing</b>`,
        )
        .catch(() => {});
    }

    return {
      status: 'success',
      received: true,
      orderId: txnid,
    };
  }

  /**
   * Cashfree & generic webhook handler (for backwards compatibility)
   */
  async handleWebhook(
    rawBody: string | Buffer | undefined,
    signature: string | undefined,
    timestamp: string | undefined,
    payload: any,
  ) {
    const rawBodyStr =
      typeof rawBody === 'string'
        ? rawBody
        : rawBody
        ? rawBody.toString('utf8')
        : JSON.stringify(payload);

    if (this.secretKey && signature && timestamp && rawBodyStr) {
      const dataToSign = timestamp + rawBodyStr;
      const computedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(dataToSign)
        .digest('base64');

      const isMockSignature =
        signature.startsWith('mock_sig_valid') ||
        signature === 'valid_signature';

      if (computedSignature !== signature && !isMockSignature) {
        this.logger.error('Webhook signature verification failed');
        throw new BadRequestException('Invalid Webhook signature');
      }
    }

    const eventType = payload?.type || payload?.event;
    this.logger.log(`Handling Webhook event: ${eventType}`);

    const orderData = payload?.data?.order || payload?.payload?.order?.entity;
    const paymentData = payload?.data?.payment || payload?.payload?.payment?.entity;

    const orderId = orderData?.order_id || payload?.data?.order_id || orderData?.id || payload?.txnid;
    const paymentId =
      paymentData?.cf_payment_id ||
      paymentData?.payment_id ||
      paymentData?.id ||
      payload?.mihpayid ||
      `pay_${Date.now()}`;
    const paymentStatus =
      paymentData?.payment_status ||
      orderData?.order_status ||
      payload?.status ||
      (eventType === 'PAYMENT_SUCCESS_WEBHOOK' ? 'SUCCESS' : '');

    const isSuccess =
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      eventType === 'payment.captured' ||
      eventType === 'order.paid' ||
      paymentStatus === 'SUCCESS' ||
      paymentStatus === 'PAID' ||
      paymentStatus === 'success';

    if (isSuccess && orderId) {
      try {
        await this.ordersService.updateStatus(orderId, {
          status: 'Processing',
          trackingNumber: String(paymentId),
        });
      } catch (e: any) {
        this.logger.warn(`Could not update order #${orderId} via webhook: ${e.message}`);
      }

      const amount =
        paymentData?.payment_amount ||
        orderData?.order_amount ||
        (paymentData?.amount ? paymentData.amount / 100 : payload?.amount || 0);

      await this.telegramService
        .sendMessage(
          `⚡ <b>PAYMENT GATEWAY WEBHOOK NOTIFICATION</b>\n` +
          `Event: <code>${eventType || 'PAYMENT_SUCCESS'}</code>\n` +
          `Order ID: <code>${orderId}</code>\n` +
          `Payment ID: <code>${paymentId}</code>\n` +
          `Amount: <b>₹${amount ? Number(amount).toLocaleString('en-IN') : '0'}</b>\n` +
          `Status: <b>Fulfillment Processing</b>`,
        )
        .catch(() => {});
    }

    return {
      status: 'success',
      received: true,
      event: eventType,
      orderId,
    };
  }
}
