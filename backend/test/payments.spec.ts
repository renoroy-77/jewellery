import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { PaymentsService } from '../src/payments/payments.service';

describe('Payments & Cashfree Webhook E2E Integration Tests', () => {
  let app: INestApplication;
  let testOrderId: string;
  let paymentsService: PaymentsService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();
    paymentsService = app.get(PaymentsService);

    // Obtain admin token for order verification
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin-login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Cashfree Order Creation', () => {
    it('POST /api/payments/cashfree/create-order - should create a valid payment order with session ID', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/cashfree/create-order')
        .send({
          amount: 1899,
          currency: 'INR',
          receipt: `test_rcpt_${Date.now()}`,
          customerDetails: {
            customerId: 'cust_test_101',
            customerName: 'Karthik Ramanathan',
            customerEmail: 'karthik@temple.org',
            customerPhone: '9840123456',
          },
          notes: {
            devoteeName: 'Karthik Ramanathan',
            sankalpam: 'Ayushya Homam Blessings',
          },
        })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(true);
      expect(res.body.orderId).toBeDefined();
      expect(res.body.paymentSessionId).toBeDefined();
      expect(res.body.orderAmount).toBe(1899);
      expect(res.body.currency).toBe('INR');
      expect(res.body.appId).toBeDefined();
    });

    it('POST /api/payments/cashfree/create-order - should reject invalid payload (missing amount)', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/cashfree/create-order')
        .send({
          currency: 'INR',
        })
        .expect(400);
    });
  });

  describe('2. Cashfree Payment Verification & Order Commitment', () => {
    it('POST /api/payments/cashfree/verify - should verify payment & create database order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/cashfree/verify')
        .send({
          orderId: `order_sim_${Date.now()}`,
          cfPaymentId: `cf_pay_sim_${Date.now()}`,
          orderData: {
            devoteeName: 'Meenakshi Sundaram',
            email: 'meenakshi@temple.org',
            phone: '+91 98401 99999',
            shippingAddress: '108 Temple Car Street, Madurai, Tamil Nadu - 625001',
            items: [
              {
                productId: 'prod-001',
                name: 'Lord Ganesha Pendant',
                price: 1899,
                quantity: 1,
              },
            ],
            totalAmount: 1899,
            paymentMethod: 'Cashfree Online',
          },
        })
        .expect(200);

      expect(res.body.verified).toBe(true);
      expect(res.body.orderId).toBeDefined();
      expect(res.body.paymentId).toBeDefined();
      testOrderId = res.body.orderId;

      // Verify the order was committed in PostgreSQL
      const fetchRes = await request(app.getHttpServer())
        .get(`/api/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(fetchRes.body.id).toBe(testOrderId);
      expect(fetchRes.body.status).toBe('Confirmed');
      expect(fetchRes.body.devoteeName).toBe('Meenakshi Sundaram');
    });
  });

  describe('3. Cashfree Webhook Event Processing', () => {
    it('POST /api/payments/cashfree/webhook - should verify signature and process PAYMENT_SUCCESS_WEBHOOK', async () => {
      const secretKey = paymentsService.secretKey;
      const timestamp = Math.floor(Date.now() / 1000).toString();

      const webhookPayload = {
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: {
            order_id: testOrderId,
            order_amount: 1899,
            order_currency: 'INR',
          },
          payment: {
            cf_payment_id: 'cf_live_99887766',
            payment_status: 'SUCCESS',
            payment_amount: 1899,
            payment_currency: 'INR',
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(timestamp + rawBody)
        .digest('base64');

      const res = await request(app.getHttpServer())
        .post('/api/payments/cashfree/webhook')
        .set('Content-Type', 'application/json')
        .set('x-webhook-signature', signature)
        .set('x-webhook-timestamp', timestamp)
        .send(rawBody)
        .expect(200);

      expect(res.body.received).toBe(true);
      expect(res.body.status).toBe('success');

      // Verify status progressed to Processing in PostgreSQL
      const orderCheck = await request(app.getHttpServer())
        .get(`/api/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(orderCheck.body.status).toBe('Processing');
      expect(orderCheck.body.trackingNumber).toBe('cf_live_99887766');
    });

    it('POST /api/payments/cashfree/webhook - should reject invalid webhook signature', async () => {
      const webhookPayload = {
        type: 'PAYMENT_FAILED_WEBHOOK',
        data: {},
      };

      await request(app.getHttpServer())
        .post('/api/payments/cashfree/webhook')
        .set('x-webhook-signature', 'forged_invalid_signature_base64==')
        .set('x-webhook-timestamp', '1727000000')
        .send(webhookPayload)
        .expect(400);
    });
  });
});
