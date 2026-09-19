import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products CRUD Module (E2E / Jest)', () => {
  let app: INestApplication;
  let createdProductId: string;

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

  it('GET /api/products - should return all seeded products', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(6);
    const ganesha = res.body.find((p: any) => p.name.includes('Ganesha'));
    expect(ganesha).toBeDefined();
    expect(ganesha.deity).toBe('Lord Ganesha');
    expect(ganesha.metalGold).toBe('2.5%');
  });

  it('GET /api/products?category=pendants - should filter by category', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/products?category=pendants')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    for (const p of res.body) {
      expect(p.category).toBe('pendants');
    }
  });

  it('POST /api/products - should create a new sacred jewellery product', async () => {
    const newProduct = {
      name: 'Vedic Subramanya Trisulam Pendant',
      deity: 'Lord Murugan',
      category: 'pendants',
      price: 2799,
      originalPrice: 3499,
      description: 'Sacred Agamic Trisulam talisman in Panchaloham.',
      metalGold: '3.0%',
      metalSilver: '13.0%',
      metalCopper: '64.0%',
      metalZinc: '15.0%',
      metalIron: '5.0%',
      inStock: true,
    };

    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send(newProduct)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.slug).toBeDefined();
    expect(res.body.name).toBe(newProduct.name);
    expect(res.body.price).toBe(2799);
    expect(res.body.inStock).toBe(true);

    createdProductId = res.body.id;
  });

  it('GET /api/products/:id - should retrieve created product by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/products/${createdProductId}`)
      .expect(200);

    expect(res.body.id).toBe(createdProductId);
    expect(res.body.name).toBe('Vedic Subramanya Trisulam Pendant');
  });

  it('PUT /api/products/:id - should update product price and description', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/products/${createdProductId}`)
      .send({ price: 2999, description: 'Updated temple description' })
      .expect(200);

    expect(res.body.price).toBe(2999);
    expect(res.body.description).toBe('Updated temple description');
  });

  it('PATCH /api/products/:id/toggle-stock - should toggle stock status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/products/${createdProductId}/toggle-stock`)
      .expect(200);

    expect(res.body.inStock).toBe(false);

    // Toggle back
    const res2 = await request(app.getHttpServer())
      .patch(`/api/products/${createdProductId}/toggle-stock`)
      .expect(200);

    expect(res2.body.inStock).toBe(true);
  });

  it('DELETE /api/products/:id - should remove product from database', async () => {
    await request(app.getHttpServer())
      .delete(`/api/products/${createdProductId}`)
      .expect(200);

    // Confirm it no longer exists
    await request(app.getHttpServer())
      .get(`/api/products/${createdProductId}`)
      .expect(404);
  });

  // =========================================================================
  // PHOTO STORAGE & MEDIA HANDLING INTEGRATION
  // =========================================================================
  describe('Photo Storage & Image Array Persistence in PostgreSQL', () => {
    const photoProductId = 'prod-photo-storage-test';
    const testImages = [
      '/uploads/cms-1726710000-front.webp',
      '/uploads/cms-1726710000-side.webp',
      '/uploads/cms-1726710000-hallmark.png',
    ];

    afterAll(async () => {
      try {
        await request(app.getHttpServer()).delete(`/api/products/${photoProductId}`);
      } catch {}
    });

    it('POST /api/products - should store multiple photo paths in images array in PostgreSQL', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          id: photoProductId,
          name: 'Panchaloham Photo Test Pendant',
          deity: 'Lord Shiva',
          category: 'pendants',
          price: 3200,
          description: 'Testing multiple photo storage persistence in PostgreSQL',
          images: testImages,
        })
        .expect(201);

      expect(res.body.id).toBe(photoProductId);
      expect(Array.isArray(res.body.images)).toBe(true);
      expect(res.body.images).toHaveLength(3);
      expect(res.body.images[0]).toBe(testImages[0]);
      expect(res.body.images[1]).toBe(testImages[1]);
      expect(res.body.images[2]).toBe(testImages[2]);
    });

    it('GET /api/products/:id - should retrieve stored photo URLs from PostgreSQL', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/products/${photoProductId}`)
        .expect(200);

      expect(res.body.images).toEqual(testImages);
      expect(res.body.images[0]).toContain('/uploads/');
    });

    it('DELETE /api/products/:id - should permanently delete product and ensure no mock data returns', async () => {
      // 1. Verify it exists before deletion
      const listBefore = await request(app.getHttpServer()).get('/api/products').expect(200);
      expect(listBefore.body.some((p: any) => p.id === photoProductId)).toBe(true);

      // 2. Delete it
      await request(app.getHttpServer())
        .delete(`/api/products/${photoProductId}`)
        .expect(200);

      // 3. Confirm GET /:id returns 404
      await request(app.getHttpServer())
        .get(`/api/products/${photoProductId}`)
        .expect(404);

      // 4. Confirm GET /api/products no longer contains it
      const listAfter = await request(app.getHttpServer()).get('/api/products').expect(200);
      expect(listAfter.body.some((p: any) => p.id === photoProductId)).toBe(false);

      // 5. Subsequent DELETE must return 404
      await request(app.getHttpServer())
        .delete(`/api/products/${photoProductId}`)
        .expect(404);
    });

    it('GET /api/media - should return media assets array from PostgreSQL', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/media')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
