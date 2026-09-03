import crypto from "crypto";
import prisma from "../utils/prisma.js";

const QR_SECRET = process.env.QR_SECRET || "campus_karma_qr_default_secret_2026";
const QR_EXPIRES_SECONDS = 60; // 60s hết hạn chống replay

/**
 * Helper: Tạo chữ ký HMAC-SHA256
 */
function signPayload(payload) {
  return crypto
    .createHmac("sha256", QR_SECRET)
    .update(payload)
    .digest("hex");
}

/**
 * 1. POST /api/transactions
 * Tạo giao dịch mới (Borrower yêu cầu mượn)
 * Thực hiện Escrow: Khóa số Karma của borrower (ACID Transaction)
 */
export const createTransaction = async (req, res) => {
  try {
    const borrower_id = req.user.user_id;
    const { item_id, due_date } = req.body;

    if (!item_id || !due_date) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp item_id và due_date (hạn trả)!",
      });
    }

    // 1. Kiểm tra vật phẩm
    const item = await prisma.item.findUnique({
      where: { item_id: parseInt(item_id) },
      include: {
        owner: {
          select: {
            user_id: true,
            full_name: true,
            karma_balance: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Không tìm thấy vật phẩm!" });
    }

    if (item.owner_id === borrower_id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể mượn vật phẩm do chính mình đăng!",
      });
    }

    if (item.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: `Vật phẩm hiện không khả dụng (Trạng thái: ${item.status})!`,
      });
    }

    // 2. Lấy thông tin Borrower và Level để tính cọc
    const borrower = await prisma.user.findUnique({
      where: { user_id: borrower_id },
      include: { level: true },
    });

    const discountPct = borrower.level?.deposit_discount_pct ?? 0;
    const karma_amount = item.karma_value;
    const deposit_amount = item.type === "GIVE" ? 0 : Math.ceil(karma_amount * (1 - discountPct / 100));
    const totalRequired = karma_amount + deposit_amount;

    if (borrower.karma_balance < totalRequired) {
      return res.status(400).json({
        success: false,
        message: `Bạn không đủ Karma! Cần ${totalRequired} (Phí: ${karma_amount} + Cọc: ${deposit_amount}), hiện có ${borrower.karma_balance}.`,
      });
    }

    // 3. Thực hiện ACID Transaction
    const result = await prisma.$transaction(async (tx) => {
      // a. Trừ Karma tạm khóa từ Borrower
      await tx.user.update({
        where: { user_id: borrower_id },
        data: { karma_balance: { decrement: totalRequired } },
      });

      // b. Khóa trạng thái Item thành BORROWED
      await tx.item.update({
        where: { item_id: parseInt(item_id) },
        data: { status: "BORROWED" },
      });

      // c. Tạo bản ghi Transaction với trạng thái ESCROW_LOCKED
      const newTransaction = await tx.transaction.create({
        data: {
          item_id: parseInt(item_id),
          lender_id: item.owner_id,
          borrower_id: borrower_id,
          karma_amount,
          deposit_amount,
          status: "ESCROW_LOCKED",
          due_date: new Date(due_date),
        },
        include: {
          item: true,
          lender: { select: { user_id: true, full_name: true, email: true, avatar: true } },
          borrower: { select: { user_id: true, full_name: true, email: true, avatar: true } },
        },
      });

      // d. Tạo bản ghi EscrowLog
      await tx.escrowLog.create({
        data: {
          trans_id: newTransaction.trans_id,
          user_id: borrower_id,
          locked_karma: totalRequired,
          status: "LOCKED",
        },
      });

      return newTransaction;
    });

    return res.status(201).json({
      success: true,
      message: "Tạo giao dịch và khóa điểm Karma (Escrow) thành công!",
      data: result,
    });
  } catch (error) {
    console.error("createTransaction error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo giao dịch!",
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/transactions
 * Lấy danh sách giao dịch của user đang đăng nhập
 */
export const getMyTransactions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { role, status } = req.query; // role: 'lender' | 'borrower'

    const where = {};
    if (role === "lender") {
      where.lender_id = user_id;
    } else if (role === "borrower") {
      where.borrower_id = user_id;
    } else {
      where.OR = [{ lender_id: user_id }, { borrower_id: user_id }];
    }

    if (status) {
      where.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        item: { include: { category: true } },
        lender: { select: { user_id: true, full_name: true, email: true, avatar: true } },
        borrower: { select: { user_id: true, full_name: true, email: true, avatar: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("getMyTransactions error:", error);
    return res.status(500).json({ success: false, message: "Lỗi tải giao dịch!", error: error.message });
  }
};

/**
 * 3. GET /api/transactions/:id
 * Lấy chi tiết một giao dịch
 */
export const getTransactionById = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const trans_id = parseInt(req.params.id);

    const transaction = await prisma.transaction.findUnique({
      where: { trans_id },
      include: {
        item: { include: { category: true } },
        lender: { select: { user_id: true, full_name: true, email: true, avatar: true } },
        borrower: { select: { user_id: true, full_name: true, email: true, avatar: true } },
        escrowLogs: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch!" });
    }

    if (transaction.lender_id !== user_id && transaction.borrower_id !== user_id) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem giao dịch này!" });
    }

    return res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error("getTransactionById error:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi lấy chi tiết giao dịch!", error: error.message });
  }
};

/**
 * 4. GET /api/transactions/:id/qr
 * Sinh mã QR động có HMAC và TTL (Người cho mượn - Lender hiển thị mã này)
 */
export const generateQRCode = async (req, res) => {
  try {
    const lender_id = req.user.user_id;
    const trans_id = parseInt(req.params.id);

    const transaction = await prisma.transaction.findUnique({
      where: { trans_id },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch!" });
    }

    if (transaction.lender_id !== lender_id) {
      return res.status(403).json({
        success: false,
        message: "Chỉ người cho mượn mới có quyền hiển thị mã QR để bàn giao!",
      });
    }

    if (transaction.status !== "ESCROW_LOCKED") {
      return res.status(400).json({
        success: false,
        message: `Không thể sinh QR ở trạng thái ${transaction.status}!`,
      });
    }

    const expiresAt = Date.now() + QR_EXPIRES_SECONDS * 1000;
    const payload = `${trans_id}:${lender_id}:${transaction.borrower_id}:${expiresAt}`;
    const signature = signPayload(payload);
    const token = Buffer.from(JSON.stringify({ payload, signature })).toString("base64");

    const qrHash = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.transaction.update({
      where: { trans_id },
      data: { qr_code_hash: qrHash },
    });

    return res.status(200).json({
      success: true,
      data: {
        token,
        expires_at: expiresAt,
        expires_in: QR_EXPIRES_SECONDS,
      },
    });
  } catch (error) {
    console.error("generateQRCode error:", error);
    return res.status(500).json({ success: false, message: "Lỗi sinh mã QR!", error: error.message });
  }
};

/**
 * 5. POST /api/transactions/:id/verify-qr
 * Người mượn quét mã QR của Lender để xác nhận đã nhận đồ
 * Giải phóng Karma phí mượn chuyển cho Lender
 */
export const verifyQRCode = async (req, res) => {
  try {
    const borrower_id = req.user.user_id;
    const trans_id = parseInt(req.params.id);
    const { qr_token } = req.body;

    if (!qr_token) {
      return res.status(400).json({ success: false, message: "Vui lòng quét hoặc nhập mã QR!" });
    }

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(qr_token, "base64").toString("utf-8"));
    } catch {
      return res.status(400).json({ success: false, message: "Mã QR không đúng định dạng!" });
    }

    const { payload, signature } = decoded;
    if (!payload || !signature) {
      return res.status(400).json({ success: false, message: "Dữ liệu QR bị thiếu!" });
    }

    const expectedSig = signPayload(payload);
    if (signature !== expectedSig) {
      return res.status(400).json({ success: false, message: "Mã QR giả mạo hoặc không hợp lệ!" });
    }

    const [tIdStr, lIdStr, bIdStr, expStr] = payload.split(":");
    const tokenTransId = parseInt(tIdStr);
    const tokenBorrowerId = parseInt(bIdStr);
    const expiresAt = parseInt(expStr);

    if (tokenTransId !== trans_id) {
      return res.status(400).json({ success: false, message: "Mã QR không khớp với giao dịch này!" });
    }

    if (tokenBorrowerId !== borrower_id) {
      return res.status(403).json({ success: false, message: "Bạn không phải người mượn của giao dịch này!" });
    }

    if (Date.now() > expiresAt) {
      return res.status(400).json({ success: false, message: "Mã QR đã hết hạn! Hãy nhờ người cho mượn mở lại mã mới." });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { trans_id },
      include: { lender: true },
    });

    if (!transaction || transaction.status !== "ESCROW_LOCKED") {
      return res.status(400).json({
        success: false,
        message: "Giao dịch không ở trạng thái chờ quét QR!",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Cộng Karma phí mượn cho Lender
      await tx.user.update({
        where: { user_id: transaction.lender_id },
        data: { karma_balance: { increment: transaction.karma_amount } },
      });

      // Cập nhật trạng thái giao dịch
      const updatedTrans = await tx.transaction.update({
        where: { trans_id },
        data: {
          status: "QR_VERIFIED",
          qr_code_hash: null, // Xóa hash chống dùng lại
        },
      });

      // Cập nhật EscrowLog
      await tx.escrowLog.updateMany({
        where: { trans_id, status: "LOCKED" },
        data: { status: "RELEASED" },
      });

      return updatedTrans;
    });

    return res.status(200).json({
      success: true,
      message: `Xác thực QR thành công! Đã bàn giao đồ và chuyển ${transaction.karma_amount} Karma cho người cho mượn.`,
      data: result,
    });
  } catch (error) {
    console.error("verifyQRCode error:", error);
    return res.status(500).json({ success: false, message: "Lỗi xác thực QR!", error: error.message });
  }
};

