import { IMAGE_BASE_URL } from "./constants";

/**
 * Format a yyyy-MM-dd string to a readable locale date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};

/**
 * Truncate string to maxLen and append ellipsis
 */
export const truncate = (str, maxLen = 60) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;

/**
 * Build query string from params object, skip falsy values
 */
export const buildQuery = (params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `?${qs}` : "";
};

/**
 * Extract a human-readable error message from Axios error
 */
export const extractError = (err) => {
  if (!err) return "An unexpected error occurred.";
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error)   return err.response.data.error;
  if (typeof err.response?.data === "string") return err.response.data;
  if (err.message) return err.message;
  return "An unexpected error occurred.";
};

/**
 * Get initials from a full name
 */
export const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/**
 * Capitalise first letter
 */
export const capitalise = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Build full image URL from a relative /uploads/... path returned by backend
 * Example: "/uploads/tournaments/abc.jpg" → "http://localhost:8080/uploads/tournaments/abc.jpg"
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE_URL}${path}`;
};

/**
 * Format a prize amount to currency string
 */
export const formatPrize = (amount) => {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
};
