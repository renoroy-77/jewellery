import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';

describe('Payments & Razorpay Webhook E2E Integration Tests', () => {
  let app: INestApplication;
  let testOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    // Cleanup any created test order
    if (testOrderId) {
      await request(app.getHttpServer()).delete(`/api/orders/${testOrderId}`);
    }
    await app.close();
  });

  describe('1. Razorpay Order Creation', () => {
    it('POST /api/payments/razorpay/create-order - should create a valid payment order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/razorpay/create-order')
        .send({
          amount: 2499,
          currency: 'INR',
          receipt: 'test_rcpt_101',
          notes: {
            devoteeName: 'Karthik Ramanathan',
            sankalpam: 'Ayushya Homam Blessings',
          },
        })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.amount).toBe(249900); // in paise
      expect(res.body.currency).toBe('INR');
      expect(res.body.keyId).toBeDefined();
    });

    it('POST /api/payments/razorpay/create-order - should reject invalid payload (missing amount)', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/razorpay/create-order')
        .send({
          currency: 'INR',
        })
        .expect(400);
    });
  });

  describe('2. Payment Signature Verification & Order Commitment', () => {
    it('POST /api/payments/razorpay/verify - should verify simulated payment & create database order', async () => {
      testOrderId = `ORD-TEST-${Date.now()}`;

      const res = await request(app.getHttpServer())
        .post('/api/payments/razorpay/verify')
        .send({
          razorpayOrderId: 'order_sim_998877',
          razorpayPaymentId: 'pay_sim_112233',
          razorpaySignature: 'simulated_signature',
          orderData: {
            id: testOrderId,
            devoteeName: 'Meenakshi Sundaram',
            email: 'meenakshi@temple.org',
            phone: '+91 98401 99999',
            shippingAddress: '108 Temple Car Street, Madurai, Tamil Nadu - 625001',
            items: [
              {
                productId: 'prod-01',
                name: 'Lord Ganesha Panchaloham Pendant',
                price: 2499,
                quantity: 1,
              },
            ],
            totalAmount: 2499,
            paymentMethod: 'Razorpay UPI',
          },
        })
        .expect(201);

      expect(res.body.verified).toBe(true);
      expect(res.body.orderId).toBe(testOrderId);
      expect(res.body.paymentId).toBe('pay_sim_112233');

      // Verify the order was committed in PostgreSQL
      const fetchRes = await request(app.getHttpServer())
        .get(`/api/orders/${testOrderId}`)
        .expect(200);

      expect(fetchRes.body.id).toBe(testOrderId);
      expect(fetchRes.body.status).toBe('Confirmed');
      expect(fetchRes.body.devoteeName).toBe('Meenakshi Sundaram');
      expect(fetchRes.body.trackingNumber).toBe('pay_sim_112233');
    });

    it('POST /api/payments/razorpay/verify - should reject mismatched HMAC signature on live order IDs', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/razorpay/verify')
        .send({
          razorpayOrderId: 'order_live_999888',
          razorpayPaymentId: 'pay_live_777666',
          razorpaySignature: 'completely_invalid_hash_signature',
        })
        .expect(400);
    });
  });

  describe('3. Razorpay Webhook Event Processing', () => {
    it('POST /api/payments/razorpay/webhook - should handle payment.captured and advance order status', async () => {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_demo';
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_live_5566',
              amount: 249900,
              currency: 'INR',
              order_id: 'order_sim_998877',
              notes: {
                orderId: testOrderId,
              },
            },
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const res = await request(app.getHttpServer())
        .post('/api/payments/razorpay/webhook')
        .set('x-razorpay-signature', signature)
        .send(webhookPayload)
        .expect(200);

      expect(res.body.received).toBe(true);
      expect(res.body.event).toBe('payment.captured');

      // Verify status progressed to Processing in PostgreSQL
      const orderCheck = await request(app.getHttpServer())
        .get(`/api/orders/${testOrderId}`)
        .expect(200);

      expect(orderCheck.body.status).toBe('Processing');
      expect(orderCheck.body.trackingNumber).toBe('pay_webhook_live_5566');
    });

    it('POST /api/payments/razorpay/webhook - should reject invalid webhook signature', async () => {
      const webhookPayload = {
        event: 'payment.failed',
        payload: {},
      };

      await request(app.getHttpServer())
        .post('/api/payments/razorpay/webhook')
        .set('x-razorpay-signature', 'forged_invalid_signature_hash')
        .send(webhookPayload)
        .expect(400);
    });
  });
});
