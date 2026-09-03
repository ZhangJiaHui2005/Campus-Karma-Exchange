import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const itemInclude = {
  category: true,
  owner: {
    select: { user_id: true, full_name: true, email: true, avatar: true },
  },
};

const getSince = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// 1. POST /api/admin/auth/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    await prisma.admin.update({
      where: { admin_id: admin.admin_id },
      data: { last_login_at: new Date() },
    });

    const token = jwt.sign(
      { admin_id: admin.admin_id, type: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        full_name: admin.full_name,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// 2. POST /api/admin/auth/create (Tạo Admin mới)
export const createAdminAccount = async (req, res) => {
  const { email, password, full_name } = req.body;

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Email này đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password_hash,
        full_name,
      },
      select: {
        admin_id: true,
        email: true,
        full_name: true,
        created_at: true,
      },
    });

    return res.status(201).json({
      message: "Tạo tài khoản Admin thành công",
      admin: newAdmin,
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// 3. POST /api/admin/auth/logout
export const adminLogout = (req, res) => {
  res.clearCookie("admin_token");
  return res.status(200).json({ message: "Đã đăng xuất" });
};

// 4. GET /api/admin/auth/me
export const getAdminMe = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { admin_id: req.admin.admin_id },
      select: {
        admin_id: true,
        email: true,
        full_name: true,
        last_login_at: true,
        created_at: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "Không tìm thấy admin" });
    }

    return res.status(200).json({ admin });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

export const getAdminDashboard = async (_req, res) => {
  try {
    const since = getSince(7);
    const [
      totalUsers,
      totalItems,
      availableItems,
      newUsers,
      pendingUserCount,
      pendingItemCount,
      pendingRequestCount,
      karma,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.item.count({ where: { status: "AVAILABLE" } }),
      prisma.user.count({ where: { created_at: { gte: since } } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.item.count({ where: { status: "PENDING" } }),
      prisma.borrowRequest.count({ where: { status: "PENDING" } }),
      prisma.user.aggregate({ _sum: { karma_balance: true } }),
    ]);

    const recentItems = await prisma.item.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      include: itemInclude,
    });

    return res.json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_items: totalItems,
        available_items: availableItems,
        pending_requests: pendingRequestCount,
        pending_users: pendingUserCount,
        pending_items: pendingItemCount,
        pending_approvals:
          pendingUserCount + pendingItemCount + pendingRequestCount,
        new_users: newUsers,
        karma_in_circulation: karma._sum.karma_balance || 0,
      },
      recent_items: recentItems,
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the tai tong quan quan tri" });
  }
};

export const getAdminPendingApprovals = async (_req, res) => {
  try {
    const [users, items, borrowRequests] = await Promise.all([
      prisma.user.findMany({
        where: { status: "PENDING" },
        orderBy: { created_at: "desc" },
        select: {
          user_id: true,
          full_name: true,
          email: true,
          created_at: true,
        },
      }),
      prisma.item.findMany({
        where: { status: "PENDING" },
        orderBy: { created_at: "desc" },
        include: itemInclude,
      }),
      prisma.borrowRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { created_at: "desc" },
        include: {
          borrower: { select: { user_id: true, full_name: true, email: true } },
          item: {
            select: {
              item_id: true,
              title: true,
              owner: { select: { full_name: true } },
            },
          },
        },
      }),
    ]);
    return res.json({
      success: true,
      pending: { users, items, borrow_requests: borrowRequests },
    });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải danh sách chờ duyệt" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const query = req.query.q?.trim();
    const where = query
      ? {
          OR: [
            { full_name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined;
    const users = await prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: { level: true, _count: { select: { items: true } } },
    });

    const activeSince = new Date(Date.now() - 5 * 60 * 1000);
    return res.json({
      success: true,
      users: users.map((user) => ({
        ...user,
        is_online:
          user.status !== "BANNED" && user.last_active_at >= activeSince,
      })),
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the tai danh sach nguoi dung" });
  }
};

export const updateUserBanStatus = async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  const banned = req.body.banned === true;
  if (!Number.isInteger(userId) || userId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "ID người dùng không hợp lệ" });
  }

  try {
    const user = await prisma.user.update({
      where: { user_id: userId },
      data: { status: banned ? "BANNED" : "ACTIVE" },
      select: { user_id: true, status: true },
    });
    return res.json({ success: true, user });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }
    console.error("Update user ban status error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái người dùng",
    });
  }
};

export const approveAdminUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { user_id: Number.parseInt(req.params.id, 10) },
      data: { status: "ACTIVE" },
      select: { user_id: true, status: true },
    });
    return res.json({ success: true, user });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    return res
      .status(500)
      .json({ success: false, message: "Không thể duyệt người dùng" });
  }
};

export const approveAdminItem = async (req, res) => {
  try {
    const item = await prisma.item.update({
      where: { item_id: Number.parseInt(req.params.id, 10) },
      data: { status: "AVAILABLE" },
      select: { item_id: true, status: true },
    });
    return res.json({ success: true, item });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đồ dùng" });
    return res
      .status(500)
      .json({ success: false, message: "Không thể duyệt đồ dùng" });
  }
};

