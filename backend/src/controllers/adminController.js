import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

// 1. POST /api/admin/auth/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    await prisma.admin.update({
      where: { admin_id: admin.admin_id },
      data: { last_login_at: new Date() },
    });

    const token = jwt.sign(
      { admin_id: admin.admin_id, type: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        full_name: admin.full_name,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
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
      return res.status(400).json({ message: 'Email này đã tồn tại' });
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
      message: 'Tạo tài khoản Admin thành công',
      admin: newAdmin,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

// 3. POST /api/admin/auth/logout
export const adminLogout = (req, res) => {
  res.clearCookie('admin_token');
  return res.status(200).json({ message: 'Đã đăng xuất' });
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
      return res.status(404).json({ message: 'Không tìm thấy admin' });
    }

    return res.status(200).json({ admin });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};
