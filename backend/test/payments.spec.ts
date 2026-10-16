import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { PaymentsService } from '../src/payments/payments.service';

describe('Payments & PayU Gateway E2E Integration & Edge Cases Tests', () => {
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

  // ===========================================================================
  // 1. PayU Order Creation & Edge Cases
  // ===========================================================================
  describe('1. PayU Order Creation & Input Edge Cases', () => {
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
      expect(res.body.hash.length).toBe(128); // SHA-512 hex is exactly 128 chars
      expect(res.body.actionUrl).toBeDefined();
      expect(res.body.key).toBeDefined();
      expect(res.body.amount).toBe('1899.00');
    });

    it('POST /api/payments/payu/create-order - EDGE CASE: should reject missing amount with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/payu/create-order')
        .send({
          currency: 'INR',
        })
        .expect(400);
    });

    it('POST /api/payments/payu/create-order - EDGE CASE: should reject non-numeric amount with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/payu/create-order')
        .send({
          amount: 'invalid_amount_string',
          currency: 'INR',
        })
        .expect(400);
    });

    it('POST /api/payments/payu/create-order - EDGE CASE: should normalize international phone numbers and clean names', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/create-order')
        .send({
          amount: 2499,
          currency: 'INR',
          customerDetails: {
            customerName: 'Renoroy <>!@#$ Cherian',
            customerEmail: 'renoroy800@gmail.com',
            customerPhone: '+91 (872) 390-7309',
          },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.phone).toBe('8723907309'); // Normalized to clean 10-digit phone
      expect(res.body.firstname).toBe('Renoroy Cherian'); // Sanitized name
      expect(res.body.amount).toBe('2499.00');
    });

    it('POST /api/payments/payu/create-order - EDGE CASE: should pre-create Pending order if orderData is provided', async () => {
      const customTxnid = `rcpt_pre_${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/create-order')
        .send({
          amount: 1899,
          orderId: customTxnid,
          customerDetails: {
            customerName: 'Sivaram Iyer',
            customerEmail: 'sivaram@temple.org',
            customerPhone: '9840198401',
          },
          orderData: {
            devoteeName: 'Sivaram Iyer',
            email: 'sivaram@temple.org',
            phone: '9840198401',
            shippingAddress: '12 Brahmin Street, Kumbakonam, Tamil Nadu - 612001',
            items: [
              {
                productId: 'prod-001',
                name: 'Lord Ganesha Pendant',
                price: 1899,
                quantity: 1,
              },
            ],
            totalAmount: 1899,
          },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.txnid).toBe(customTxnid);

      // Verify the order was pre-created in database as Pending
      const checkRes = await request(app.getHttpServer())
        .get(`/api/orders/${customTxnid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(checkRes.body.id).toBe(customTxnid);
      expect(checkRes.body.status).toBe('Pending');
      expect(checkRes.body.devoteeName).toBe('Sivaram Iyer');
    });
  });

  // ===========================================================================
  // 2. Cryptographic SHA-512 Hashing & Security Edge Cases
  // ===========================================================================
  describe('2. PayU Cryptographic SHA-512 & Security Edge Cases', () => {
    it('should generate valid PayU forward SHA-512 hash matching official formula', () => {
      const key = 'b3PZ00';
      const salt = 'FeIR86MzjVAk2ZeJC30npwlQFaMEQtnS';
      const txnid = 'ord_test_sample_123';
      const amount = '1.00';
      const productinfo = 'Sacred Temple Jewellery Order';
      const firstname = 'Renoroy';
      const email = 'renoroy800@gmail.com';

      const hash = paymentsService.generatePayUHash({
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        salt,
      });

      const expectedRaw = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
      const expectedHash = crypto.createHash('sha512').update(expectedRaw).digest('hex');

      expect(hash).toBe(expectedHash);
      expect(hash.length).toBe(128);
    });

    it('should verify PayU reverse SHA-512 response hash accurately', () => {
      const key = 'b3PZ00';
      const salt = 'FeIR86MzjVAk2ZeJC30npwlQFaMEQtnS';
      const txnid = 'ord_test_sample_123';
      const amount = '1.00';
      const productinfo = 'Sacred Temple Jewellery Order';
      const firstname = 'Renoroy';
      const email = 'renoroy800@gmail.com';
      const status = 'success';

      const baseString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      const validHash = crypto.createHash('sha512').update(baseString).digest('hex');

      const isValid = paymentsService.verifyPayUResponseHash({
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        salt,
        receivedHash: validHash,
      });

      expect(isValid).toBe(true);
    });

    it('EDGE CASE: should verify PayU reverse hash with additionalCharges (convenience fees)', () => {
      const key = 'b3PZ00';
      const salt = 'FeIR86MzjVAk2ZeJC30npwlQFaMEQtnS';
      const txnid = 'ord_test_sample_456';
      const amount = '100.00';
      const productinfo = 'Devotional Ring';
      const firstname = 'Renoroy';
      const email = 'renoroy800@gmail.com';
      const status = 'success';
      const additionalCharges = '2.50';

      const baseString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      const hashWithCharges = crypto
        .createHash('sha512')
        .update(`${additionalCharges}|${baseString}`)
        .digest('hex');

      const isValid = paymentsService.verifyPayUResponseHash({
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        additionalCharges,
        salt,
        receivedHash: hashWithCharges,
      });

      expect(isValid).toBe(true);
    });

    it('SECURITY EDGE CASE: should REJECT tampered transaction amount (man-in-the-middle attack)', () => {
      const key = 'b3PZ00';
      const salt = 'FeIR86MzjVAk2ZeJC30npwlQFaMEQtnS';
      const txnid = 'ord_test_sample_123';
      const originalAmount = '1899.00';
      const tamperedAmount = '1.00'; // Attacker alters amount
      const productinfo = 'Lord Ganesha Pendant';
      const firstname = 'Renoroy';
      const email = 'renoroy800@gmail.com';
      const status = 'success';

      const baseString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${originalAmount}|${txnid}|${key}`;
      const originalHash = crypto.createHash('sha512').update(baseString).digest('hex');

      // Verifying with tampered amount MUST fail
      const isValid = paymentsService.verifyPayUResponseHash({
        key,
        txnid,
        amount: tamperedAmount,
        productinfo,
        firstname,
        email,
        status,
        salt,
        receivedHash: originalHash,
      });

      expect(isValid).toBe(false);
    });

    it('SECURITY EDGE CASE: should REJECT invalid or corrupted hash', () => {
      const isValid = paymentsService.verifyPayUResponseHash({
        key: 'b3PZ00',
        txnid: 'ord_test_123',
        amount: '1899.00',
        productinfo: 'Test',
        firstname: 'Test',
        email: 'test@test.com',
        status: 'success',
        salt: 'FeIR86MzjVAk2ZeJC30npwlQFaMEQtnS',
        receivedHash: 'invalid_hex_hash_string',
      });

      expect(isValid).toBe(false);
    });
  });

  // ===========================================================================
  // 3. PayU Payment Verification & Order Commitment
  // ===========================================================================
  describe('3. PayU Payment Verification & Database Commitment', () => {
    it('POST /api/payments/payu/verify - should verify payment & create database order with both name & productName', async () => {
      const uniqueTxn = `order_sim_${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/verify')
        .send({
          txnid: uniqueTxn,
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
                productName: 'Lord Ganesha Pendant',
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

      // Verify item names are populated properly without undefined
      expect(fetchRes.body.items).toBeDefined();
      expect(fetchRes.body.items.length).toBeGreaterThan(0);
      const item = fetchRes.body.items[0];
      expect(item.name || item.productName).toBe('Lord Ganesha Pendant');
    });

    it('POST /api/payments/payu/verify - EDGE CASE: should update existing pending order to Confirmed status', async () => {
      // First, create a pending order
      const pendingTxnid = `order_sim_pend_${Date.now()}`;
      await request(app.getHttpServer())
        .post('/api/payments/payu/create-order')
        .send({
          amount: 1899,
          orderId: pendingTxnid,
          customerDetails: {
            customerName: 'Anand Kumar',
            customerEmail: 'anand@temple.org',
            customerPhone: '9876543210',
          },
          orderData: {
            devoteeName: 'Anand Kumar',
            email: 'anand@temple.org',
            phone: '9876543210',
            shippingAddress: 'Anna Nagar, Chennai, Tamil Nadu - 600040',
            items: [
              {
                productId: 'prod-001',
                name: 'Lord Ganesha Pendant',
                price: 1899,
                quantity: 1,
              },
            ],
            totalAmount: 1899,
          },
        })
        .expect(201);

      // Verify payment for this pending order
      const verifyRes = await request(app.getHttpServer())
        .post('/api/payments/payu/verify')
        .send({
          txnid: pendingTxnid,
          payuPaymentId: 'payu_pay_sim_998877',
        })
        .expect(200);

      expect(verifyRes.body.verified).toBe(true);

      // Verify order status updated to Confirmed in database
      const orderCheck = await request(app.getHttpServer())
        .get(`/api/orders/${pendingTxnid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(orderCheck.body.status).toBe('Confirmed');
      expect(orderCheck.body.trackingNumber).toBe('payu_pay_sim_998877');
    });
  });

  // ===========================================================================
  // 4. PayU Response & SURL/FURL Redirects
  // ===========================================================================
  describe('4. PayU Response (surl/furl) Callback & Edge Cases', () => {
    it('POST /api/payments/payu/response - should handle success surl POST and redirect 302 to order-success', async () => {
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

    it('POST /api/payments/payu/response - EDGE CASE: should handle failed payment redirecting 302 to checkout with error', async () => {
      const failedTxnid = `ord_fail_${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/response')
        .send({
          status: 'failure',
          txnid: failedTxnid,
          amount: '1899.00',
          error_Message: 'Bank decline / Insufficient funds',
        })
        .expect(302);

      expect(res.header.location).toContain('/checkout');
      expect(res.header.location).toContain('error=payment_failed');
      expect(res.header.location).toContain('Insufficient');
    });

    it('POST /api/payments/payu/response - EDGE CASE: should automatically create fallback order if order was not pre-created', async () => {
      const upiTxnid = `rcpt_upi_intent_${Date.now()}`;
      const mihpayid = `31329346_${Date.now().toString().slice(-4)}`;

      // PayU sends success callback for an order that did not exist in DB yet
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/response')
        .send({
          status: 'success',
          txnid: upiTxnid,
          amount: '1.00',
          mihpayid,
          firstname: 'Roy K Cherian',
          email: 'renoroy800@gmail.com',
          phone: '8723907309',
          productinfo: 'Sacred Temple Jewellery Order',
          udf1: '8723907309',
          udf2: 'CMENDAMENGALAM - 683513',
        })
        .expect(302);

      expect(res.header.location).toContain('/order-success');
      expect(res.header.location).toContain(upiTxnid);

      // Verify the fallback order was automatically created in PostgreSQL
      const orderCheck = await request(app.getHttpServer())
        .get(`/api/orders/${upiTxnid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(orderCheck.body.id).toBe(upiTxnid);
      expect(orderCheck.body.status).toBe('Confirmed');
      expect(orderCheck.body.totalAmount).toBe(1);
      expect(orderCheck.body.trackingNumber).toBe(mihpayid);
    });
  });

  // ===========================================================================
  // 5. PayU Real-Time Webhook & Edge Cases
  // ===========================================================================
  describe('5. PayU Real-Time Webhooks & Edge Cases', () => {
    it('POST /api/payments/payu/webhook - should handle PayU real-time webhook notification for existing order', async () => {
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

    it('POST /api/payments/payu/webhook - EDGE CASE: should create fallback order when webhook received for new transaction', async () => {
      const webhookTxnid = `rcpt_whk_${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/webhook')
        .send({
          txnid: webhookTxnid,
          mihpayid: 'payu_whk_999111',
          status: 'success',
          amount: 2499,
          firstname: 'Devotee Customer',
          email: 'devotee@temple.org',
          phone: '9840123456',
        })
        .expect(200);

      expect(res.body.received).toBe(true);
      expect(res.body.status).toBe('success');

      // Verify order exists in database
      const orderCheck = await request(app.getHttpServer())
        .get(`/api/orders/${webhookTxnid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(orderCheck.body.id).toBe(webhookTxnid);
      expect(orderCheck.body.totalAmount).toBe(2499);
    });

    it('POST /api/payments/payu/webhook - EDGE CASE: should handle failed webhook status without throwing internal error', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/payu/webhook')
        .send({
          txnid: `ord_fail_${Date.now()}`,
          mihpayid: 'payu_failed_001',
          status: 'failure',
          amount: 100,
        })
        .expect(200);

      expect(res.body.received).toBe(true);
    });
  });

  // ===========================================================================
  // 6. Universal Endpoints & Backwards Compatibility
  // ===========================================================================
  describe('6. Universal Endpoints & Backwards Compatibility', () => {
    it('POST /api/payments/create-order - should route universal endpoint to PayU order creator', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/create-order')
        .send({
          amount: 1899,
          currency: 'INR',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.txnid).toBeDefined();
    });

    it('POST /api/payments/verify - should route universal verify endpoint to PayU verifier', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/verify')
        .send({
          txnid: `order_sim_${Date.now()}`,
          payuPaymentId: `pay_sim_${Date.now()}`,
        })
        .expect(200);

      expect(res.body.verified).toBe(true);
    });

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
