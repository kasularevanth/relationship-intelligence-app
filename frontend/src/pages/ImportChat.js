import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext'; // Import ThemeContext
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress,
  Grow,
  Chip
} from '@mui/material';
import { 
  Upload, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  BarChart, 
  MessageCircle,
  Activity,
  Clock,
  Star,
  FileType
} from 'lucide-react';

import { importService, relationshipService } from '../services/api';
import RelationshipAnalysisProgress from '../components/RelationshipAnalysisProgress';


const ImportChat = () => {
  const { darkMode } = useTheme(); // Add this line to get darkMode state
  const darkGradient = 'linear-gradient(222deg, #0009 0%, #1c345c 100%)';
  const { relationshipId } = useParams();
  const navigate = useNavigate(); 
  
  const [activeStep, setActiveStep] = useState(0);
  const [chatSource, setChatSource] = useState('whatsapp');
  const [contactPhone, setContactPhone] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [importStats, setImportStats] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importAnalysis, setImportAnalysis] = useState(null);
  const pollingIntervalRef = useRef(null); // Use ref for polling interval
  const [topicsProcessed, setTopicsProcessed] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(false);

  const steps = ['Select Source', 'Upload File', 'Process Import', 'Review Analysis'];

  // File types allowed - to display in the upload screen
  const allowedFileTypes = ['.txt', '.csv', '.json', '.zip', '.html'];

  // Clean up polling when component unmounts
      useEffect(() => {
        return () => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        };
      }, []);

  // Start polling for import status when conversationId is set
  useEffect(() => {
   // Clean up any existing interval first
   if (pollingIntervalRef.current) {
    clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = null;
  }
  
  // Start new polling only if we have a conversation ID and it's still processing
  if (conversationId && importStatus !== 'completed' && importStatus !== 'analyzed' && importStatus !== 'failed') {
    pollingIntervalRef.current = setInterval(checkImportStatus, 1500);
  }
  
  return () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };
  }, [conversationId, importStatus]);

  // When import is completed, fetch analysis
  useEffect(() => {
    if ((importStatus === 'completed' || importStatus === 'analyzed') && conversationId && !importAnalysis) {
      fetchImportAnalysis();
    }
  }, [importStatus, conversationId]);
  
  // Show update notification with animation when topics are processed
  useEffect(() => {
    if (topicsProcessed) {
      setUpdateNotification(true);
    }
  }, [topicsProcessed]);

  const checkImportStatus = async () => {
    try {
      if (!conversationId) return;

      const response = await importService.getImportStatus(conversationId);
      const { status, progress = 0 } = response.data;
      
      setImportStatus(status);

      // If no progress is returned, increment slowly up to 95%
      if (progress === 0 && importProgress < 95) {
        // Faster increments to give impression of quicker processing
        const increment = importProgress < 40 ? 15 : 
                          importProgress < 70 ? 10 : 
                          importProgress < 90 ? 5 : 2;
        setImportProgress(prev => Math.min(prev + increment, 95));
      } else {
        setImportProgress(progress || importProgress);
      } 
      
      // Check for completion states - now including "analyzed" status
      if (status === 'completed' || status === 'analyzed' || status === 'failed') {
        // Clear the interval to stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        if (status === 'completed' || status === 'analyzed') {
          setSuccess(true);
          setImportProgress(100);
          // Move to final step to show analysis
          setActiveStep(3);
        } else if (status === 'failed') {
          setError('Import failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error checking import status:', err);
      setError(err.response?.data?.message || 'Error checking import status');
      
      // Always clear interval on error to prevent continuous failing requests
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

 // Update this function in your ImportChat component
 const fetchImportAnalysis = async () => {
  try {
    const response = await importService.getImportAnalysis(conversationId);
    console.log("imported data response.............", response);
    
    // Ensure all expected fields are present (with fallbacks)
    const analysisData = {
      topSenders: response.data.topSenders || {},
      topTopics: response.data.topTopics || [],
      timeRange: response.data.timeRange || '',
      insights: typeof response.data.insights === 'object' ? 
        response.data.insights.insightsText || 'Analysis in progress...' : 
        response.data.insights || 'Analysis in progress...',
        summary: {
      ...response.data.summary,
      // Add fallbacks for missing nested structures
      emotionalDynamics: response.data.summary?.emotionalDynamics || {
        overall: "balanced",
        user: "engaged",
        contact: "responsive",
        trends: "consistent"
      },
    // Always ensure arrays exist
    keyInsights: response.data.summary?.keyInsights || [],
    areasForGrowth: response.data.summary?.areasForGrowth || []
  },
      messageCount: response.data.messageCount || 0,
      // Include all the additional fields from the response
      sentimentScore: response.data.sentimentScore,
      sentimentLabel: response.data.sentimentLabel,
      communicationBalance: response.data.communicationBalance,
      messageCount: response.data.messageCount,
      primaryTopics: response.data.primaryTopics,
      topicDistribution: response.data.topicDistribution,
      connectionScore: response.data.connectionScore,
      relationshipLevel: response.data.relationshipLevel,
      challengesBadges: response.data.challengesBadges,
      nextMilestone: response.data.nextMilestone,
      communicationStyle: response.data.communicationStyle,
      // Add new fields
      loveLanguage: response.data.loveLanguage,
      trustLevel: response.data.trustLevel,
      theirValues: response.data.theirValues,
      theirInterests: response.data.theirInterests,
      communicationPreferences: response.data.communicationPreferences,
      importantDates: response.data.importantDates
    };
    
    setImportAnalysis(analysisData);
    
      // Process topics for relationship if we have topic data
      if (analysisData.topTopics && analysisData.topTopics.length > 0) {
        await processTopicsForRelationship(analysisData.topTopics);
      }
      localStorage.setItem('relationship_data_updated', relationshipId);
    sessionStorage.setItem('refreshRelationshipData', 'true');
  } catch (err) {
    console.error('Error fetching import analysis:', err);
    setError(err.response?.data?.message || 'Error fetching import analysis');
    
    // Provide fallback analysis data so UI doesn't break
    setImportAnalysis({
      topSenders: { 'You': 1, 'Contact': 1 },
      topTopics: [],
      timeRange: '',
      insights: 'Unable to load analysis data.',
      summary: {},
      sentimentScore: 0,
      sentimentLabel: '',
      communicationBalance: '',
      messageCount: 0,
      primaryTopics: [],
      topicDistribution: [],
      connectionScore: 0,
      relationshipLevel: 0,
      challengesBadges: [],
      nextMilestone: '',
      communicationStyle: {}
    });
  }
};


  const forceUpdateRelationshipMetrics = async () => {
    try {
      console.log("Forcing update of relationship metrics for:", relationshipId);
  
      const response = await relationshipService.recalculateMetrics(relationshipId);
      console.log("Successfully forced relationship metrics update", response.data);
      
  
      // Set a flag in localStorage that the relationship profile should refresh
      localStorage.setItem('relationship_data_updated', relationshipId);
      // Also set a flag in sessionStorage for when returning to the profile page
    sessionStorage.setItem('refreshRelationshipData', 'true');
  
      return true;
    } catch (err) {
      console.error("Error updating relationship metrics:", err);
      return false;
    }
  };


  // New function to process topics for the relationship
  const processTopicsForRelationship = async (topTopics) => {
    try {
      // First check if there are conversations to analyze
      const hasConversations = await relationshipService.checkIfRelationshipHasConversations(relationshipId);
      
      if (hasConversations) {
        // Use conversation analysis
        await relationshipService.analyzeTopics(relationshipId);
      } else {
        // No conversations, use imported topics
        const topicsForUpdate = topTopics.map(topic => ({
          name: topic.name,
          percentage: topic.percentage
        }));
        await relationshipService.updateTopicDistribution(relationshipId, topicsForUpdate);
      }
      
      // Force update the metrics directly - ensure this happens regardless of what comes before
      const metricsUpdated = await forceUpdateRelationshipMetrics();
      if (metricsUpdated) {
        setTopicsProcessed(true);
        console.log("Topics and metrics successfully updated for relationship:", relationshipId);
      } else {
        console.warn("Topics updated but metrics update may have failed");
      }
    } catch (err) {
      console.error('Error updating relationship topics:', err);
      // Try metrics update one more time even if topic update failed
      await forceUpdateRelationshipMetrics();
    }
  };

  const handleSourceChange = (event) => {
    setChatSource(event.target.value);
  };

  const handleFileChange = (event) => {
  if (event.target.files.length > 0) {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    // Store file size for better time estimation
    setFileSize(selectedFile.size);
    setError('');
  }
};

  const handleNext = () => {
    if (activeStep === 0 && !chatSource) {
      setError('Please select a chat source');
      return;
    }
    
    if (activeStep === 1 && !file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (activeStep === 2) {
      handleImport();
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    if (activeStep === 0) {
      // Navigate back to relationship profile page
      console.log("i have clicked you");
      navigate(`/relationships/${relationshipId}`);
    } else {
      setActiveStep((prevStep) => prevStep - 1);
      setError('');
    }
  };

  // In your ImportChat.jsx component:

  const handleImport = async () => {
    try {
      setLoading(true);
      setError('');
      setImportProgress(40); // Start with a small progress value
      
      const formData = new FormData();
      formData.append('chatFile', file); // Make sure 'chatFile' matches the name in the backend
      formData.append('source', chatSource);
      if (contactPhone) {
        formData.append('contactPhone', contactPhone);
      }
      
      console.log('File being uploaded:', file.name, file.type, file.size);
      
      const response = await importService.importChat(relationshipId, formData);
      
      // Store conversation ID in state for later use
      const newConversationId = response.data.conversationId;
      setConversationId(newConversationId);
      console.log("Conversation created with ID:", newConversationId);
      
      setImportStats({
        messageCount: response.data.messageCount || 0,
      });
      setImportStatus('processing');
      setImportProgress(40); // Jump to 20% after successful upload
      
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || 'Error importing chat history');
    } finally {
      setLoading(false);
    }
  };

  // Update the goToRelationship function:
    const goToRelationship = async () => {
      try {
        // Always force update before navigating
        await forceUpdateRelationshipMetrics();
        
        // Clear any cached relationship data to ensure fresh load
        localStorage.removeItem('relationshipData_' + relationshipId);
        
        // Add a timestamp query parameter to force the page to reload
        navigate(`/relationships/${relationshipId}?refresh=${Date.now()}`);
      } catch (err) {
        console.error("Error updating metrics before navigation:", err);
        navigate(`/relationships/${relationshipId}?refresh=${Date.now()}`);
      }
    };
  // Also, update the goToConversation function similarly:
  const goToConversation = async () => {
    try {
      // Try to force update before navigating
      await forceUpdateRelationshipMetrics();
      
      // Navigate to the conversation view
      if (conversationId) {
        navigate(`/conversations/${conversationId}`);
      } else {
        setError("Conversation ID is missing. Please try again.");
      }
    } catch (err) {
      console.error("Error updating metrics before navigation:", err);
      if (conversationId) {
        navigate(`/conversations/${conversationId}`);
      }
    }
  };
  
  const getProgressPhaseMessage = () => {
  if (importProgress < 40) return "Starting import process...";
  if (importProgress < 70) return "Processing messages...";
  return "Finalizing analysis...";
};

// Add this function to calculate estimated time
const calculateEstimatedTime = (fileSize, messageCount) => {
  // Base time in seconds for setup/initialization
  const baseTime = 15;
  
  // Calculate time based on file size (if available)
  const fileSizeTime = fileSize ? (fileSize / (1024 * 1024)) * 2 : 0; // ~2 seconds per MB
  
  // Calculate time based on message count (if available)
  const messageTime = messageCount ? messageCount * 0.005 : 0; // ~0.005 seconds per message
  
  // Use the larger of the two estimates or a minimum time
  const totalEstimatedSeconds = Math.max(baseTime + fileSizeTime, baseTime + messageTime, 20);
  
  // Constrain maximum shown time to avoid excessive estimates
  const cappedSeconds = Math.min(totalEstimatedSeconds, 300); // Cap at 5 minutes max
  
  if (cappedSeconds < 30) {
    return "< 30 seconds";
  } else if (cappedSeconds < 60) {
    return "< 1 min";
  } else if (cappedSeconds < 120) {
    return "~1-2 min";
  } else {
    return `~${Math.ceil(cappedSeconds / 60)} min`;
  }
};

const getEstimatedTimeRemaining = () => {
  // Use both file size and message count if available
  if (importStats && importStats.messageCount) {
    // For partially completed imports, estimate remaining time
    const processedPercent = importProgress / 100;
    const remainingMessages = importStats.messageCount * (1 - processedPercent);
    
    // Use the calculateEstimatedTime function with remaining messages
    return calculateEstimatedTime(null, remainingMessages);
  } 
  
  // Initial estimate before upload completes, based on file size
  if (file && fileSize > 0) {
    return calculateEstimatedTime(fileSize, null);
  }
  
  // Fallback to progress-based estimation if no metrics available
  if (importProgress < 20) {
    return "1-2 min";
  } else if (importProgress < 50) {
    return "< 1 min";
  } else if (importProgress < 85) {
    return "Just a moment...";
  }
  return "Almost done!";
};

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box mt={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }}>Select Chat Source</FormLabel>
              <RadioGroup value={chatSource} onChange={handleSourceChange}>
                <FormControlLabel 
                  value="whatsapp" 
                  control={<Radio sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }} />} 
                  label="WhatsApp" 
                  sx={{ color: darkMode ? '#fff' : undefined }}
                />
                <FormControlLabel 
                  value="imessage" 
                  control={<Radio sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }} />} 
                  label="iMessage" 
                  sx={{ color: darkMode ? '#fff' : undefined }}
                />                
              </RadioGroup>
            </FormControl>
            
            <Box mt={3}>
              <Typography variant="subtitle1" sx={{ color: darkMode ? '#fff' : undefined }}>How to export your chat</Typography>
              <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'textSecondary'}>
                {chatSource === 'whatsapp' ? (
                  <>
                    1. Open the chat in WhatsApp<br />
                    2. Tap the three dots (menu) in the top right<br />
                    3. Select 'More' {'>'} 'Export chat'<br />
                    4. Choose 'Without media'<br />
                    5. Save the file and upload it here
                  </>
                ) : chatSource === 'imessage' ? (
                  <>
                    1. On your Mac, export your iMessage conversation<br />
                    2. You can use apps like iMazing or create a CSV with your messages<br />
                    3. Format should be: date,sender,message (one per line)
                  </>) : chatSource === 'telegram' ? (
                                    <>
                                      1. Open Telegram Desktop<br />
                                      2. Open the chat you want to export<br />
                                      3. Click the three dots {'>'} Export chat history<br />
                                      4. Select 'HTML' format and export without media
                                    </>
                                  ) : chatSource === 'signal' ? (
                                    <>
                                      1. Open Signal Desktop<br />
                                      2. Go to the conversation<br />
                                      3. Click on the conversation name {'>'} Export chat<br />
                                      4. Save the file and upload it here
                                    </>
                                  ) : (
                                    <>
                                      Upload a CSV or text file with your chat history.<br />
                                      Format should include: timestamp, sender, and message content.<br />
                                      Contact us if you need help with a specific format.
                                    </>
                                  )}
              </Typography>
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box mt={3}>
            <Box 
              border={1} 
              borderRadius={1} 
              borderColor={darkMode ? "rgba(255, 255, 255, 0.2)" : "divider"} 
              p={3} 
              textAlign="center"
              mb={3}
              sx={{
                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : undefined
              }}
            >
              {/* Allowed file types section */}
              <Box mb={2}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary', mb: 1 }}>
                  Supported file types:
                </Typography>
                <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
                  {allowedFileTypes.map((type, index) => (
                    <Chip 
                      key={index}
                      icon={<FileType size={16} />}
                      label={type}
                      variant="outlined"
                      size="small"
                      sx={{
                        color: darkMode ? '#fff' : undefined,
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : undefined
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <input
                accept=".txt,.csv,.json,.zip,.html"
                style={{ display: 'none' }}
                id="chat-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="chat-file-upload">
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  component="span"
                  sx={{
                    color: darkMode ? '#fff' : undefined,
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : undefined,
                    '&:hover': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : undefined
                    }
                  }}
                >
                  Select Chat Export File
                </Button>
              </label>
              
              {file && (
                <Typography variant="body2" mt={2} sx={{ color: darkMode ? '#fff' : undefined }}>
                  Selected file: {file.name}
                </Typography>
              )}
            </Box>
            
            <TextField
              label="Contact's Phone Number (optional)"
              placeholder="e.g. +1234567890"
              fullWidth
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              helperText="This helps identify which messages are from your contact"
              margin="normal"
              sx={{
                '& .MuiInputBase-root': {
                  color: darkMode ? '#fff' : undefined,
                  backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2) !important' : undefined,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : undefined
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : undefined
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined
                },
                '& .MuiFormHelperText-root': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.5)' : undefined
                }
              }}
            />
          </Box>
        );
      
      case 2:
        return (
          <Box mt={3}>
                <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#fff' : undefined, mb: 2 }}>
                Processing Import
                </Typography>
                
                {/* Enhanced Progress Section */}
                            <Box mt={4} mb={5}>
                              <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">  
                                <Box display="flex" alignItems="center" color={darkMode ? '#6366f1' : 'primary.main'}>
                                  <Activity sx={{ mr: 2, fontSize: 18 }} />
                                  <Typography variant="body1" fontWeight="medium">
                                    Processing {chatSource} data
                                  </Typography>
                                </Box>
                                <Typography variant="h6" fontWeight="bold" color={darkMode ? '#6366f1' : 'primary.main'}>
                                  {importProgress}%
                                </Typography>
                              </Box>
                              
                              {/* Animated progress bar */}                    
                              <LinearProgress 
                      variant="determinate" 
                      value={importProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: darkMode ? '#6366f1' : undefined,
                          transition: 'transform 0.3s linear',
                        }
                      }} 
                    />

              {/* Status message */}
              <Box mt={1} display="flex" justifyContent="space-between" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                <Typography variant="body2" display="flex" alignItems="center" sx={{ gap: 2 }}>
                  <Clock sx={{ fontSize: 16 }} />
                  {getProgressPhaseMessage()}
                </Typography>
                <Typography variant="body2" color={darkMode ? '#6366f1' : 'primary.main'}>
                  Estimated time: {getEstimatedTimeRemaining()}
                </Typography>
              </Box>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3, backgroundColor: darkMode ? 'rgba(3, 45, 96, 0.3)' : undefined }}>
              <Typography variant="body1" sx={{ color: darkMode ? '#fff' : undefined }}>
                We're importing your {chatSource} chat history and analyzing it to generate relationship insights.
                </Typography>
               <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} sx={{ mt: 1 }}>
                               This process analyzes message patterns, identifies key topics, and extracts valuable relationship insights.
                             </Typography>
                           </Alert>
                           
                           {/* Stats preview (updates as processing continues) */}
                           {importStats && (
                             <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} textAlign="center" mb={3}>
                               <Paper variant="outlined" sx={{ 
                                 p: 2,
                                 background: darkMode ? 'rgba(0, 0, 0, 0.2)' : undefined,
                                 borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                               }}>
                                 <Typography variant="h4" fontWeight="bold" color={darkMode ? '#fff' : 'text.primary'}>
                                   {importStats.messageCount}
                                 </Typography>
                                 <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                                   Messages Processed
                                 </Typography>
                               </Paper>
                               <Paper variant="outlined" sx={{ 
                                 p: 2,
                                 background: darkMode ? 'rgba(0, 0, 0, 0.2)' : undefined,
                                 borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                               }}>
                                 <Typography variant="h4" fontWeight="bold" color={darkMode ? '#fff' : 'text.primary'}>
                                   {Math.max(1, Math.floor(importProgress / 25))}
                                 </Typography>
                                 <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                                   Topics Identified
                                 </Typography>
                               </Paper>
                             </Box>
                           )}
                         </Box>
                       );
                       
      case 3:
        return (
          <Box mt={3}>
                      <Box textAlign="center" mb={4}>
                        <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                          Import Successful!
                        </Typography>
                        <Typography variant="body1" sx={{ color: darkMode ? '#fff' : undefined }}>
                          Successfully imported {importStats?.messageCount || 'your'} messages
                          {importAnalysis?.timeRange ? ` spanning ${importAnalysis.timeRange}` : ''}.
                        </Typography>
                        {topicsProcessed && (
                          <Grow in={updateNotification} timeout={800}>
                            <Box 
                              sx={{ 
                                mt: 2, 
                                p: 1, 
                                bgcolor: darkMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.1)', 
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: darkMode ? 'rgba(74, 222, 128, 0.3)' : 'rgba(74, 222, 128, 0.2)',
                                display: 'inline-block'
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                color={darkMode ? '#4ade80' : 'success.main'} 
                                fontWeight="medium"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <CheckCircle size={16} style={{ marginRight: 8 }} />
                                Relationship Page has been Updated!
                              </Typography>
                            </Box>
                          </Grow>
                        )}
                      </Box>
                      
                      {importAnalysis ? (
                        <>
                          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} mb={4}>
                            {/* Message Distribution */}
                            <Paper variant="outlined" sx={{ 
                              p: 3,
                              background: darkMode ? darkGradient : undefined,
                              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                            }}>
                              <Typography variant="subtitle1" fontWeight="600" gutterBottom display="flex" alignItems="center" sx={{ color: darkMode ? '#fff' : undefined }}>
                                <MessageCircle size={18} style={{ marginRight: '8px', color: darkMode ? '#6366f1' : '#3f51b5' }} />
                                Import Analysis
                              </Typography>
                              
                              {importAnalysis.topSenders && Object.entries(importAnalysis.topSenders).length > 0 ? (
                      Object.entries(importAnalysis.topSenders).map(([sender, count], index) => (
                                <Box key={index} mb={2}>
                                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2" sx={{ color: darkMode ? '#fff' : undefined }}>{sender}</Typography>
                                    <Typography variant="body2" fontWeight="500" sx={{ color: darkMode ? '#fff' : undefined }}>{count} messages</Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(count / Object.values(importAnalysis.topSenders).reduce((a, b) => a + b, 0)) * 100}
                                    sx={{ 
                                      height: 6, 
                                      borderRadius: 3,
                                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: index === 0 ? 
                                          (darkMode ? '#6366f1' : 'primary.main') : 
                                          (darkMode ? '#a855f7' : 'secondary.main'),
                                      }
                                    }} 
                                  />
                                </Box>
                             ))
                            ) : (
                              <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                                Message distribution data not available
                              </Typography>
                            )}
                            </Paper>
                            
                            {/* Top Topics */}                       
                              <Paper variant="outlined" sx={{ 
                                p: 3,
                                background: darkMode ? darkGradient : undefined,
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                              }}>
                                <Typography variant="subtitle1" fontWeight="600" gutterBottom display="flex" alignItems="center" sx={{ color: darkMode ? '#fff' : undefined }}>
                                  <BarChart size={18} style={{ marginRight: '8px', color: darkMode ? '#6366f1' : '#3f51b5' }} />
                                  Top Conversation Topics
                                </Typography>
                                
                                {importAnalysis.topTopics && importAnalysis.topTopics.length > 0 ? (
                      importAnalysis.topTopics.map((topic, index) => (
                                  <Box key={index} mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                      <Typography variant="body2" sx={{ color: darkMode ? '#fff' : undefined }}>{topic.name}</Typography>
                                      <Typography variant="body2" fontWeight="500" sx={{ color: darkMode ? '#fff' : undefined }}>{topic.percentage}%</Typography>
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={topic.percentage}
                                      sx={{ 
                                        height: 6, 
                                        borderRadius: 3,
                                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: darkMode ? '#4ade80' : 'success.main',
                                        }
                                      }} 
                                    />
                                  </Box>
                                 ))
                                ) : (
                                  <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                                    Topic analysis in progress...
                                  </Typography>
                                )}
                                </Paper>
                              </Box>
                          
                          {/* Relationship Insights */}
                          <Paper variant="outlined" sx={{ 
                            p: 3, 
                            mb: 4,
                            background: darkMode ? darkGradient : undefined,
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                          }}>
                            <Typography variant="subtitle1" fontWeight="600" gutterBottom display="flex" alignItems="center" sx={{ color: darkMode ? '#fff' : undefined }}>
                              <FileText size={18} style={{ marginRight: '8px', color: darkMode ? '#6366f1' : '#3f51b5' }} />
                              Relationship Insights
                            </Typography>
                            <Typography variant="body2" paragraph sx={{ color: darkMode ? '#fff' : undefined }}>
                              {importAnalysis.insights || "Analysis in progress. Check back shortly for relationship insights."}
                            </Typography>
                            
                            {importAnalysis.summary && importAnalysis.summary.keyInsights && importAnalysis.summary.keyInsights.length > 0 && (
                              <>
                                <Divider sx={{ 
                                  my: 2,
                                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                                }} />
                                <Typography variant="subtitle2" fontWeight="500" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Key Observations
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                                  {importAnalysis.summary.keyInsights.map((insight, idx) => (
                                    <Typography component="li" variant="body2" key={idx} sx={{ mb: 1, color: darkMode ? '#fff' : undefined }}>
                                      {insight}
                                    </Typography>
                                  ))}
                                </Box>
                              </>
                            )}
                            
                            {importAnalysis.summary && importAnalysis.summary.emotionalDynamics && (
                              <>
                                <Divider sx={{ 
                                  my: 2,
                                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                                }} />
                                <Typography variant="subtitle2" fontWeight="500" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Emotional Dynamic
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                                  <Typography variant="body2" sx={{ color: darkMode ? '#fff' : undefined }}>
                                    <strong>Overall Tone:</strong> {importAnalysis.summary.emotionalDynamics.overall || "Balanced"}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: darkMode ? '#fff' : undefined }}>
                                    <strong>Your Style:</strong> {importAnalysis.summary.emotionalDynamics.user || "Engaged"}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: darkMode ? '#fff' : undefined }}>
                                    <strong>Their Style:</strong> {importAnalysis.summary.emotionalDynamics.contact || "Responsive"}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: darkMode ? '#fff' : undefined }}>
                                    <strong>Trends:</strong> {importAnalysis.summary.emotionalDynamics.trends || "Consistent"}
                                  </Typography>
                                </Box>
                              </>
                            )}
                            
                            {importAnalysis.summary && importAnalysis.summary.areasForGrowth && importAnalysis.summary.areasForGrowth.length > 0 && (
                              <>
                                <Divider sx={{ 
                                  my: 2,
                                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
                                }} />
                                <Typography variant="subtitle2" fontWeight="500" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Growth Opportunities
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                                  {importAnalysis.summary.areasForGrowth.map((area, idx) => (
                                    <Typography component="li" variant="body2" key={idx} sx={{ mb: 1, color: darkMode ? '#fff' : undefined }}>
                                      {area}
                                    </Typography>
                                  ))}
                                </Box>
                              </>
                            )}
                          </Paper>



                          {/* New Gamified Metrics Section */}
                          <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom fontWeight="600" textAlign="center" sx={{ color: darkMode ? '#fff' : undefined }}>
                              Relationship Analytics
                            </Typography>
                            <RelationshipAnalysisProgress 
                              relationshipId={relationshipId}
                              conversationId={conversationId}   
                              onComplete={() => {
                                console.log('Analysis completed in component');
                              }}
                              hideCompletionText={true} // Add this prop to hide the completion text                  
                            />
                            
                            {/* Connection Score */}
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: { xs: 2, sm: 3 },
                                mb: 3, 
                                background: darkMode ? 
                                  darkGradient : 
                                  'linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)',
                                borderRadius: 2,
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box sx={{ maxWidth: { xs: '65%', sm: '70%' } }}>
                                  <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                    Connection Score
                                  </Typography>
                                  <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, .7)' : 'text.secondary'}>
                                    Based on your conversation patterns, engagement level, and sentiment
                                  </Typography>
                                </Box>
                                <Box 
                                  sx={{ 
                                    width: { xs: 64, sm: 80 }, 
                                    height: { xs: 64, sm: 80 }, 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    background: `conic-gradient(${darkMode ? '#6366f1' : '#3f51b5'} ${(importAnalysis?.connectionScore || 0) * 3.6}deg, ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'} 0deg)`,
                                    position: 'relative',
                                    '&::after': {
                                      content: '""',
                                      position: 'absolute',
                                      width: { xs: '85%', sm: '87%' },
                                      height: { xs: '85%', sm: '87%' },
                                      borderRadius: '50%',
                                      background: darkMode ? 'rgba(0, 0, 0, 0.4)' : '#fff',
                                    }
                                  }}
                                >
                                  <Typography 
                                    variant="h5" 
                                    fontWeight="bold" 
                                    color={darkMode ? '#6366f1' : 'primary'} 
                                    sx={{ 
                                      position: 'relative', 
                                      zIndex: 1,
                                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}
                                  >
                                    {importAnalysis?.connectionScore || 0}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              {/* Relationship Level */}
                              {importAnalysis?.relationshipLevel && (
                                <Box mt={2} pt={2} borderTop={1} borderColor={darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" fontWeight="500" sx={{ color: darkMode ? '#fff' : undefined }}>
                                      Relationship Level
                                    </Typography>
                                    <Box 
                                      sx={{ 
                                        px: { xs: 1.5, sm: 2 }, 
                                        py: 0.5, 
                                        backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.3)' : 'primary.light', 
                                        color: darkMode ? '#fff' : 'primary.contrastText',
                                        borderRadius: 5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: darkMode ? '1px solid rgba(99, 102, 241, 0.5)' : 'none'
                                      }}
                                    >
                                      <Typography variant="body2" fontWeight="bold">
                                        Level {importAnalysis.relationshipLevel}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  {/* Next Milestone */}
                                  {importAnalysis?.nextMilestone && (
                                    <Box mt={1.5} display="flex" alignItems="center">
                                      <ArrowRight size={16} style={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#666', marginRight: 8 }} />
                                      <Typography 
                                        variant="body2" 
                                        color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}
                                        sx={{ 
                                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                          lineHeight: { xs: 1.4, sm: 1.5 }
                                        }}
                                      >
                                        Next milestone: {importAnalysis.nextMilestone}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Paper>
                            
                            {/* Sentiment and Communication Balance */}
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} mb={3}>
                              {/* Sentiment Score */}
                              <Paper variant="outlined" sx={{ 
                                p: 2.5, 
                                borderRadius: 2,
                                background: darkMode ? darkGradient : undefined,
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                              }}>
                                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Emotional Tone
                                </Typography>
                                
                                <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                  <Box 
                                    sx={{ 
                                      width: '80%', 
                                      height: 8, 
                                      bgcolor: darkMode ? 'rgba(0, 0, 0, 0.3)' : '#f0f0f0', 
                                      borderRadius: 4,
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <Box 
                                      sx={{ 
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #ff6b6b 0%, #ffcc80 33%, #81c784 66%, #64b5f6 100%)',
                                      }}
                                    />
                                    <Box 
                                      sx={{ 
                                        position: 'absolute',
                                        left: `${Math.min(100, Math.max(0, ((importAnalysis?.sentimentScore || 0) + 1) * 50))}%`,
                                        transform: 'translateX(-50%)',
                                        bottom: -14,
                                        width: 3,
                                        height: 14,
                                        backgroundColor: darkMode ? '#fff' : '#000',
                                      }}
                                    />
                                  </Box>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight="bold" 
                                    sx={{ 
                                      px: 1.5, 
                                      py: 0.5, 
                                      borderRadius: 1, 
                                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
                                      color: darkMode ? '#fff' : undefined
                                    }}
                                  >
                                    {importAnalysis?.sentimentScore ? importAnalysis.sentimentScore.toFixed(1) : "0.0"}
                                  </Typography>
                                </Box>
                                
                                <Typography 
                                  variant="body2" 
                                  color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} 
                                  textAlign="center" 
                                  mt={2}
                                  fontWeight={500}
                                >
                                  {importAnalysis?.sentimentLabel || "Neutral"}
                                </Typography>
                              </Paper>
                              
                              {/* Communication Balance */}
                              <Paper variant="outlined" sx={{ 
                                p: 2.5, 
                                borderRadius: 2,
                                background: darkMode ? darkGradient : undefined,
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                              }}>
                                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Communication Balance
                                </Typography>
                                
                                {importAnalysis?.communicationBalance && (
                                  <Box mt={1.5} display="flex" flexDirection="column" alignItems="center">
                                    <Box 
                                      sx={{ 
                                        position: 'relative',
                                        width: '100%',
                                        height: 8,
                                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
                                        borderRadius: 4,
                                        mb: 1,
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {/* Define the balance visually */}
                                      <Box 
                                        sx={{ 
                                          position: 'absolute',
                                          left: 0,
                                          top: 0,
                                          height: '100%',
                                          width: `${
                                            importAnalysis.communicationBalance === 'Balanced' ? '50%' :
                                            importAnalysis.communicationBalance === 'You lead slightly' ? '60%' :
                                            importAnalysis.communicationBalance === 'You lead significantly' ? '70%' :
                                            importAnalysis.communicationBalance === 'They lead slightly' ? '40%' :
                                            importAnalysis.communicationBalance === 'They lead significantly' ? '30%' : '50%'
                                          }`,
                                          backgroundColor: darkMode ? '#6366f1' : 'primary.main',
                                          borderRadius: 4
                                        }}
                                      />
                                    </Box>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight="500" 
                                      mt={1}
                                      textAlign="center"
                                      sx={{ color: darkMode ? '#fff' : undefined }}
                                    >
                                      {importAnalysis.communicationBalance}
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            </Box>
                            
                            {/* Communication Style */}
                            {importAnalysis?.communicationStyle && Object.keys(importAnalysis.communicationStyle).length > 0 && (
                              <Paper variant="outlined" sx={{ 
                                p: 3, 
                                mb: 3, 
                                borderRadius: 2,
                                background: darkMode ? darkGradient : undefined,
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                              }}>
                                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Communication Style
                                </Typography>
                                
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mt={2}>
                                  {Object.entries(importAnalysis.communicationStyle).map(([key, value], index) => (
                                    <Box key={index}>
                                      <Typography variant="body2" fontWeight="500" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                      </Typography>
                                      <Box display="flex" alignItems="center">
                                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={typeof value === 'number' ? value : 
                                                  typeof value === 'string' && !isNaN(parseFloat(value)) ? parseFloat(value) : 50} 
                                            sx={{ 
                                              height: 6, 
                                              borderRadius: 3,
                                              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
                                              '& .MuiLinearProgress-bar': {
                                                bgcolor: darkMode ? '#6366f1' : undefined,
                                              }
                                            }} 
                                          />
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium" minWidth={24} textAlign="right" sx={{ color: darkMode ? '#fff' : undefined }}>
                                          {typeof value === 'number' ? value : 
                                          typeof value === 'string' && !isNaN(parseFloat(value)) ? parseFloat(value) : value}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Paper>
                            )}
                            
                            {/* Challenges & Badges */}
                            {importAnalysis?.challengesBadges && importAnalysis.challengesBadges.length > 0 && (
                              <Paper variant="outlined" sx={{ 
                                p: 3, 
                                borderRadius: 2,
                                background: darkMode ? darkGradient : undefined,
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                              }}>
                                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Earned Badges
                                </Typography>
                                
                                <Box 
                                  display="grid" 
                                  gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }} 
                                  gap={2} 
                                  mt={2}
                                >
                                  {importAnalysis.challengesBadges.map((badge, index) => (
                                    <Box 
                                      key={index} 
                                      sx={{
                                        p: { xs: 1.5, sm: 2 },
                                        textAlign: 'center',
                                        borderRadius: 2,
                                        bgcolor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(63, 81, 181, 0.08)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 1,
                                        border: darkMode ? '1px solid rgba(99, 102, 241, 0.3)' : 'none'
                                      }}
                                    >
                                      {/* Render a different icon based on badge type/title */}
                                      {badge.includes('Consistent') && <Clock size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      {badge.includes('Balanced') && <Activity size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      {badge.includes('Supportive') && <MessageCircle size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      {badge.includes('Topic') && <BarChart size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      {badge.includes('Deep') && <FileText size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      {badge.includes('Fast') && <ArrowRight size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      {badge.includes('Milestone') && <CheckCircle size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      {!badge.includes('Consistent') && 
                                      !badge.includes('Balanced') && 
                                      !badge.includes('Supportive') && 
                                      !badge.includes('Topic') && 
                                      !badge.includes('Deep') && 
                                      !badge.includes('Fast') && 
                                      !badge.includes('Milestone') && <Star size={24} color={darkMode ? '#818cf8' : '#5c6bc0'} />}
                                      
                                      <Typography 
                                        variant="body2" 
                                        fontWeight="500" 
                                        sx={{ 
                                          color: darkMode ? '#fff' : undefined,
                                          fontSize: { xs: '0.7rem', sm: '0.875rem' }
                                        }}
                                      >
                                        {badge}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Paper>
                            )}
                          </Box>

                          {/* Primary Topics */}
                          {importAnalysis?.primaryTopics && importAnalysis.primaryTopics.length > 0 && (
                            <Paper variant="outlined" sx={{ 
                              p: 3, 
                              mb: 4, 
                              borderRadius: 2,
                              background: darkMode ? darkGradient : undefined,
                              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                            }}>
                              <Typography variant="subtitle1" fontWeight="600" gutterBottom display="flex" alignItems="center" sx={{ color: darkMode ? '#fff' : undefined }}>
                                <BarChart size={18} style={{ marginRight: '8px', color: darkMode ? '#6366f1' : '#3f51b5' }} />
                                Primary Topics & Distribution
                              </Typography>
                              
                              <Box display="flex" flexWrap="wrap" gap={1} mt={2} mb={3}>
                                {importAnalysis.primaryTopics.map((topic, index) => (
                                  <Box 
                                    key={index}
                                    sx={{
                                      px: 2,
                                      py: 0.75,
                                      borderRadius: 4,
                                      bgcolor: darkMode ? 'rgba(99, 102, 241, 0.3)' : 'primary.light',
                                      color: darkMode ? '#fff' : 'primary.contrastText',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      border: darkMode ? '1px solid rgba(99, 102, 241, 0.5)' : 'none'
                                    }}
                                  >
                                    <Typography variant="body2" fontWeight="medium">
                                      {topic}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                              
                              {importAnalysis?.topicDistribution && importAnalysis.topicDistribution.length > 0 && (
                                <Box mt={1}>
                                  {importAnalysis.topicDistribution.map((topic, index) => (
                                    <Box key={index} mb={2}>
                                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" sx={{ color: darkMode ? '#fff' : undefined }}>{topic.name}</Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ color: darkMode ? '#fff' : undefined }}>
                                          {typeof topic.percentage === 'number' ? 
                                            `${topic.percentage}%` : 
                                            typeof topic.percentage === 'string' ? topic.percentage : 
                                            typeof topic.value === 'number' ? `${topic.value}%` : 
                                            typeof topic.value === 'string' ? topic.value : ''}
                                        </Typography>
                                      </Box>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={typeof topic.percentage === 'number' ? topic.percentage : 
                                              typeof topic.percentage === 'string' && !isNaN(parseFloat(topic.percentage)) ? 
                                              parseFloat(topic.percentage) : 
                                              typeof topic.value === 'number' ? topic.value :
                                              typeof topic.value === 'string' && !isNaN(parseFloat(topic.value)) ?
                                              parseFloat(topic.value) : 0}
                                        sx={{ 
                                          height: 6, 
                                          borderRadius: 3,
                                          bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
                                          '& .MuiLinearProgress-bar': {
                                            bgcolor: index % 3 === 0 ? 
                                                    (darkMode ? '#6366f1' : 'primary.main') : 
                                                    index % 3 === 1 ? 
                                                    (darkMode ? '#a855f7' : 'secondary.main') : 
                                                    (darkMode ? '#4ade80' : 'success.main'),
                                          }
                                        }} 
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Paper>
                          )}

                          {/* Message Count Information */}
                          {importAnalysis?.messageCount && (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 3, 
                                mb: 4, 
                                borderRadius: 2,
                                background: darkMode ? 
                                  darkGradient : 
                                  'linear-gradient(135deg, #f5f7fa 0%, #f3e7ff 100%)',
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : undefined
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="600" sx={{ color: darkMode ? '#fff' : undefined }}>
                                  Total Messages Analyzed
                                </Typography>
                                <Box 
                                  sx={{ 
                                    px: 3, 
                                    py: 1, 
                                    bgcolor: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'background.paper', 
                                    borderRadius: 2,
                                    boxShadow: darkMode ? 
                                      '0 2px 5px rgba(0,0,0,0.2)' : 
                                      '0 2px 5px rgba(0,0,0,0.08)',
                                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined
                                  }}
                                >
                                  <Typography variant="h5" fontWeight="bold" color={darkMode ? '#6366f1' : 'primary.main'}>
                                    {importAnalysis.messageCount.toLocaleString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          )}
                                                   
                          <Box 
                            mt={4} 
                            display="flex" 
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            justifyContent="center" 
                            gap={2}
                          >
                            <Button 
                              variant="contained" 
                              color="primary"
                              onClick={goToConversation}
                              startIcon={<MessageCircle />}
                              fullWidth
                              sx={{
                                bgcolor: darkMode ? '#6366f1' : undefined,
                                '&:hover': {
                                  bgcolor: darkMode ? '#4f46e5' : undefined
                                },
                                py: { xs: 1.5, sm: 1 },
                                order: { xs: 1, sm: 1 }
                              }}                  
                            >
                              View Imported Conversation
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={goToRelationship}
                              fullWidth
                              sx={{
                                color: darkMode ? '#fff' : undefined,
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : undefined,
                                '&:hover': {
                                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : undefined
                                },
                                py: { xs: 1.5, sm: 1 },
                                order: { xs: 2, sm: 2 }
                              }}
                            >
                              Back to Relationship
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" py={4}>
                          <CircularProgress size={40} sx={{ color: darkMode ? '#6366f1' : undefined }} />
                          <Typography variant="body2" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} mt={2}>
                            Loading analysis...
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          my: 4,
          bgcolor: darkMode ? 'transparent' : '#fff',
          color: darkMode ? '#fff' : 'inherit',
          backgroundImage: darkMode ? darkGradient : 'none',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.4)' : undefined
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: darkMode ? '#fff' : undefined }}>
          Import Chat History
        </Typography>
        <Typography variant="body1" color={darkMode ? 'rgba(255, 255, 255, 0.7)' : 'textSecondary'} paragraph>
          Import your existing conversations to quickly build relationship insights
        </Typography>
        
        <Divider sx={{ 
          my: 3,
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'divider'
        }} />
        
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{
            '.MuiStepLabel-label': {
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              '&.Mui-active': {
                color: darkMode ? '#fff' : 'primary.main',
              },
              '&.Mui-completed': {
                color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
              },
            },
            '.MuiStepIcon-root': {
              color: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              '&.Mui-active': {
                color: darkMode ? '#6366f1' : 'primary.main',
              },
              '&.Mui-completed': {
                color: darkMode ? '#4ade80' : 'success.main',
              },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ 
          '& .MuiFormLabel-root': { 
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined 
          },
          '& .MuiFormControlLabel-label': { 
            color: darkMode ? '#fff' : undefined 
          },
          '& .MuiInputBase-root': {
            color: darkMode ? '#fff' : undefined,
            backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : undefined,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : undefined
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : undefined
            }
          },
          '& .MuiTypography-root': {
            color: darkMode ? '#fff' : undefined
          },
          '& .MuiTypography-body2': {
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined
          }
        }}>
          {renderStepContent(activeStep)}
        </Box>

       




        {(activeStep !== 3) && (
          <Box mt={4} display="flex" justifyContent="space-between">
            {/* Back button - always disabled during processing */}
            <Button
              disabled={activeStep === 2 && (importStatus === 'processing' || importProgress > 0)}
              onClick={handleBack}
              sx={{
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
                '&:hover': {
                  color: darkMode ? '#fff' : undefined
                }
              }}
            >
              Back
            </Button>
            
            {/* Step 0 & 1 buttons stay the same */}
            {activeStep === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{
                  bgcolor: darkMode ? '#6366f1' : undefined,
                  '&:hover': {
                    bgcolor: darkMode ? '#4f46e5' : undefined
                  }
                }}
              >
                Next
              </Button>
            )}
            
            {activeStep === 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{
                  bgcolor: darkMode ? '#6366f1' : undefined,
                  '&:hover': {
                    bgcolor: darkMode ? '#4f46e5' : undefined
                  }
                }}
              >
                Next
              </Button>
            )}
            
            {/* Key fix: Only show Start Import if we're at step 2 AND no import has started yet */}
            {activeStep === 2 && !importStatus && importProgress === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{
                  bgcolor: darkMode ? '#6366f1' : undefined,
                  '&:hover': {
                    bgcolor: darkMode ? '#4f46e5' : undefined
                  }
                }}
              >
                Start Import
              </Button>
            )}
            
            {/* Show Processing button whenever an import is in progress */}
            {activeStep === 2 && (importStatus === 'processing' || importProgress > 0) && (
              <Button
                variant="contained"
                disabled={true}
                sx={{
                  opacity: 0.7
                }}
              >
                Processing...
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ImportChat;