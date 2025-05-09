// frontend/src/pages/VoiceQuestionPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Button, CircularProgress, 
  Paper, Divider, IconButton 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RelationshipQA from '../components/RelationshipQA';
import api from '../services/api';

const VoiceQuestionPage = () => {
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
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !relationship) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" color="error">Error</Typography>
          <Typography>{error || 'Could not find relationship.'}</Typography>
          <Button 
            variant="contained" 
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={handleBack} sx={{ mr: 1 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography 
        variant="h4" 
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem' }, // Smaller font on mobile
          fontWeight: 600,
        }}
      >
          Ask Questions About {relationship.contactName}
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
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
    </Container>
  );
};

export default VoiceQuestionPage;