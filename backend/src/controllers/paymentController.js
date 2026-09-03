import crypto from "node:crypto";
import { PayOS } from "@payos/node";
import prisma from "../utils/prisma.js";
import { syncUserLevel } from "../services/levelService.js";

const getRequiredConfig = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const getPayOS = () =>
  new PayOS({
    clientId: getRequiredConfig("PAYOS_CLIENT_ID"),
    apiKey: getRequiredConfig("PAYOS_API_KEY"),
    checksumKey: getRequiredConfig("PAYOS_CHECKSUM_KEY"),
  });

const createOrderCode = () =>
  Number(`${Date.now()}${crypto.randomInt(10, 100)}`.slice(-15));

export const createPayOSPaymentLink = async (payment) => {
  const orderCode = Number(payment.transaction_ref);
  const result = await getPayOS().paymentRequests.create({
    orderCode,
    amount: payment.amount_vnd,
    description:
      payment.purpose === "MEMBERSHIP"
        ? `Karma Pass ${payment.membership_months} thang`
        : `Nap ${payment.karma_received} Karma`,
    cancelUrl: getRequiredConfig("PAYOS_CANCEL_URL"),
    returnUrl: getRequiredConfig("PAYOS_RETURN_URL"),
  });

  return result.checkoutUrl;
};

export const createKarmaTopup = async (req, res) => {
  try {
    const amountVnd = Number(req.body.amount_vnd);
    const karmaReceived = Number(req.body.karma_received);

    if (
      !Number.isInteger(amountVnd) ||
      amountVnd <= 0 ||
      !Number.isInteger(karmaReceived) ||
      karmaReceived <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "amount_vnd và karma_received phải là số nguyên dương.",
      });
    }

    const transactionRef = String(createOrderCode());
    const payment = await prisma.payments.create({
      data: {
        user_id: req.user.user_id,
        amount_vnd: amountVnd,
        karma_received: karmaReceived,
        payment_gateway: "PAYOS",
        transaction_ref: transactionRef,
        purpose: "KARMA_TOPUP",
        status: "PENDING",
      },
    });
    await prisma.adminNotification.create({
      data: {
        type: "PAYMENT_PENDING",
        title: "Thanh toán mới cần kiểm tra",
        message: `Người dùng đã tạo giao dịch nạp ${karmaReceived} Karma với giá trị ${amountVnd.toLocaleString("vi-VN")} VND.`,
        user_id: req.user.user_id,
      },
    });
    const paymentUrl = await createPayOSPaymentLink({
      ...payment,
      ip_address: req.ip,
    });

    return res.status(201).json({
      success: true,
      payment_id: payment.payment_id,
      transaction_ref: payment.transaction_ref,
      payment_url: paymentUrl,
    });
  } catch (error) {
    console.error("Create Karma Topup Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tạo thanh toán PayOS." });
  }
};

export const processPayOSWebhook = async (webhook) => {
  const webhookData = await getPayOS().webhooks.verify(webhook);
  const transactionRef = String(webhookData.orderCode);
  const paymentStatus = webhookData.code === "00" ? "SUCCESS" : "FAILED";

  return prisma.$transaction(async (transaction) => {
    const payment = await transaction.payments.findUnique({
      where: { transaction_ref: transactionRef },
    });

    if (!payment) return { code: "01", message: "Order not found" };
    if (webhookData.amount !== payment.amount_vnd) {
      return { code: "04", message: "Invalid amount" };
    }
    if (payment.status === "SUCCESS")
      return { code: "00", message: "Already confirmed" };

    const updatedPayments = await transaction.payments.updateMany({
      where: { payment_id: payment.payment_id, status: { not: "SUCCESS" } },
      data: {
        status: paymentStatus,
        paid_at: paymentStatus === "SUCCESS" ? new Date() : null,
      },
    });
    if (updatedPayments.count === 0)
      return { code: "00", message: "Already confirmed" };

    if (paymentStatus === "SUCCESS" && payment.purpose === "KARMA_TOPUP") {
      await transaction.user.update({
        where: { user_id: payment.user_id },
        data: { karma_balance: { increment: payment.karma_received } },
      });
      await syncUserLevel(payment.user_id, transaction);
    }

    if (payment.purpose === "MEMBERSHIP") {
      await transaction.memberships.updateMany({
        where: { payment_id: payment.payment_id, status: "PENDING" },
        data: { status: paymentStatus === "SUCCESS" ? "ACTIVE" : "CANCELLED" },
      });
    }

    return { code: "00", message: "Confirm Success" };
  });
};

export const handlePayOSWebhook = async (req, res) => {
  try {
    const result = await processPayOSWebhook(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("PayOS Webhook Error:", error);
    return res
      .status(400)
      .json({ success: false, message: "Webhook PayOS không hợp lệ." });
  }
};

export const confirmKarmaTopup = async (req, res) => {
  try {
    const { orderCode } = req.body;
    if (!orderCode) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu orderCode." });
    }

    const payment = await prisma.payments.findUnique({
      where: { transaction_ref: String(orderCode) },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy giao dịch." });
    }
    if (payment.user_id !== req.user.user_id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Không có quyền xác nhận giao dịch này.",
        });
    }
    if (payment.status === "SUCCESS") {
      return res.json({
        success: true,
        message: "Giao dịch đã được xác nhận trước đó.",
        alreadyConfirmed: true,
      });
    }

    let payosStatus;
    try {
      const payosResult = await getPayOS().paymentRequests.get(
        Number(orderCode),
      );
      payosStatus = payosResult.status;
    } catch (err) {
      console.error("PayOS Get Payment Error:", err);
      return res
        .status(502)
        .json({
          success: false,
          message: "Không thể xác minh trạng thái từ PayOS.",
        });
    }

    if (payosStatus === "PAID") {
      const result = await prisma.$transaction(async (transaction) => {
        const updated = await transaction.payments.updateMany({
          where: { payment_id: payment.payment_id, status: { not: "SUCCESS" } },
          data: { status: "SUCCESS", paid_at: new Date() },
        });
        if (updated.count === 0) return { alreadyConfirmed: true };

        if (payment.purpose === "KARMA_TOPUP") {
          await transaction.user.update({
            where: { user_id: payment.user_id },
            data: { karma_balance: { increment: payment.karma_received } },
          });
          await syncUserLevel(payment.user_id, transaction);
        }
        if (payment.purpose === "MEMBERSHIP") {
          await transaction.memberships.updateMany({
            where: { payment_id: payment.payment_id, status: "PENDING" },
            data: { status: "ACTIVE" },
          });
        }
        return { alreadyConfirmed: false };
      });
      return res.json({
        success: true,
        message: "Đã cộng Karma vào ví.",
        ...result,
      });
    }

    if (payosStatus === "CANCELLED") {
      await prisma.payments.updateMany({
        where: { payment_id: payment.payment_id, status: { not: "SUCCESS" } },
        data: { status: "CANCELLED" },
      });
      return res
        .status(400)
        .json({
          success: false,
          message: "Giao dịch đã bị hủy.",
          cancelled: true,
        });
    }

    await prisma.payments.updateMany({
      where: { payment_id: payment.payment_id, status: { not: "SUCCESS" } },
      data: { status: "FAILED" },
    });
    return res
      .status(400)
      .json({
        success: false,
        message: "Thanh toán không thành công.",
        failed: true,
      });
  } catch (error) {
    console.error("Confirm Karma Topup Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể xác nhận giao dịch." });
  }
};
