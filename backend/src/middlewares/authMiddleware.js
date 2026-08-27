import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export default async (req, res, next) => {
  // Ưu tiên lấy token từ HttpOnly Cookie, fallback sang Bearer Header nếu cần
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Yêu cầu đăng nhập!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
      select: { user_id: true, status: true },
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Không tìm thấy người dùng!" });
    }
    if (user.status === "BANNED") {
      return res
        .status(403)
        .json({ success: false, message: "Tài khoản của bạn đã bị cấm!" });
    }
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { last_active_at: new Date() },
    });
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Token hết hạn hoặc không hợp lệ!" });
  }
};
