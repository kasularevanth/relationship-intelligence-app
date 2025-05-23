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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled components
const PremiumDownloadButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #ff6b8b 0%, #33d2c3 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(255, 107, 139, 0.3)',
    background: 'linear-gradient(135deg, #ff5c7f 0%, #2bc0b2 100%)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    animation: `${shimmer} 2s infinite`,
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

const PremiumDownloadOption = styled(Button)(({ selected }) => ({
  border: selected ? '2px solid #ff6b8b' : '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: selected ? 'rgba(255, 107, 139, 0.08)' : 'transparent',
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  minHeight: '120px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: selected ? 'rgba(255, 107, 139, 0.12)' : 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  '&::before': selected ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #ff6b8b, #33d2c3)',
  } : {}
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

const CircleProgressIndicator = styled('circle')(({ progress }) => ({
  fill: 'none',
  stroke: 'url(#progressGradient)',
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

  const { darkMode } = useTheme();
  
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
      const response = await api.post('/relationships/question', {
        relationshipId,
        question
      });
      
      if (response.data.success) {
        setAnswer(response.data.answer);
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
      if (isNaN(date.getTime())) return 'Date unavailable';
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  // Clean and professional PDF generation with proper SoulSync branding
  const generatePDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      let currentPage = 1;
      
      // Professional color scheme
      const primaryColor = [255, 107, 139]; // Pink #ff6b8b
      const secondaryColor = [51, 210, 195]; // Teal #33d2c3
      const darkText = [40, 40, 40]; // Almost black for readability
      const lightBg = [248, 249, 250]; // Very light gray
      const white = [255, 255, 255]; // Pure white
      
      // Perfect SoulSync logo recreation matching your actual design
      const drawSoulSyncLogo = (x, y, size = 20) => {
        try {
          // Pink figure head (left)
          doc.setFillColor(...primaryColor);
          doc.circle(x + size * 0.35, y + size * 0.15, size * 0.08, 'F');
          
          // Teal figure head (right)
          doc.setFillColor(...secondaryColor);
          doc.circle(x + size * 0.65, y + size * 0.15, size * 0.08, 'F');
          
          // Create the heart shape body - Pink left side
          doc.setFillColor(...primaryColor);
          
          // Pink left heart curve - multiple points to create smooth curve
          const leftHeartPoints = [];
          leftHeartPoints.push([x + size * 0.35, y + size * 0.25]); // start from head
          leftHeartPoints.push([x + size * 0.25, y + size * 0.35]); // curve out left
          leftHeartPoints.push([x + size * 0.25, y + size * 0.5]);  // down left side
          leftHeartPoints.push([x + size * 0.35, y + size * 0.65]); // curve in
          leftHeartPoints.push([x + size * 0.5, y + size * 0.8]);   // heart bottom point
          
          // Draw pink left side of heart
          doc.setDrawColor(...primaryColor);
          doc.setFillColor(...primaryColor);
          doc.setLineWidth(size * 0.06);
          doc.setLineCap('round');
          doc.setLineJoin('round');
          
          // Pink curves
          for (let i = 0; i < leftHeartPoints.length - 1; i++) {
            doc.line(leftHeartPoints[i][0], leftHeartPoints[i][1], 
                    leftHeartPoints[i + 1][0], leftHeartPoints[i + 1][1]);
          }
          
          // Teal right side of heart
          doc.setDrawColor(...secondaryColor);
          doc.setFillColor(...secondaryColor);
          
          const rightHeartPoints = [];
          rightHeartPoints.push([x + size * 0.65, y + size * 0.25]); // start from head
          rightHeartPoints.push([x + size * 0.75, y + size * 0.35]); // curve out right
          rightHeartPoints.push([x + size * 0.75, y + size * 0.5]);  // down right side
          rightHeartPoints.push([x + size * 0.65, y + size * 0.65]); // curve in
          rightHeartPoints.push([x + size * 0.5, y + size * 0.8]);   // heart bottom point
          
          // Draw teal right side of heart
          for (let i = 0; i < rightHeartPoints.length - 1; i++) {
            doc.line(rightHeartPoints[i][0], rightHeartPoints[i][1], 
                    rightHeartPoints[i + 1][0], rightHeartPoints[i + 1][1]);
          }
          
          // Heart top curves (the rounded tops of the heart)
          doc.setFillColor(...primaryColor);
          doc.circle(x + size * 0.4, y + size * 0.32, size * 0.06, 'F');
          doc.setFillColor(...secondaryColor);
          doc.circle(x + size * 0.6, y + size * 0.32, size * 0.06, 'F');
          
        } catch (error) {
          console.warn('Logo drawing failed, using fallback:', error);
          // Simplified fallback that still looks good
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(size * 0.6);
          doc.setTextColor(...primaryColor);
          doc.text('❤', x + size * 0.5, y + size * 0.6);
        }
      };
      
      // Professional header design
      const addHeader = () => {
        // Header background
        doc.setFillColor(...lightBg);
        doc.rect(0, 0, pageWidth, margin + 25, 'F');
        
        // Top accent line
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(2);
        doc.line(0, 0, pageWidth, 0);
        
        // Logo
        drawSoulSyncLogo(margin, margin - 2, 20);
        
        // Define position for the header text
        const textStartX = margin + 30; // After logo
        
        // Use a completely different approach - render Soul with proper space
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        
        // First render 'Soul' in pink
        doc.setTextColor(...primaryColor);
        doc.text('Soul', textStartX, margin + 12);
        
        // Calculate the width of 'Soul' and add a custom gap
        const soulWidth = doc.getTextWidth('Soul');
        const customGap = 3; // Adjust this value to control spacing (smaller = less space)
        
        // Then render 'Sync' in teal at a position that ensures proper spacing
        doc.setTextColor(...secondaryColor);
        doc.text('Sync', textStartX + soulWidth + customGap, margin + 12);
        
        // Professional tagline
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...darkText);
        doc.text('Relationship Intelligence & Insights', textStartX, margin + 20);
        
        // Bottom header line
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(1);
        doc.line(margin, margin + 25, pageWidth - margin, margin + 25);
      };
      
      // Clean footer design
      const addFooter = () => {
        const footerY = pageHeight - 12;
        
        // Footer background
        doc.setFillColor(...lightBg);
        doc.rect(0, footerY - 8, pageWidth, 20, 'F');
        
        // Footer top line
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
        
        // Footer content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...darkText);
        
        // Left: Company name
        doc.text('SoulSync - Relationship Intelligence Platform', margin, footerY - 2);
        
        // Right: Page number
        doc.setTextColor(...primaryColor);
        const pageText = `Page ${currentPage}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(pageText, pageWidth - margin - pageTextWidth, footerY - 2);
        
        // Website
        doc.setTextColor(...secondaryColor);
        doc.setFontSize(7);
        doc.text('soulsync.ai', margin, footerY + 3);
      };
      
      // Function to add new page
      const addNewPage = () => {
        doc.addPage();
        currentPage++;
        addHeader();
        addFooter();
      };
      
      // Start first page
      addHeader();
      addFooter();
      
      // Title section with better spacing
      let yPosition = margin + 40;
      
      // Main title with professional styling
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...secondaryColor);
      doc.text(`Relationship Insights: ${relationshipName}`, margin, yPosition);
      
      yPosition += 12;
      
      // Generation info with better layout
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...darkText);
      doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, margin, yPosition);
      
      const questionsText = `Total Questions: ${questionHistory.length}`;
      const questionsTextWidth = doc.getTextWidth(questionsText);
      doc.text(questionsText, pageWidth - margin - questionsTextWidth, yPosition);
      
      yPosition += 15;
      
      // Elegant divider
      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 20;
      
      // Process each Q&A with better formatting - keep Q&A together on same page
      questionHistory.forEach((item, index) => {
        try {
          // Calculate TOTAL space needed for both question and answer
          const questionLines = doc.splitTextToSize(item.question, contentWidth);
          const answerLines = doc.splitTextToSize(item.answer, contentWidth - 8);
          
          const questionHeight = (questionLines.length * 5) + 16; // question header + text + spacing
          const answerHeight = (answerLines.length * 4.5) + 20; // answer background + padding
          const totalNeededHeight = questionHeight + answerHeight;
          
          // Check if ENTIRE Q&A fits on current page - if not, start new page
          if (yPosition + totalNeededHeight > pageHeight - 60) {
            addNewPage();
            yPosition = margin + 50;
          }
          
          // Question header with better styling
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...primaryColor);
          doc.text(`Question ${index + 1}`, margin, yPosition);
          
          // Date aligned to the right
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...darkText);
          const dateText = safeFormatDate(item.createdAt);
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margin - dateWidth, yPosition);
          
          yPosition += 8;
          
          // Question text with better readability
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(...darkText);
          doc.text(questionLines, margin, yPosition);
          yPosition += (questionLines.length * 5) + 8;
          
          // Answer section - now guaranteed to fit on same page
          const answerBackgroundHeight = (answerLines.length * 4.5) + 12;
          
          // Answer background
          doc.setFillColor(...lightBg);
          doc.rect(margin, yPosition - 4, contentWidth, answerBackgroundHeight, 'F');
          
          // Answer border
          doc.setDrawColor(...secondaryColor);
          doc.setLineWidth(0.3);
          doc.rect(margin, yPosition - 4, contentWidth, answerBackgroundHeight, 'S');
          
          // AI label
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...secondaryColor);
          doc.text('AI Response:', margin + 4, yPosition + 3);
          
          // Answer text with good contrast
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...darkText);
          doc.text(answerLines, margin + 4, yPosition + 9);
          yPosition += answerBackgroundHeight + 15;
          
          // Elegant separator between questions
          if (index < questionHistory.length - 1) {
            doc.setDrawColor(...lightBg);
            doc.setLineWidth(0.5);
            doc.line(margin + 30, yPosition - 8, pageWidth - margin - 30, yPosition - 8);
          }
          
        } catch (error) {
          console.warn(`Failed to process Q&A ${index + 1}:`, error);
        }
      });
      
      // Save with clean filename
      const timestamp = format(new Date(), 'yyyy-MM-dd');
      const filename = `SoulSync_${relationshipName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  };

  // Generate JSON file
  const generateJSON = async () => {
    const jsonData = {
      relationshipName,
      exportDate: new Date().toISOString(),
      conversations: questionHistory.map(item => ({
        question: item.question,
        answer: item.answer,
        date: item.createdAt
      }))
    };
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${relationshipName.replace(/\s+/g, '_')}_conversation_history.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open download dialog
  const handleOpenDownloadDialog = () => {
    setShowDownloadDialog(true);
  };

  // Close download dialog
  const handleCloseDownloadDialog = () => {
    setShowDownloadDialog(false);
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
    
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const nextProgress = prev + Math.random() * 15;
        return nextProgress >= 95 ? 95 : nextProgress;
      });
    }, 300);
    
    try {
      if (downloadFormat === 'pdf') {
        await generatePDF();
      } else {
        await generateJSON();
      }
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setDownloadComplete(true);
      
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error downloading history:', error);
      clearInterval(progressInterval);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
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
            startIcon={<QuestionAnswerIcon />}
          >
            {voiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
          </Button>
        </Box>
        
        {voiceMode ? (
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
            <PremiumDownloadButton
              startIcon={<AutoAwesomeIcon />}
              endIcon={<DownloadIcon />}
              onClick={handleOpenDownloadDialog}
            >
              Download Report
            </PremiumDownloadButton>
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

      {/* Simple Download Dialog */}
      <Dialog 
        open={showDownloadDialog} 
        onClose={!isDownloading ? handleCloseDownloadDialog : undefined}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {downloadComplete ? "✅ Download Complete!" : "📄 Export Report"}
        </DialogTitle>
        
        <DialogContent>
          {downloadComplete ? (
            <AnimatedBox>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <SuccessAnimation>
                  <CheckCircleIcon sx={{ fontSize: 60, color: '#33d2c3' }} />
                </SuccessAnimation>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Your report is ready!
                </Typography>
              </Box>
            </AnimatedBox>
          ) : isDownloading ? (
            <Box sx={{ py: 3 }}>
              <CircleProgressContainer>
                <CircleProgressSVG width="120" height="120">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff6b8b" />
                      <stop offset="100%" stopColor="#33d2c3" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                  <CircleProgressIndicator 
                    cx="60" 
                    cy="60" 
                    r="45" 
                    progress={downloadProgress} 
                  />
                </CircleProgressSVG>
                <CircleProgressLabel>
                  <Typography variant="h4" sx={{ 
                    background: 'linear-gradient(135deg, #ff6b8b 0%, #33d2c3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                  }}>
                    {Math.round(downloadProgress)}%
                  </Typography>
                </CircleProgressLabel>
              </CircleProgressContainer>
              
              <Typography variant="h6" align="center" sx={{ mt: 3 }}>
                Generating your report...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Choose format for your <strong>{relationshipName}</strong> conversation history.
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <PremiumDownloadOption 
                  onClick={() => handleSelectFormat('pdf')}
                  selected={downloadFormat === 'pdf'}
                >
                  <PictureAsPdfIcon sx={{ 
                    fontSize: 40, 
                    color: downloadFormat === 'pdf' ? '#ff6b8b' : 'text.secondary', 
                    mb: 1 
                  }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Clean PDF
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Professional report with SoulSync branding
                  </Typography>
                </PremiumDownloadOption>
                
                <PremiumDownloadOption 
                  onClick={() => handleSelectFormat('json')}
                  selected={downloadFormat === 'json'}
                >
                  <InsertDriveFileIcon sx={{ 
                    fontSize: 40, 
                    color: downloadFormat === 'json' ? '#33d2c3' : 'text.secondary', 
                    mb: 1 
                  }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    JSON Data
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Raw data for technical use
                  </Typography>
                </PremiumDownloadOption>
              </Box>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {downloadComplete ? (
            <Button 
              onClick={handleCloseDownloadDialog} 
              variant="contained" 
              fullWidth
              sx={{ 
                background: 'linear-gradient(135deg, #ff6b8b 0%, #33d2c3 100%)',
                color: 'white'
              }}
            >
              Close
            </Button>
          ) : isDownloading ? (
            <Button disabled variant="outlined" fullWidth>
              Generating...
            </Button>
          ) : (
            <>
              <Button onClick={handleCloseDownloadDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleDownload} 
                variant="contained" 
                disabled={!downloadFormat}
                startIcon={<DownloadIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #ff6b8b 0%, #33d2c3 100%)',
                  color: 'white'
                }}
              >
                Generate {downloadFormat?.toUpperCase()}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RelationshipQA;