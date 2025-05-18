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
  FormHelperText
} from '@mui/material';
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

  // Colors based on mode
  const accentColor = darkMode ? '#4aeabc' : '#30a58b'; // Darker green for light mode
  const headerBgColor = darkMode ? '#000000' : '#ffffff'; // White header in light mode
  const formBgColor = darkMode ? '#1a1a1a' : '#ffffff'; // White form in light mode
  const inputBgColor = darkMode ? '#333333' : '#f7f7f7'; // Light gray inputs in light mode
  const inputBorderColor = darkMode ? '#444444' : '#e0e0e0'; // Light borders in light mode
  const textColor = darkMode ? '#4aeabc' : '#30a58b'; // Darker green text in light mode
  const subtitleColor = darkMode ? '#aaaaaa' : '#757575'; // Gray subtitle in light mode
  const iconColor = darkMode ? '#4aeabc' : '#30a58b'; // Darker green icons in light mode
  const formHelperTextColor = '#ff4444'; // Red error text in both modes
  const buttonColor = darkMode ? '#4aeabc' : '#30a58b'; // Darker green button in light mode

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

  // Calculate if all password requirements are met
  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordRequirementsMet = Object.values(passwordStrength).filter(Boolean).length;
  const passwordStrengthPercent = (passwordRequirementsMet / Object.values(passwordStrength).length) * 100;

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? '#000000' : '#f5f5f5',
      px: isMobile ? 2 : 4,
      py: 4,
      transition: 'background-color 0.3s ease'
    }}>
      {/* Form Container */}
      <Paper 
        elevation={darkMode ? 0 : 4} 
        sx={{ 
          width: '100%',
          maxWidth: isMobile ? '100%' : '400px',
          backgroundColor: formBgColor,
          borderRadius: 4,
          overflow: 'hidden',
          border: darkMode ? '1px solid #333333' : 'none',
          boxShadow: darkMode 
            ? 'none' 
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          mb: isMobile ? 0 : 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box sx={{ 
          width: '100%', 
          backgroundColor: headerBgColor,
          p: 4,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          textAlign: 'center' // Ensure text is centered on mobile
        }}>
          {/* Lock Icon */}
          <LockOutlinedIcon 
            sx={{ 
              fontSize: 48, 
              color: accentColor, 
              mb: 2
            }} 
          />
          
          {/* Title */}
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              color: accentColor,
              fontWeight: 'bold',
              mb: 1,
              textAlign: 'center', // Ensure text is centered on mobile
              width: '100%'
            }}
          >
            Create Account
          </Typography>
          
          {/* Subtitle */}
          <Typography 
            variant="body1" 
            sx={{ 
              color: subtitleColor,
              textAlign: 'center', // Ensure text is centered on mobile
              width: '100%'
            }}
          >
            Join the circle
          </Typography>
        </Box>

        <Box sx={{ 
          width: '100%',
          p: 3,
          backgroundColor: formBgColor
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
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
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
                mb: isMobile ? 2 : 4,
                backgroundColor: buttonColor,
                color: '#ffffff', // Use white text for better contrast on darker green
                borderRadius: 6, // Keep original border radius
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: darkMode ? '#3dd9aa' : '#278f77', // Darker hover in light mode
                },
                '&:disabled': {
                  backgroundColor: darkMode ? 'rgba(74, 234, 188, 0.7)' : 'rgba(48, 165, 139, 0.7)',
                  color: '#ffffff',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
            
            {!isMobile && (
              <>
                {/* Already have an account text */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? '#4aeabc' : '#30a58b', // Darker green in light mode
                    textAlign: 'center',
                    mb: 2
                  }}
                >
                  Already have an account? {' '}
                  <RouterLink 
                    to="/login" 
                    style={{ 
                      color: darkMode ? '#4aeabc' : '#30a58b', // Darker green in light mode
                      textDecoration: 'none', 
                      fontWeight: 'bold' 
                    }}
                  >
                    Login
                  </RouterLink>
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Mobile-only bottom links */}
      {isMobile && (
        <Box sx={{ 
          mt: 3,
          textAlign: 'center',
          width: '100%'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: darkMode ? '#4aeabc' : '#30a58b', // Darker green in light mode
              mb: isMobile ? 1 : 0
            }}
          >
            Already have an account? {' '}
            <RouterLink 
              to="/login" 
              style={{ 
                color: darkMode ? '#4aeabc' : '#30a58b', // Darker green in light mode
                textDecoration: 'none', 
                fontWeight: 'bold' 
              }}
            >
              Login
            </RouterLink>
          </Typography>         
        </Box>
      )}
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
    color: darkMode ? '#4aeabc' : '#333333',
    backgroundColor: inputBgColor,
    borderRadius: 10, // Keep original border radius
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
      color: darkMode ? '#4aeabc' : '#888888',
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