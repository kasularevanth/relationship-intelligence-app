// frontend/src/pages/Register.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  Paper,
  useMediaQuery,
  useTheme as useMuiTheme,
  IconButton,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Colors and other functions remain the same
  const accentColor = darkMode ? '#4aeabc' : '#30a58b';
  const headerBgColor = darkMode ? '#121212' : '#ffffff';
  const formBgColor = darkMode ? '#121212' : '#ffffff';
  const inputBgColor = darkMode ? '#1e1e1e' : '#f7f7f7';
  const inputBorderColor = darkMode ? '#333333' : '#e0e0e0';
  const textColor = darkMode ? '#4aeabc' : '#30a58b';
  const subtitleColor = darkMode ? '#aaaaaa' : '#757575';
  const iconColor = darkMode ? '#4aeabc' : '#30a58b';
  const formHelperTextColor = '#ff4444';
  const buttonColor = darkMode ? '#4aeabc' : '#30a58b';

  // Validate email format
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Validate password strength
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.password]);


  // Add this in both Login.js and Register.js right at the start of the return statement
useEffect(() => {
  // Add a class to the body when on auth pages
  if (isMobile && darkMode) {
    document.body.classList.add('dark-mode-auth');
    // Set page-specific data attribute
    document.body.setAttribute('data-page-type', 'auth');
  }
  
  return () => {
    // Clean up when component unmounts
    document.body.classList.remove('dark-mode-auth');
    document.body.removeAttribute('data-page-type');
  };
}, [isMobile, darkMode]);
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate individual fields
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        return isValidEmail(value) ? '' : 'Invalid email format';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'age':
        if (value && (isNaN(value) || value < 1 || value > 120)) {
          return 'Please enter a valid age';
        }
        return '';
      default:
        return '';
    }
  };
  
  // Validate all fields before submission
  const validateForm = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      age: validateField('age', formData.age)
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) return;
    
    try {
      setError('');
      setLoading(true);
      console.log('Submitting registration for:', formData.email);
      await register(formData.name, formData.email, formData.password, formData.age);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to create an account');
    } finally {
      setLoading(false);
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
  };

  const handleGoogleSignup = () => {
  window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
};

  // Calculate if all password requirements are met
  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordRequirementsMet = Object.values(passwordStrength).filter(Boolean).length;
  const passwordStrengthPercent = (passwordRequirementsMet / Object.values(passwordStrength).length) * 100;

  return (
    <Box className="auth-page" sx={{ 
        width: '100%', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: darkMode ? '#000000' : '#f5f5f5',
        // Critical fix: remove any horizontal padding or margin
        m: 0,
        p: 0,
        overflow: 'hidden', // Prevent any overflow
        position: 'relative',
        transition: 'background-color 0.3s ease'
      }}>
      {/* Form Container */}
      <Paper 
        elevation={0}
        sx={{ 
          width: isMobile ? '100vw' : '400px',
          maxWidth: '100%',
          backgroundColor: darkMode ? (isMobile ? '#000000' : '#121212') : '#ffffff',
          borderRadius: isMobile ? 0 : 4,
          // Change this line to use !important
          padding: isMobile ? '0 !important' : undefined, 
          overflow: 'hidden',
          border: 'none',
          boxShadow: 'none',
          mb: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: isMobile ? 'absolute' : 'relative',
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          height: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : 'none',
          overflowY: isMobile ? 'auto' : 'visible', 
        }}
      >
        <Box sx={{ 
          width: '100%', 
          backgroundColor: darkMode ? '#121212' : '#ffffff',
          p: 3,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          textAlign: 'center'
        }}>
          {/* Lock Icon */}
          <LockOutlinedIcon 
            sx={{ 
              fontSize: 40, 
              color: accentColor, 
              mb: 1
            }} 
          />
          
          {/* Title */}
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              color: accentColor,
              fontWeight: 'bold',
              mb: 0.5,
              textAlign: 'center',
              width: '100%'
            }}
          >
            Create Account
          </Typography>
          
          {/* Subtitle */}
          <Typography 
            variant="body2" // Smaller subtitle
            sx={{ 
              color: subtitleColor,
              textAlign: 'center',
              width: '100%'
            }}
          >
            Join the circle
          </Typography>
        </Box>

        <Box sx={{ 
          width: '100%',
          p: 3,
          backgroundColor: darkMode ? '#121212' : '#ffffff',
          // Most important fix: set a specific height and make it scrollable
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1 // Ensure form has higher z-index than the login link
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
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
              flexDirection: 'column'
            }}
          >
            {/* Full Name Field */}
            <TextField
              fullWidth
              id="name"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: errors.name ? '#ff4444' : iconColor }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle(darkMode, accentColor, inputBgColor, inputBorderColor)}
            />
            
            {/* Age Field */}
            <TextField
              fullWidth
              id="age"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              type="number"
              error={!!errors.age}
              helperText={errors.age}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayOutlinedIcon sx={{ color: errors.age ? '#ff4444' : iconColor }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle(darkMode, accentColor, inputBgColor, inputBorderColor)}
            />
            
            {/* Email Field */}
            <TextField
              fullWidth
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: errors.email ? '#ff4444' : iconColor }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle(darkMode, accentColor, inputBgColor, inputBorderColor)}
            />
            
            {/* Password Field */}
            <TextField
              fullWidth
              id="password"
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: errors.password ? '#ff4444' : iconColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{ color: darkMode ? '#aaaaaa' : '#666666' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyle(darkMode, accentColor, inputBgColor, inputBorderColor)}
            />
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      height: 4,
                      flexGrow: 1,
                      borderRadius: 2,
                      backgroundColor: darkMode ? '#333' : '#e0e0e0',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${passwordStrengthPercent}%`,
                        backgroundColor: 
                          passwordStrengthPercent < 40 ? '#ff4444' :
                          passwordStrengthPercent < 80 ? '#ffbb33' : accentColor,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 1, 
                      color: darkMode ? '#aaaaaa' : '#666666',
                      minWidth: '70px',
                      textAlign: 'right'
                    }}
                  >
                    {passwordStrengthPercent === 0 ? 'Very Weak' :
                     passwordStrengthPercent < 40 ? 'Weak' :
                     passwordStrengthPercent < 80 ? 'Moderate' : 'Strong'}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: darkMode ? '#aaaaaa' : '#666666',
                    display: 'block',
                    mb: 0.5,
                    fontWeight: 'bold'
                  }}
                >
                  Password must:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <PasswordRequirement 
                    text="Be at least 8 characters long" 
                    met={passwordStrength.length} 
                    darkMode={darkMode}
                    accentColor={accentColor}
                  />
                  <PasswordRequirement 
                    text="Include uppercase letters (A-Z)" 
                    met={passwordStrength.uppercase} 
                    darkMode={darkMode}
                    accentColor={accentColor}
                  />
                  <PasswordRequirement 
                    text="Include lowercase letters (a-z)" 
                    met={passwordStrength.lowercase} 
                    darkMode={darkMode} 
                    accentColor={accentColor}
                  />
                  <PasswordRequirement 
                    text="Include at least one number (0-9)" 
                    met={passwordStrength.number} 
                    darkMode={darkMode} 
                    accentColor={accentColor}
                  />
                  <PasswordRequirement 
                    text="Include at least one special character (!@#$%^&*)" 
                    met={passwordStrength.special} 
                    darkMode={darkMode} 
                    accentColor={accentColor}
                  />
                </Box>
              </Box>
            )}
            
            {/* Confirm Password Field */}
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: errors.confirmPassword ? '#ff4444' : iconColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      sx={{ color: darkMode ? '#aaaaaa' : '#666666' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyle(darkMode, accentColor, inputBgColor, inputBorderColor)}
            />
            
            {/* Sign Up Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2, // Reduced bottom margin to make room for Google button
                backgroundColor: buttonColor,
                color: '#ffffff',
                borderRadius: 6,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: darkMode ? '#3dd9aa' : '#278f77',
                },
                '&:disabled': {
                  backgroundColor: darkMode ? 'rgba(74, 234, 188, 0.7)' : 'rgba(48, 165, 139, 0.7)',
                  color: '#ffffff',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>

            {/* Divider for visual separation */}
            <Divider sx={{ my: 2, width: '100%' }}>
              <Typography variant="caption" sx={{ color: subtitleColor }}>
                OR
              </Typography>
            </Divider>
            
            {/* Google signup button */}         
            <Button
  onClick={handleGoogleSignup}
  variant="outlined"
  fullWidth
  sx={{
    height: 48,
    backgroundColor: darkMode ? '#1e1e1e' : 'white',
    color: darkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.54)',
    border: darkMode ? '1px solid #333' : '1px solid #ddd',
    borderRadius: 24,
    fontWeight: 500,
    textTransform: 'none',
    fontSize: '14px',
    mb: 2, // Reduced bottom margin
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: darkMode ? '#252525' : '#f5f5f5',
      boxShadow: 'none'
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <GoogleIcon sx={{ color: '#4285F4', mr: 1, fontSize: 20 }} />
  Sign up with Google
</Button>

{/* Login link - placed directly after Google signup */}
<Box 
  sx={{
    width: '100%',
    textAlign: 'center',
    mt: 1,
    mb: 2
  }}
>
  <Typography 
    variant="body2" 
    sx={{ 
            color: textColor,
            textAlign: 'center',
            pb: 2
          }}
  >
    Already have an account? {' '}
    <RouterLink 
                to="/login" 
                style={{ 
                  color: textColor, 
                  textDecoration: 'none', 
                  fontWeight: 'bold' 
                }}
              >
                Login
              </RouterLink>
    {/* <Button
      component={RouterLink}
      to="/login"
      variant="text"
      sx={{
        color: darkMode ? '#4aeabc' : '#30a58b',
        textTransform: 'none',
        fontWeight: 'bold',
        ml: -1,
        borderRadius: 'none'
        
      }}
    >
      Login
    </Button> */}
  </Typography>
</Box>
          </Box>
        </Box>
      
      
      {/* Mobile-only bottom links */}
      
      </Paper>
    </Box>
  );
};

// Password requirement component
const PasswordRequirement = ({ text, met, darkMode, accentColor }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {met ? (
      <CheckCircleOutlineIcon sx={{ fontSize: 16, color: accentColor, mr: 1 }} />
    ) : (
      <ErrorOutlineIcon sx={{ fontSize: 16, color: darkMode ? '#aaaaaa' : '#666666', mr: 1 }} />
    )}
    <Typography 
      variant="caption" 
      sx={{ 
        color: met ? accentColor : darkMode ? '#aaaaaa' : '#666666'
      }}
    >
      {text}
    </Typography>
  </Box>
);

// Dynamic input field styling that adapts to dark/light mode
const inputStyle = (darkMode, accentColor, inputBgColor, inputBorderColor) => ({
  mb: 2,
  '& .MuiOutlinedInput-root': {
    color: darkMode ? '#ffffff' : '#333333', // Fixed text color for dark mode
    backgroundColor: inputBgColor,
    borderRadius: 10,
    '& fieldset': {
      borderColor: inputBorderColor,
      borderWidth: 1,
    },
    '&:hover fieldset': {
      borderColor: accentColor,
    },
    '&.Mui-focused fieldset': {
      borderColor: accentColor,
    },
    '&.Mui-error fieldset': {
      borderColor: '#ff4444',
    },
  },
  '& .MuiInputBase-input': {
    padding: '14px 14px 14px 0',
    '&::placeholder': {
      color: darkMode ? '#aaaaaa' : '#888888', // Fixed placeholder color
      opacity: 0.7,
    },
  },
  '& .MuiInputAdornment-root': {
    marginLeft: 2,
  },
  '& .MuiFormHelperText-root': {
    color: '#ff4444',
    marginLeft: 0,
    marginTop: 0.5,
  },
});

export default Register;