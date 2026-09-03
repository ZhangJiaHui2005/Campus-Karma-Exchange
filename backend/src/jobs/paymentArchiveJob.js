import cron from "node-cron";
import prisma from "../utils/prisma.js";

const SUCCESS_ARCHIVE_DAYS = 30;
const FINAL_PAYMENT_DELETE_DAYS = 14;

export const archiveAndDeletePayments = async (
  db = prisma,
  now = new Date(),
) => {
  const archiveBefore = new Date(
    now.getTime() - SUCCESS_ARCHIVE_DAYS * 24 * 60 * 60 * 1000,
  );
  const deleteBefore = new Date(
    now.getTime() - FINAL_PAYMENT_DELETE_DAYS * 24 * 60 * 60 * 1000,
  );

  const archived = await db.payments.updateMany({
    where: {
      purpose: "KARMA_TOPUP",
      status: "SUCCESS",
      archived_at: null,
      created_at: { lte: archiveBefore },
    },
    data: { archived_at: now },
  });
  const deleted = await db.payments.deleteMany({
    where: {
      purpose: "KARMA_TOPUP",
      status: { in: ["FAILED", "CANCELLED"] },
      created_at: { lte: deleteBefore },
    },
  });

  return { archived: archived.count, deleted: deleted.count };
};

export const startPaymentArchiveJob = () => {
  const task = cron.schedule("0 * * * *", async () => {
    try {
      const result = await archiveAndDeletePayments();
      if (result.archived || result.deleted) {
        console.log(
          `Archived ${result.archived} payment(s), deleted ${result.deleted} expired payment(s).`,
        );
      }
    } catch (error) {
      console.error("Payment archive job failed:", error);
    }
  });

  void archiveAndDeletePayments().catch((error) => {
    console.error("Initial payment archive check failed:", error);
  });

  return task;
};
