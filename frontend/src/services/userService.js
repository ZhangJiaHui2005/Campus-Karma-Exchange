const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra.');
  }
  return data;
};

/**
 * Lấy danh sách tất cả các cấp độ trong hệ thống
 */
export const getLevels = () => request('/users/levels');

/**
 * Lấy trạng thái cấp độ và tiến trình của người dùng hiện tại
 */
export const getUserLevelStatus = () => request('/users/level/status');

/**
 * API Lên / Xuống Level & Điều chỉnh Karma
 * @param {object} payload { amount, action, targetLevelId, reason }
 */
export const adjustUserLevel = (payload) =>
  request('/users/level/adjust', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
