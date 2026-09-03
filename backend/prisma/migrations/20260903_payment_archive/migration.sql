ALTER TABLE "Payments" ADD COLUMN "archived_at" TIMESTAMP(3);

CREATE INDEX "Payments_archived_at_idx" ON "Payments"("archived_at");
