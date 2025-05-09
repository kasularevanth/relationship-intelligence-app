// frontend/src/pages/Home.js
import React from 'react';
import { Box, Button, Container, Grid, Typography, Card, CardContent, CardMedia, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useTheme } from '../contexts/ThemeContext';
import { autoBatchEnhancer } from '@reduxjs/toolkit';

const Home = () => {
  const { darkMode } = useTheme();

  return (
    <Box className="home-container" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Hero Section */}
      <Box
        className="home-hero"
        sx={{
          background: darkMode 
          ? 'linear-gradient(345deg, #0009 0%, #5045aa 100%)' 
          : 'linear-gradient(345deg, #4040a0 0%, #5045aa 100%)',
          color: 'primary.contrastText',
          borderRadius: 3,
          py: { xs: 3.5, md: 5 },
          px: { xs: 2, md: 3 },
          mx: 'auto', 
          mb: { xs: 3, md: 4 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '1200px',
          
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            gutterBottom
            className="home-title"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 2
            }}
          >
            Relationship Intelligence
          </Typography>
          <Typography 
            variant="h5" 
            align="center" 
            paragraph
            className="home-subtitle"
            sx={{
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              lineHeight: 1.5,
              mb: 2.5,
              mx: 'auto',
              maxWidth: '800px'
            }}
          >
            Reflect on your closest relationships through conversations with an emotionally intelligent AI.
            Gain insights, build awareness, and strengthen your connections.
          </Typography>
          <Stack
            className="home-buttons"
            sx={{ pt: { xs: 1, md: 2 } }}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            justifyContent="center"
            alignItems="center"
          >
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={RouterLink}
              to="/register"
              sx={{
                borderRadius: 30,
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'none',
                width: { xs: '90%', sm: 'auto' },
                maxWidth: '240px'
              }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              component={RouterLink}
              to="/login"
              sx={{
                borderRadius: 30,
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'none',
                width: { xs: '90%', sm: 'auto' },
                maxWidth: '240px'
              }}
            >
              Log In
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          sx={{ 
            mb: { xs: 3, md: 4 },
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '1.8rem' }
          }}
        >
          How It Works
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 15px rgba(0,0,0,0.1)'
                },
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper'
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5, px: 2 }}>
                <PeopleIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, mb: 1, fontSize: '1.25rem' }}>
                  Create Relationship Profiles
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Add the important people in your life and track your interactions, emotions, and experiences with them.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 15px rgba(0,0,0,0.1)'
                },
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper'
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5, px: 2 }}>
                <PsychologyIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, mb: 1, fontSize: '1.25rem' }}>
                  AI-Guided Conversations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Have natural conversations with our emotionally intelligent AI to process your thoughts and feelings about each relationship.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 15px rgba(0,0,0,0.1)'
                },
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper'
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5, px: 2 }}>
                <InsightsIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600, mb: 1, fontSize: '1.25rem' }}>
                  Gain Valuable Insights
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Discover patterns, improve self-awareness, and develop strategies for deeper connections with the people who matter most.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box 
        sx={{ 
          bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'background.paper', 
          py: { xs: 3, md: 4 }, 
          px: 2,
          mt: { xs: 2, md: 3 }, 
          textAlign: 'center',
          borderRadius: 3,
          mx: 'auto', 
          maxWidth: '1200px',
          margin: '0 auto',
          boxShadow: darkMode ? 'none' : '0 -2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="h5" 
          component="p" 
          color="text.primary" 
          gutterBottom
          sx={{
            fontWeight: 600,
            
            mb: 2,
            fontSize: { xs: '1.1rem', md: '1.3rem' }
          }}
        >
          Ready to transform your relationships?
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ 
            mt: 1,
            borderRadius: 30,
            px: 3,
            py: 1,
            fontWeight: 600,
            fontSize: '0.9rem',
            textTransform: 'none',
            minWidth: { xs: 180, sm: 220 }
          }}
          component={RouterLink}
          to="/register"
        >
          Get Started Now
        </Button>
      </Box>
    </Box>
  );
};

export default Home;