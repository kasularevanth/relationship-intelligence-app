import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkUserSession } = useAuth();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          // Update auth context
          await checkUserSession();
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          throw new Error('No token received');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };
    
    handleCallback();
  }, [location, navigate, checkUserSession]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default AuthCallback;