export const deleteAdminItem = async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);
  try {
    await prisma.item.delete({ where: { item_id: itemId } });
    return res.json({ success: true, message: "Đã xóa bài đăng" });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài đăng" });
    return res
      .status(500)
      .json({ success: false, message: "Không thể xóa bài đăng" });
  }
};

export const getAdminBorrowRequests = async (_req, res) => {
  try {
    const requests = await prisma.borrowRequest.findMany({
      orderBy: { created_at: "desc" },
      include: {
        borrower: { select: { user_id: true, full_name: true, email: true } },
        item: {
          select: {
            item_id: true,
            title: true,
            karma_value: true,
            owner: { select: { full_name: true } },
          },
        },
      },
    });
    return res.json({ success: true, requests });
  } catch (error) {
    console.error("Get borrow requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải yêu cầu mượn" });
  }
};

export const approveAdminBorrowRequest = async (req, res) => {
  try {
    const request = await prisma.borrowRequest.update({
      where: { request_id: Number.parseInt(req.params.id, 10) },
      data: { status: "APPROVED" },
      select: { request_id: true, status: true },
    });
    return res.json({ success: true, request });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy yêu cầu mượn" });
    return res
      .status(500)
      .json({ success: false, message: "Không thể duyệt yêu cầu mượn" });
  }
};

export const deleteAdminBorrowRequest = async (req, res) => {
  const requestId = Number.parseInt(req.params.id, 10);
  try {
    await prisma.borrowRequest.delete({ where: { request_id: requestId } });
    return res.json({ success: true, message: "Đã xóa yêu cầu mượn" });
  } catch (error) {
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy yêu cầu mượn" });
    return res
      .status(500)
      .json({ success: false, message: "Không thể xóa yêu cầu mượn" });
  }
};

export const deleteAdminUser = async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "ID người dùng không hợp lệ" });
  }

  try {
    const deletedUser = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { full_name: true, email: true },
    });
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }
    await prisma.user.delete({ where: { user_id: userId } });
    await prisma.adminNotification.create({
      data: {
        type: "USER_DELETED",
        title: "Người dùng đã bị xóa",
        message: `${deletedUser.full_name} (${deletedUser.email}) đã bị xóa khỏi hệ thống.`,
        user_id: userId,
      },
    });
    return res.json({ success: true, message: "Đã xóa người dùng" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }
    console.error("Delete admin user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể xóa người dùng" });
  }
};

export const getAdminNotifications = async (_req, res) => {
  try {
    const notifications = await prisma.adminNotification.findMany({
      take: 30,
      orderBy: { created_at: "desc" },
    });
    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể tải thông báo" });
  }
};

export const getAdminSystemReport = async (_req, res) => {
  const startedAt = Date.now();
  const checks = [];
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: "Cơ sở dữ liệu",
      status: "OK",
      message: "Kết nối database ổn định",
    });
  } catch (error) {
    checks.push({
      name: "Cơ sở dữ liệu",
      status: "ERROR",
      message: error.message,
    });
  }
  checks.push({
    name: "API backend",
    status: "OK",
    message: "API đang phản hồi bình thường",
  });
  const failed = checks.filter((check) => check.status === "ERROR");
  return res.json({
    success: true,
    status: failed.length ? "DEGRADED" : "OK",
    response_time_ms: Date.now() - startedAt,
    checked_at: new Date().toISOString(),
    checks,
  });
};

export const getAdminItems = async (req, res) => {
  try {
    const query = req.query.q?.trim();
    const where = query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { owner: { full_name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined;
    const items = await prisma.item.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: itemInclude,
    });

    return res.json({ success: true, items });
  } catch (error) {
    console.error("Get admin items error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the tai danh sach vat pham" });
  }
};

export const getAdminActivity = async (_req, res) => {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6);
    const [posts, users, payments, borrowRequests] = await Promise.all([
      prisma.item.findMany({
        where: { created_at: { gte: since } },
        select: { created_at: true },
      }),
      prisma.user.findMany({
        where: { created_at: { gte: since } },
        select: { created_at: true },
      }),
      prisma.payments.findMany({
        where: { created_at: { gte: since } },
        select: { created_at: true, status: true },
      }),
      prisma.borrowRequest.findMany({
        where: { created_at: { gte: since } },
        select: { created_at: true },
      }),
    ]);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      return {
        date: date.toISOString(),
        posts: posts.filter(
          (item) => item.created_at >= date && item.created_at < next,
        ).length,
        new_users: users.filter(
          (user) => user.created_at >= date && user.created_at < next,
        ).length,
        payments: payments.filter(
          (payment) => payment.created_at >= date && payment.created_at < next,
        ).length,
        successful_payments: payments.filter(
          (payment) =>
            payment.created_at >= date &&
            payment.created_at < next &&
            payment.status === "SUCCESS",
        ).length,
        borrow_requests: borrowRequests.filter(
          (request) => request.created_at >= date && request.created_at < next,
        ).length,
      };
    });

    return res.json({ success: true, activity: days });
  } catch (error) {
    console.error("Get admin activity error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the tai hoat dong" });
  }
};
