import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Blog & Articles Module (E2E / Supertest)', () => {
  let app: INestApplication;
  let testPostId: string;

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

  it('GET /api/blog - should return all published blog posts', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blog')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const first = res.body[0];
    expect(first.title).toBeDefined();
    expect(first.authorName).toBeDefined();
    expect(first.slug).toBeDefined();
  });

  it('GET /api/blog/:slug - should retrieve blog post by slug', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/blog/alchemical-secrets-of-panchaloham')
      .expect(200);

    expect(res.body.slug).toBe('alchemical-secrets-of-panchaloham');
    expect(res.body.title).toContain('Secret Vedic Ratios');
  });

  it('POST /api/blog - should create and publish a new blog post', async () => {
    const newPost = {
      id: 'post-test-temple',
      title: 'Significance of Murugan Vel Talismans in Tamil Agamas',
      subtitle: 'Spear of Wisdom and Spiritual Protection',
      excerpt: 'Exploring the sacred symbology and metallurgical casting of the divine Vel.',
      category: 'TEMPLE TRADITIONS',
      authorName: 'Dr. Subramanian Sastri',
      authorRole: 'Agama Scholar',
      likes: 18,
      featured: true,
    };

    const res = await request(app.getHttpServer())
      .post('/api/blog')
      .send(newPost)
      .expect(201);

    expect(res.body.id).toBe('post-test-temple');
    expect(res.body.title).toBe('Significance of Murugan Vel Talismans in Tamil Agamas');
    expect(res.body.slug).toBeDefined();
    testPostId = res.body.id;
  });

  it('PUT /api/blog/:id - should update blog post details and likes', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/blog/${testPostId}`)
      .send({
        likes: 25,
        subtitle: 'Updated Divine Spear of Wisdom',
      })
      .expect(200);

    expect(res.body.likes).toBe(25);
    expect(res.body.subtitle).toBe('Updated Divine Spear of Wisdom');
  });

  it('DELETE /api/blog/:id - should delete blog post', async () => {
    await request(app.getHttpServer())
      .delete(`/api/blog/${testPostId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/blog/${testPostId}`)
      .expect(404);
  });

  it('GET /api/blog/non-existent-article-slug - should return 404 for unknown article', async () => {
    await request(app.getHttpServer())
      .get('/api/blog/non-existent-article-slug-404')
      .expect(404);
  });
});
