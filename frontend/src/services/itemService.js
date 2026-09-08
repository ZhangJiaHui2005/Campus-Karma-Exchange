const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const readResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Yêu cầu thất bại");
  return data;
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`, {
    credentials: "include",
  });
  return readResponse(response);
};

export const fetchItems = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      params.set(key, value);
  });

  const response = await fetch(`${API_URL}/items?${params.toString()}`, {
    credentials: "include",
  });
  return readResponse(response);
};

export const fetchItemById = async (itemId) => {
  const response = await fetch(`${API_URL}/items/${itemId}`, {
    credentials: "include",
  });
  return readResponse(response);
};

export const createItem = async (payload) => {
  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body.append(key === "image_file" ? "image" : key, value);
    }
  });

  const response = await fetch(`${API_URL}/items`, {
    method: "POST",
    credentials: "include",
    body,
  });
  return readResponse(response);
};

export const fetchMyItems = async (status = "") => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);

  const response = await fetch(`${API_URL}/items/mine?${params.toString()}`, {
    credentials: "include",
  });
  return readResponse(response);
};

export const uploadItemImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/items/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return readResponse(response);
};

export const updateItem = async (itemId, payload) => {
  const response = await fetch(`${API_URL}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return readResponse(response);
};

export const deleteItem = async (itemId) => {
  const response = await fetch(`${API_URL}/items/${itemId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return readResponse(response);
};
