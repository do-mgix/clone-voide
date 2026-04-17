-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCompany" TEXT,
ADD COLUMN     "shippingDeadline" INTEGER,
ADD COLUMN     "shippingPriceCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shippingService" TEXT,
ADD COLUMN     "shippingServiceId" INTEGER;
