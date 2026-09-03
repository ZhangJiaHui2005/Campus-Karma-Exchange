const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Yêu cầu thất bại");
  }
  return data;
};

export const createTransaction = async (payload) => {
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const fetchMyTransactions = async (params = {}) => {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${API_URL}/transactions?${searchParams.toString()}`, {
    credentials: "include",
  });
  return handleResponse(res);
};

export const fetchTransactionById = async (id) => {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    credentials: "include",
  });
  return handleResponse(res);
};

export const getQRCode = async (id) => {
  const res = await fetch(`${API_URL}/transactions/${id}/qr`, {
    credentials: "include",
  });
  return handleResponse(res);
};

export const verifyQR = async (id, qr_token) => {
  const res = await fetch(`${API_URL}/transactions/${id}/verify-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ qr_token }),
  });
  return handleResponse(res);
};

export const confirmReturn = async (id) => {
  const res = await fetch(`${API_URL}/transactions/${id}/return`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(res);
};

export const cancelTransaction = async (id) => {
  const res = await fetch(`${API_URL}/transactions/${id}/cancel`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(res);
};
