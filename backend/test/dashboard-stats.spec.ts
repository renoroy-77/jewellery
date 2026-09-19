import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin Dashboard Statistics (E2E / Supertest)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/dashboard/stats - should return comprehensive aggregated store metrics', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/stats')
      .expect(200);

    expect(res.body.metrics).toBeDefined();
    const { metrics } = res.body;

    // Metrics validation
    expect(metrics.totalRevenue).toBeGreaterThan(0);
    expect(metrics.totalOrders).toBeGreaterThanOrEqual(4);
    expect(metrics.totalProducts).toBeGreaterThanOrEqual(6);
    expect(metrics.totalUsers).toBeGreaterThanOrEqual(6);
    expect(metrics.totalCategories).toBeGreaterThanOrEqual(7);
    expect(metrics.totalBlogPosts).toBeGreaterThanOrEqual(2);

    // Recent orders and users arrays
    expect(Array.isArray(res.body.recentOrders)).toBe(true);
    expect(res.body.recentOrders.length).toBeGreaterThanOrEqual(1);

    expect(Array.isArray(res.body.recentUsers)).toBe(true);
    expect(res.body.recentUsers.length).toBeGreaterThanOrEqual(1);

    // Categories array
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.categories.length).toBeGreaterThanOrEqual(7);
  });
});
