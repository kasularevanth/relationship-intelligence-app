// SiriStyleVoiceAssistant.js - ChatGPT-style UI
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';

const SiriStyleVoiceAssistant = ({ 
  status = 'idle', 
  onActivate,
  size = 240, 
  speechVisualizerRef
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Expose simulateWordEmphasis to parent component
  useEffect(() => {
    if (speechVisualizerRef) {
      speechVisualizerRef.current = {
        simulateWordEmphasis: (emphasisLevel) => {
          // This is just a stub - the animation will happen through CSS
          console.log('Word emphasis:', emphasisLevel);
        }
      };
    }
  }, [speechVisualizerRef]);
  
  // Helper function to determine which icon to show
  const getIcon = () => {
    if (status === 'listening') {
      return <CloseIcon sx={{ color: 'white', fontSize: 32 }} />;
    }
    return <MicIcon sx={{ color: 'white', fontSize: 32 }} />;
  };
  
  // Helper text based on status
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
  
  // Helper function to get the appropriate animation class
  const getAnimationClass = () => {
    if (status === 'listening') return 'pulse-listening';
    if (status === 'processing') return 'pulse-processing';
    if (status === 'speaking') return 'pulse-speaking';
    return isHovered ? 'pulse-hover' : '';
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
      }}
    >
      {/* Audio waves visualization */}
      {status === 'listening' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '40px',
            zIndex: 5,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              sx={{
                width: '4px',
                backgroundColor: '#60a5fa',
                height: '20px',
                borderRadius: '4px',
                animation: `wave-animation ${0.6 + i * 0.1}s infinite ease-in-out alternate`,
              }}
            />
          ))}
        </Box>
      )}
      
      {/* Main orb container */}
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
          borderRadius: '50%',
          cursor: 'pointer',
          background: 'radial-gradient(circle, rgba(137,207,240,1) 0%, rgba(0,119,255,1) 100%)',
          boxShadow: '0 0 30px 5px rgba(0, 119, 255, 0.4)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)',
            zIndex: 2,
          },
          // Animation classes
          [`&.${getAnimationClass()}`]: {
            animation: status === 'listening' ? 'pulse-blue 1.5s infinite' :
                      status === 'processing' ? 'pulse-orange 0.8s infinite' :
                      status === 'speaking' ? 'pulse-normal 2s infinite' : 'none',
          },
          // Dynamic styling based on status
          transform: isHovered && status === 'idle' ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
          // Apply the animation class
          className: getAnimationClass(),
        }}
      >
        {/* Outer glow - varies by status */}
        <Box
          sx={{
            position: 'absolute',
            width: '130%',
            height: '130%',
            borderRadius: '50%',
            opacity: 0.3,
            filter: 'blur(30px)',
            background: status === 'listening' ? 'rgba(66, 153, 225, 0.6)' :
                       status === 'processing' ? 'rgba(237, 137, 54, 0.6)' :
                       status === 'speaking' ? 'rgba(72, 187, 120, 0.6)' :
                       'rgba(66, 153, 225, 0.4)',
            animation: status !== 'idle' ? 'glow-animation 2s infinite alternate' : 'none',
          }}
        />
        
        {/* Inner white shine */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '40%',
            height: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
            transform: 'rotate(-30deg)',
            zIndex: 4,
          }}
        />
        
        {/* Icon container */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            position: 'relative',
          }}
        >
          {getIcon()}
        </Box>
      </Box>
      
      {/* Status text */}
      <Typography 
        variant="body1" 
        color="primary"
        fontWeight={500}
        sx={{ 
          mt: 3, 
          textAlign: 'center',
          minHeight: '24px',
          opacity: 0.8,
          color: '#60a5fa',
        }}
      >
        {getStatusText()}
      </Typography>
      
      {/* Add styles directly in component for animations */}
      <style jsx="true">{`
        @keyframes pulse-blue {
          0% { transform: scale(1); box-shadow: 0 0 30px 5px rgba(0, 119, 255, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(0, 119, 255, 0.6); }
          100% { transform: scale(1); box-shadow: 0 0 30px 5px rgba(0, 119, 255, 0.4); }
        }
        
        @keyframes pulse-orange {
          0% { transform: scale(1); box-shadow: 0 0 30px 5px rgba(237, 137, 54, 0.4); }
          50% { transform: scale(1.03); box-shadow: 0 0 35px 8px rgba(237, 137, 54, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 30px 5px rgba(237, 137, 54, 0.4); }
        }
        
        @keyframes pulse-normal {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        
        @keyframes glow-animation {
          0% { opacity: 0.2; }
          100% { opacity: 0.4; }
        }
        
        @keyframes wave-animation {
          0% { height: 5px; }
          100% { height: 30px; }
        }
      `}</style>
    </Box>
  );
};

export default SiriStyleVoiceAssistant;