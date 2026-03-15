import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

/**
 * Wraps authenticated routes.
 * If the user is not authenticated, redirects to /login.
 * Shows a loading screen while auth state is being resolved.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader fullPage text="Loading session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
