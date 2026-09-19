import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin Dashboard & Database Integrity (Jest)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should verify all core database entities are active and seeded', async () => {
    const [productsCount, slidesCount, bannersCount, faqsCount, adminCount] =
      await Promise.all([
        prisma.product.count(),
        prisma.heroSlide.count(),
        prisma.storyBanner.count(),
        prisma.faq.count(),
        prisma.adminUser.count(),
      ]);

    expect(productsCount).toBeGreaterThanOrEqual(6);
    expect(slidesCount).toBeGreaterThanOrEqual(3);
    expect(bannersCount).toBeGreaterThanOrEqual(2);
    expect(faqsCount).toBeGreaterThanOrEqual(5);
    expect(adminCount).toBeGreaterThanOrEqual(1);
  });

  it('should verify default admin user exists with SUPERADMIN role', async () => {
    const admin = await prisma.adminUser.findFirst({ where: { username: 'admin' } });
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('SUPERADMIN');
    expect(admin?.email).toBe('admin@aamadappetti.com');
  });

  it('should verify products contain all sacred deity categories', async () => {
    const categories = await prisma.product.findMany({
      select: { category: true, deity: true },
    });

    const categoryNames = categories.map((c) => c.category);
    expect(categoryNames).toContain('pendants');
    expect(categoryNames).toContain('chains');

    const deityNames = categories.map((c) => c.deity);
    expect(deityNames).toContain('Lord Ganesha');
    expect(deityNames).toContain('Lord Murugan');
  });
});
