import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('FCM Push Notifications Module (E2E)', () => {
  let app: INestApplication;
  const dummyToken = 'fcm-dummy-test-token-1234567890';

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

  it('GET /api/notifications/status - should return FCM service status', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/notifications/status')
      .expect(200);

    expect(res.body).toHaveProperty('isInitialized');
    expect(res.body).toHaveProperty('activeDeviceTokens');
    expect(res.body).toHaveProperty('service', 'Firebase Cloud Messaging (FCM)');
  });

  it('POST /api/notifications/register-token - should register an admin device token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/notifications/register-token')
      .send({
        token: dummyToken,
        deviceName: 'Admin Pixel Test Device',
        platform: 'android',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.totalTokens).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /api/notifications/register-token - should deregister an admin device token', async () => {
    const res = await request(app.getHttpServer())
      .delete('/api/notifications/register-token')
      .send({ token: dummyToken })
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
