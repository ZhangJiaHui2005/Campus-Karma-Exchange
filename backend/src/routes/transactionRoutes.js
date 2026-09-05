import express from "express";
import {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  generateQRCode,
  verifyQRCode,
  confirmReturn,
  cancelTransaction,
} from "../controllers/transactionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả các routes transaction đều yêu cầu đăng nhập
router.use(authMiddleware);

// CRUD / List
router.post("/", createTransaction);
router.get("/", getMyTransactions);
router.get("/:id", getTransactionById);

// QR Code Flow
router.get("/:id/qr", generateQRCode);
router.post("/:id/verify-qr", verifyQRCode);

// Lifecycle actions
router.post("/:id/return", confirmReturn);
router.post("/:id/cancel", cancelTransaction);

export default router;
