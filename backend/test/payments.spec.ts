import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { PaymentsService } from '../src/payments/payments.service';

describe('Payments & PayU Gateway E2E Integration Tests', () => {
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

  describe('1. PayU Order Creation', () => {
    it('POST /api/payments/payu/create-order - should create a valid PayU payment order with hash and actionUrl', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/create-order')
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
      expect(res.body.txnid).toBeDefined();
      expect(res.body.hash).toBeDefined();
      expect(res.body.hash.length).toBe(128); // SHA-512 hex is 128 chars
      expect(res.body.actionUrl).toBeDefined();
      expect(res.body.key).toBeDefined();
      expect(res.body.amount).toBe('1899.00');
    });

    it('POST /api/payments/payu/create-order - should reject invalid payload (missing amount)', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/payu/create-order')
        .send({
          currency: 'INR',
        })
        .expect(400);
    });
  });

  describe('2. PayU Payment Verification & Order Commitment', () => {
    it('POST /api/payments/payu/verify - should verify payment & create database order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/verify')
        .send({
          txnid: `order_sim_${Date.now()}`,
          payuPaymentId: `payu_pay_sim_${Date.now()}`,
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
            paymentMethod: 'PayU Online',
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

  describe('3. PayU Webhook & Response Redirect', () => {
    it('POST /api/payments/payu/webhook - should handle PayU real-time webhook notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/webhook')
        .send({
          txnid: testOrderId,
          mihpayid: 'payu_live_88776655',
          status: 'success',
          amount: 1899,
        })
        .expect(200);

      expect(res.body.received).toBe(true);
      expect(res.body.status).toBe('success');

      // Verify status progressed to Processing in PostgreSQL
      const orderCheck = await request(app.getHttpServer())
        .get(`/api/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(orderCheck.body.status).toBe('Processing');
      expect(orderCheck.body.trackingNumber).toBe('payu_live_88776655');
    });

    it('POST /api/payments/payu/response - should handle surl POST redirect to order-success', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/response')
        .send({
          status: 'success',
          txnid: testOrderId,
          amount: '1899.00',
          mihpayid: 'mih_445566',
        })
        .expect(302);

      expect(res.header.location).toContain('/order-success');
      expect(res.header.location).toContain(testOrderId);
      expect(res.header.location).toContain('method=payu');
    });
  });

  describe('4. Legacy Cashfree Backwards Compatibility', () => {
    it('POST /api/payments/cashfree/create-order - should create order via legacy alias', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/cashfree/create-order')
        .send({
          amount: 1899,
          currency: 'INR',
          receipt: `test_legacy_${Date.now()}`,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.orderId).toBeDefined();
    });

    it('POST /api/payments/cashfree/verify - should verify via legacy alias', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/cashfree/verify')
        .send({
          orderId: `order_sim_${Date.now()}`,
          cfPaymentId: `cf_pay_sim_${Date.now()}`,
        })
        .expect(200);

      expect(res.body.verified).toBe(true);
    });
  });
});
