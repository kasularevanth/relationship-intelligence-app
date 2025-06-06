import React, { useState, useRef, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext"; // Import useApp

import {
  Alert,
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

// Custom Google Icon Component for authentic look
const GoogleIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    style={{
      verticalAlign: "middle",
      display: "inline-block",
      flexShrink: 0,
    }}
  >
    <path
      d="M10.8 6.13636C10.8 5.72727 10.7636 5.34545 10.6909 4.96364H6V7.09091H8.8C8.68182 7.69091 8.32727 8.2 7.8 8.52727V9.9H9.38182C10.2545 9.09091 10.8 7.74545 10.8 6.13636Z"
      fill="#4285F4"
    />
    <path
      d="M6 11.25C7.425 11.25 8.61818 10.7727 9.38182 9.9L7.8 8.52727C7.35 8.81818 6.72727 9.00909 6 9.00909C4.62273 9.00909 3.45455 8.19091 3.04091 7.04545H1.40909V8.46818C2.16818 9.975 3.94091 11.25 6 11.25Z"
      fill="#34A853"
    />
    <path
      d="M3.04091 7.04545C2.95909 6.75455 2.90909 6.45 2.90909 6.13636C2.90909 5.82273 2.95909 5.51818 3.04091 5.22727V3.80455H1.40909C1.0909 4.43182 0.909091 5.155 0.909091 5.92727C0.909091 6.69955 1.0909 7.42273 1.40909 8.04955L3.04091 7.04545Z"
      fill="#FBBC05"
    />
    <path
      d="M6 3.26364C6.79091 3.26364 7.50909 3.55455 8.07273 4.09091L9.48182 2.68182C8.61364 1.86364 7.42045 1.36364 6 1.36364C3.94091 1.36364 2.16818 2.63864 1.40909 4.14545L3.04091 5.56818C3.45455 4.42273 4.62273 3.60455 6 3.60455V3.26364Z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for focused input tracking
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { markOnboardingAsCompleted } = useApp(); // Get the function from AppContext
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  useEffect(() => {
    // Apply theme class to body
    if (darkMode) {
      document.body.classList.add("dark-mode-auth");
      document.body.classList.remove("light-mode-auth");
    } else {
      document.body.classList.add("light-mode-auth");
      document.body.classList.remove("dark-mode-auth");
    }
    document.body.setAttribute("data-page-type", "auth");

    return () => {
      document.body.classList.remove("dark-mode-auth", "light-mode-auth");
      document.body.removeAttribute("data-page-type");
    };
  }, [darkMode]);

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate email format
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validate field
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        return isValidEmail(value) ? "" : "Invalid email format";
      case "password":
        return value.trim() ? "" : "Password is required";
      default:
        return "";
    }
  };

  // Handle field change
  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter(value);

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Clear general error when user starts making changes
    if (error) {
      setError("");
    }
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError,
    });
    setFocusedInput(null);
  };

  // Handle field focus
  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  // Validate form
  const validateForm = () => {
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      markOnboardingAsCompleted(); // Mark onboarding as completed
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      process.env.REACT_APP_API_URL || "http://localhost:5000/api"
    }/auth/google`;
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--primary-bg)",
        margin: 0,
        padding: 0,
        overflow: isMobile ? "auto" : "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        fontFamily: "var(--font-family-secondary)",
      }}
    >


      {/* Full Screen Container */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: isMobile ? "var(--content-bg)" : "transparent",
          padding: isMobile ? "20px" : "40px",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Mobile SoulSync Title */}
        {isMobile && (
          <Typography
            sx={{
              fontFamily: "var(--font-family-primary)",
              fontWeight: 700,
              fontSize: "30px",
              lineHeight: "39px",
              letterSpacing: "-0.165px",
              background: "var(--brand-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textAlign: "center",
              marginBottom: "20px",
              marginTop: "40px",
            }}
          >
            SoulSync
          </Typography>
        )}

        {/* Content Container */}
        <Box
          sx={{
            width: isMobile ? "100%" : "var(--auth-card-width-desktop)",
            maxWidth: "var(--auth-card-max-width-mobile)",
            // height: isMobile ? "auto" : "var(--desktop-login-height)", // Let height be auto based on content
            backgroundColor: "var(--auth-card-background)", // Updated
            // backdropFilter: "var(--auth-card-backdrop-blur)", // Removed
            boxShadow: isMobile
              ? "var(--content-shadow)" // Existing mobile shadow, can be updated if spec provides mobile shadow
              : "var(--auth-card-box-shadow)", // Updated
            borderRadius: "var(--auth-card-border-radius)", // Updated
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "var(--auth-card-padding-mobile)" : "var(--auth-card-padding-desktop)",
            gap: "var(--auth-card-gap)",
            position: "relative",
            // border: "var(--auth-card-border)", // Removed
          }}
        >
          {/* Components Container */}
          <Box
            sx={{
              width: isMobile ? "100%" : "var(--desktop-component-width)",
              maxWidth: isMobile
                ? "var(--component-width)"
                : "var(--desktop-component-width)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              {/* Title */}
              <Typography
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  fontSize: isMobile
                    ? "var(--font-size-title-mobile)"
                    : "var(--font-size-title-desktop)",
                  lineHeight: "17px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Welcome Back
              </Typography>

              {/* Google Button */}
              <Button
                onClick={handleGoogleLogin}
                sx={{
                  width: "100%",
                  height: isMobile
                    ? "var(--input-height-mobile)"
                    : "var(--input-height-desktop)",
                  border: "0.42px solid var(--google-border)",
                  borderRadius: '25px',
                  background: "var(--google-bg)",
                  color: "var(--google-text)",
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 500,
                  fontSize: isMobile
                    ? "var(--font-size-google-mobile)"
                    : "var(--font-size-google-desktop)",
                  lineHeight: isMobile ? "10px" : "11px",
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isMobile ? "8px" : "6.73px",
                  padding: "0 10px",
                  minHeight: isMobile
                    ? "var(--input-height-mobile)"
                    : "var(--input-height-desktop)",
                  "&:hover": {
                    background: "var(--google-hover-bg)",
                    border: "0.42px solid var(--google-border)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <GoogleIcon size={isMobile ? 12 : 14.76} />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 1,
                  }}
                >
                  Continue with Google
                </Box>
              </Button>

              {/* Divider */}
              <Box
                sx={{
                  width: "167.94px",
                  display: "flex",
                  alignItems: "center",
                  gap: "9.68px",
                }}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    height: "0.63px",
                    background: "var(--divider-color)",
                    opacity: "var(--border-opacity)",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "var(--font-family-secondary)",
                    fontWeight: 500,
                    fontSize: isMobile
                      ? "var(--font-size-divider-mobile)"
                      : "var(--font-size-divider-desktop)",
                    lineHeight: "11px",
                    color: "var(--text-primary)",
                  }}
                >
                  Or
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    height: "0.63px",
                    background: "var(--divider-color)",
                    opacity: "var(--border-opacity)",
                  }}
                />
              </Box>
            </Box>

            {/* Input Section */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "25px" : "20px",
              }}
            >
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    backgroundColor: "var(--alert-error-bg)",
                    color: "var(--alert-error-text)",
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? "25px" : "20px",
                }}
              >
                {/* Email Field */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-family-secondary)",
                      fontWeight: 500,
                      fontSize: isMobile
                        ? "var(--font-size-label-mobile)"
                        : "var(--font-size-label-desktop)",
                      lineHeight: "11px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Email Address
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: isMobile
                        ? "var(--input-height-mobile)"
                        : "var(--input-height-desktop)",
                      border: `0.8px solid ${
                        focusedInput === "email"
                          ? "var(--input-border-focus)"
                          : errors.email
                          ? "var(--input-border-error)"
                          : "var(--input-border)"
                      }`,
                      borderRadius: "var(--border-radius-input)",
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      background: "var(--input-bg)",
                    }}
                  >
                    <input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => handleChange(e, setEmail)}
                      onFocus={() => handleFocus("email")}
                      onBlur={handleBlur}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "var(--input-text)",
                        width: "100%",
                        height: "100%",
                        fontSize: isMobile
                          ? "var(--font-size-input-mobile)"
                          : "var(--font-size-input-desktop)",
                        fontFamily: "var(--font-family-secondary)",
                        fontWeight: 300,
                      }}
                    />
                  </Box>
                  {errors.email && (
                    <Typography
                      sx={{
                        color: "var(--input-border-error)",
                        fontSize: "12px",
                      }}
                    >
                      {errors.email}
                    </Typography>
                  )}
                </Box>

                {/* Password Field */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-family-secondary)",
                      fontWeight: 500,
                      fontSize: isMobile
                        ? "var(--font-size-label-mobile)"
                        : "var(--font-size-label-desktop)",
                      lineHeight: "11px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Password
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: isMobile
                        ? "var(--input-height-mobile)"
                        : "var(--input-height-desktop)",
                      border: `0.8px solid ${
                        focusedInput === "password"
                          ? "var(--input-border-focus)"
                          : errors.password
                          ? "var(--input-border-error)"
                          : "var(--input-border)"
                      }`,
                      borderRadius: "var(--border-radius-input)",
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      background: "var(--input-bg)",
                    }}
                  >
                    <input
                      ref={passwordInputRef}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => handleChange(e, setPassword)}
                      onFocus={() => handleFocus("password")}
                      onBlur={handleBlur}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "var(--input-text)",
                        width: "100%",
                        height: "100%",
                        fontSize: isMobile
                          ? "var(--font-size-input-mobile)"
                          : "var(--font-size-input-desktop)",
                        fontFamily: "var(--font-family-secondary)",
                        fontWeight: 300,
                      }}
                    />
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      size="small"
                      sx={{
                        color: "var(--text-primary)",
                        width: "18px",
                        height: "18px",
                        padding: 0,
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ fontSize: "14px" }} />
                      ) : (
                        <Visibility sx={{ fontSize: "14px" }} />
                      )}
                    </IconButton>
                  </Box>
                  {errors.password && (
                    <Typography
                      sx={{
                        color: "var(--input-border-error)",
                        fontSize: "12px",
                      }}
                    >
                      {errors.password}
                    </Typography>
                  )}
                </Box>

                {/* Login Button */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? "15px" : "26px",
                  }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    sx={{
                      width: "100%",
                      height: isMobile
                        ? "var(--input-height-mobile)"
                        : "var(--input-height-desktop)",
                      background: "var(--button-gradient)",
                      borderRadius: '25px',
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-family-secondary)",
                      fontWeight: 500,
                      fontSize: isMobile
                        ? "var(--font-size-button-mobile)"
                        : "var(--font-size-button-desktop)",
                      lineHeight: isMobile ? "21px" : "24px",
                      textTransform: "none",
                      border: "none",
                      "&:hover": {
                        background: "var(--button-gradient)",
                        opacity: 0.9,
                      },
                      "&:disabled": {
                        background: "var(--button-gradient)",
                        opacity: 0.7,
                        color: "var(--text-primary)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      "Login"
                    )}
                  </Button>

                  {/* Sign Up Link */}
                  <Typography
                    sx={{
                      fontFamily: "var(--font-family-secondary)",
                      fontWeight: 400,
                      fontSize: isMobile
                        ? "var(--font-size-link-mobile)"
                        : "var(--font-size-link-desktop)",
                      lineHeight: "11px",
                      color: "var(--text-tertiary)",
                      textAlign: "center",
                      letterSpacing: "0.005em",
                    }}
                  >
                    Don't have an account?{" "}
                    <RouterLink
                      to="/register"
                      style={{
                        color: "var(--text-tertiary)",
                        textDecoration: "underline",
                        fontWeight: "bold",
                      }}
                    >
                      Sign-up
                    </RouterLink>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Social Icons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "10.1px" : "21.12px",
                marginTop: "10px",
              }}
            >
              <FacebookIcon
                sx={{
                  fontSize: isMobile
                    ? "var(--social-icon-size-mobile)"
                    : "var(--social-icon-size-desktop)",
                  color: "var(--social-icon-color)",
                }}
              />
              <TwitterIcon
                sx={{
                  fontSize: isMobile
                    ? "var(--social-icon-size-mobile)"
                    : "var(--social-icon-size-desktop)",
                  color: "var(--social-icon-color)",
                }}
              />
              <InstagramIcon
                sx={{
                  fontSize: isMobile
                    ? "var(--social-icon-size-mobile)"
                    : "var(--social-icon-size-desktop)",
                  color: "var(--social-icon-color)",
                }}
              />
              <LinkedInIcon
                sx={{
                  fontSize: isMobile
                    ? "var(--social-icon-size-mobile)"
                    : "var(--social-icon-size-desktop)",
                  color: "var(--social-icon-color)",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
