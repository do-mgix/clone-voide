ALTER TABLE "Order"
ADD COLUMN "paymentProvider" TEXT NOT NULL DEFAULT 'mercadopago',
ADD COLUMN "paymentSessionId" TEXT;

UPDATE "Order"
SET "paymentSessionId" = "preferenceId"
WHERE "preferenceId" IS NOT NULL
  AND "paymentSessionId" IS NULL;
