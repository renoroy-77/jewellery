-- CreateTable
CREATE TABLE "hero_slides" (
    "id" SERIAL NOT NULL,
    "kicker" TEXT NOT NULL,
    "titleLine1" TEXT NOT NULL,
    "titleLine2" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL DEFAULT 'Shop Now',
    "ctaLink" TEXT NOT NULL DEFAULT '/collections',
    "tag" TEXT NOT NULL DEFAULT 'FAITH IN EVERY DETAIL',
    "image" TEXT NOT NULL,
    "mobileImage" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL DEFAULT 'Explore',
    "ctaLink" TEXT NOT NULL DEFAULT '/collections',
    "image" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "freeShippingText" TEXT NOT NULL DEFAULT 'Free Shipping on Orders Above ₹999',
    "authenticityText" TEXT NOT NULL DEFAULT 'Authentic Panchaloham',
    "worldwideText" TEXT NOT NULL DEFAULT 'Blessings Delivered Worldwide',
    "activePromoAlert" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);
