import { createContext, useContext, useReducer, useCallback } from "react";
import {
  loginApi, registerApi,
  saveAuthData, clearAuthData,
  getToken, getStoredUser,
} from "../api/authService";
import { extractError } from "../utils/helpers";

/**
 * AuthContext — manages JWT auth state.
 *
 * Backend returns only { token } on login/register.
 * We decode the JWT payload to get { id, email, role } for the user object.
 *
 * Register payload:  { username, email, password }
 * Login payload:     { email, password }
 */

const initialState = {
  user:      getStoredUser(),
  token:     getToken(),
  isLoading: false,
  error:     null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":   return { ...state, isLoading: true,  error: null };
    case "AUTH_SUCCESS": return { ...state, isLoading: false, error: null, user: action.user, token: action.token };
    case "AUTH_ERROR":   return { ...state, isLoading: false, error: action.error };
    case "LOGOUT":       return { ...initialState, user: null, token: null };
    case "CLEAR_ERROR":  return { ...state, error: null };
    default: return state;
  }
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (credentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      // Backend returns: { token: "eyJ..." }
      const { data } = await loginApi(credentials);
      const user = saveAuthData(data.token);
      dispatch({ type: "AUTH_SUCCESS", user, token: data.token });
      return { success: true };
    } catch (err) {
      const error = extractError(err);
      dispatch({ type: "AUTH_ERROR", error });
      return { success: false, error };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: "AUTH_START" });
    try {
      // Backend expects: { username, email, password }
      const { data } = await registerApi(userData);
      const user = saveAuthData(data.token);
      dispatch({ type: "AUTH_SUCCESS", user, token: data.token });
      return { success: true };
    } catch (err) {
      const error = extractError(err);
      dispatch({ type: "AUTH_ERROR", error });
      return { success: false, error };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    dispatch({ type: "LOGOUT" });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated: !!state.token,
      login, register, logout, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
};
