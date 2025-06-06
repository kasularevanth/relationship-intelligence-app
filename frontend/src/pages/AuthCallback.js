// frontend/src/pages/AuthCallback.js
import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext"; // Import useApp
import { CircularProgress, Box, Typography } from "@mui/material";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkUserSession } = useAuth();
  const { markOnboardingAsCompleted } = useApp(); // Get the function from AppContext

  // Prevent duplicate callback processing
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing in React Strict Mode
      if (hasProcessed.current) {
        console.log("🔄 Auth callback already processed, skipping");
        return;
      }

      hasProcessed.current = true;
      console.log("🔐 Processing auth callback");

      try {
        // Get token from URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
          console.log("✅ Token received from callback");

          // Store token in localStorage
          localStorage.setItem("token", token);

          // Update auth context
          await checkUserSession();

          // Mark onboarding as completed so it doesn't show after this auth flow
          markOnboardingAsCompleted();

          console.log("🎯 Redirecting to home page after marking onboarding complete");
          // Redirect to home page instead of analysis
          navigate("/", { replace: true });
        } else {
          throw new Error("No token received in callback");
        }
      } catch (error) {
        console.error("❌ Auth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [location, navigate, checkUserSession]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "var(--primary-bg, #00081E)",
        color: "var(--text-primary, #F5F5F5)",
      }}
    >
      <CircularProgress
        size={60}
        sx={{ color: "var(--text-primary, #F5F5F5)", mb: 3 }}
      />
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        Completing authentication...
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: "var(--text-tertiary, #D1D1D1)",
          textAlign: "center",
        }}
      >
        Please wait while we set up your account
      </Typography>
    </Box>
  );
};

export default AuthCallback;
