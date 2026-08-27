import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Token bắt buộc truyền audience để chống token bị dùng chéo Client ID
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: google_id, name, picture } = payload;

    // Chốt chặn bảo mật bắt buộc tại Backend cho domain .edu.vn
    if (!email || !email.endsWith(".edu.vn")) {
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản không hợp lệ. Vui lòng sử dụng Email sinh viên (.edu.vn)!",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    // Xử lý Race Condition bằng upsert theo email (Unique)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        google_id,
        avatar: picture,
        last_active_at: new Date(),
      },
      create: {
        email,
        google_id,
        full_name: name,
        avatar: picture,
        karma_balance: 100, // Bonus 100 Karma khởi tạo
        level_id: 1,
        is_verified: true,
        status: "ACTIVE",
        last_active_at: new Date(),
      },
      include: { level: true },
    });

    if (!existingUser) {
      await prisma.adminNotification.create({
        data: {
          type: "USER_REGISTERED",
          title: "Người dùng mới đăng ký",
          message: `${user.full_name} (${user.email}) vừa tạo tài khoản.`,
          user_id: user.user_id,
        },
      });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị cấm!",
      });
    }

    // Cấp JWT thời hạn 7 ngày phù hợp cho quy trình mượn đồ dài ngày
    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, level_id: user.level_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Lưu Token vào HttpOnly Cookie chặn XSS (JavaScript ở client không thể truy cập)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      user,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(401).json({
      success: false,
      message: "Xác thực Google thất bại hoặc Token không hợp lệ",
    });
  }
};

// Trả về thông tin user hiện tại từ HttpOnly Cookie (dùng cho middleware frontend)
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.user_id },
      include: { level: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("accessToken");
  return res.status(200).json({ success: true, message: "Đã đăng xuất" });
};
