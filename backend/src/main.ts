import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Enable CORS
  const allowedOrigins = process.env.CORS_ORIGIN
    ? [process.env.CORS_ORIGIN, 'http://localhost:3000']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Static uploads serving
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Aamadappetti Jewellery - Admin & CMS API')
    .setDescription('NestJS + PostgreSQL backend for Panchaloham Temple Jewellery e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Admin Authentication', 'Admin login and session token verification')
    .addTag('Products Management', 'Sacred jewellery catalog CRUD and stock management')
    .addTag('CMS - Hero Slides', 'Hero carousel slides management')
    .addTag('CMS - Story Banners', 'Promotional & heritage banners')
    .addTag('CMS - Announcements', 'Top notification bar & promotional banners')
    .addTag('CMS - FAQs', 'Frequently Asked Questions management')
    .addTag('Public CMS (Storefront)', 'Optimized aggregated public endpoints')
    .addTag('Categories Management', 'Sacred jewellery collections & categories')
    .addTag('Orders Management', 'Fulfillment & sacred consecration tracking')
    .addTag('Devotees & Users Management', 'Devotee directory and order history')
    .addTag('Blog & Articles Management', 'Temple crafts & Vedic metallurgy articles')
    .addTag('Admin Dashboard & Analytics', 'Aggregated metrics and store performance')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`====================================================`);
  logger.log(`🚀 Jewellery CMS Backend running at: http://localhost:${port}`);
  logger.log(`📖 Swagger API Documentation:       http://localhost:${port}/api/docs`);
  logger.log(`====================================================`);
}

bootstrap();
