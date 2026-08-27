DO $$
BEGIN
  CREATE TYPE "PaymentPurpose" AS ENUM ('KARMA_TOPUP', 'MEMBERSHIP');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "MembershipPlanType" AS ENUM ('KARMA_PASS');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "MembershipPaymentMethod" AS ENUM ('PAYOS', 'KARMA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Transaction" (
  "trans_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("trans_id")
);

CREATE TABLE IF NOT EXISTS "Payments" (
  "payment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" INTEGER NOT NULL,
  "amount_vnd" INTEGER NOT NULL,
  "karma_received" INTEGER NOT NULL DEFAULT 0,
  "payment_gateway" TEXT NOT NULL,
  "transaction_ref" TEXT NOT NULL,
  "purpose" "PaymentPurpose" NOT NULL,
  "status" "PaymentStatus" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paid_at" TIMESTAMP(3),
  CONSTRAINT "Payments_pkey" PRIMARY KEY ("payment_id"),
  CONSTRAINT "Payments_transaction_ref_key" UNIQUE ("transaction_ref"),
  CONSTRAINT "Payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Memberships" (
  "membership_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" INTEGER NOT NULL,
  "payment_id" UUID,
  "plan_type" "MembershipPlanType" NOT NULL,
  "payment_method" "MembershipPaymentMethod" NOT NULL,
  "karma_cost" INTEGER,
  "price_vnd" INTEGER,
  "start_at" TIMESTAMP(3) NOT NULL,
  "end_at" TIMESTAMP(3) NOT NULL,
  "status" "MembershipStatus" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Memberships_pkey" PRIMARY KEY ("membership_id"),
  CONSTRAINT "Memberships_payment_id_key" UNIQUE ("payment_id"),
  CONSTRAINT "Memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "Memberships_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payments" ("payment_id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Insurance_Fund_Logs" (
  "log_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "trans_id" UUID NOT NULL,
  "amount_karma" INTEGER NOT NULL,
  "rate_pct" DECIMAL(65,30) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Insurance_Fund_Logs_pkey" PRIMARY KEY ("log_id"),
  CONSTRAINT "Insurance_Fund_Logs_trans_id_fkey" FOREIGN KEY ("trans_id") REFERENCES "Transaction" ("trans_id") ON UPDATE CASCADE ON DELETE RESTRICT
);
