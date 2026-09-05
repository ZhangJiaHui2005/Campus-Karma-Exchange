import express from "express";
import {
  adminLogin,
  createAdminAccount,
  adminLogout,
  getAdminMe,
  getAdminDashboard,
  getAdminUsers,
  getAdminItems,
  getAdminActivity,
  getAdminBorrowRequests,
  updateUserBanStatus,
  approveAdminUser,
  approveAdminItem,
  deleteAdminItem,
  approveAdminBorrowRequest,
  deleteAdminBorrowRequest,
  deleteAdminUser,
  getAdminNotifications,
  deleteAdminNotification,
  getAdminPayments,
  getAdminSystemReport,
  getAdminPendingApprovals,
} from "../controllers/adminController.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/create", createAdminAccount);
router.post("/logout", adminLogout);
router.get("/me", adminMiddleware, getAdminMe);
router.get("/dashboard", adminMiddleware, getAdminDashboard);
router.get("/pending-approvals", adminMiddleware, getAdminPendingApprovals);
router.get("/users", adminMiddleware, getAdminUsers);
router.patch("/users/:id/ban", adminMiddleware, updateUserBanStatus);
router.patch("/users/:id/approve", adminMiddleware, approveAdminUser);
router.delete("/users/:id", adminMiddleware, deleteAdminUser);
router.get("/notifications", adminMiddleware, getAdminNotifications);
router.delete("/notifications/:id", adminMiddleware, deleteAdminNotification);
router.get("/payments", adminMiddleware, getAdminPayments);
router.get("/system-report", adminMiddleware, getAdminSystemReport);
router.get("/items", adminMiddleware, getAdminItems);
router.patch("/items/:id/approve", adminMiddleware, approveAdminItem);
router.delete("/items/:id", adminMiddleware, deleteAdminItem);
router.get("/activity", adminMiddleware, getAdminActivity);
router.get("/borrow-requests", adminMiddleware, getAdminBorrowRequests);
router.patch(
  "/borrow-requests/:id/approve",
  adminMiddleware,
  approveAdminBorrowRequest,
);
router.delete(
  "/borrow-requests/:id",
  adminMiddleware,
  deleteAdminBorrowRequest,
);

export default router;
