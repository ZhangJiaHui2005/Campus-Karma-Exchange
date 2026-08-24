const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Gửi Google ID Token lên backend, backend set HttpOnly Cookie
export const googleLogin = async (token) => {
  const res = await fetch(`${API_URL}/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại');
  }
  return data;
};

// Kiểm tra trạng thái đăng nhập qua HttpOnly Cookie (dùng cho guard)
export const fetchMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi xác thực');
  }
  return data.user;
};

export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};
