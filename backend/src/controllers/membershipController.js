import crypto from "node:crypto";
import prisma from "../utils/prisma.js";
import { createPayOSPaymentLink } from "./paymentController.js";

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const getMembershipDates = (activeMembership, months) => {
  const now = new Date();
  const startAt =
    activeMembership && activeMembership.end_at > now
      ? activeMembership.end_at
      : now;
  return { startAt, endAt: addMonths(startAt, months) };
};

const parseRequest = (body) => {
  const months = Number(body.months);
  const karmaCost = Number(body.karma_cost);
  const priceVnd = Number(body.price_vnd);
  const paymentMethod = body.payment_method;

  if (
    !Number.isInteger(months) ||
    months <= 0 ||
    months > 12 ||
    !["KARMA", "PAYOS"].includes(paymentMethod)
  ) {
    return null;
  }
  if (
    paymentMethod === "KARMA" &&
    (!Number.isInteger(karmaCost) || karmaCost <= 0)
  )
    return null;
  if (
    paymentMethod === "PAYOS" &&
    (!Number.isInteger(priceVnd) || priceVnd <= 0)
  )
    return null;

  return { months, karmaCost, priceVnd, paymentMethod };
};

export const createMembership = async (req, res) => {
  const request = parseRequest(req.body);
  if (!request) {
    return res.status(400).json({
      success: false,
      message: "Gói hoặc phương thức thanh toán không hợp lệ.",
    });
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const activeMembership = await transaction.memberships.findFirst({
        where: { user_id: req.user.user_id, status: "ACTIVE" },
        orderBy: { end_at: "desc" },
      });
      const { startAt, endAt } = getMembershipDates(
        activeMembership,
        request.months,
      );

      if (request.paymentMethod === "KARMA") {
        const updatedUser = await transaction.user.updateMany({
          where: {
            user_id: req.user.user_id,
            karma_balance: { gte: request.karmaCost },
          },
          data: { karma_balance: { decrement: request.karmaCost } },
        });
        if (updatedUser.count === 0) {
          return { insufficientKarma: true };
        }

        const membership = await transaction.memberships.create({
          data: {
            user_id: req.user.user_id,
            plan_type: "KARMA_PASS",
            payment_method: "KARMA",
            karma_cost: request.karmaCost,
            start_at: startAt,
            end_at: endAt,
            status: "ACTIVE",
          },
        });
        return { membership };
      }

      const payment = await transaction.payments.create({
        data: {
          user_id: req.user.user_id,
          amount_vnd: request.priceVnd,
          karma_received: 0,
          payment_gateway: "PAYOS",
          transaction_ref: String(
            `${Date.now()}${crypto.randomInt(10, 100)}`.slice(-15),
          ),
          purpose: "MEMBERSHIP",
          status: "PENDING",
        },
      });
      const membership = await transaction.memberships.create({
        data: {
          user_id: req.user.user_id,
          payment_id: payment.payment_id,
          plan_type: "KARMA_PASS",
          payment_method: "PAYOS",
          price_vnd: request.priceVnd,
          start_at: startAt,
          end_at: endAt,
          status: "PENDING",
        },
      });

      await transaction.adminNotification.create({
        data: {
          type: "PAYMENT_PENDING",
          title: "Thanh toán Karma Pass mới",
          message: `Người dùng đã tạo yêu cầu thanh toán Karma Pass ${request.months} tháng với giá trị ${request.priceVnd.toLocaleString("vi-VN")} VND.`,
          user_id: req.user.user_id,
        },
      });

      return {
        membership,
        payment,
        paymentUrl: await createPayOSPaymentLink({
          ...payment,
          purpose: "MEMBERSHIP",
          membership_months: request.months,
          ip_address: req.ip,
        }),
      };
    });

    if (result.insufficientKarma) {
      return res
        .status(400)
        .json({ success: false, message: "Không đủ Karma để đăng ký gói." });
    }
    return res.status(201).json({
      success: true,
      membership: result.membership,
      ...(result.payment
        ? {
            payment_id: result.payment.payment_id,
            transaction_ref: result.payment.transaction_ref,
            payment_url: result.paymentUrl,
          }
        : {}),
    });
  } catch (error) {
    console.error("Create Membership Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tạo Karma Pass." });
  }
};

export const getCurrentMembership = async (req, res) => {
  try {
    const membership = await prisma.memberships.findFirst({
      where: {
        user_id: req.user.user_id,
        status: { in: ["ACTIVE", "PENDING"] },
      },
      orderBy: { end_at: "desc" },
    });

    return res.json({ success: true, membership });
  } catch (error) {
    console.error("Current Membership Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Không thể tải trạng thái Karma Pass.",
      });
  }
};
