// frontend/src/components/SoulSyncLogo.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const SoulSyncLogo = ({ size = 'medium', withText = true, textSize = 'small', inline = false }) => {
  // Size variants
  const sizes = {
    xsmall: 28,
    small: 40,
    medium: 60,
    large: 80,
    xlarge: 120
  };
  
  // Text size variants
  const textSizes = {
    xsmall: { xs: '1rem', md: '1.1rem' },
    small: { xs: '1.2rem', md: '1.5rem' },
    medium: { xs: '1.8rem', md: '2rem' },
    large: { xs: '2.5rem', md: '3rem' },
    xlarge: { xs: '3rem', md: '4rem' }
  };
  
  const logoSize = typeof size === 'string' ? sizes[size] : size;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      flexDirection: inline ? 'row' : 'column', 
      gap: inline ? 1 : 0
    }}>
      {/* SVG Logo */}
      <Box sx={{ width: logoSize, height: logoSize }}>
        <svg 
          viewBox="0 0 100 100" 
          width="100%" 
          height="100%" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b8b" />
              <stop offset="100%" stopColor="#ff4778" />
            </linearGradient>
            <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#33d2c3" />
              <stop offset="100%" stopColor="#20b5a5" />
            </linearGradient>
          </defs>
          
          {/* Pink figure head */}
          <circle cx="30" cy="20" r="10" fill="url(#pinkGradient)" />
          
          {/* Teal figure head */}
          <circle cx="70" cy="20" r="10" fill="url(#tealGradient)" />
          
          {/* Pink heart part */}
          <path 
            d="M 30,30 C 20,40 5,60 30,80 C 40,60 45,55 50,55" 
            fill="none" 
            stroke="url(#pinkGradient)" 
            strokeWidth="15" 
            strokeLinecap="round"
          />
          
          {/* Teal infinity part */}
          <path 
            d="M 70,30 C 80,40 95,60 70,80 C 60,60 55,55 50,55" 
            fill="none" 
            stroke="url(#tealGradient)" 
            strokeWidth="15" 
            strokeLinecap="round"
          />
        </svg>
      </Box>
      
      {/* Text */}
      {withText && (
        <Typography
          variant="h1"
          component="span"
          sx={{
            fontSize: textSizes[textSize],
            fontWeight: 700,
            background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            mt: inline ? 0 : 1
          }}
        >
          SoulSync
        </Typography>
      )}
    </Box>
  );
};

export default SoulSyncLogo;