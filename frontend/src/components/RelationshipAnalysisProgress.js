// components/RelationshipAnalysisProgress.js
import React, { useState, useEffect } from 'react';
import { relationshipAnalysisService } from '../services/api';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Button,
  Alert,
  Paper,
  CircularProgress,
  Fade
} from '@mui/material';
import { Refresh, CheckCircle, Error } from '@mui/icons-material';

/**
 * Component to display relationship analysis progress and handle refresh
 */
const RelationshipAnalysisProgress = ({ relationshipId, conversationId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('analyzing');
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let timer = null;
    let attempts = 0;
    const maxAttempts = 20;

    const checkAnalysisStatus = async () => {
      try {
        if (attempts >= maxAttempts) {
          setStatus('timeout');
          setError('Analysis is taking longer than expected. You can try refreshing manually.');
          return;
        }

        // Simulate progress based on attempts
        setProgress(Math.min((attempts / maxAttempts) * 100, 95));
        attempts++;

        // Check if relationship has been analyzed
        const response = await relationshipAnalysisService.getDetailedProfile(relationshipId);
        const relationship = response.data;

        // Check for completion indicators
        if (relationship && 
            relationship.metrics && 
            relationship.metrics.depthScore && 
            relationship.metrics.emotionalVolatility &&
            relationship.topicDistribution && 
            relationship.topicDistribution.length > 0) {
          
          // Analysis completed
          setProgress(100);
          setStatus('completed');
          
          // Call completion callback
          if (onComplete) {
            onComplete(relationship);
          }
          
          return;
        }

        // Continue checking
        timer = setTimeout(checkAnalysisStatus, 3000);
      } catch (err) {
        console.error('Error checking analysis status:', err);
        setError('Error checking analysis status. Please try refreshing manually.');
        setStatus('error');
      }
    };

    // Start checking
    checkAnalysisStatus();

    // Clean up timer on unmount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [relationshipId, conversationId, onComplete]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setStatus('analyzing');
      
      // Trigger manual analysis
      await relationshipAnalysisService.analyzeRelationship(relationshipId);
      
      // Reset progress 
      setProgress(30);
      
      // Start checking again
      let newAttempts = 0;
      const checkAgain = async () => {
        if (newAttempts > 10) {
          setError('Refresh attempt timed out. Please try again later.');
          setStatus('error');
          setIsRefreshing(false);
          return;
        }
        
        setProgress(30 + Math.min((newAttempts / 10) * 70, 65));
        newAttempts++;
        
        // Check for completion
        const response = await relationshipAnalysisService.getDetailedProfile(relationshipId);
        const relationship = response.data;
        
        if (relationship && 
            relationship.metrics && 
            relationship.metrics.depthScore && 
            relationship.metrics.emotionalVolatility &&
            relationship.topicDistribution && 
            relationship.topicDistribution.length > 0) {
          
          // Refresh completed
          setProgress(100);
          setStatus('completed');
          setIsRefreshing(false);
          
          // Call completion callback
          if (onComplete) {
            onComplete(relationship);
          }
          
          return;
        }
        
        // Continue checking
        setTimeout(checkAgain, 3000);
      };
      
      // Start checking
      checkAgain();
      
    } catch (err) {
      console.error('Error refreshing analysis:', err);
      setError('Error refreshing analysis. Please try again later.');
      setStatus('error');
      setIsRefreshing(false);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mt: 2, 
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${status === 'error' ? '#ffcccc' : status === 'completed' ? '#ccffcc' : '#e0e0e0'}`
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" component="div">
          Relationship Analysis
        </Typography>
        
        {status === 'completed' && (
          <Fade in={true}>
            <CheckCircle color="success" />
          </Fade>
        )}
        
        {status === 'error' && (
          <Fade in={true}>
            <Error color="error" />
          </Fade>
        )}
        
        {status === 'analyzing' && !isRefreshing && (
          <CircularProgress size={24} />
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box mb={2}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          color={status === 'error' ? 'error' : status === 'completed' ? 'success' : 'primary'} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {status === 'analyzing' && 'Analyzing relationship data...'}
          {status === 'completed' && 'Analysis completed successfully!'}
          {status === 'error' && 'Analysis encountered an error.'}
          {status === 'timeout' && 'Analysis taking longer than expected.'}
        </Typography>
        
        {(status === 'error' || status === 'timeout') && (
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default RelationshipAnalysisProgress;