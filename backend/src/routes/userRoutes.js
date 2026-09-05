import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  adjustUserLevel,
  getLevels,
  getUserLevelStatus,
} from '../controllers/userController.js';

const router = express.Router();

// Lấy danh sách toàn bộ các cấp độ & quyền lợi
router.get('/levels', getLevels);

// Lấy trạng thái cấp độ và tiến trình của người dùng hiện tại
router.get('/level/status', authMiddleware, getUserLevelStatus);

// API điều chỉnh karma và tự động lên/xuống level
router.post('/level/adjust', authMiddleware, adjustUserLevel);

export default router;
