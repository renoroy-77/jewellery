import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Categories Module (E2E / Supertest)', () => {
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

  it('GET /api/categories - should return all seeded categories', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/categories')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(7);

    const ganesha = res.body.find((c: any) => c.id === 'ganesha');
    expect(ganesha).toBeDefined();
    expect(ganesha.name).toBe('Ganesha Jewellery');
    expect(ganesha.slug).toBe('ganesha-jewellery');
  });

  it('GET /api/categories/:id - should retrieve a specific category by ID or slug', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/categories/ganesha')
      .expect(200);

    expect(res.body.id).toBe('ganesha');
    expect(res.body.name).toBe('Ganesha Jewellery');
    expect(res.body.description).toBeDefined();
  });

  it('POST /api/categories - should create a new sacred category', async () => {
    const newCategory = {
      id: 'test-navaratna',
      slug: 'test-navaratna',
      name: 'Navaratna Sacred Rings',
      tamilName: 'நவரத்தின மோதிரங்கள்',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      itemCount: 12,
      description: 'Nine planetary celestial gemstones set in Agamic Panchaloham rings.',
    };

    const res = await request(app.getHttpServer())
      .post('/api/categories')
      .send(newCategory)
      .expect(201);

    expect(res.body.id).toBe('test-navaratna');
    expect(res.body.name).toBe('Navaratna Sacred Rings');
    expect(res.body.itemCount).toBe(12);
  });

  it('PUT /api/categories/:id - should update category details', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/categories/test-navaratna')
      .send({
        name: 'Vedic Navaratna Celestial Rings',
        itemCount: 16,
      })
      .expect(200);

    expect(res.body.name).toBe('Vedic Navaratna Celestial Rings');
    expect(res.body.itemCount).toBe(16);
  });

  it('DELETE /api/categories/:id - should delete test category', async () => {
    await request(app.getHttpServer())
      .delete('/api/categories/test-navaratna')
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/categories/test-navaratna')
      .expect(404);
  });

  it('GET /api/categories/unknown-category - should return 404 for unknown category', async () => {
    await request(app.getHttpServer())
      .get('/api/categories/unknown-category-999')
      .expect(404);
  });
});
