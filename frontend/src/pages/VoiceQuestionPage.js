// frontend/src/pages/VoiceQuestionPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Button, CircularProgress, 
  Paper, Divider, IconButton 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RelationshipQA from '../components/RelationshipQA';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AnimatedBox = styled(Box)`
  animation: ${fadeIn} 0.5s ease-out forwards;
`;

const VoiceQuestionPage = () => {
  const { darkMode } = useTheme();
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchRelationship = async () => {
      try {
        const response = await api.get(`/relationships/${relationshipId}`);
        setRelationship(response.data);
      } catch (err) {
        console.error('Error fetching relationship data:', err);
        setError('Could not load relationship data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRelationship();
  }, [relationshipId]);

  const handleBack = () => {
    navigate(`/relationships/${relationshipId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 3, color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
          Loading relationship data...
        </Typography>
      </Box>
    );
  }

  if (error || !relationship) {
    return (
      <Container maxWidth="md">
        <Paper 
            sx={{ 
              p: 4, 
              mt: 4, 
              textAlign: 'center',
              bgcolor: darkMode ? 'rgba(211, 47, 47, 0.2)' : '#fff8f8',
              border: '1px solid',
              borderColor: darkMode ? 'rgba(211, 47, 47, 0.4)' : '#ffcccc'
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Unable to Load Relationship
            </Typography>
            <Typography sx={{ mb: 3 }}>
              {error || 'Could not find relationship data. Please try again later.'}
            </Typography>
            <Button 
              variant="contained"
              color="primary" 
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Return to Dashboard
            </Button>
          </Paper>
      </Container>
    );
  }

  return (
    <Container 
        maxWidth="md" 
        sx={{ 
          pt: { xs: 6, sm: 8 }, // Top padding to push content away from navbar
          px: { xs: 2, sm: 3 },  // Horizontal padding
          pb: 4, // Bottom padding
        }}
      >
      <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
          <IconButton 
              onClick={handleBack} 
              sx={{ 
                mr: 2,
                color: darkMode ? '#fff' : 'inherit',
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                }
              }}
            >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 600,
                color: darkMode ? '#fff' : 'inherit'
              }}
            >
            Ask Questions About {relationship.contactName}
          </Typography>
        </Box>
      <AnimatedBox>
        <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                mb: 4,
                bgcolor: darkMode ? '#1e1e1e' : 'background.paper',
                color: darkMode ? '#fff' : 'inherit',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'inherit'
              }}
            >
          <Typography variant="h6" gutterBottom>
            About This Feature
          </Typography>
          <Typography paragraph>
            Ask the AI any questions about your relationship with {relationship.contactName}. 
            The AI will analyze your relationship data and provide thoughtful insights.
          </Typography>
          <Typography paragraph>
            You can ask questions by text or voice. The AI will use your conversation 
            history, relationship details, and patterns to provide personalized responses.
          </Typography>
        </Paper>

        <RelationshipQA 
          relationshipId={relationshipId}
          relationshipName={relationship.contactName}
        />
      </AnimatedBox>
    </Container>
  );
};

export default VoiceQuestionPage;