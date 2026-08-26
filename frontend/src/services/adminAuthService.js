const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const adminLogin = async (email, password) => {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đăng nhập admin thất bại');
  }
  return data;
};

export const fetchAdminMe = async () => {
  const res = await fetch(`${API_URL}/admin/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi xác thực admin');
  }
  return data.admin;
};

export const adminLogout = async () => {
  await fetch(`${API_URL}/admin/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};
