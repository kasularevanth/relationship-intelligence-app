// frontend/src/pages/ConversationPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Divider,
  Avatar,
  IconButton,
  CircularProgress,
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VoiceInterface from '../components/VoiceInterface';
import VoiceAssistant from '../components/VoiceAssistant';
import { conversationService } from '../services/api';

// Existing styled components remain the same
const MessageBubble = styled(Paper)(({ theme, isAi }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  maxWidth: '85%',
  alignSelf: isAi ? 'flex-start' : 'flex-end',
  backgroundColor: isAi ? 'rgba(30, 30, 30, 0.8)' : theme.palette.primary.main,
  color: isAi ? theme.palette.common.white : theme.palette.primary.contrastText,
  borderRadius: isAi ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  position: 'relative',
  wordBreak: 'break-word',
  backdropFilter: 'blur(10px)',
  border: isAi ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    maxWidth: '90%',
  },
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 180px)', // Adjusted for fixed header
  overflowY: 'auto',
  padding: '16px',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
  },
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 160px)',
    padding: '12px 8px',
  },
}));
// Fixed header with backdrop blur effect
const ConversationHeader = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2, 2, 1),
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '0 0 16px 16px',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 1),
    marginBottom: theme.spacing(1),
  },
}));

// Enhanced phase indicator with glow effect
const PhaseIndicator = styled(Box)(({ theme, active }) => ({
  padding: theme.spacing(0.75, 1.75),
  borderRadius: 16,
  backgroundColor: active 
    ? 'rgba(74, 107, 245, 0.8)' 
    : 'rgba(50, 50, 50, 0.6)',
  color: active 
    ? '#ffffff' 
    : 'rgba(255, 255, 255, 0.6)',
  fontWeight: active ? 600 : 400,
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  fontSize: '0.85rem',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  boxShadow: active 
    ? '0 0 10px rgba(74, 107, 245, 0.7)' 
    : 'none',
  backdropFilter: 'blur(5px)',
  border: `1px solid ${active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
  '&:hover': {
    backgroundColor: active 
      ? 'rgba(74, 107, 245, 0.9)' 
      : 'rgba(60, 60, 60, 0.8)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1.25),
    fontSize: '0.75rem',
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginBottom: theme.spacing(1),
}));

const PhaseContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'flex-start',
  },
}));

const ConversationPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [relationshipName, setRelationshipName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('onboarding');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState('');
  const [isSpeakingComplete, setIsSpeakingComplete] = useState(true);
  const [summaryRequested, setSummaryRequested] = useState(false); // New state to track if summary has been requested

  useEffect(() => {
      console.log("Phase changed to:", currentPhase);
      
      // If phase is 'completed' and summary hasn't been requested yet, show summary
      if (currentPhase === 'completed' && !summaryRequested) {
        fetchSummary();
      }
    }, [currentPhase, summaryRequested]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await conversationService.getById(conversationId);
        setConversation(response.data);
        
        // Format messages
        if (response.data.messages && response.data.messages.length > 0) {
          const formattedMessages = response.data.messages.map(msg => ({
            type: msg.role === 'ai' ? 'ai' : 'user',
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString()
          }));
          setMessages(formattedMessages);
          
          // Set the last AI message to be spoken
          const lastAiMessage = formattedMessages
            .filter(msg => msg.type === 'ai')
            .pop();
            
          if (lastAiMessage) {
            setCurrentSpeakingMessage(lastAiMessage.content);
          }
        }
        
        // Set relationship name
        setRelationshipName(response.data.contactName || 'Unknown');

        // Set phase (ensure it's a string)
        const initialPhase = response.data.phase || 'onboarding';
        console.log("Setting initial phase to:", initialPhase);
        setCurrentPhase(initialPhase);

        // Check if we should immediately show the summary (if phase is already completed)
        if (initialPhase === 'completed') {
          setSummaryRequested(true); // Mark as requested to prevent duplicate requests
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set the latest AI message for TTS when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const aiMessages = messages.filter(msg => msg.type === 'ai');
      if (aiMessages.length > 0) {
        const latestAiMessage = aiMessages[aiMessages.length - 1];
        setCurrentSpeakingMessage(latestAiMessage.content);
        setIsSpeakingComplete(false);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
    // Centralized function to fetch summary data
    const fetchSummary = async () => {
      // Prevent duplicate API calls
      if (summaryLoading || summaryRequested) {
        return;
      }
      
      setSummaryLoading(true);
      setSummaryRequested(true);
      setShowSummaryDialog(true);
      
      try {
        const response = await conversationService.getSummary(conversationId);
        console.log("Summary fetched successfully:", response.data);
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setSummaryLoading(false);
      }
    };

  const handleNewMessage = async (messageData) => {
    console.log("Received message data:", messageData);
    
    const newMessages = [
      ...messages,
      {
        type: 'user',
        content: messageData.userMessage,
        timestamp: new Date().toISOString(),
      },
      {
        type: 'ai',
        content: messageData.aiResponse.text,
        timestamp: new Date().toISOString(),
      },
    ];
    
    setMessages(newMessages);
    
    // Set the new AI message to be spoken
    setCurrentSpeakingMessage(messageData.aiResponse.text);
    setIsSpeakingComplete(false);
    
    // If backend provides phase update
    if (messageData.aiResponse && messageData.aiResponse.phase) {
      const newPhase = messageData.aiResponse.phase;
      console.log("New phase from backend:", newPhase);
    
      if (newPhase !== currentPhase) {
        console.log(`Updating phase from ${currentPhase} to ${newPhase}`);
        setCurrentPhase(newPhase);
      }
    } else {
      // Alternative: Progressive phase changes based on message count
      const totalMessages = newMessages.length;
      const phases = ['onboarding', 'emotionalMapping', 'dynamics', 'dualLens', 'completed'];
      const phaseThresholds = {
        'onboarding': 6,
        'emotionalMapping': 10,
        'dynamics': 14,
        'dualLens': 18
      };
      
      // Find current phase index
      const currentIndex = phases.indexOf(currentPhase);
      
      // Check if we should move to next phase
      if (currentIndex >= 0 && currentIndex < phases.length - 1) {
        const currentThreshold = phaseThresholds[currentPhase];
        if (currentThreshold && totalMessages >= currentThreshold) {
          const nextPhase = phases[currentIndex + 1];
          console.log(`Moving to ${nextPhase} based on message count ${totalMessages}`);
          setCurrentPhase(nextPhase);
        }
      }
    }
  };

  const handlePhaseChange = (phase) => {
    // Only used if phase indicators are made interactive
    setCurrentPhase(phase);
  };

  // This is now just a wrapper for the centralized fetchSummary
  const handleSummaryRequest = () => {
    fetchSummary();
  };

  const handleSpeakingComplete = () => {
    setIsSpeakingComplete(true);
  };

  const renderPhaseIndicators = () => {
    // Phase labels with completion state
    const phases = [
      { id: 'onboarding', label: 'Onboarding' },
      { id: 'emotionalMapping', label: 'Emotional Mapping' },
      { id: 'dynamics', label: 'Dynamics & Tensions' },
      { id: 'dualLens', label: 'Dual-Lens Reflection' }
    ];
    
    console.log("Current phase in renderPhaseIndicators:", currentPhase);
    
    return phases.map((phase) => (
      <PhaseIndicator 
        key={phase.id} 
        active={currentPhase === phase.id}
        onClick={() => handlePhaseChange(phase.id)}
      >
        {phase.label}
      </PhaseIndicator>
    ));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container 
        maxWidth="md" 
        sx={{ 
          p: isMobile ? 1 : 2, 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#000', // Dark background like Siri
          color: '#fff',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 30, 50, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%)',
        }}
      >  
      <ConversationHeader>
        <HeaderContent>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate(-1)} 
            sx={{ mr: 1.5 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Avatar 
            sx={{ 
              mr: 1.5, 
              bgcolor: 'primary.main',
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40
            }}
          >       
            {relationshipName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"}>
              {relationshipName}
            </Typography>
          </Box>
          {!isMobile && (
            <IconButton 
              color="primary" 
              onClick={handleSummaryRequest}
              disabled={messages.length < 4}
              title="View conversation summary"
            >
              <SummarizeIcon />
            </IconButton>
          )}
        </HeaderContent>
        <PhaseContainer>
          {renderPhaseIndicators()}
          {isMobile && (
            <IconButton 
              color="primary" 
              onClick={handleSummaryRequest}
              disabled={messages.length < 4}
              title="View conversation summary"
              sx={{ ml: 'auto', mt: -1 }}
              size="small"
            >
              <SummarizeIcon fontSize="small" />
            </IconButton>
          )}
        </PhaseContainer>
      </ConversationHeader>

      <MessageContainer>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <Slide
              direction={message.type === 'ai' ? 'right' : 'left'}
              in={true}
              mountOnEnter
              unmountOnExit
              key={index}
              timeout={250 + index * 50}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.type === 'ai' ? 'flex-start' : 'flex-end',
                  mb: 1.5,
                  width: '100%'
                }}
              >
                <MessageBubble isAi={message.type === 'ai'}>
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: message.type === 'ai' ? 'left' : 'right',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.7rem'
                    }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </MessageBubble>
              </Box>
            </Slide>
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <Typography variant="body1" color="textSecondary">
              Start speaking to begin the conversation
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </MessageContainer>

      {/* Voice Assistant (Siri-like) */}
      {!isSpeakingComplete && currentSpeakingMessage && (
        <VoiceAssistant 
          message={currentSpeakingMessage} 
          onComplete={handleSpeakingComplete}
        />
      )}

      <Box sx={{ mt: 'auto', pt: 1 }}>
        <VoiceInterface
          conversationId={conversationId}
          onMessageReceived={handleNewMessage}
        />
      </Box>

      {/* Summary Dialog */}
      <Dialog
        open={showSummaryDialog}
        onClose={() => setShowSummaryDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Conversation Summary
          <IconButton
            onClick={() => setShowSummaryDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <MoreVertIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {summaryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : summary ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
                  Key Insights
                </Typography>
                <Typography variant="body1" paragraph>
                  {summary.keyInsights}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
                  Emotional Dynamics
                </Typography>
                <Typography variant="body1" paragraph>
                  {summary.emotionalDynamics}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
                  Areas for Growth
                </Typography>
                <Typography variant="body1" paragraph>
                  {summary.areasForGrowth}
                </Typography>
              </Box>
            </>
          ) : (
            <DialogContentText>
              No summary data available. Continue the conversation to generate more insights.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSummaryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConversationPage;