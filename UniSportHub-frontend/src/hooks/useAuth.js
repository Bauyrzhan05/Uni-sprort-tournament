import { useAuthContext } from "../context/AuthContext";

/**
 * Convenience hook that exposes the entire auth context.
 * Usage:  const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => useAuthContext();
export default useAuth;
