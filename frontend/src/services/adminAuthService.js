const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const adminLogin = async (email, password) => {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Đăng nhập admin thất bại");
  }
  return data;
};

export const fetchAdminMe = async () => {
  const res = await fetch(`${API_URL}/admin/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Lỗi xác thực admin");
  }
  return data.admin;
};

export const adminLogout = async () => {
  await fetch(`${API_URL}/admin/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
};

const adminRequest = async (path, options = {}) => {
  const res = await fetch(`${API_URL}/admin/auth/${path}`, {
    credentials: "include",
    ...options,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Khong the tai du lieu quan tri");
  return data;
};

export const fetchAdminDashboard = () => adminRequest("dashboard");
export const fetchAdminPendingApprovals = () =>
  adminRequest("pending-approvals");
export const fetchAdminUsers = (query = "") =>
  adminRequest(`users${query ? `?q=${encodeURIComponent(query)}` : ""}`);
export const approveAdminUser = (userId) =>
  adminRequest(`users/${userId}/approve`, { method: "PATCH" });
export const approveAdminItem = (itemId) =>
  adminRequest(`items/${itemId}/approve`, { method: "PATCH" });
export const deleteAdminItem = (itemId) =>
  adminRequest(`items/${itemId}`, { method: "DELETE" });
export const approveAdminBorrowRequest = (requestId) =>
  adminRequest(`borrow-requests/${requestId}/approve`, { method: "PATCH" });
export const deleteAdminBorrowRequest = (requestId) =>
  adminRequest(`borrow-requests/${requestId}`, { method: "DELETE" });
export const fetchAdminItems = (query = "") =>
  adminRequest(`items${query ? `?q=${encodeURIComponent(query)}` : ""}`);
export const fetchAdminActivity = () => adminRequest("activity");
export const deleteAdminNotification = (notificationId) =>
  adminRequest(`notifications/${notificationId}`, { method: "DELETE" });
export const fetchAdminPayments = (archived = false) =>
  adminRequest(`payments${archived ? "?archived=true" : ""}`);
export const fetchAdminBorrowRequests = () => adminRequest("borrow-requests");

export const updateAdminUserBanStatus = async (userId, banned) => {
  const res = await fetch(`${API_URL}/admin/auth/users/${userId}/ban`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ banned }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Không thể cập nhật người dùng");
  return data;
};

export const deleteAdminUser = async (userId) => {
  const res = await fetch(`${API_URL}/admin/auth/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Không thể xóa người dùng");
  return data;
};

export const fetchAdminNotifications = () => adminRequest("notifications");
export const fetchAdminSystemReport = () => adminRequest("system-report");
