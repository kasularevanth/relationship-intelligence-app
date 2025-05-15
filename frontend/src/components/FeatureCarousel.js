// frontend/src/components/FeatureCarousel.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link as RouterLink } from 'react-router-dom';
import Lottie from 'lottie-react';

// Import your local JSON animation files
// Replace these imports with the correct paths to your JSON files
import privacyAnimation from '../assets/animations/privacy.json';
import relationshipAnimation from '../assets/animations/smart-relationship.json';
import whatsappAnimation from '../assets/animations/whatsapp.json';

  // Add global CSS for Lottie animations
const globalStyles = `
  .lottie-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    max-width: 100%;
  }
  
  @media (min-width: 600px) {
    .lottie-animation svg {
      transform: scale(0.85);
    }
  }
  
  /* Specific positioning for each animation */
  .privacy-animation svg {
    margin-top: 0;
  }
  
  .relationship-animation svg {
    margin-top: 15px;
  }
  
  .whatsapp-animation svg {
    margin-top: 5px;
  }
`;

// Inject global styles
const injectGlobalStyles = () => {
  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  styleEl.innerHTML = globalStyles;
  document.head.appendChild(styleEl);
  return () => {
    document.head.removeChild(styleEl);
  };
};

// Styled components
const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
  maxWidth: '100%',
  margin: '0 auto',
  [theme.breakpoints.up('md')]: {
    maxWidth: '80%',
  },
}));

const SlideContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  transition: 'transform 0.5s ease-in-out',
  height: 520, // Increased height for mobile
  [theme.breakpoints.up('sm')]: {
    height: 500, // Increased height for desktop to avoid dots overlapping
  },
}));

const Slide = styled(Box)(({ theme }) => ({
  minWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4, 2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const SlideBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0.05,
  zIndex: 0,
  background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  color: '#fff',
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  [theme.breakpoints.up('sm')]: {
    width: 48,
    height: 48,
  },
}));

const NavigationDot = styled(Box)(({ active, theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: active ? '#fff' : 'rgba(255, 255, 255, 0.5)',
  margin: theme.spacing(0, 0.5),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  [theme.breakpoints.up('sm')]: {
    width: 10,
    height: 10,
  },
}));

