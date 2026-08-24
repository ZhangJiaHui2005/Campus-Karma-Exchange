import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  // Ưu tiên lấy token từ HttpOnly Cookie, fallback sang Bearer Header nếu cần
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token hết hạn hoặc không hợp lệ!' });
  }
};
