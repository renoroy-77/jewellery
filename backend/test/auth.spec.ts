import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin Authentication & Session (E2E / Jest)', () => {
  let app: INestApplication;
  let adminToken: string;

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

  describe('POST /api/auth/admin-login', () => {
    it('should successfully authenticate with valid credentials (admin / admin123)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/admin-login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('admin');
      expect(res.body.user.role).toBe('SUPERADMIN');
      adminToken = res.body.token;
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/admin-login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toContain('Invalid admin credentials');
    });

    it('should reject login with empty payload', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/admin-login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify session with valid Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.valid).toBe(true);
      expect(res.body.user).toBeDefined();
    });

    it('should return 401 if token is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/verify')
        .expect(401);
    });

    it('should return 401 if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token-xyz')
        .expect(401);
    });
  });
});
