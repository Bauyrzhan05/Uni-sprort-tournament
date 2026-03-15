import axios from "axios";
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from "../utils/constants";

/**
 * Axios instance configured for the Spring Boot backend at :8080/api
 * - Request interceptor: attaches JWT Bearer token from localStorage
 * - Response interceptor: on 401, wipes auth data and redirects to /login
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request: attach JWT ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: handle 401 ──────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Hard redirect so React Router state is also cleared
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
