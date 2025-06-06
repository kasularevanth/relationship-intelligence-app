// frontend/src/contexts/AuthContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import api from "../services/api";
import { useApp } from "./AppContext"; // Import useApp

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const appCtx = useApp(); // Get AppContext for resetOnboarding

  // Prevent duplicate session checks
  const sessionCheckInProgress = useRef(false);
  const hasInitialized = useRef(false);

  const checkUserSession = async () => {
    // Prevent multiple simultaneous session checks
    if (sessionCheckInProgress.current) {
      console.log("⏳ Session check already in progress, skipping");
      return;
    }

    try {
      sessionCheckInProgress.current = true;

      const response = await api.get("/auth/me");
      setCurrentUser(response.data);
      setLoading(false);

      return response.data;
    } catch (err) {
      console.error("❌ Session expired or invalid", err);
      logout();
      setLoading(false);
      throw err;
    } finally {
      sessionCheckInProgress.current = false;
    }
  };

  // Initialize auth state only once
  useEffect(() => {
    // Prevent multiple initializations in React Strict Mode
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const token = localStorage.getItem("token");

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkUserSession();
    } else {
      console.log("📝 No token found, user not authenticated");
      setLoading(false);
    }
  }, []); // Empty dependency array is correct here

  const login = async (email, password) => {
    try {
      setError("");
      console.log("🔐 Attempting login");

      const response = await api.post("/auth/login", { email, password });

      if (!response.data.token) {
        throw new Error("No token received from server");
      }

      const token = response.data.token.trim();
      localStorage.setItem("token", token);

      // Explicitly set the Authorization header for all future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const userResponse = await api.get("/auth/me");
        setCurrentUser(userResponse.data);
        console.log("✅ Login successful");
      } catch (testError) {
        console.error("❌ Test request failed:", testError);
        // Don't throw here, continue with login even if test fails
      }

      return response.data;
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.message || "Failed to login");
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError("");
      console.log("📝 Attempting registration");

      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Get user data after registration
        const userResponse = await api.get("/auth/me");
        setCurrentUser(userResponse.data);
        console.log("✅ Registration successful");
        return userResponse.data;
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.response?.data?.message || "Failed to register");
      throw err;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("soulSync_onboarding_complete"); // Clear onboarding flag
    delete api.defaults.headers.common["Authorization"];
    setCurrentUser(null);
    // Reset refs
    sessionCheckInProgress.current = false;
    hasInitialized.current = false;

    // Reset AppContext states for onboarding and splash
    if (appCtx && appCtx.resetOnboarding) {
      appCtx.resetOnboarding();
    }
  };

  const refreshToken = async () => {
    try {
      console.log("🔄 Refreshing token");
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await api.post("/auth/refresh-token", { refreshToken });
      const { token } = response.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("✅ Token refreshed successfully");
      return token;
    } catch (err) {
      console.error("❌ Failed to refresh token:", err);
      logout();
      throw err;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    error,
    refreshToken,
    loading,
    checkUserSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
