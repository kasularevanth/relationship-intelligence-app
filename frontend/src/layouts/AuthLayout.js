// frontend/src/layouts/AuthLayout.js
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material"; // Added Typography

const AuthLayout = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--primary-bg)",
        }}
      >
        <CircularProgress sx={{ color: "var(--text-primary)" }} />
      </Box>
    );
  }

  // Redirect if user is already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Pure auth layout - no sidebar, no navigation
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--primary-bg)",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "relative", // Added for positioning the logo
      }}
    >
      {/* Logo Header */}
      {/* Logo Header */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "20px", md: "var(--auth-logo-text-top-padding)" }, // Use CSS variable
          left: { xs: "20px", md: "var(--auth-logo-text-left-padding)" }, // Use CSS variable
          zIndex: 10, 
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--auth-logo-text-font-family)",
            fontWeight: "var(--auth-logo-text-font-weight)",
            fontSize: { xs: "30px", md: "var(--auth-logo-text-font-size)" }, // Responsive font size
            lineHeight: { xs: "39px", md: "var(--auth-logo-text-line-height)" }, // Responsive line height
            letterSpacing: "var(--auth-logo-text-letter-spacing)",
            background: "var(--auth-logo-text-gradient)", // Changed to use the new gradient variable
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textAlign: "left",
          }}
        >
          SoulSync
        </Typography>
      </Box>
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
