// frontend/src/pages/Login.js
import React, { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import {
  Alert,
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs for focused input tracking
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Colors based on mode
  const accentColor = darkMode ? '#4aeabc' : '#30a58b'; // Darker green for light mode
  const bgColor = darkMode ? '#000000' : '#ffffff';
  const headerBgColor = darkMode ? '#000000' : '#ffffff';
  const formBgColor = darkMode ? '#1a1a1a' : '#ffffff';
  const footerBgColor = darkMode ? '#000000' : '#ffffff';
  const inputBgColor = darkMode ? '#333333' : '#f7f7f7';
  const inputBorderColor = darkMode ? '#444444' : '#e0e0e0';
  const textColor = darkMode ? '#4aeabc' : '#30a58b';
  const subtitleColor = darkMode ? '#aaaaaa' : '#757575';
  const inputTextColor = darkMode ? '#4aeabc' : '#333333';

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
      case 'email':
        if (!value.trim()) return 'Email is required';
        return isValidEmail(value) ? '' : 'Invalid email format';
      case 'password':
        return value.trim() ? '' : 'Password is required';
      default:
        return '';
    }
  };

  // Handle field change
  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter(value);
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError
    });
    setFocusedInput(null);
  };
  
  // Handle field focus
  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  // Validate form
  const validateForm = () => {
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    
    setErrors({
      email: emailError,
      password: passwordError
    });
    
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? '#000000' : '#f5f5f5',
      position: 'relative'
    }}>
      {/* Main Container */}
      <Box sx={{
        width: isMobile ? '100%' : '400px',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
        backgroundColor: bgColor
      }}>
        {/* Header Section */}
        <Box sx={{
          width: '100%',
          backgroundColor: headerBgColor,
          pt: 6,
          pb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          {/* Lock Icon */}
          <LockOutlinedIcon 
            sx={{ 
              fontSize: 48, 
              color: accentColor, 
              mb: 2
            }} 
          />
          
          {/* Welcome Back Title */}
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              color: accentColor,
              fontWeight: 'bold',
              mb: 1,
              fontSize: { xs: '2.5rem', sm: '3rem' },
              lineHeight: 1.1,
              textAlign: 'center'
            }}
          >
            Welcome<br />Back!
          </Typography>
          
          {/* Subtitle */}
          <Typography 
            variant="body1" 
            sx={{ 
              color: subtitleColor,
              textAlign: 'center'
            }}
          >
            Login to continue
          </Typography>
        </Box>

        {/* Main Form Section */}
        <Box sx={{
          width: '100%',
          backgroundColor: formBgColor,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%',
                mb: 2,
                backgroundColor: darkMode ? 'rgba(211, 47, 47, 0.2)' : undefined,
                color: darkMode ? '#ff7777' : undefined
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
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Email Input */}
            <Box 
              sx={{
                position: 'relative',
                width: '100%',
                height: 56,
                mb: 2,
                borderRadius: 28,
                backgroundColor: inputBgColor,
                display: 'flex',
                alignItems: 'center',
                px: 3,
                border: focusedInput === 'email' 
                  ? `1px solid ${accentColor}` 
                  : errors.email 
                    ? '1px solid #ff4444' 
                    : `1px solid ${inputBorderColor}`
              }}
            >
              <EmailOutlinedIcon 
                sx={{ 
                  color: accentColor, 
                  mr: 2,
                  fontSize: 20
                }} 
              />
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleChange(e, setEmail)}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: inputTextColor,
                  width: '100%',
                  height: '100%',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              />
            </Box>
            
            {/* Password Input */}
            <Box 
              sx={{
                position: 'relative',
                width: '100%',
                height: 56,
                mb: 3,
                borderRadius: 28,
                backgroundColor: inputBgColor,
                display: 'flex',
                alignItems: 'center',
                px: 3,
                border: focusedInput === 'password' 
                  ? `1px solid ${accentColor}` 
                  : errors.password 
                    ? '1px solid #ff4444' 
                    : `1px solid ${inputBorderColor}`
              }}
            >
              <LockOutlinedIcon 
                sx={{ 
                  color: accentColor, 
                  mr: 2,
                  fontSize: 20
                }} 
              />
              <input
                ref={passwordInputRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => handleChange(e, setPassword)}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: inputTextColor,
                  width: '100%',
                  height: '100%',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              />
              <IconButton
                onClick={handleTogglePasswordVisibility}
                size="small"
                sx={{ 
                  color: '#aaaaaa',
                  p: 0.5
                }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Box>
            
            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                height: 56,
                backgroundColor: accentColor,
                color: '#ffffff', // White text for better contrast on darker green
                borderRadius: 28,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: darkMode ? '#3dd9aa' : '#278f77', // Darker hover for light mode
                  boxShadow: 'none'
                },
                '&:disabled': {
                  backgroundColor: darkMode ? 'rgba(74, 234, 188, 0.7)' : 'rgba(48, 165, 139, 0.7)',
                  color: '#ffffff',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        </Box>
        
        {/* Footer Section */}
        <Box sx={{
          width: '100%',
          backgroundColor: footerBgColor,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Or login with text */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: textColor,
              mb: 2,
              textAlign: 'center'
            }}
          >
            Or login with
          </Typography>
          
          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleLogin}
            variant="outlined"
            sx={{
              width: '240px',
              height: 48,
              backgroundColor: 'white',
              color: 'rgba(0, 0, 0, 0.54)',
              border: '1px solid #ddd',
              borderRadius: 24,
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '14px',
              mb: 3,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                boxShadow: 'none'
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <GoogleIcon sx={{ color: '#4285F4', mr: 1, fontSize: 20 }} />
            Sign in with Google
          </Button>
          
          {/* Sign Up Link */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: textColor,
              textAlign: 'center',
            }}
          >
            Don't have an account? {' '}
            <RouterLink 
              to="/register" 
              style={{ 
                color: textColor, 
                textDecoration: 'none', 
                fontWeight: 'bold' 
              }}
            >
              Sign up
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;