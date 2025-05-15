// frontend/src/pages/Home.js
import React from 'react';
import { Box, Button, Container, Grid, Typography, Card, CardContent, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ForumIcon from '@mui/icons-material/Forum';
import SecurityIcon from '@mui/icons-material/Security';
import { useTheme } from '../contexts/ThemeContext';
import SoulSyncLogo from '../components/SoulSyncLogo';
import FeatureCarousel from '../components/FeatureCarousel';

const Home = () => {
  const { darkMode } = useTheme();

  return (
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
            background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
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
                mb: 4,
                mt: 3,
                mx: 'auto',
                maxWidth: '800px',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              Reflect on your closest relationships through conversations with an emotionally intelligent AI.
              Gain insights, build awareness, and strengthen your connections.
            </Typography>
            
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
          </Box>
        </Container>
      </Box>

      {/* Feature Carousel - only visible on mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mt: -3, zIndex: 10, position: 'relative' }}>
        <FeatureCarousel />
      </Box>

      {/* Features Section - Desktop Version */}
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

      {/* Desktop version of the feature carousel */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 5, mb: 5 }}>
        <FeatureCarousel />
      </Box>

      {/* Security & Privacy Section */}
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

      {/* Call to Action */}
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
    </Box>
  );
};

export default Home;