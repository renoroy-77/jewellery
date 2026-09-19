import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Devotees & Users Module (E2E / Supertest)', () => {
  let app: INestApplication;
  let testUserId: string;

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

  it('GET /api/users - should return all devotee registered users', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(6);

    const user = res.body.find((u: any) => u.email.includes('rajesh'));
    expect(user).toBeDefined();
    expect(user.name).toContain('Rajesh');
    expect(user.email).toBe('rajesh.sharma@example.com');
  });

  it('GET /api/users/:id - should retrieve a specific devotee and their order history', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/users/USR-101')
      .expect(200);

    expect(res.body.id).toBe('USR-101');
    expect(res.body.email).toBe('rajesh.sharma@example.com');
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('POST /api/users - should create a new devotee user profile', async () => {
    const newDevotee = {
      id: 'USR-TEST-999',
      name: 'Venkataraman Sastry',
      email: 'venkataraman.s@templetest.org',
      phone: '+91 94440 11223',
      shippingAddress: '7, Car Street, Kumbakonam, Tamil Nadu - 612001',
      memberSince: 'Sep 2026',
    };

    const res = await request(app.getHttpServer())
      .post('/api/users')
      .send(newDevotee)
      .expect(201);

    expect(res.body.id).toBe('USR-TEST-999');
    expect(res.body.name).toBe('Venkataraman Sastry');
    expect(res.body.email).toBe('venkataraman.s@templetest.org');
    testUserId = res.body.id;
  });

  it('PUT /api/users/:id - should update devotee user profile', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/users/${testUserId}`)
      .send({
        name: 'Venkataraman Sastry (Vedic Trustee)',
        phone: '+91 94440 99999',
      })
      .expect(200);

    expect(res.body.name).toBe('Venkataraman Sastry (Vedic Trustee)');
    expect(res.body.phone).toBe('+91 94440 99999');
  });

  it('DELETE /api/users/:id - should delete devotee profile', async () => {
    await request(app.getHttpServer())
      .delete(`/api/users/${testUserId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/users/${testUserId}`)
      .expect(404);
  });

  it('GET /api/users/USR-NONEXISTENT - should return 404 for unknown user ID', async () => {
    await request(app.getHttpServer())
      .get('/api/users/USR-NONEXISTENT')
      .expect(404);
  });
});