const IllustrationBox = styled(Box)(({ theme, slideIndex }) => ({
  width: '100%',
  maxWidth: 200,
  height: 160,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: slideIndex === 2 ? theme.spacing(2) : 0, // Add padding specifically for relationship advice slide
  [theme.breakpoints.up('sm')]: {
    maxWidth: 240,
    height: 180,
    marginBottom: theme.spacing(4), // More margin on larger screens
    paddingTop: slideIndex === 2 ? theme.spacing(3) : 0, // More padding on desktop
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
  borderRadius: 30,
  color: '#fff',
  fontWeight: 600,
  padding: theme.spacing(1, 4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(5), // Add bottom margin for dots
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  textTransform: 'none',
  fontSize: '0.95rem',
  '&:hover': {
    background: 'linear-gradient(90deg, #ff5c7f 0%, #2bc0b2 100%)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5, 4),
    fontSize: '1rem',
    marginBottom: theme.spacing(6), // More margin on larger screens
  },
}));

// The main component
const FeatureCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Refs for the Lottie animations
  const privacyAnimRef = useRef(null);
  const relationshipAnimRef = useRef(null);
  const whatsappAnimRef = useRef(null);

  // Feature slides data
  const slides = [
    {
      title: "Welcome to SoulSync",
      description: "Your AI-powered relationship advisor. Understand emotional patterns and improve how you connect with those who matter.",
      color: "#5e35b1", // Deep purple
      icon: <FavoriteIcon sx={{ fontSize: isMobile ? 36 : 50, color: '#ff4081' }} />,
      illustration: (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Hearts floating animation */}
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              component="span"
              sx={{
                position: 'absolute',
                fontSize: Math.random() * 20 + 15,
                color: '#ff4081',
                animation: `float ${Math.random() * 4 + 3}s ease-in-out ${Math.random() * 2}s infinite`,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80}%`,
                opacity: Math.random() * 0.5 + 0.5,
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                  '50%': { transform: `translateY(-20px) rotate(${Math.random() * 20}deg)` },
                },
              }}
            >
              ❤️
            </Box>
          ))}
        </Box>
      ),
    },
    {
      title: "Private & Secure",
      description: "Your data is never shared. Everything is analyzed locally and securely, with full transparency.",
      color: "#2e7d32", // Green
      icon: <LockIcon sx={{ fontSize: isMobile ? 36 : 50, color: '#fff' }} />,
      illustration: (
        <Lottie 
          animationData={privacyAnimation} 
          loop={true} 
          autoplay={currentSlide === 1}
          style={{ width: '100%', height: '100%' }}
          lottieRef={privacyAnimRef}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
          className="lottie-animation privacy-animation"
        />
      ),
    },
    {
      title: "Smart Relationship Advice",
      description: "Receive helpful insights to navigate conflict, deepen bonds, and grow mutual understanding — powered by AI.",
      color: "#ed6c02", // Orange
      icon: <SmartToyOutlinedIcon sx={{ fontSize: isMobile ? 36 : 50, color: '#fff' }} />,
      illustration: (
        <Lottie 
          animationData={relationshipAnimation} 
          loop={true} 
          autoplay={currentSlide === 2}
          style={{ width: '100%', height: '100%' }}
          lottieRef={relationshipAnimRef}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
          className="lottie-animation relationship-animation"
        />
      ),
    },
    {
      title: "Analyze WhatsApp Chats",
      description: "Upload your WhatsApp conversations and let SoulSync decode tone, trends, and emotional cues in your relationships.",
      color: "#0288d1", // Blue
      icon: <ChatOutlinedIcon sx={{ fontSize: isMobile ? 36 : 50, color: '#fff' }} />,
      illustration: (
        <Lottie 
          animationData={whatsappAnimation} 
          loop={true} 
          autoplay={currentSlide === 3}
          style={{ width: '100%', height: '100%' }}
          lottieRef={whatsappAnimRef}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
          className="lottie-animation whatsapp-animation"
        />
      ),
    },
  ];

  // Inject global styles for Lottie animations
  useEffect(() => {
    const cleanup = injectGlobalStyles();
    return cleanup;
  }, []);

  // Effect to control which animation should play
  useEffect(() => {
    // Pause all animations
    [privacyAnimRef, relationshipAnimRef, whatsappAnimRef].forEach(ref => {
      if (ref.current) {
        ref.current.pause();
      }
    });

    // Play the current animation
    if (currentSlide === 1 && privacyAnimRef.current) {
      privacyAnimRef.current.play();
    } else if (currentSlide === 2 && relationshipAnimRef.current) {
      relationshipAnimRef.current.play();
    } else if (currentSlide === 3 && whatsappAnimRef.current) {
      whatsappAnimRef.current.play();
    }
  }, [currentSlide]);

  // Autoplay functionality
  useEffect(() => {
    let interval;
    if (autoplay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoplay, slides.length]);

  // Pause autoplay when user interacts
  const handleUserInteraction = () => {
    setAutoplay(false);
    // Restart autoplay after 10 seconds of inactivity
    setTimeout(() => setAutoplay(true), 10000);
  };

  const handlePrev = () => {
    handleUserInteraction();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    handleUserInteraction();
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index) => {
    handleUserInteraction();
    setCurrentSlide(index);
  };

  return (
    <CarouselContainer>
      <SlideContainer
        sx={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            sx={{ 
              backgroundColor: slide.color,
              color: '#fff',
            }}
          >
            {/* Background pattern */}
            <SlideBackground />
            
            <IllustrationBox>
              {slide.illustration}
            </IllustrationBox>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              mb: 1.5,
              position: 'relative',
              zIndex: 1
            }}>
              <Box sx={{ 
                mb: isMobile ? 1 : 0,
                mr: isMobile ? 0 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {slide.icon}
              </Box>
              
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h2" 
                sx={{ 
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  // Word break to prevent awkward breaks in titles
                  wordBreak: 'break-word',
                  hyphens: 'auto',
                  width: '100%'
                }}
              >
                {slide.title}
              </Typography>
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                maxWidth: 450, 
                mx: 'auto',
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 1,
                px: isMobile ? 1 : 0
              }}
            >
              {slide.description}
            </Typography>
            
            <GradientButton
              component={RouterLink}
              to="/register"
            >
              Get Started
            </GradientButton>
          </Slide>
        ))}
      </SlideContainer>

      {/* Navigation arrows */}
      <NavigationButton
        onClick={handlePrev}
        sx={{ left: isMobile ? theme.spacing(1) : theme.spacing(2) }}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon fontSize={isMobile ? "small" : "medium"} />
      </NavigationButton>
      
      <NavigationButton
        onClick={handleNext}
        sx={{ right: isMobile ? theme.spacing(1) : theme.spacing(2) }}
        aria-label="Next slide"
      >
        <ChevronRightIcon fontSize={isMobile ? "small" : "medium"} />
      </NavigationButton>

      {/* Navigation dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: isMobile ? theme.spacing(2) : theme.spacing(3),
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
        }}
      >
        {slides.map((_, index) => (
          <NavigationDot
            key={index}
            active={currentSlide === index}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </Box>
    </CarouselContainer>
  );
};

export default FeatureCarousel;