/**
 * 6. POST /api/transactions/:id/return
 * Lender xác nhận đã nhận lại đồ đầy đủ -> Hoàn tiền cọc (deposit) cho Borrower
 */
export const confirmReturn = async (req, res) => {
  try {
    const lender_id = req.user.user_id;
    const trans_id = parseInt(req.params.id);

    const transaction = await prisma.transaction.findUnique({
      where: { trans_id },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch!" });
    }

    if (transaction.lender_id !== lender_id) {
      return res.status(403).json({ success: false, message: "Chỉ người cho mượn mới có quyền xác nhận nhận lại đồ!" });
    }

    if (transaction.status !== "QR_VERIFIED") {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể xác nhận trả đồ khi đang ở trạng thái QR_VERIFIED (Hiện tại: ${transaction.status})!`,
      });
    }

    await prisma.$transaction(async (tx) => {
      // Hoàn tiền cọc cho borrower nếu có cọc
      if (transaction.deposit_amount > 0) {
        await tx.user.update({
          where: { user_id: transaction.borrower_id },
          data: { karma_balance: { increment: transaction.deposit_amount } },
        });
      }

      // Mở lại trạng thái Item thành AVAILABLE
      await tx.item.update({
        where: { item_id: transaction.item_id },
        data: { status: "AVAILABLE" },
      });

      // Đánh dấu giao dịch COMPLETED
      await tx.transaction.update({
        where: { trans_id },
        data: { status: "COMPLETED" },
      });

      // Cập nhật EscrowLog
      await tx.escrowLog.updateMany({
        where: { trans_id },
        data: { status: "REFUNDED" },
      });
    });

    return res.status(200).json({
      success: true,
      message: `Đã xác nhận trả đồ! Hoàn trả ${transaction.deposit_amount} Karma cọc cho người mượn và hoàn tất giao dịch.`,
    });
  } catch (error) {
    console.error("confirmReturn error:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi xác nhận trả đồ!", error: error.message });
  }
};

/**
 * 7. POST /api/transactions/:id/cancel
 * Hủy giao dịch (khi chưa bàn giao) -> Hoàn lại 100% Karma đã khóa
 */
export const cancelTransaction = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const trans_id = parseInt(req.params.id);

    const transaction = await prisma.transaction.findUnique({
      where: { trans_id },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch!" });
    }

    if (transaction.lender_id !== user_id && transaction.borrower_id !== user_id) {
      return res.status(403).json({ success: false, message: "Bạn không thuộc giao dịch này!" });
    }

    if (transaction.status !== "PENDING" && transaction.status !== "ESCROW_LOCKED") {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy giao dịch ở trạng thái ${transaction.status}!`,
      });
    }

    const refundKarma = transaction.karma_amount + transaction.deposit_amount;

    await prisma.$transaction(async (tx) => {
      // Hoàn lại Karma cho Borrower
      await tx.user.update({
        where: { user_id: transaction.borrower_id },
        data: { karma_balance: { increment: refundKarma } },
      });

      // Mở lại Item
      await tx.item.update({
        where: { item_id: transaction.item_id },
        data: { status: "AVAILABLE" },
      });

      // Cập nhật trạng thái CANCELLED
      await tx.transaction.update({
        where: { trans_id },
        data: { status: "CANCELLED" },
      });

      // Cập nhật EscrowLog
      await tx.escrowLog.updateMany({
        where: { trans_id, status: "LOCKED" },
        data: { status: "REFUNDED" },
      });
    });

    return res.status(200).json({
      success: true,
      message: `Đã hủy giao dịch thành công. Hoàn lại ${refundKarma} Karma cho người mượn.`,
    });
  } catch (error) {
    console.error("cancelTransaction error:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi hủy giao dịch!", error: error.message });
  }
};
