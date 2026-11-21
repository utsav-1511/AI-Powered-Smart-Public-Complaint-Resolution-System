import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("civicresolve.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("civicresolve.token");
    localStorage.removeItem("civicresolve.user");
  }
  return Promise.reject(error);
});

export const apiErrorMessage = (error) => error.response?.data?.message || error.message || "Request failed. Please try again.";
