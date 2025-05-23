// frontend/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Fade,
  Slide,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ForumIcon from '@mui/icons-material/Forum';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { keyframes, styled } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SoulSyncLogo from '../components/SoulSyncLogo';
import FeatureCarousel from '../components/FeatureCarousel';

// Typing animation keyframes
const typing = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const blink = keyframes`
  0%, 50% {
    border-right-color: #ff6b8b;
  }
  51%, 100% {
    border-right-color: transparent;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 139, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 107, 139, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 139, 0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-30px);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

// Styled components
const TypingText = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  borderRight: '3px solid #ff6b8b',
  whiteSpace: 'nowrap',
  width: '0',
  maxWidth: 'none',
  // Text: "What Does AI Really Think About Your Relationship?" = 51 characters
  // Increased to 6 seconds with 100+ steps to ensure full completion
  animation: `${typing} 6s steps(100, end) forwards, ${blink} 1s infinite 6s`,
  fontFamily: "'Fira Code', 'Monaco', monospace",
  display: 'inline-block',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  // Better contrast for both light and dark modes
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)'
    : 'linear-gradient(90deg, #d63384 0%, #198754 100%)', // Darker colors for light mode
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  // Fallback colors for better visibility
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#2c3e50',
  position: 'relative',  
  zIndex: 1,
  minHeight: '1.2em',
  // Force the animation to complete fully
  animationFillMode: 'forwards',
  // Fallback for browsers that don't support background-clip
  '@supports not (background-clip: text)': {
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#2c3e50',
    background: 'none',
  },
}));

// Mobile-specific typing text with better line breaks
const MobileTypingText = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  borderRight: '2px solid #ff6b8b', // Smaller cursor for mobile
  whiteSpace: 'nowrap',
  width: '0',
  maxWidth: 'none',
  animation: `${typing} 4s steps(60, end) forwards, ${blink} 1s infinite 4s`,
  fontFamily: "'Fira Code', 'Monaco', monospace",
  display: 'inline-block',
  fontSize: '1.6rem',
    fontWeight: 700,
    lineHeight: 1.3,
    textAlign: 'center',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)'
      : 'linear-gradient(90deg, #d63384 0%, #198754 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#2c3e50',
    position: 'relative',  
    zIndex: 1,
    minHeight: '0.5em',
    animationFillMode: 'forwards',
    '@supports not (background-clip: text)': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#2c3e50',
      background: 'none',
    },
  }));
  
  // Second line typing animation for mobile
  const MobileTypingTextSecond = styled(Box)(({ theme }) => ({
    overflow: 'hidden',
    borderRight: '2px solid #ff6b8b', // Same small cursor
    whiteSpace: 'nowrap',
    width: '0',
    maxWidth: 'none',
    animation: `${typing} 3s steps(50, end) forwards, ${blink} 1s infinite 3s`,
    fontFamily: "'Fira Code', 'Monaco', monospace",
    display: 'inline-block',
    fontSize: '1.8rem',
  fontWeight: 700,
  lineHeight: 1.3,
  textAlign: 'center',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)'
    : 'linear-gradient(90deg, #d63384 0%, #198754 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#2c3e50',
  position: 'relative',  
  zIndex: 1,
  minHeight: '2.2em',
  animationFillMode: 'forwards',
  '@supports not (background-clip: text)': {
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#2c3e50',
    background: 'none',
  },
}));

const AnimatedChip = styled(Chip)(({ theme, delay = 0 }) => ({
  animation: `${fadeInUp} 0.8s ease-out ${delay}s both`,
  margin: theme.spacing(0.5),
  background: 'linear-gradient(45deg, #ff6b8b, #33d2c3)',
  color: 'white',
  fontWeight: 600,
  '&:hover': {
    transform: 'scale(1.05)',
    transition: 'transform 0.2s ease',
  },
}));

const StatsCard = styled(Card)(({ theme, delay = 0 }) => ({
  animation: `${fadeInUp} 0.8s ease-out ${delay}s both`,
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
}));

const FloatingIcon = styled(Box)(({ delay = 0 }) => ({
  animation: `${float} 3s ease-in-out ${delay}s infinite`,
  display: 'inline-block',
}));

const PulseButton = styled(Button)(({ theme }) => ({
  animation: `${pulse} 2s infinite`,
  background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
  borderRadius: 30,
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #ff5c7f 0%, #2bc0b2 100%)',
    transform: 'translateY(-2px)',
  },
}));

// Welcome Dialog Component
const WelcomeDialog = ({ open, onClose, darkMode }) => {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showObservation, setShowObservation] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [questionFaded, setQuestionFaded] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset all states
      setTypingComplete(false);
      setQuestionFaded(false);
      
      // Mobile timing (shorter text)
      const typingTimer = setTimeout(() => setTypingComplete(true), 5000);
      const fadeTimer = setTimeout(() => setQuestionFaded(true), 5800);
      const subtitleTimer = setTimeout(() => setShowSubtitle(true), 6800);
      const statsTimer = setTimeout(() => setShowStats(true), 7500);
      const observationTimer = setTimeout(() => setShowObservation(true), 8500);

      return () => {
        clearTimeout(typingTimer);
        clearTimeout(fadeTimer);
        clearTimeout(subtitleTimer);
        clearTimeout(statsTimer);
        clearTimeout(observationTimer);
      };
    } else {
      // Reset states when dialog closes
      setShowSubtitle(false);
      setShowStats(false);
      setShowObservation(false);
      setTypingComplete(false);
      setQuestionFaded(false);
    }
  }, [open]);

  const topicData = [
    { label: 'Logistics', value: 62, color: '#ff6b8b' },
    { label: 'Work', value: 28, color: '#33d2c3' },
    { label: 'Affection', value: 6, color: '#9966ff' },
    { label: 'Future Plans', value: 4, color: '#ffa726' },
  ];

  const powerDynamics = [
    { label: 'You initiate conversations', value: '85%', icon: <ChatBubbleOutlineIcon /> },
    { label: 'You apologize more often', value: '2x', icon: <PsychologyOutlinedIcon /> },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
      PaperProps={{
        sx: {
          background: darkMode 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
        }
      }}
    >
      {/* Animated background particles */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          zIndex: 0,
        }}
      />

      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          color: 'white',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
          padding: { xs: 2, md: 4 },
          paddingTop: { xs: 6, md: 8 }, 
          paddingBottom: { xs: 4, md: 6 },
          overflow: 'auto', // Enable scrolling
          maxHeight: '100vh', // Ensure it doesn't exceed viewport
        }}
      >
        <Container maxWidth="lg" sx={{ width: '100%' }}>
          {/* Mobile-first question display */}
          <Box sx={{ 
            display: { xs: 'flex', md: 'none' }, // Only show on mobile
            textAlign: 'center', 
            mb: 4,
            minHeight: '70vh',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            px: 1,
          }}>
            {/* Mobile typing question with better text */}
            <Fade 
              in={!questionFaded} 
              timeout={1000}
              style={{
                transitionDelay: questionFaded ? '0ms' : '200ms',
              }}
            >
              <Box sx={{ 
                textAlign: 'center',
                width: '100%',
                maxWidth: '100%',
                mx: 'auto',
                animation: typingComplete && !questionFaded ? `${fadeOut} 1s ease-out 0.8s forwards` : 'none',
              }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontFamily: "'Fira Code', 'Monaco', monospace",
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    minHeight: '5em',
                    width: '100%',
                  }}
                >
                  {/* First line */}
                  <Box sx={{ width: '100%',overflow: 'visible',minWidth: 'fit-content', }}>
                    <MobileTypingText>
                      What Does AI Think
                    </MobileTypingText>
                  </Box>
                  
                  {/* Second line - shows after first completes */}
                  {typingComplete && (
                    <Box sx={{ 
                      width: '100%',
                      animation: `${fadeInUp} 0.8s ease-out forwards`,
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontFamily: "'Fira Code', 'Monaco', monospace",
                    }}>
                      About Your Relationship?
                    </Box>
                  )}
                </Typography>
              </Box>
            </Fade>

            {/* Mobile subtitle */}
            <Fade in={questionFaded && showSubtitle} timeout={1200}>
              <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    opacity: 0.95,
                    maxWidth: '90%',
                    mx: 'auto',
                    lineHeight: 1.4,
                    mb: 4,
                    color: 'white',
                  }}
                >
                  Upload your conversation and get instant insights:
                </Typography>
              </Box>
            </Fade>
          </Box>

          {/* Desktop question display */}
          <Box sx={{ 
            display: { xs: 'none', md: 'block' }, // Only show on desktop
            textAlign: 'center', 
            mb: { xs: 4, md: 6 }, 
            width: '100%' 
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: { xs: '100px', md: '140px' },
              px: { xs: 1, sm: 2 },
              width: '100%',
              position: 'relative',
            }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontSize: { 
                    sm: '1.3rem',    
                    md: '1.8rem',    
                    lg: '2.2rem'     
                  },
                  fontWeight: 700,
                  lineHeight: 1.1,  
                  textAlign: 'center',
                  width: '100%',
                  fontFamily: "'Fira Code', 'Monaco', monospace",
                  position: 'relative',
                  zIndex: 2,
                  letterSpacing: { md: '0.01em' },
                  wordBreak: 'keep-all',
                  maxWidth: '95%',
                  margin: '0 auto',
                }}
              >
                <TypingText>
                  What Does AI Really Think About Your Relationship?
                </TypingText>
              </Typography>
            </Box>

            {/* Desktop subtitle */}
            <Fade in={showSubtitle} timeout={800}>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    opacity: 0.9,
                    maxWidth: 800,
                    mx: 'auto',
                    lineHeight: 1.6,
                    mt: 2,
                  }}
                >
                  Upload your conversation and get instant insights:
                </Typography>
              </Box>
            </Fade>
          </Box>

          {/* Stats grid - Show only after subtitle appears */}
          <Fade in={showStats} timeout={1000}>
            <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
              {/* Topics breakdown */}
              <Grid item xs={12} md={6}>
                <StatsCard delay={0.2}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FloatingIcon delay={0}>
                        <TrendingUpIcon sx={{ color: '#ff6b8b', mr: 1, fontSize: { xs: 24, md: 32 } }} />
                      </FloatingIcon>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Topics You Talk About Most
                      </Typography>
                    </Box>
                    
                    {topicData.map((topic, index) => (
                      <Box key={topic.label} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {topic.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: topic.color }}>
                            {topic.value}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={topic.value}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: topic.color,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </StatsCard>
              </Grid>

              {/* Power dynamics */}
              <Grid item xs={12} md={6}>
                <StatsCard delay={0.4}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FloatingIcon delay={0.5}>
                        <PsychologyIcon sx={{ color: '#33d2c3', mr: 1, fontSize: { xs: 24, md: 32 } }} />
                      </FloatingIcon>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Power Dynamics
                      </Typography>
                    </Box>
                    
                    {powerDynamics.map((dynamic, index) => (
                      <Box
                        key={dynamic.label}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          mb: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(51, 210, 195, 0.1)',
                          border: '1px solid rgba(51, 210, 195, 0.2)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {dynamic.icon}
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                            {dynamic.label}
                          </Typography>
                        </Box>
                        <AnimatedChip
                          label={dynamic.value}
                          delay={0.6 + index * 0.2}
                          size="small"
                        />
                      </Box>
                    ))}
                  </CardContent>
                </StatsCard>
              </Grid>
            </Grid>
          </Fade>

          {/* AI Observation */}
          <Slide direction="up" in={showObservation} timeout={1000}>
            <StatsCard
              delay={0.8}
              sx={{
                mb: 4,
                background: 'linear-gradient(135deg, rgba(153, 102, 255, 0.2), rgba(255, 107, 139, 0.2))',
                border: '2px solid rgba(153, 102, 255, 0.3)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                <FloatingIcon delay={1}>
                  <PsychologyOutlinedIcon sx={{ color: '#9966ff', fontSize: { xs: 32, md: 48 }, mb: 2 }} />
                </FloatingIcon>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  // Better visibility in both modes
                  color: theme => theme.palette.mode === 'dark' ? '#9966ff' : '#e2c9c9'
                }}>
                  AI Observations
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: 'italic',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    // Better contrast for light and dark modes
                    color: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.9)' 
                      : 'rgb(0 9 25)', // Darker color for light mode
                    maxWidth: 600,
                    mx: 'auto',
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  "There's emotional effort, but unmet needs beneath the surface."
                </Typography>
              </CardContent>
            </StatsCard>
          </Slide>

          {/* Call to action */}
          <Fade in={showObservation} timeout={1500}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                }}
              >
                And much more!
              </Typography>
              
              <PulseButton
                size="large"
                onClick={onClose}
                sx={{
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.2rem' },
                }}
              >
                Discover Your Relationship Insights
              </PulseButton>
              
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  opacity: 0.8,
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                }}
              >
                Upload your chat • Get instant analysis • 100% private
              </Typography>
            </Box>
          </Fade>
        </Container>
      </DialogContent>
    </Dialog>
  );
};

const Home = () => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  
  const isAuthenticated = currentUser !== null;

  // Check if user has seen the welcome dialog
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && !isAuthenticated) {
      setShowWelcomeDialog(true);
    }
  }, [isAuthenticated]);

  const handleCloseWelcome = () => {
    setShowWelcomeDialog(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <>
      {/* Welcome Dialog */}
      <WelcomeDialog
        open={showWelcomeDialog}
        onClose={handleCloseWelcome}
        darkMode={darkMode}
      />

      {/* Main Home Content */}
      <Box className="home-container" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Hero Section */}
        <Box
          className="home-hero"
          sx={{
            background: darkMode 
            ? 'linear-gradient(345deg, #1e1033 0%, #2c124d 100%)' 
            : 'linear-gradient(345deg, #2a1a5e 0%, #3d1e7a 100%)',
            color: 'primary.contrastText',
            borderRadius: 4,
            py: { xs: 6, md: 8 },
            px: { xs: 2, md: 3 },
            mx: 'auto', 
            mb: { xs: 0, md: 4 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxWidth: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <Box 
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              opacity: 0.05,
              zIndex: 0,
              background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 2 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            }}
          />
          
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                mb: 4,
              }}
            >
              <SoulSyncLogo size="large" withText textSize="xlarge" />
              
              <Typography 
                variant="h5" 
                align="center" 
                paragraph
                className="home-subtitle"
                sx={{
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  lineHeight: 1.6,
                  mb: 5,
                  mt: 5,
                  maxWidth: '800px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 400,
                  letterSpacing: '0.015em',
                }}
                >
                {isAuthenticated ? (
                  <>
                    <Box component="span" sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.7rem' },
                          display: 'block',
                          mb: 2,
                        }}>Welcome back, {currentUser.name || 'User'}!</Box> 
                    <Box sx={{ 
                            fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.4rem' },
                            opacity: 0.9,
                            maxWidth: '700px',
                            mx: 'auto',
                          }}>
                      Developing emotional intelligence takes practice. Let's continue exploring your relationship patterns together.
                    </Box>
                  </>
                ) : (
                  'Reflect on your closest relationships through conversations with an emotionally intelligent AI. Gain insights, build awareness, and strengthen your connections.'
                )}
              </Typography>
              
              {/* Show different buttons based on authentication status */}
              {isAuthenticated ? (
                <Stack
                  className="home-buttons"
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 3 }}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Button 
                    variant="contained" 
                    size="large"
                    component={RouterLink}
                    to="/dashboard"
                    sx={{
                      borderRadius: 30,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      width: { xs: '100%', sm: 'auto' },
                      background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #ff5c7f 0%, #2bc0b2 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    component={RouterLink}
                    to="/new-relationship"
                    sx={{
                      borderRadius: 30,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      width: { xs: '100%', sm: 'auto' },
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: '#ffffff',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Add New Relationship
                  </Button>
                </Stack>
              ) : (
                <Stack
                  className="home-buttons"
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 3 }}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Button 
                    variant="contained" 
                    size="large"
                    component={RouterLink}
                    to="/register"
                    sx={{
                      borderRadius: 30,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      width: { xs: '100%', sm: 'auto' },
                      background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #ff5c7f 0%, #2bc0b2 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      borderRadius: 30,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      width: { xs: '100%', sm: 'auto' },
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: '#ffffff',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Log In
                  </Button>
                </Stack>
              )}
              
              {/* Show welcome dialog button for non-authenticated users */}
              {!isAuthenticated && (
                <Button
                  variant="text"
                  onClick={() => setShowWelcomeDialog(true)}
                  sx={{
                    mt: 2,
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  See AI Analysis Preview
                </Button>
              )}
            </Box>
          </Container>
        </Box>

        {/* Feature Carousel - only visible on mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mt: -3, zIndex: 10, position: 'relative' }}>
          <FeatureCarousel />
        </Box>

        {/* Features Section - Desktop Version - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <Container 
            maxWidth="lg" 
            sx={{ 
              mb: { xs: 3, md: 5 }, 
              mt: { md: 8 },
              px: { xs: 2, sm: 3 },
              display: { xs: 'none', md: 'block' }
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              align="center" 
              sx={{ 
                mb: 5,
                fontWeight: 700,
                fontSize: { md: '2.2rem' },
                background: darkMode ? 
                  'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)' : 
                  'linear-gradient(90deg, #5e35b1 20%, #512da8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Transform Your Relationships with SoulSync
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 30px rgba(0,0,0,0.15)'
                    },
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <Box sx={{ 
                    height: 8, 
                    width: '100%', 
                    background: '#ff6b8b',
                  }} />
                  <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                    <PeopleIcon sx={{ fontSize: 60, color: '#ff6b8b', mb: 2 }} />
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, mb: 2, fontSize: '1.4rem' }}>
                      Create Relationship Profiles
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Add the important people in your life and track your interactions, emotions, and experiences with them. Build a comprehensive view of each relationship.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 30px rgba(0,0,0,0.15)'
                    },
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <Box sx={{ 
                    height: 8, 
                    width: '100%', 
                    background: '#9966ff',
                  }} />
                  <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                    <PsychologyIcon sx={{ fontSize: 60, color: '#9966ff', mb: 2 }} />
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, mb: 2, fontSize: '1.4rem' }}>
                      AI-Guided Conversations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Have natural conversations with our emotionally intelligent AI to process your thoughts and feelings about each relationship. Get insights in real-time.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 30px rgba(0,0,0,0.15)'
                    },
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <Box sx={{ 
                    height: 8, 
                    width: '100%', 
                    background: '#33d2c3',
                  }} />
                  <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                    <InsightsIcon sx={{ fontSize: 60, color: '#33d2c3', mb: 2 }} />
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, mb: 2, fontSize: '1.4rem' }}>
                      Valuable Insights
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Discover patterns, improve self-awareness, and develop strategies for deeper connections with the people who matter most in your life.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 30px rgba(0,0,0,0.15)'
                    },
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <Box sx={{ 
                    height: 8, 
                    width: '100%', 
                    background: '#0288d1',
                  }} />
                  <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                    <ForumIcon sx={{ fontSize: 60, color: '#0288d1', mb: 2 }} />
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, mb: 2, fontSize: '1.4rem' }}>
                      Analyze Chats
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Upload your WhatsApp conversations and let SoulSync decode tone, trends, and emotional cues in your relationships. Private and secure.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        )}

        {/* Desktop version of the feature carousel - only show for non-authenticated users */}
        {!isAuthenticated && (
          <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 5, mb: 5 }}>
            <FeatureCarousel />
          </Box>
        )}

        {/* Security & Privacy Section - show to everyone */}
        <Container maxWidth="md" sx={{ my: 8, px: { xs: 2, sm: 3 } }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              p: 4,
              borderRadius: 4,
              bgcolor: darkMode ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.05)',
              border: '1px solid',
              borderColor: darkMode ? 'rgba(46, 125, 50, 0.3)' : 'rgba(46, 125, 50, 0.1)',
            }}
          >
            <SecurityIcon 
              sx={{ 
                fontSize: 80, 
                color: '#2e7d32', 
                mr: { md: 4 },
                mb: { xs: 2, md: 0 } 
              }} 
            />
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                Private & Secure
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Your data is never shared. Everything is analyzed locally and securely, with full transparency. We never store your chat data longer than needed for analysis.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                SoulSync uses state-of-the-art encryption and doesn't share your relationship data with third parties.
              </Typography>
            </Box>
          </Box>
        </Container>

        {/* Call to Action - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <Box 
            sx={{ 
              bgcolor: darkMode ? 'rgba(94, 53, 177, 0.1)' : '#f5f5f7', 
              py: { xs: 6, md: 8 }, 
              px: 2,
              borderRadius: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Container maxWidth="md">
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                  borderRadius: 4,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ready to transform your relationships?
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  maxWidth: 700,
                  mx: 'auto',
                  mb: 4,
                  color: darkMode ? 'text.primary' : 'text.secondary',
                }}
              >
                Join thousands of people using SoulSync to gain insights, improve communication, and build stronger connections with the people who matter most.
              </Typography>
              
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  px: 5,
                  py: 1.5,
                  borderRadius: 30,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #ff5c7f 0%, #2bc0b2 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
                component={RouterLink}
                to="/register"
              >
                Create Your Free Account
              </Button>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2,
                  opacity: 0.7,
                  fontSize: '0.875rem',
                }}
              >
                No credit card required. Start for free today.
              </Typography>
            </Container>
          </Box>
        )}

        {/* Show a different action section for authenticated users */}
        {isAuthenticated && (
          <Box 
            sx={{ 
              bgcolor: darkMode ? 'rgba(94, 53, 177, 0.1)' : '#f5f5f7', 
              py: { xs: 6, md: 8 }, 
              px: 2,
              borderRadius: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Container maxWidth="md">
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                  borderRadius: 4,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Continue your relationship journey
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  maxWidth: 700,
                  mx: 'auto',
                  mb: 4,
                  color: darkMode ? 'text.primary' : 'text.secondary',
                }}
              >
                Access your dashboard to view your relationships, start new conversations, or analyze your recent interactions.
              </Typography>
              
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  px: 5,
                  py: 1.5,
                  borderRadius: 30,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #ff5c7f 0%, #2bc0b2 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
                component={RouterLink}
                to="/dashboard"
              >
                Go to Dashboard
              </Button>
            </Container>
          </Box>
        )}
      </Box>
    </>
  );
};

export default Home;