import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TelegramService } from '../src/telegram/telegram.service';

describe('Orders Module & Edge Cases (E2E / Supertest)', () => {
  let app: INestApplication;
  let telegramService: TelegramService;
  let testOrderId: string;
  let autoOrderId: string;

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

    telegramService = moduleFixture.get<TelegramService>(TelegramService);
  });

  afterAll(async () => {
    await app.close();
  });

  // --- Core Lifecycle & Seed Tests ---
  it('GET /api/orders - should return all seeded orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(4);

    const first = res.body[0];
    expect(first.id).toBeDefined();
    expect(first.devoteeName).toBeDefined();
    expect(first.totalAmount).toBeGreaterThan(0);
  });

  it('GET /api/orders?status=Pending - should filter orders by status', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders?status=Pending')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    for (const order of res.body) {
      expect(order.status.toLowerCase()).toBe('pending');
    }
  });

  it('GET /api/orders?search=Suresh - should search orders by devotee name', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders?search=Suresh')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].devoteeName).toContain('Suresh');
  });

  it('GET /api/orders/ORD-98421 - should retrieve specific order by ID', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders/ORD-98421')
      .expect(200);

    expect(res.body.id).toBe('ORD-98421');
    expect(res.body.devoteeName).toBe('Suresh Narayanan');
  });

  it('POST /api/orders - should create a new devotee sacred order with explicit ID', async () => {
    const newOrder = {
      id: 'ORD-TEST-999',
      devoteeName: 'Sivasankaran Ramanathan',
      email: 'sivasankaran.r@temple.org',
      phone: '+91 98402 99887',
      items: [
        {
          productId: 'prod-002',
          name: 'Lord Murugan Vel Panchaloham Pendant',
          price: 2899,
          quantity: 1,
        },
      ],
      totalAmount: 2899,
      status: 'Pending',
      shippingAddress: '15, Agrahara Street, Madurai, Tamil Nadu - 625001',
      date: '18 Sep 2026',
      paymentMethod: 'UPI Verified',
    };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(newOrder)
      .expect(201);

    expect(res.body.id).toBe('ORD-TEST-999');
    expect(res.body.devoteeName).toBe('Sivasankaran Ramanathan');
    expect(res.body.totalAmount).toBe(2899);
    testOrderId = res.body.id;
  });

  it('PATCH /api/orders/:id/status - should update order status and tracking number', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/orders/${testOrderId}/status`)
      .send({
        status: 'Shipped',
        trackingNumber: 'DTDC-774921-IN',
      })
      .expect(200);

    expect(res.body.status).toBe('Shipped');
    expect(res.body.trackingNumber).toBe('DTDC-774921-IN');
  });

  // --- Edge Cases: Auto-Generated ID ---
  it('Edge Case: POST /api/orders - should automatically generate order ID starting with ORD- when omitted', async () => {
    const orderWithoutId = {
      devoteeName: 'Kavitha Sundaresan',
      email: 'kavitha.s@example.org',
      phone: '+91 94440 88776',
      items: [
        {
          productId: 'prod-001',
          name: 'Lord Ganesha Panchaloham Pendant',
          price: 1899,
          quantity: 1,
        },
      ],
      totalAmount: 1899,
      shippingAddress: '88, North Mada Street, Mylapore, Chennai - 600004',
      paymentMethod: 'NetBanking HDFC',
    };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(orderWithoutId)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.id).toMatch(/^ORD-\d+$/);
    expect(res.body.devoteeName).toBe('Kavitha Sundaresan');
    expect(res.body.status).toBe('Pending');
    autoOrderId = res.body.id;
  });

  // --- Edge Cases: Validation Rejection (400 Bad Request) ---
  it('Edge Case: POST /api/orders - should reject empty body with 400 Bad Request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send({})
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('Edge Case: POST /api/orders - should reject order when devoteeName is missing', async () => {
    const invalidOrder = {
      email: 'test@example.com',
      phone: '+91 99999 99999',
      items: [{ name: 'Item', price: 1000, quantity: 1 }],
      totalAmount: 1000,
      shippingAddress: 'Address',
      paymentMethod: 'UPI',
    };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(invalidOrder)
      .expect(400);

    expect(Array.isArray(res.body.message)).toBe(true);
    expect(res.body.message.some((m: string) => m.includes('devoteeName'))).toBe(true);
  });

  it('Edge Case: POST /api/orders - should reject order when shippingAddress is missing', async () => {
    const invalidOrder = {
      devoteeName: 'Test Devotee',
      email: 'test@example.com',
      phone: '+91 99999 99999',
      items: [{ name: 'Item', price: 1000, quantity: 1 }],
      totalAmount: 1000,
      paymentMethod: 'UPI',
    };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(invalidOrder)
      .expect(400);

    expect(res.body.message.some((m: string) => m.includes('shippingAddress'))).toBe(true);
  });

  it('Edge Case: POST /api/orders - should reject order when totalAmount is non-numeric', async () => {
    const invalidOrder = {
      devoteeName: 'Test Devotee',
      email: 'test@example.com',
      phone: '+91 99999 99999',
      items: [{ name: 'Item', price: 1000, quantity: 1 }],
      totalAmount: 'two thousand',
      shippingAddress: 'Address',
      paymentMethod: 'UPI',
    };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(invalidOrder)
      .expect(400);

    expect(res.body.message.some((m: string) => m.includes('totalAmount'))).toBe(true);
  });

  it('Edge Case: POST /api/orders - should reject order when items is not an array', async () => {
    const invalidOrder = {
      devoteeName: 'Test Devotee',
      email: 'test@example.com',
      phone: '+91 99999 99999',
      items: 'single-item-string',
      totalAmount: 1000,
      shippingAddress: 'Address',
      paymentMethod: 'UPI',
    };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(invalidOrder)
      .expect(400);

    expect(res.body.message.some((m: string) => m.includes('items'))).toBe(true);
  });

  // --- Edge Cases: Status Patching Validation & Not Found ---
  it('Edge Case: PATCH /api/orders/:id/status - should reject when status is missing from body', async () => {
    await request(app.getHttpServer())
      .patch(`/api/orders/${testOrderId}/status`)
      .send({})
      .expect(400);
  });

  it('Edge Case: PATCH /api/orders/NON-EXISTENT/status - should return 404 for unknown order ID', async () => {
    await request(app.getHttpServer())
      .patch('/api/orders/ORD-NONEXISTENT-99999/status')
      .send({ status: 'Delivered' })
      .expect(404);
  });

  // --- Edge Cases: Search & Filtering Queries ---
  it('Edge Case: GET /api/orders?status=NonExistentStatus - should return empty array without error', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders?status=NonExistentStatusXYZ')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('Edge Case: GET /api/orders?search=RandomQueryWithoutMatchesXYZ999 - should return empty array', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders?search=RandomQueryWithoutMatchesXYZ999')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('Edge Case: GET /api/orders?search=special!@#$ - should not crash when query has special characters', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders?search=%21%40%23%24%25')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // --- Edge Cases: Telegram Non-Blocking Resilience ---
  it('Edge Case: POST /api/orders - should succeed even if Telegram notification fails or throws', async () => {
    // Force Telegram service to reject
    const spy = jest
      .spyOn(telegramService, 'sendOrderNotification')
      .mockRejectedValueOnce(new Error('Telegram network outage'));

    const resilientOrder = {
      id: 'ORD-RESILIENT-1',
      devoteeName: 'Balamurugan Swamy',
      email: 'balamurugan@temple.org',
      phone: '+91 94441 22334',
      items: [{ name: 'Shiva Trishul Locket', price: 2199, quantity: 1 }],
      totalAmount: 2199,
      shippingAddress: '55, Sannadhi St, Thiruchendur',
      paymentMethod: 'UPI',
    };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(resilientOrder)
      .expect(201);

    expect(res.body.id).toBe('ORD-RESILIENT-1');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    // Clean up resilient order
    await request(app.getHttpServer())
      .delete('/api/orders/ORD-RESILIENT-1')
      .expect(200);
  });

  // --- Cleanup of created test orders ---
  it('DELETE /api/orders/:id - should delete or cancel test order', async () => {
    await request(app.getHttpServer())
      .delete(`/api/orders/${testOrderId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/orders/${testOrderId}`)
      .expect(404);
  });

  it('DELETE auto-generated order - should delete autoOrderId', async () => {
    if (autoOrderId) {
      await request(app.getHttpServer())
        .delete(`/api/orders/${autoOrderId}`)
        .expect(200);
    }
  });

  it('GET /api/orders/ORD-NONEXISTENT - should return 404 for unknown order ID', async () => {
    await request(app.getHttpServer())
      .get('/api/orders/ORD-NONEXISTENT')
      .expect(404);
  });

  it('POST /api/orders/test-telegram - should return diagnostic status when unconfigured or configured', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/orders/test-telegram')
      .expect(201);

    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('message');
  });

  // =========================================================================
  // FULL ORDER LIFECYCLE SCENARIO (5 SACRED STAGES)
  // =========================================================================
  describe('Full Order Lifecycle Scenario (End-to-End)', () => {
    const lifecycleOrderId = 'ORD-LIFECYCLE-108';

    afterAll(async () => {
      try {
        await request(app.getHttpServer()).delete(`/api/orders/${lifecycleOrderId}`);
      } catch {}
    });

    it('Stage 1 (Creation): Devotee places sacred order (Status: Pending)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: lifecycleOrderId,
          devoteeName: 'Ramesh Sundararajan',
          email: 'ramesh.s@templedevotee.org',
          phone: '+91 98403 11223',
          items: [
            { productId: 'prod-101', name: 'Lord Shiva Trishul Panchaloham Pendant', price: 2499, quantity: 1 },
            { productId: 'prod-102', name: 'Goddess Meenakshi Panchaloham Ring', price: 1899, quantity: 1 },
          ],
          totalAmount: 4398,
          status: 'Pending',
          shippingAddress: '77, Sannadhi Post, Mylapore, Chennai, Tamil Nadu - 600004',
          paymentMethod: 'UPI Verified (Instant)',
        })
        .expect(201);

      expect(res.body.id).toBe(lifecycleOrderId);
      expect(res.body.status).toBe('Pending');
      expect(res.body.totalAmount).toBe(4398);
      expect(res.body.items).toHaveLength(2);
    });

    it('Stage 2 (Consecration): Sanctum Pooja performed by priest (Status: Consecrated)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/orders/${lifecycleOrderId}/status`)
        .send({ status: 'Consecrated' })
        .expect(200);

      expect(res.body.status).toBe('Consecrated');
    });

    it('Stage 3 (Packaging): Sacred silk-lined box packing (Status: Packed)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/orders/${lifecycleOrderId}/status`)
        .send({ status: 'Packed' })
        .expect(200);

      expect(res.body.status).toBe('Packed');
    });

    it('Stage 4 (Courier Dispatch): India Post / BlueDart dispatched (Status: Shipped + Tracking)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/orders/${lifecycleOrderId}/status`)
        .send({
          status: 'Shipped',
          trackingNumber: 'IN-POST-SPEED-884912',
        })
        .expect(200);

      expect(res.body.status).toBe('Shipped');
      expect(res.body.trackingNumber).toBe('IN-POST-SPEED-884912');
    });

    it('Stage 5 (Handover): Sacred delivery completed to devotee (Status: Delivered)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/orders/${lifecycleOrderId}/status`)
        .send({ status: 'Delivered' })
        .expect(200);

      expect(res.body.status).toBe('Delivered');
      expect(res.body.trackingNumber).toBe('IN-POST-SPEED-884912');

      // Verify order state retrieval preserves all lifecycle data
      const getRes = await request(app.getHttpServer())
        .get(`/api/orders/${lifecycleOrderId}`)
        .expect(200);

      expect(getRes.body.status).toBe('Delivered');
      expect(getRes.body.trackingNumber).toBe('IN-POST-SPEED-884912');
      expect(getRes.body.devoteeName).toBe('Ramesh Sundararajan');
    });
  });

  // =========================================================================
  // FULL CANCELLATION SCENARIOS
  // =========================================================================
  describe('Cancellation Scenarios (E2E & Telegram Alerts)', () => {
    const cancelPendingId = 'ORD-CANCEL-PENDING';
    const cancelConsecratedId = 'ORD-CANCEL-CONSECRATED';
    const cancelShippedId = 'ORD-CANCEL-SHIPPED';

    afterAll(async () => {
      for (const id of [cancelPendingId, cancelConsecratedId, cancelShippedId]) {
        try {
          await request(app.getHttpServer()).delete(`/api/orders/${id}`);
        } catch {}
      }
    });

    it('Scenario A: Immediate Cancellation from Pending with reason', async () => {
      // 1. Create order
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: cancelPendingId,
          devoteeName: 'Karthik Subramanian',
          email: 'karthik@example.com',
          phone: '+91 98404 44332',
          items: [{ name: 'Murugan Vel Amulet', price: 1499, quantity: 1 }],
          totalAmount: 1499,
          status: 'Pending',
          shippingAddress: '12, Mada St, Thiruchendur',
          paymentMethod: 'UPI',
        })
        .expect(201);

      // 2. Spy on Telegram alert
      const statusSpy = jest.spyOn(telegramService, 'sendOrderStatusUpdate');

      // 3. Cancel order
      const cancelRes = await request(app.getHttpServer())
        .patch(`/api/orders/${cancelPendingId}/status`)
        .send({
          status: 'Cancelled',
          cancellationReason: 'Devotee shifted to overseas before consecration',
        })
        .expect(200);

      expect(cancelRes.body.status).toBe('Cancelled');
      expect(statusSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: cancelPendingId, status: 'Cancelled' }),
        'Pending',
        'Devotee shifted to overseas before consecration',
      );
      statusSpy.mockRestore();

      // 4. Verify filtered retrieval in Cancelled tab
      const listRes = await request(app.getHttpServer())
        .get('/api/orders?status=Cancelled')
        .expect(200);

      const found = listRes.body.find((o: any) => o.id === cancelPendingId);
      expect(found).toBeDefined();
      expect(found.status).toBe('Cancelled');
    });

    it('Scenario B: In-Flight Cancellation after Consecration (Consecrated -> Cancelled)', async () => {
      // 1. Create order and advance to Consecrated
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: cancelConsecratedId,
          devoteeName: 'Meenakshi Sundaresan',
          email: 'meenakshi@temple.org',
          phone: '+91 94440 99887',
          items: [{ name: 'Lakshmi Panchaloham Idol', price: 7999, quantity: 1 }],
          totalAmount: 7999,
          status: 'Consecrated',
          shippingAddress: '4, Temple Car Street, Madurai',
          paymentMethod: 'NetBanking',
        })
        .expect(201);

      const statusSpy = jest.spyOn(telegramService, 'sendOrderStatusUpdate');

      // 2. Cancel in-flight consecrated order
      const cancelRes = await request(app.getHttpServer())
        .patch(`/api/orders/${cancelConsecratedId}/status`)
        .send({
          status: 'Cancelled',
          cancellationReason: 'Devotee family received identical consecration idol as temple gift',
        })
        .expect(200);

      expect(cancelRes.body.status).toBe('Cancelled');
      expect(statusSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: cancelConsecratedId, status: 'Cancelled' }),
        'Consecrated',
        'Devotee family received identical consecration idol as temple gift',
      );
      statusSpy.mockRestore();
    });

    it('Scenario C: Return / Cancellation after Shipped (Shipped -> Cancelled, retains tracking)', async () => {
      // 1. Create order and mark as Shipped
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: cancelShippedId,
          devoteeName: 'Anand Kumar',
          email: 'anand.k@example.com',
          phone: '+91 98840 12345',
          items: [{ name: 'Panchaloham Rudraksha Mala', price: 3200, quantity: 1 }],
          totalAmount: 3200,
          status: 'Shipped',
          trackingNumber: 'DTDC-RET-449102',
          shippingAddress: '23, Gandhi Road, Coimbatore',
          paymentMethod: 'COD',
        })
        .expect(201);

      // 2. Cancel with return reason
      const cancelRes = await request(app.getHttpServer())
        .patch(`/api/orders/${cancelShippedId}/status`)
        .send({
          status: 'Cancelled',
          cancellationReason: 'Devotee unavailable at address; package returned by courier',
        })
        .expect(200);

      expect(cancelRes.body.status).toBe('Cancelled');
      // Tracking number must be preserved for reverse logistics
      expect(cancelRes.body.trackingNumber).toBe('DTDC-RET-449102');
    });

    it('Scenario D: Permanent Order Deletion and Subsequent 404 Guard', async () => {
      const deleteTargetId = 'ORD-PERMANENT-DELETE-99';

      // 1. Create order
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: deleteTargetId,
          devoteeName: 'Test For Deletion',
          email: 'delete@test.com',
          phone: '+91 90000 00000',
          items: [{ name: 'Test Product', price: 999, quantity: 1 }],
          totalAmount: 999,
          shippingAddress: 'Test St',
          paymentMethod: 'UPI',
        })
        .expect(201);

      // 2. Delete permanently
      await request(app.getHttpServer())
        .delete(`/api/orders/${deleteTargetId}`)
        .expect(200);

      // 3. Subsequent GET must return 404 Not Found
      await request(app.getHttpServer())
        .get(`/api/orders/${deleteTargetId}`)
        .expect(404);

      // 4. Subsequent PATCH status must return 404 Not Found
      await request(app.getHttpServer())
        .patch(`/api/orders/${deleteTargetId}/status`)
        .send({ status: 'Cancelled' })
        .expect(404);

      // 5. Subsequent duplicate DELETE must return 404 Not Found
      await request(app.getHttpServer())
        .delete(`/api/orders/${deleteTargetId}`)
        .expect(404);
    });
  });

  // =========================================================================
  // EXHAUSTIVE EDGE CASES & BOUNDARIES
  // =========================================================================
  describe('Exhaustive Order Edge Cases & Boundary Conditions', () => {
    const edgeOrderId = 'ORD-EDGE-CALC-1';
    const tamilOrderId = 'ORD-EDGE-TAMIL-1';

    afterAll(async () => {
      for (const id of [edgeOrderId, tamilOrderId]) {
        try {
          await request(app.getHttpServer()).delete(`/api/orders/${id}`);
        } catch {}
      }
    });

    it('Edge Case: Multi-Item Calculation with varying quantities and prices', async () => {
      const multiItems = [
        { productId: 'p1', name: 'Lord Ganesha Panchaloham Pendant', price: 1499, quantity: 2 }, // 2998
        { productId: 'p2', name: 'Lord Murugan Vel Panchaloham Locket', price: 2999, quantity: 1 }, // 2999
        { productId: 'p3', name: 'Auspicious Silver Sacred Cord', price: 499, quantity: 3 }, // 1497
      ];
      const calculatedTotal = 2998 + 2999 + 1497; // 7494

      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: edgeOrderId,
          devoteeName: 'Bhakta Somasundaram',
          email: 'somasundaram@temple.org',
          phone: '+91 98411 99881',
          items: multiItems,
          totalAmount: calculatedTotal,
          status: 'Pending',
          shippingAddress: '55, Temple Car St, Kanchipuram, Tamil Nadu - 631502',
          paymentMethod: 'Razorpay UPI',
        })
        .expect(201);

      expect(res.body.totalAmount).toBe(7494);
      expect(res.body.items).toHaveLength(3);
      expect(res.body.items[0].quantity).toBe(2);
      expect(res.body.items[2].quantity).toBe(3);
    });

    it('Edge Case: Unicode, Tamil Script & Devotee Temple Honorifics', async () => {
      const tamilName = 'ஸ்ரீ மகா கணபதி பக்தர் (Sri Maha Ganapathi Bhaktar)';
      const tamilAddress = '108, சந்நிதி வீதி, திருக்கடையூர், மயிலாடுதுறை மாவட்டம், தமிழ்நாடு - 609311';

      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: tamilOrderId,
          devoteeName: tamilName,
          email: 'ganapathi.bhaktar@temple.org',
          phone: '+91 94443 12345',
          items: [{ name: 'பஞ்சலோக கணபதி திருவுருவம் (Panchaloham Ganapathi Idol)', price: 4500, quantity: 1 }],
          totalAmount: 4500,
          status: 'Pending',
          shippingAddress: tamilAddress,
          paymentMethod: 'UPI Verified',
        })
        .expect(201);

      expect(res.body.devoteeName).toBe(tamilName);
      expect(res.body.shippingAddress).toBe(tamilAddress);

      // Verify retrieval matches Tamil Unicode without mojibake
      const getRes = await request(app.getHttpServer())
        .get(`/api/orders/${tamilOrderId}`)
        .expect(200);

      expect(getRes.body.devoteeName).toBe(tamilName);
      expect(getRes.body.shippingAddress).toBe(tamilAddress);
    });

    it('Edge Case: Telegram Failure Resilience during Order Cancellation', async () => {
      // Create order for resilience test
      const tempId = 'ORD-RESILIENT-CANCEL';
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          id: tempId,
          devoteeName: 'Resilience Test Devotee',
          email: 'resilient@test.com',
          phone: '+91 99999 88888',
          items: [{ name: 'Test Pendant', price: 1000, quantity: 1 }],
          totalAmount: 1000,
          shippingAddress: 'Address',
          paymentMethod: 'UPI',
        })
        .expect(201);

      // Force Telegram service to throw network exception
      const spy = jest
        .spyOn(telegramService, 'sendOrderStatusUpdate')
        .mockRejectedValueOnce(new Error('Network timeout reaching Telegram Bot API'));

      // Status update / cancellation MUST NOT fail even if Telegram fails
      const res = await request(app.getHttpServer())
        .patch(`/api/orders/${tempId}/status`)
        .send({
          status: 'Cancelled',
          cancellationReason: 'Devotee cancelled',
        })
        .expect(200);

      expect(res.body.status).toBe('Cancelled');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();

      // Clean up
      await request(app.getHttpServer()).delete(`/api/orders/${tempId}`).expect(200);
    });

    it('Edge Case: Multi-query Filter by Status and Devotee Search Term', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/orders?status=Pending&search=Somasundaram`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0].devoteeName).toContain('Somasundaram');
        expect(res.body[0].status).toBe('Pending');
      }
    });

    it('Edge Case: Reject empty status string in PATCH /api/orders/:id/status', async () => {
      await request(app.getHttpServer())
        .patch(`/api/orders/${edgeOrderId}/status`)
        .send({ status: '' })
        .expect(400);
    });

    it('Edge Case: Reject non-string status in PATCH /api/orders/:id/status', async () => {
      await request(app.getHttpServer())
        .patch(`/api/orders/${edgeOrderId}/status`)
        .send({ status: 999 })
        .expect(400);
    });

    it('Edge Case: Reject invalid phone number format in POST /api/orders', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          devoteeName: 'Test Devotee',
          email: 'test@example.com',
          phone: '12345',
          shippingAddress: 'Chennai, Tamil Nadu',
          items: [{ name: 'Item', price: 1000, quantity: 1 }],
          totalAmount: 1000,
          paymentMethod: 'COD',
        })
        .expect(400);
    });
  });
});
