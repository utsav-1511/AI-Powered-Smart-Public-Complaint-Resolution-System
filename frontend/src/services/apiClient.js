import axios from "axios";

// Keep API configuration in one place for the future Express integration.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
