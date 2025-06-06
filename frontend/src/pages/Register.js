// frontend/src/pages/Register.js
import React, { useState, useEffect } from "react";
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

const Register = () => {
  // Form state - only the 3 required fields
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    name: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const { markOnboardingAsCompleted } = useApp(); // Get the function from AppContext
  const { darkMode } = useTheme();
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

  // Track password strength in real-time
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`]/.test(password),
    });
  }, [formData.password]);

  // Comprehensive email validation (returns boolean)
  const isValidEmail = (email) => {
    const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicRegex.test(email)) return false;

    // Additional length checks
    if (email.length > 254 || email.length < 5) return false;

    const parts = email.split("@");
    if (parts.length !== 2) return false;

    const [localPart, domainPart] = parts;

    // Local part checks
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
    if (localPart.includes("..")) return false;

    // Domain part checks
    if (domainPart.length === 0 || domainPart.length > 253) return false;
    if (domainPart.startsWith("-") || domainPart.endsWith("-")) return false;
    if (domainPart.startsWith(".") || domainPart.endsWith(".")) return false;
    if (domainPart.includes("..")) return false;

    // TLD validation
    const domainParts = domainPart.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;

    // Prevent all-numeric domains
    if (/^\d+$/.test(domainParts[0])) return false;

    return true;
  };

  // Check for common email domain typos
  const hasCommonDomainTypo = (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return false;

    const commonTypos = {
      "gmail.co": "gmail.com",
      "gmail.om": "gmail.com",
      "gmai.com": "gmail.com",
      "gmial.com": "gmail.com",
      "gmail.cm": "gmail.com",
      "yahoo.co": "yahoo.com",
      "yahoo.om": "yahoo.com",
      "yaho.com": "yahoo.com",
      "hotmail.co": "hotmail.com",
      "hotmail.om": "hotmail.com",
      "outlook.co": "outlook.com",
      "outlook.om": "outlook.com",
      "live.co": "live.com",
      "icloud.co": "icloud.com",
    };

    return commonTypos.hasOwnProperty(domain) ? commonTypos[domain] : false;
  };

  // Validate name format
  const isValidName = (name) => {
    const regex = /^[a-zA-Z\s'-]{2,50}$/;
    return regex.test(name.trim());
  };

  // Check if password meets all requirements
  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(Boolean);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "email" ? value.toLowerCase() : value;

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    // Clear field-specific error when user starts typing
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

  // Simplified field validation with helpful typo detection
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        const trimmedEmail = value.trim().toLowerCase();

        if (!trimmedEmail) return "Email address is required";

        // Check for common domain typos first (better UX)
        if (trimmedEmail.includes("@")) {
          const [localPart] = trimmedEmail.split("@");
          const suggestedDomain = hasCommonDomainTypo(trimmedEmail);
          if (suggestedDomain) {
            return `Did you mean ${localPart}@${suggestedDomain}?`;
          }
        }

        // Single validation check for all other cases
        if (!isValidEmail(trimmedEmail)) {
          return "Please enter a valid email address";
        }

        return "";

      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        if (value.trim().length > 50)
          return "Name must be less than 50 characters";
        if (!isValidName(value))
          return "Name can only contain letters, spaces, hyphens, and apostrophes";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (value.length > 128)
          return "Password must be less than 128 characters";
        if (!/[A-Z]/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value))
          return "Password must contain at least one number";
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`]/.test(value))
          return "Password must contain at least one special character";
        if (/\s/.test(value)) return "Password cannot contain spaces";

        // Check for common weak patterns
        if (/(.)\1{2,}/.test(value))
          return "Password cannot have 3 or more repeated characters";
        if (/123|abc|password|qwerty/i.test(value))
          return "Password contains common patterns that are not allowed";

        return "";

      default:
        return "";
    }
  };

  // Validate all fields before submission
  const validateForm = () => {
    const newErrors = {
      email: validateField("email", formData.email),
      name: validateField("name", formData.name),
      password: validateField("password", formData.password),
    };

    setErrors(newErrors);

    if (!newErrors.password && !isPasswordValid()) {
      newErrors.password = "Password must meet all security requirements";
      setErrors(newErrors);
    }

    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isValid = validateForm();
    if (!isValid) {
      setError("Please fix the errors above before submitting");
      return;
    }

    if (!isPasswordValid()) {
      setError("Password must meet all security requirements");
      return;
    }

    try {
      setLoading(true);
      const cleanedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      await register(cleanedData.name, cleanedData.email, cleanedData.password);
      markOnboardingAsCompleted(); // Mark onboarding as completed
      // After successful registration, redirect to login page with a success message
      navigate("/login?registered=true"); 
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.status === 409) {
        setError("An account with this email already exists");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid registration data");
      } else if (err.response?.status === 429) {
        setError("Too many registration attempts. Please try again later");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create account. Please try again"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError,
    });
    setFocusedInput(null);

    if (error && !fieldError) {
      setError("");
    }
  };

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleGoogleSignup = () => {
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
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          background: isMobile ? "var(--content-bg)" : "transparent",
          padding: isMobile ? "20px" : "40px",
          overflowY: "auto",
          position: "relative",
        }}
      >

        {/* Content Container */}
        <Box
          sx={{
            width: isMobile ? "100%" : "var(--auth-card-width-desktop)", // Consistent width
            maxWidth: "var(--auth-card-max-width-mobile)",
            // height: isMobile ? "auto" : "var(--desktop-content-height)", // Let height be auto
            backgroundColor: "var(--auth-card-background)", // Updated
            // backdropFilter: "var(--auth-card-backdrop-blur)", // Removed
            boxShadow: isMobile
              ? "var(--content-shadow)" // Existing mobile shadow
              : "var(--auth-card-box-shadow)", // Updated
            borderRadius: "var(--auth-card-border-radius)", // Updated
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center", // Center content vertically if space allows
            padding: isMobile ? "var(--auth-card-padding-mobile)" : "var(--auth-card-padding-desktop-register)",
            gap: "var(--auth-card-gap-register)",
            position: "relative",
            // border: "var(--auth-card-border)", // Removed
            marginBottom: isMobile ? "20px" : "0",
            flexShrink: 0,
            overflowY: "auto", // Allow scroll if content overflows
          }}
        >
          {/* Components Container */}
          <Box
            sx={{
              width: isMobile ? "100%" : "var(--desktop-component-width)",
              maxWidth: isMobile
                ? "var(--component-width)"
                : "var(--desktop-component-width)",
              height: "auto", // Changed from 655px to auto for desktop
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              padding: "0px",
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
                  fontSize: isMobile ? "18px" : "22px",
                  lineHeight: "17px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Create an account
              </Typography>

              {/* Google Button */}
              <Button
                onClick={handleGoogleSignup}
                sx={{
                  width: "100%",
                  height: isMobile ? "36px" : "40px",
                  border: "0.42px solid var(--google-border)",
                  borderRadius: isMobile ? "25px" : "25px",
                  background: "var(--google-bg)",
                  color: "var(--google-text)",
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 500,
                  fontSize: isMobile ? "10px" : "12px",
                  lineHeight: isMobile ? "10px" : "11px",
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isMobile ? "8px" : "6.73px",
                  padding: "0 10px",
                  minHeight: isMobile ? "36px" : "40px",
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
                    width: isMobile ? "12px" : "14.76px",
                    height: isMobile ? "12px" : "14.76px",
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
                  Create account with Google
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
                    fontSize: isMobile ? "7.58px" : "12px",
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
                gap: "20px",
              }}
            >
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    backgroundColor: "var(--alert-error-bg)",
                    color: "var(--alert-error-text)",
                    fontSize: "12px",
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
                  gap: "20px",
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
                      fontSize: isMobile ? "12px" : "18px",
                      lineHeight: "11px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Email Address
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: isMobile ? "36px" : "40px",
                      border: `0.8px solid ${
                        focusedInput === "email"
                          ? "var(--input-border-focus)"
                          : errors.email
                          ? "var(--input-border-error)"
                          : "var(--input-border)"
                      }`,
                      borderRadius: "2.52539px",
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      background: "var(--input-bg)",
                    }}
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus("email")}
                      onBlur={handleBlur}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "var(--input-text)",
                        width: "100%",
                        height: "100%",
                        fontSize: isMobile ? "12px" : "15px",
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

                {/* Full Name Field */}
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
                      fontSize: isMobile ? "12px" : "18px",
                      lineHeight: "11px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Full Name
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: isMobile ? "36px" : "40px",
                      border: `0.8px solid ${
                        focusedInput === "name"
                          ? "var(--input-border-focus)"
                          : errors.name
                          ? "var(--input-border-error)"
                          : "var(--input-border)"
                      }`,
                      borderRadius: "2.52539px",
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      background: "var(--input-bg)",
                    }}
                  >
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "var(--input-text)",
                        width: "100%",
                        height: "100%",
                        fontSize: isMobile ? "12px" : "15px",
                        fontFamily: "var(--font-family-secondary)",
                        fontWeight: 300,
                      }}
                    />
                  </Box>
                  {errors.name && (
                    <Typography
                      sx={{
                        color: "var(--input-border-error)",
                        fontSize: "12px",
                      }}
                    >
                      {errors.name}
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
                      height: isMobile ? "36px" : "40px",
                      border: `0.8px solid ${
                        focusedInput === "password"
                          ? "var(--input-border-focus)"
                          : errors.password
                          ? "var(--input-border-error)"
                          : "var(--input-border)"
                      }`,
                      borderRadius: "2.52539px",
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      background: "var(--input-bg)",
                    }}
                  >
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create your password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus("password")}
                      onBlur={handleBlur}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "var(--input-text)",
                        width: isMobile
                          ? "calc(100% - 20px)"
                          : "calc(100% - 18px)",
                        height: "100%",
                        fontSize: isMobile ? "12px" : "15px",
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

                {/* Sign Up Button */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? "15px" : "26px",
                    marginTop: isMobile ? "0" : "15px",
                  }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    sx={{
                      width: "100%",
                      height: isMobile ? "36px" : "40px",
                      background: "var(--button-gradient)",
                      borderRadius: '25px',
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-family-secondary)",
                      fontWeight: 500,
                      fontSize: isMobile ? "14px" : "16px",
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
                      "Create an account"
                    )}
                  </Button>

                  {/* Login Link */}
                  <Typography
                    sx={{
                      fontFamily: "var(--font-family-secondary)",
                      fontWeight: 400,
                      fontSize: isMobile ? "12px" : "16px",
                      lineHeight: "11px",
                      color: "var(--text-tertiary)",
                      textAlign: "center",
                      letterSpacing: "0.005em",
                    }}
                  >
                    Already have an account?{" "}
                    <RouterLink
                      to="/login"
                      style={{
                        color: "var(--text-tertiary)",
                        textDecoration: "underline",
                        fontWeight: "bold",
                      }}
                    >
                      Login
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
                  fontSize: isMobile ? "13.47px" : "28.16px",
                  color: "var(--social-icon-color)",
                }}
              />
              <TwitterIcon
                sx={{
                  fontSize: isMobile ? "13.47px" : "28.16px",
                  color: "var(--social-icon-color)",
                }}
              />
              <InstagramIcon
                sx={{
                  fontSize: isMobile ? "13.47px" : "28.16px",
                  color: "var(--social-icon-color)",
                }}
              />
              <LinkedInIcon
                sx={{
                  fontSize: isMobile ? "13.47px" : "28.16px",
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

// Password Requirement Component - Only used on mobile
const PasswordRequirement = ({ text, met }) => (
  <Box sx={{ display: "flex", alignItems: "center", py: 0.25 }}>
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: met
          ? "var(--password-good)"
          : "var(--text-quaternary)",
        mr: 1,
        transition: "background-color 0.2s ease",
      }}
    />
    <Typography
      variant="caption"
      sx={{
        color: met ? "var(--password-good)" : "var(--text-quaternary)",
        fontSize: "10px",
        lineHeight: 1.2,
        transition: "color 0.2s ease",
      }}
    >
      {text}
    </Typography>
  </Box>
);

export default Register;
