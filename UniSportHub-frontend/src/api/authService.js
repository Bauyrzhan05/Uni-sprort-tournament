import axiosInstance from "./axiosConfig";
import { ENDPOINTS, TOKEN_KEY, USER_KEY } from "../utils/constants";

/**
 * Auth API — maps to Spring Boot AuthController (/api/auth/*)
 *
 * Backend responses:
 *   POST /auth/register  → AuthResponse { token }
 *   POST /auth/login     → AuthResponse { token }
 *
 * NOTE: The backend AuthResponse only returns { token }.
 * We decode the JWT payload to extract user info (id, email, role).
 */

/** POST /auth/login */
export const loginApi = (credentials) =>
  axiosInstance.post(ENDPOINTS.LOGIN, credentials);
// payload: { email, password }

/** POST /auth/register */
export const registerApi = (userData) =>
  axiosInstance.post(ENDPOINTS.REGISTER, userData);
// payload: { username, email, password }

/**
 * Decode JWT payload (base64url → JSON).
 * Extracts id, email, role stored by JwtService.generateToken().
 */
export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    // base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
};

/** Persist token and decoded user to localStorage */
export const saveAuthData = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  const claims = decodeToken(token);
  // claims: { id, email, role, sub (email), iat, exp }
  const user = {
    id:       claims.id,
    email:    claims.email || claims.sub,
    username: claims.username,
    role:     claims.role,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

/** Remove auth data from localStorage */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/** Read persisted JWT token */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/** Read persisted user object (parsed JSON) */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
