import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CMS & Content Management (E2E / Jest)', () => {
  let app: INestApplication;
  let testSlideId: number;
  let testFaqId: string;

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

  describe('Hero Slides', () => {
    it('GET /api/cms/hero-slides - should return seeded hero slides', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cms/hero-slides')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('POST /api/cms/hero-slides - should create a new hero slide', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cms/hero-slides')
        .send({
          kicker: 'JEST TEST KICKER',
          titleLine1: 'Test Title 1',
          titleLine2: 'Test Title 2',
          subtitle: 'Test slide subtitle description.',
          image: '/assets/test.png',
          mobileImage: '/assets/test.png',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.titleLine1).toBe('Test Title 1');
      testSlideId = res.body.id;
    });

    it('DELETE /api/cms/hero-slides/:id - should delete the hero slide', async () => {
      await request(app.getHttpServer())
        .delete(`/api/cms/hero-slides/${testSlideId}`)
        .expect(200);
    });
  });

  describe('Story Banners & Announcements', () => {
    it('GET /api/cms/story-banners - should return story banners', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cms/story-banners')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/cms/announcements - should return active announcement', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cms/announcements')
        .expect(200);

      expect(res.body.freeShippingText).toBeDefined();
      expect(res.body.authenticityText).toBeDefined();
    });

    it('PUT /api/cms/announcements - should update announcement bar', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/cms/announcements')
        .send({ freeShippingText: 'Free Insured Express Shipping Across India' })
        .expect(200);

      expect(res.body.freeShippingText).toBe('Free Insured Express Shipping Across India');
    });
  });

  describe('FAQs & Storefront Aggregator', () => {
    it('GET /api/cms/faqs - should return seeded FAQs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cms/faqs')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(5);
    });

    it('POST /api/cms/faqs - should create an FAQ item', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cms/faqs')
        .send({
          question: 'Are Panchaloham rings suitable for astrological wear?',
          answer: 'Yes, Vedic astrology recommends 5-metal rings for balancing planetary energies.',
          category: 'astrology',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testFaqId = res.body.id;
    });

    it('DELETE /api/cms/faqs/:id - should delete FAQ item', async () => {
      await request(app.getHttpServer())
        .delete(`/api/cms/faqs/${testFaqId}`)
        .expect(200);
    });

    it('GET /api/cms/storefront - should return aggregated active content', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cms/storefront')
        .expect(200);

      expect(res.body.heroSlides).toBeDefined();
      expect(res.body.storyBanners).toBeDefined();
      expect(res.body.announcement).toBeDefined();
      expect(res.body.faqs).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
