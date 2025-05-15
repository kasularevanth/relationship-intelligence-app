// frontend/src/components/LottieVoiceAssistant.js
import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
// Import your JSON file
import AIchatbotData from '../assets/animations/AI-chatbot.json';
import { useTheme } from '../contexts/ThemeContext';

const LottieVoiceAssistant = ({ 
  status = 'idle', 
  onActivate,
  size = 240, 
  speechVisualizerRef
}) => {
  const lottieRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const { darkMode } = useTheme(); // Get dark mode state
  
  // Control animation based on status
  useEffect(() => {
    if (!lottieRef.current) return;
    
    // Different behavior based on status
    if (status === 'idle') {
      lottieRef.current.goToAndStop(0, true);
    } else if (status === 'listening') {
      lottieRef.current.play();
    } else if (status === 'processing') {
      lottieRef.current.play();
    } else if (status === 'speaking') {
      lottieRef.current.play();
    }
  }, [status]);
  
  useEffect(() => {
    if (speechVisualizerRef) {
      speechVisualizerRef.current = {
        simulateWordEmphasis: (emphasisLevel) => {
          if (lottieRef.current) {
            lottieRef.current.setSpeed(1 + emphasisLevel);
          }
        }
      };
    }
  }, [speechVisualizerRef]);
  
  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Tap to ask a question by voice';
      case 'listening':
        return 'Listening... Click again to stop';
      case 'processing':
        return 'Processing your question...';
      case 'speaking':
        return 'Speaking...';
      default:
        return '';
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        height: '400px',
        // Dark mode background adjustment
        backgroundColor: darkMode ? 'rgba(18, 18, 18, 1)' : 'transparent', 
        borderRadius: '12px',
      }}
    >
      {/* Ambient glow effect - enhanced for dark mode */}
      <Box
        sx={{
          position: 'absolute',
          width: `${size * 1.5}px`,
          height: `${size * 1.5}px`,
          borderRadius: '50%',
          background: status === 'speaking' 
            ? 'radial-gradient(circle, rgba(66, 153, 225, 0.15) 0%, rgba(0, 0, 0, 0) 70%)'
            : 'none',
          filter: 'blur(25px)',
          opacity: darkMode ? 0.6 : 0.3,
          zIndex: 0,
        }}
      />
      
      {/* Main Lottie container */}
      <Box
        onClick={onActivate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1,
          transform: isHovered && status === 'idle' ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.3s ease',
          // Add shadow glow in dark mode
          filter: darkMode ? 'drop-shadow(0 0 10px rgba(66, 153, 225, 0.5))' : 'none',
        }}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={AIchatbotData}
          loop={status !== 'idle'}
          autoplay={status !== 'idle'}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      
      {/* Status text */}
      <Typography 
        variant="body1" 
        fontWeight={500}
        sx={{ 
          mt: 3, 
          textAlign: 'center',
          minHeight: '24px',
          opacity: 0.8,
          color: '#60a5fa',
          zIndex: 1,
        }}
      >
        {getStatusText()}
      </Typography>
    </Box>
  );
};

export default LottieVoiceAssistant;