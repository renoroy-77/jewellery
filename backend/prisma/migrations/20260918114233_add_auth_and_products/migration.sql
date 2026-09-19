-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Chief Sthapati',
    "role" TEXT NOT NULL DEFAULT 'SUPERADMIN',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 1,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "metalGold" TEXT NOT NULL DEFAULT '2.5%',
    "metalSilver" TEXT NOT NULL DEFAULT '12.5%',
    "metalCopper" TEXT NOT NULL DEFAULT '65.0%',
    "metalZinc" TEXT NOT NULL DEFAULT '15.0%',
    "metalIron" TEXT NOT NULL DEFAULT '5.0%',
    "purityCertificate" TEXT NOT NULL DEFAULT 'Government Assay Certified',
    "dimensions" TEXT,
    "weight" TEXT,
    "consecrationDetails" TEXT,
    "images" TEXT[],
    "benefits" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
