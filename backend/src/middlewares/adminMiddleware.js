import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = req.cookies?.admin_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Yêu cầu đăng nhập admin!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token hết hạn hoặc không hợp lệ!' });
  }
};
