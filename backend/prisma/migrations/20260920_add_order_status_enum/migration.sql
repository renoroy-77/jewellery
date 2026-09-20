-- Custom migration: Add OrderStatus enum and cast existing data
-- Consecrated rows remapped to Delivered (legacy test data)
UPDATE orders SET status = 'Delivered' WHERE status = 'Consecrated';

CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned');

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING "status"::"OrderStatus";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending'::"OrderStatus";
