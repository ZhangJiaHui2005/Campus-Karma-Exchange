const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Có lỗi xảy ra.');
  return data;
};

export const getPaymentHistory = () => request('/payments/history');

export const createKarmaTopup = (payload) => request('/payments/karma-topup', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const confirmKarmaTopup = async (orderCode) => {
  const response = await fetch(`${API_URL}/payments/karma-topup/confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderCode }),
  });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || 'Có lỗi xảy ra.');
    err.cancelled = data.cancelled;
    err.failed = data.failed;
    throw err;
  }
  return data;
};

export const getCurrentMembership = () => request('/memberships/current');

export const createMembership = (payload) => request('/memberships', {
  method: 'POST',
  body: JSON.stringify(payload),
});