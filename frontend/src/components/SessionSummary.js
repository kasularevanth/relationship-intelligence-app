// frontend/src/components/SessionSummary.js
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import {
  Lightbulb,
  ArrowForward,
  Memory,
  Psychology,
  Bookmark,
  BookmarkBorder,
  Share,
} from '@mui/icons-material';

const SummaryContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const SummaryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  marginTop: theme.spacing(3),
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const SummarySection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const InsightChip = styled(Chip)(({ theme, insightType }) => {
  const colors = {
    emotion: theme.palette.info.light,
    pattern: theme.palette.warning.light,
    growth: theme.palette.success.light,
    challenge: theme.palette.error.light,
  };
  
  return {
    backgroundColor: colors[insightType] || theme.palette.grey[200],
    margin: theme.spacing(0.5),
    '& .MuiChip-label': {
      fontWeight: 500,
    },
  };
});

const MemoryItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
}));

const SessionSummary = ({ 
  session, 
  onSaveMemory, 
  onShare, 
  onNavigateToProfile, 
  relationshipId 
}) => {
  // Handle session data structure variations
  const {
    summary,
    insights = [],
    memories = [],
    emotionalTone,
    contactName,
    createdAt,
    duration,
  } = session || {};
  
  // Format date
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Recent session';
  
  // Format duration in minutes
  const formattedDuration = duration 
    ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
    : '00:00';
  
  // Handle saving memory items
  const handleSaveMemory = (memoryIndex) => {
    if (onSaveMemory && memories[memoryIndex]) {
      onSaveMemory(memories[memoryIndex]);
    }
  };
  
  return (
    <SummaryContainer elevation={2}>
      <SummaryHeader>
        <Box>
          <Typography variant="h5" gutterBottom>
            Conversation Summary
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formattedDate} · {formattedDuration} minutes
          </Typography>
        </Box>
        <Button 
          endIcon={<ArrowForward />}
          variant="outlined"
          onClick={() => onNavigateToProfile && onNavigateToProfile(relationshipId)}
        >
          View Full Profile
        </Button>
      </SummaryHeader>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Main summary */}
      <SummarySection>
        <Typography variant="body1">
          {summary || "You reflected on your relationship with this person, exploring various aspects of your connection and dynamic."}
        </Typography>
        
        {emotionalTone && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ mr: 1 }}>
              Emotional tone:
            </Typography>
            <Chip 
              label={emotionalTone}
              size="small"
              color={
                emotionalTone.toLowerCase().includes('positive') ? 'success' :
                emotionalTone.toLowerCase().includes('negative') ? 'error' :
                'default'
              }
              variant="outlined"
            />
          </Box>
        )}
      </SummarySection>
      
      {/* Key insights */}
      <SectionTitle variant="h6">
        <Lightbulb /> Key Insights
      </SectionTitle>
      <SummarySection>
        {insights && insights.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {insights.map((insight, index) => (
              <Box key={index} sx={{ mb: 1.5, width: '100%' }}>
                <InsightChip 
                  label={insight.type || 'Insight'} 
                  size="small" 
                  insightType={insight.category || 'pattern'}
                />
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {insight.text}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Continue having conversations to generate more insights about this relationship.
          </Typography>
        )}
      </SummarySection>
      
      {/* Key memories */}
      <SectionTitle variant="h6">
        <Memory /> Memorable Moments
      </SectionTitle>
      <SummarySection>
        {memories && memories.length > 0 ? (
          <List disablePadding>
            {memories.map((memory, index) => (
              <MemoryItem key={index}>
                <ListItemText 
                  primary={memory.content} 
                  secondary={memory.type ? `Type: ${memory.type}` : null}
                />
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleSaveMemory(index)}
                    color={memory.saved ? 'primary' : 'default'}
                  >
                    {memory.saved ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </ListItemIcon>
              </MemoryItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Continue sharing memories in conversations to save important moments.
          </Typography>
        )}
      </SummarySection>
      
      {/* Next steps */}
      <SectionTitle variant="h6">
        <Psychology /> Moving Forward
      </SectionTitle>
      <SummarySection sx={{ mb: 1 }}>
        <Typography variant="body2">
          {session?.nextSteps || 
            `Continue having conversations about ${contactName || 'this person'} to build a richer understanding of your relationship. Each conversation adds more depth to your relationship profile.`
          }
        </Typography>
      </SummarySection>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          startIcon={<Share />}
          variant="outlined"
          sx={{ mr: 2 }}
          onClick={onShare}
        >
          Share Summary
        </Button>
        <Button 
          variant="contained"
          onClick={() => onNavigateToProfile && onNavigateToProfile(relationshipId)}
        >
          View Complete Profile
        </Button>
      </Box>
    </SummaryContainer>
  );
};

export default SessionSummary;