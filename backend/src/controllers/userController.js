import {
  getAllLevels as fetchAllLevels,
  adjustUserKarmaAndLevel,
  calculateProgress,
  syncUserLevel,
} from '../services/levelService.js';
import prisma from '../utils/prisma.js';

/**
 * API Lên / Xuống Level & Điều chỉnh Karma
 * Endpoint: POST /api/users/level/adjust
 */
export const adjustUserLevel = async (req, res) => {
  try {
    const { amount, action, targetLevelId, reason, user_id } = req.body;
    // Cho phép admin chỉ định user_id, hoặc mặc định người dùng hiện tại
    const targetUserId = user_id || req.user?.user_id;

    if (!targetUserId) {
      return res.status(401).json({
        success: false,
        message: 'Không xác định được danh tính người dùng.',
      });
    }

    const result = await adjustUserKarmaAndLevel(targetUserId, {
      amount: amount !== undefined ? Number(amount) : undefined,
      action,
      targetLevelId: targetLevelId !== undefined ? Number(targetLevelId) : undefined,
      reason: reason || 'Yêu cầu điều chỉnh cấp độ / Karma',
    });

    let message = 'Cập nhật điểm Karma thành công.';
    if (result.change_type === 'LEVEL_UP') {
      message = `Chúc mừng! Bạn đã thăng hạng lên cấp "${result.current_level.level_name}"!`;
    } else if (result.change_type === 'LEVEL_DOWN') {
      message = `Cảnh báo: Cấp độ của bạn đã hạ xuống "${result.current_level.level_name}".`;
    }

    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    console.error('Adjust User Level Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể điều chỉnh cấp độ người dùng.',
    });
  }
};

/**
 * Lấy danh sách tất cả các Level và quyền lợi
 * Endpoint: GET /api/users/levels
 */
export const getLevels = async (req, res) => {
  try {
    const levels = await fetchAllLevels();
    return res.status(200).json({
      success: true,
      levels,
    });
  } catch (error) {
    console.error('Get Levels Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách cấp độ.',
    });
  }
};

/**
 * Lấy trạng thái Level chi tiết của User hiện tại
 * Endpoint: GET /api/users/level/status
 */
export const getUserLevelStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    // Đồng bộ nếu có sự sai lệch trước khi trả về
    const user = await syncUserLevel(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng.',
      });
    }

    const allLevels = await fetchAllLevels();
    const progress = calculateProgress(user.karma_balance, user.level, allLevels);

    return res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        karma_balance: user.karma_balance,
        level: user.level,
        all_levels: allLevels,
        progress,
      },
    });
  } catch (error) {
    console.error('Get User Level Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải thông tin cấp độ của người dùng.',
    });
  }
};
