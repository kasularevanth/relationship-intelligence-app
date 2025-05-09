// frontend/src/components/RelationshipQA.js
import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, CircularProgress, 
  Chip, Divider, Card, CardContent, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VoiceQuestionInterface from './VoiceQuestionInterface';
import api from '../services/api';
import { format } from 'date-fns';
import { styled, keyframes } from '@mui/system';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTheme } from '../contexts/ThemeContext';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(63, 81, 181, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(63, 81, 181, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(63, 81, 181, 0); }
`;

const circleProgress = keyframes`
  from { stroke-dashoffset: 283; }
  to { stroke-dashoffset: 0; }
`;

// Styled components
const DownloadButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '28px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  }
}));

const ProgressOverlay = styled(Box)(({ progress }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: `${progress}%`,
  backgroundColor: 'rgba(63, 81, 181, 0.15)',
  transition: 'width 0.3s ease-in-out'
}));

const SuccessAnimation = styled(Box)({
  animation: `${pulse} 1s ease-in-out`
});

const DownloadOptionsButton = styled(Button)(({ selected }) => ({
  border: selected ? '2px solid #3f51b5' : '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: selected ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? 'rgba(63, 81, 181, 0.12)' : 'rgba(0, 0, 0, 0.04)'
  }
}));

const CircleProgressContainer = styled(Box)({
  position: 'relative',
  width: '120px',
  height: '120px',
  margin: '0 auto'
});

const CircleProgressSVG = styled('svg')({
  transform: 'rotate(-90deg)',
  overflow: 'visible'
});

const CircleProgressBackground = styled('circle')({
  fill: 'none',
  stroke: '#e0e0e0',
  strokeWidth: '8px'
});

const CircleProgressIndicator = styled('circle')(({ progress }) => ({
  fill: 'none',
  stroke: '#3f51b5',
  strokeWidth: '8px',
  strokeDasharray: '283',
  strokeDashoffset: `${283 - (283 * progress) / 100}`,
  transition: 'stroke-dashoffset 0.5s ease-out',
  strokeLinecap: 'round'
}));

const CircleProgressLabel = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center'
});

const AnimatedBox = styled(Box)({
  animation: `${fadeIn} 0.5s ease-out forwards`
});

const RelationshipQA = ({ relationshipId, relationshipName }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
   
  // Download state
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);


  const { darkMode } = useTheme(); // Add this line to get the current theme
 
  
  // Suggested questions based on your 4-phase framework
  const suggestedQuestions = [
    // Onboarding & History
    "How has our relationship evolved since we first met?",
    "What patterns do you notice in how we communicate?",
    
    // Emotional Mapping
    "What emotions come up most often when we interact?",
    "How does this relationship impact my overall wellbeing?",
    
    // Dynamics & Tensions
    "What recurring conflicts or tensions exist in this relationship?",
    "Are there any power imbalances in our relationship?",
    
    // Dual-Lens Reflection
    "How might they perceive our relationship differently than I do?",
    "What might they wish I understood better about them?"
  ];

  // Fetch question history when component mounts or showHistory changes
  useEffect(() => {
    if (showHistory) {
      fetchQuestionHistory();
    }
  }, [showHistory, relationshipId]);

  const fetchQuestionHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get(`/relationships/${relationshipId}/questions`);
      if (response.data.success) {
        setQuestionHistory(response.data.questions);
      }
    } catch (error) {
      console.error('Error fetching question history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      // Use api instead of axios
        const response = await api.post('/relationships/question', {
        relationshipId,
        question
      });
      
      if (response.data.success) {
        setAnswer(response.data.answer);
        // Add new question to history if we've already loaded history
        if (showHistory) {
          setQuestionHistory(prev => [response.data, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (q) => {
    setQuestion(q);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode);
  };

  const handleVoiceMessage = (messageData) => {
    if (messageData.userMessage) {
      setQuestion(messageData.userMessage);
      
      // Automatically submit the question after a short delay
      setTimeout(() => {
        handleQuestionSubmit();
      }, 500);
    }
    
    if (messageData.aiResponse && messageData.aiResponse.text) {
      setAnswer(messageData.aiResponse.text);
    }
  };


  const safeFormatDate = (dateString) => {
    try {
      if (!dateString) return 'Date unavailable';
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Date unavailable';
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  // Open download dialog
  const handleOpenDownloadDialog = () => {
    setShowDownloadDialog(true);
  };

  // Close download dialog
  const handleCloseDownloadDialog = () => {
    setShowDownloadDialog(false);
    // Reset states
    setDownloadProgress(0);
    setIsDownloading(false);
    setDownloadComplete(false);
  };

  // Select download format
  const handleSelectFormat = (format) => {
    setDownloadFormat(format);
  };

  // Generate and download file
  const handleDownload = async () => {
    if (questionHistory.length === 0) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const nextProgress = prev + Math.random() * 15;
        return nextProgress >= 95 ? 95 : nextProgress;
      });
    }, 300);
    
    try {
      // Download based on selected format
      if (downloadFormat === 'pdf') {
        await generatePDF();
      } else {
        await generateJSON();
      }
      
      // Complete download
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setDownloadComplete(true);
      
      // Reset after a delay
      setTimeout(() => {
        setIsDownloading(false);
        // Don't close dialog automatically to allow user to see completion
      }, 1500);
      
    } catch (error) {
      console.error('Error downloading history:', error);
      clearInterval(progressInterval);
      setIsDownloading(false);
      setDownloadProgress(0);
      // Show error message
    }
  };

  // Generate PDF file
  const generatePDF = async () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(63, 81, 181); // Primary color
    doc.text(`Relationship Insights: ${relationshipName}`, 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 30);
    
    // Add description
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('This document contains your conversation history with the Relationship AI.', 14, 40);
    
    let yPosition = 55;
    
    // Add each question and answer
    questionHistory.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Question number
      doc.setFontSize(14);
      doc.setTextColor(63, 81, 181);
      doc.text(`Question ${index + 1}`, 14, yPosition);
      yPosition += 10;
      
      // Question date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(safeFormatDate(item.createdAt), 14, yPosition);
      yPosition += 8;
      
      // Question text
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      
      // Handle multiline text
      const questionLines = doc.splitTextToSize(item.question, 180);
      doc.text(questionLines, 14, yPosition);
      yPosition += (questionLines.length * 7) + 8;
      
      // Answer text
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      
      // Handle multiline text for answer
      const answerLines = doc.splitTextToSize(item.answer, 180);
      doc.text(answerLines, 14, yPosition);
      yPosition += (answerLines.length * 7) + 15;
      
      // Add separator except for the last item
      if (index < questionHistory.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPosition - 7, 196, yPosition - 7);
        yPosition += 10;
      }
      
      // Check if we need a new page for the next item
      if (yPosition > 250 && index < questionHistory.length - 1) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    // Save the PDF
    doc.save(`${relationshipName.replace(/\s+/g, '_')}_conversation_history.pdf`);
  };

  // Generate JSON file
  const generateJSON = async () => {
    // Format data
    const jsonData = {
      relationshipName,
      exportDate: new Date().toISOString(),
      conversations: questionHistory.map(item => ({
        question: item.question,
        answer: item.answer,
        date: item.createdAt
      }))
    };
    
    // Convert to string
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = `${relationshipName.replace(/\s+/g, '_')}_conversation_history.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <QuestionAnswerIcon sx={{ mr: 1 }} />
          Ask AI about {relationshipName}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Ask questions to gain insights about your relationship. The AI will analyze your relationship data to provide thoughtful perspectives.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant={voiceMode ? "contained" : "outlined"}
            color={voiceMode ? "primary" : "secondary"}
            onClick={toggleVoiceMode}
            startIcon={voiceMode ? <QuestionAnswerIcon /> : <QuestionAnswerIcon />}
          >
            {voiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
          </Button>
        </Box>
        
        {voiceMode ? (
          // Voice interface for asking questions
          <Box sx={{ mb: 3 }}>
            <VoiceQuestionInterface 
              relationshipId={relationshipId}
              onQuestionAnswered={(data) => {
                setQuestion(data.question);
                setAnswer(data.answer);
              }}
            />
          </Box>
        ) : (
          // Text interface for asking questions
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Suggested questions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedQuestions.map((q, i) => (
                  <Chip 
                    key={i}
                    label={q}
                    onClick={() => handleSuggestedQuestion(q)}
                    clickable
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
            
            <form onSubmit={handleQuestionSubmit}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Ask a question about this relationship"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                margin="normal"
                variant="outlined"
                disabled={loading}
              />
              
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                disabled={loading || !question.trim()}
                endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                sx={{ mt: 2 }}
              >
                {loading ? 'Processing...' : 'Ask Question'}
              </Button>
            </form>
          </>
        )}
        
        {answer && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mt: 4, 
              bgcolor: darkMode ? 'rgba(30, 30, 30, 0.9)' : '#f8f9fa',
              borderRadius: 2,
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
            }}
          >
            <Typography variant="h6" gutterBottom color="primary">
              AI Insight
            </Typography>
            <Typography 
              variant="body1"
              color={darkMode ? 'white' : 'text.primary'}
            >
              {answer.split('\n\n').map((paragraph, idx) => (
                <React.Fragment key={idx}>
                  {paragraph}
                  <br /><br />
                </React.Fragment>
              ))}
            </Typography>
          </Paper>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>     
          <Button 
            variant="outlined" 
            onClick={toggleHistory}
            disabled={historyLoading}
            startIcon={<HistoryIcon />}
          >
            {showHistory ? 'Hide Previous Questions' : 'Show Previous Questions'}
          </Button>
          
          {showHistory && questionHistory.length > 0 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleOpenDownloadDialog}
            >
              Download History
            </Button>
          )}
        </Box>
        
        {showHistory && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Previous Questions
            </Typography>
            
            {historyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : questionHistory.length === 0 ? (
              <Typography color="text.secondary" align="center">
                No previous questions yet
              </Typography>
            ) : (
              questionHistory.map((item) => (
                <Card 
                  key={item._id} 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'background.paper',
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {item.question}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {safeFormatDate(item.createdAt)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography 
                      variant="body2"
                      color={darkMode ? 'white' : 'text.primary'}
                    >
                      {item.answer.split('\n\n').map((paragraph, idx) => (
                        <React.Fragment key={idx}>
                          {paragraph}
                          <br /><br />
                        </React.Fragment>
                      ))}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Paper>

          
          {/* Download Dialog */}
          <Dialog 
            open={showDownloadDialog} 
            onClose={!isDownloading ? handleCloseDownloadDialog : undefined}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {downloadComplete ? "Download Complete!" : "Download Conversation History"}
            </DialogTitle>
            
            <DialogContent>
              {downloadComplete ? (
                <AnimatedBox>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <SuccessAnimation>
                      <CheckCircleIcon color="primary" sx={{ fontSize: 80 }} />
                    </SuccessAnimation>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Your conversation history has been downloaded!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      You can now view your conversation history offline.
                    </Typography>
                  </Box>
                </AnimatedBox>
              ) : isDownloading ? (
                <Box sx={{ py: 3 }}>
                  <CircleProgressContainer>
                    <CircleProgressSVG width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                      <CircleProgressBackground cx="60" cy="60" r="45" />
                      <CircleProgressIndicator 
                        cx="60" 
                        cy="60" 
                        r="45" 
                        progress={downloadProgress} 
                      />
                    </CircleProgressSVG>
                    <CircleProgressLabel>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {Math.round(downloadProgress)}%
                      </Typography>
                    </CircleProgressLabel>
                  </CircleProgressContainer>
                  
                  <Typography variant="h6" align="center" sx={{ mt: 3 }}>
                    Preparing your download...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Please wait while we process your conversation history.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose a format to download your conversation history with {relationshipName}.
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <DownloadOptionsButton 
                      onClick={() => handleSelectFormat('pdf')}
                      selected={downloadFormat === 'pdf'}
                    >
                      <PictureAsPdfIcon sx={{ fontSize: 40, color: downloadFormat === 'pdf' ? 'primary.main' : 'text.secondary', mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={downloadFormat === 'pdf' ? 'bold' : 'normal'}>
                        PDF Document
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formatted document with Q&A history
                      </Typography>
                    </DownloadOptionsButton>
                    
                    <DownloadOptionsButton 
                      onClick={() => handleSelectFormat('json')}
                      selected={downloadFormat === 'json'}
                    >
                      <InsertDriveFileIcon sx={{ fontSize: 40, color: downloadFormat === 'json' ? 'primary.main' : 'text.secondary', mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={downloadFormat === 'json' ? 'bold' : 'normal'}>
                        JSON File
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Raw data format for technical use
                      </Typography>
                    </DownloadOptionsButton>
                  </Box>
                </>
              )}
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3 }}>
              {downloadComplete ? (
                <Button 
                  onClick={handleCloseDownloadDialog} 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Close
                </Button>
              ) : isDownloading ? (
                <Button 
                  disabled 
                  variant="outlined" 
                  fullWidth
                >
                  Downloading...
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleCloseDownloadDialog} 
                    color="inherit"
                  >
                    Cancel
                  </Button>
                  <DownloadButton 
                    onClick={handleDownload} 
                    variant="contained" 
                    color="primary"
                    disabled={!downloadFormat}
                    startIcon={<DownloadIcon />}
                  >
                    Download {downloadFormat === 'pdf' ? 'PDF' : 'JSON'}
                    <ProgressOverlay progress={0} />
                  </DownloadButton>
                </>
              )}
            </DialogActions>
          </Dialog>
    </Box>
  );
};

export default RelationshipQA;