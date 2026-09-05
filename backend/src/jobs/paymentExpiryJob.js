import cron from "node-cron";
import prisma from "../utils/prisma.js";

export const PAYMENT_EXPIRY_MINUTES = 5;

export const expirePendingPayments = async (db = prisma, now = new Date()) => {
  const expiresBefore = new Date(
    now.getTime() - PAYMENT_EXPIRY_MINUTES * 60 * 1000,
  );
  const result = await db.payments.updateMany({
    where: {
      purpose: "KARMA_TOPUP",
      status: "PENDING",
      created_at: { lte: expiresBefore },
    },
    data: { status: "CANCELLED" },
  });
  return result.count;
};

export const startPaymentExpiryJob = () => {
  const task = cron.schedule("* * * * *", async () => {
    try {
      const expiredCount = await expirePendingPayments();
      if (expiredCount > 0) {
        console.log(`Cancelled ${expiredCount} expired payment(s).`);
      }
    } catch (error) {
      console.error("Payment expiry job failed:", error);
    }
  });

  void expirePendingPayments().catch((error) => {
    console.error("Initial payment expiry check failed:", error);
  });

  return task;
};
