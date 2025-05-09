import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Grid,
  Avatar,
  CircularProgress,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { relationshipService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Styled components
const PageContainer = styled(Box)(({ theme, darkMode }) => ({
  backgroundColor: darkMode ? '#121212' : '#fff',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 16px', // Add horizontal padding for mobile
}));

const HeaderContainer = styled(Box)(({ darkMode }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px 16px',
  color: darkMode ? '#fff' : '#000',
}));

const HeaderTitle = styled(Typography)(({ darkMode }) => ({
  fontWeight: 700,
  fontSize: '24px',
  color: darkMode ? '#fff' : '#000',
}));

const AddCircleButton = styled(IconButton)(({ darkMode }) => ({
  backgroundColor: darkMode ? '#333' : '#000',
  color: '#fff',
  width: 32,
  height: 32,
  '&:hover': {
    backgroundColor: darkMode ? '#444' : '#333',
  },
}));

const CircularContactItem = styled(Box)(({ darkMode }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  },
}));
const ContactAvatar = styled(Avatar)(({ darkMode }) => ({
  width: 68, // Slightly smaller for mobile
  height: 68, // Slightly smaller for mobile
  marginBottom: 8,
  boxShadow: darkMode 
    ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)',
  backgroundColor: darkMode ? '#333' : '#D3D3D3',
  border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
  
  // Responsive sizing
  '@media (min-width: 600px)': {
    width: 78,
    height: 78,
  },
}));

const ContactName = styled(Typography)(({ darkMode }) => ({
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: 1.2,
  color: darkMode ? '#e0e0e0' : 'inherit',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const TimeAgo = styled(Typography)(({ darkMode }) => ({
  fontSize: '12px',
  color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
}));
const MicButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  margin: '24px auto',
});

const MicButton = styled(Button)(({ darkMode }) => ({
  backgroundColor: darkMode ? '#333' : '#000',
  color: '#fff',
  width: '80%', // Responsive width for mobile
  maxWidth: '260px',
  height: 48,
  borderRadius: '24px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: darkMode ? '#444' : '#333',
  },
}));

const EmptyStateContainer = styled(Box)(({ darkMode }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  minHeight: 400,
  textAlign: 'center',
  color: darkMode ? '#e0e0e0' : 'inherit',
  backgroundColor: darkMode ? '#1e1e1e' : 'transparent',
  borderRadius: '12px',
}));

// Sound Wave SVG component
const SoundWave = ({ darkMode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', height: 24, mx: 1 }}>
    <Box sx={{ width: 2, height: 8, mx: 0.5, bgcolor: darkMode ? '#aaa' : 'white' }} />
    <Box sx={{ width: 2, height: 14, mx: 0.5, bgcolor: darkMode ? '#aaa' : 'white' }} />
    <Box sx={{ width: 2, height: 18, mx: 0.5, bgcolor: darkMode ? '#aaa' : 'white' }} />
    <Box sx={{ width: 2, height: 14, mx: 0.5, bgcolor: darkMode ? '#aaa' : 'white' }} />
    <Box sx={{ width: 2, height: 8, mx: 0.5, bgcolor: darkMode ? '#aaa' : 'white' }} />
  </Box>
);

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Backup sample images for contacts without photos
  const sampleImages = {
    'test': 'https://randomuser.me/api/portraits/men/32.jpg',
    'vineeth': 'https://randomuser.me/api/portraits/men/33.jpg',
    'Revanth': 'https://randomuser.me/api/portraits/men/34.jpg',
    'MASA MALLIK': 'https://randomuser.me/api/portraits/men/35.jpg',
    'divya': 'https://randomuser.me/api/portraits/women/32.jpg',
    'test1': 'https://randomuser.me/api/portraits/women/33.jpg',
  };

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const response = await relationshipService.getAll();
        console.log("Relationships data:", response.data);
        
        // Process relationships to ensure we properly handle the photo URL
        const enhancedRelationships = response.data.map(relationship => {
          // Get the base API URL from environment or use default
          const baseApiUrl = 'http://localhost:5000';
          
          // Check if photo path exists and ensure it has the proper URL format
          if (relationship.photo) {
            // If the photo path starts with "/uploads", prepend the base API URL
            if (relationship.photo.startsWith('/uploads')) {
              const fullPhotoUrl = `${baseApiUrl}${relationship.photo}`;
              
              return { ...relationship, photoUrl: fullPhotoUrl };
            } else {
              // If it's already a full URL, use it as is
              return { ...relationship, photoUrl: relationship.photo };
            }
          }
          
          // Fallback to the original photoUrl if it exists
          if (relationship.photoUrl) {
            return relationship;
          }
          
          // Final fallback to sample images or null
          const photoUrl = sampleImages[relationship.contactName] || null;
          return { ...relationship, photoUrl };
        });

        
        setRelationships(enhancedRelationships);
      } catch (error) {
        console.error('Error fetching relationships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (date) => {
    if (!date) return 'No interactions yet';
    
    const now = new Date();
    const interactionDate = new Date(date);
    const diffMinutes = Math.floor((now - interactionDate) / (1000 * 60));
    
    if (diffMinutes < 60) {
      // Show in minutes if less than an hour
      return `${diffMinutes || 1} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes < 24 * 60) {
      // Show in hours if less than a day
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      // Show in days otherwise
      const diffDays = Math.floor(diffMinutes / (60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const contactsToDisplay = relationships.length > 0 ? relationships : "";

  const renderContacts = () => (
    <Grid container spacing={2} sx={{ px: 2 }}>
      {contactsToDisplay.map((contact, index) => (
        <Grid item xs={4} key={contact.id || contact._id || index}>
          <CircularContactItem darkMode={darkMode} onClick={() => navigate(`/relationships/${contact._id || contact.id}`)}>
         <ContactAvatar src={contact.photoUrl} darkMode={darkMode}
                           onError={(e) => {
                             console.error("Error loading image:", e.target.src);
                             e.target.onerror = null;
                             e.target.src = "";
                           }}
            >
              {getInitials(contact.contactName)}
            </ContactAvatar>
            <ContactName darkMode={darkMode}>{contact.contactName}</ContactName>
            <TimeAgo darkMode={darkMode}>
              {getTimeAgo(contact.lastInteraction || contact.updatedAt)}
            </TimeAgo>
          </CircularContactItem>
        </Grid>
      ))}
    </Grid>
  );

  const EmptyState = () => (
    <EmptyStateContainer darkMode={darkMode}>
      <Avatar sx={{ width: 100, height: 100, mb: 3, bgcolor: 'primary.main' }}>
        <PersonAddIcon sx={{ fontSize: 50 }} />
      </Avatar>
      <Typography variant="h6" gutterBottom>
        Your Circle is Empty
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Add your first contact to begin building your circle.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate('/new-relationship')}
      >
        Add First Contact
      </Button>
    </EmptyStateContainer>
  );

  return (
    <PageContainer darkMode={darkMode}>
      <HeaderContainer darkMode={darkMode}>
        <HeaderTitle darkMode={darkMode}>My Circle</HeaderTitle>
        <AddCircleButton darkMode={darkMode} onClick={() => navigate('/new-relationship')}>
          <AddIcon fontSize="small" />
        </AddCircleButton>
      </HeaderContainer>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      ) : relationships.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {renderContacts()}
          <MicButtonContainer>
          <MicButton 
              darkMode={darkMode}
              onClick={() => console.log('Mic button clicked')}
              startIcon={<Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                <SoundWave darkMode={darkMode}/>
              </Box>}
            >
            </MicButton>
          </MicButtonContainer>
        </>
      )}
    </PageContainer>
  );
};

export default Dashboard;