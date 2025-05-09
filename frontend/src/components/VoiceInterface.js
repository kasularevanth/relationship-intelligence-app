// Updated VoiceInterface.js with enhanced animations
import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, Paper, CircularProgress } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { voiceService } from '../services/api';

// Enhanced animation keyframes
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(63, 81, 181, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(63, 81, 181, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(63, 81, 181, 0);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;

const breathe = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const waveBounce = keyframes`
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(2);
  }
`;

const VoiceButtonContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const VoiceButton = styled(IconButton)(({ theme, isRecording }) => ({
  width: 80,
  height: 80,
  backgroundColor: isRecording ? theme.palette.error.main : '#4a6bf5',
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: isRecording ? theme.palette.error.dark : '#3f51b5',
  },
  animation: isRecording ? `${breathe} 1.5s infinite ease-in-out` : 'none',
  position: 'relative',
  zIndex: 5,
  boxShadow: isRecording ? '0 0 20px rgba(244, 67, 54, 0.7)' : '0 0 15px rgba(63, 81, 181, 0.5)',
  transition: 'all 0.3s ease',
}));

const RippleEffect = styled(Box)(({ theme, isRecording, delay = 0 }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: isRecording ? 'rgba(244, 67, 54, 0.4)' : 'rgba(63, 81, 181, 0.4)',
  animation: isRecording ? `${ripple} 2s infinite ease-out` : 'none',
  animationDelay: `${delay}s`,
  opacity: isRecording ? 1 : 0,
}));

const WaveContainer = styled(Box)(({ isActive }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  height: 60,
  justifyContent: 'center',
  marginBottom: 20,
  opacity: isActive ? 1 : 0.6,
  transition: 'opacity 0.3s ease',
}));

const WaveBar = styled(Box)(({ active, index, height, theme }) => ({
  width: 4,
  height: active ? height : '5px',
  margin: '0 3px',
  backgroundColor: active ? '#4a6bf5' : theme.palette.grey[300],
  borderRadius: 4,
  transition: 'height 0.2s ease',
  animation: active ? `${waveBounce} 0.7s infinite ease` : 'none',
  animationDelay: `${index * 0.05}s`,
}));

const StatusText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontWeight: 500,
  fontSize: '1rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));

const ResponsePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  maxHeight: 300,
  overflowY: 'auto',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.common.white,
}));

const ProcessingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(5px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
}));

const VoiceInterface = ({ conversationId, onMessageReceived }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [nextQuestion, setNextQuestion] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const waveInterval = useRef(null);
  const [waveLevels, setWaveLevels] = useState([]);
  
  // Generate random wave heights for visualization
  const generateWaveLevels = () => {
    return Array.from({ length: 30 }).map(() => 
      isRecording ? Math.floor(Math.random() * 30) + 5 : 5
    );
  };
  
  useEffect(() => {
    if (isRecording) {
      // Update wave visualization at intervals
      waveInterval.current = setInterval(() => {
        setWaveLevels(generateWaveLevels());
      }, 150);
    } else {
      if (waveInterval.current) {
        clearInterval(waveInterval.current);
      }
      setWaveLevels(Array(30).fill(5));
    }
    
    return () => {
      if (waveInterval.current) {
        clearInterval(waveInterval.current);
      }
    };
  }, [isRecording]);

  // Initialize wave levels
  useEffect(() => {
    setWaveLevels(Array(30).fill(5));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processRecording(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start the recording via API
      await voiceService.startRecording(conversationId);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processRecording = async (blob) => {
    try {
      setIsProcessing(true);
      
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      // Send the recording to the backend for processing
      const stopResponse = await voiceService.stopRecording(conversationId, formData);
      console.log("Stop recording response:", stopResponse.data);
      
      // Start polling for the transcription result
      const recordingId = stopResponse.data.recordingId;
      
      // Poll for the final transcription
      let attempts = 0;
      const maxAttempts = 10;
      const checkTranscript = async () => {
        if (attempts >= maxAttempts) {
          setIsProcessing(false);
          console.error("Transcription timed out");
          return;
        }
        
        try {
          const transcriptResponse = await voiceService.getTranscript(recordingId);
          console.log("Transcript response:", transcriptResponse.data);
          
          if (transcriptResponse.data.status === 'completed') {
            // We have the transcript and next question
            setResponseText(transcriptResponse.data.transcript);
            setNextQuestion(transcriptResponse.data.nextQuestion);
            
            if (onMessageReceived) {
              onMessageReceived({
                userMessage: transcriptResponse.data.transcript,
                aiResponse: {
                  text: transcriptResponse.data.nextQuestion,
                  phase: transcriptResponse.data.phase
                }
              });
            }
            
            setIsProcessing(false);
          } else if (transcriptResponse.data.status === 'failed') {
            setIsProcessing(false);
            console.error("Transcription failed");
          } else {
            // Still processing, try again after delay
            attempts++;
            setTimeout(checkTranscript, 2000);
          }
        } catch (error) {
          console.error("Error checking transcript:", error);
          setIsProcessing(false);
        }
      };
      
      // Start polling
      checkTranscript();
      
    } catch (error) {
      console.error('Error processing recording:', error);
      setIsProcessing(false);
    }
  };

  // Function to handle the response from the backend and proceed to the next question
  const proceedToNextQuestion = () => {
    if (nextQuestion) {
      setResponseText(nextQuestion);
      setNextQuestion('');
    }
  };

  useEffect(() => {
    // If we have a next question after processing, display it
    if (nextQuestion && !isProcessing) {
      proceedToNextQuestion();
    }
  }, [nextQuestion, isProcessing]);

  useEffect(() => {
    // Clean up on component unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      if (waveInterval.current) {
        clearInterval(waveInterval.current);
      }
    };
  }, []);

  // Create wave visualization
  const renderWaveBars = () => {
    return waveLevels.map((height, index) => (
      <WaveBar 
        key={index} 
        active={isRecording} 
        index={index}
        height={`${height}px`}
      />
    ));
  };

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <WaveContainer isActive={isRecording}>
        {renderWaveBars()}
      </WaveContainer>
      
      <VoiceButtonContainer>
        <RippleEffect isRecording={isRecording} />
        <RippleEffect isRecording={isRecording} delay={0.5} />
        <VoiceButton 
          isRecording={isRecording}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? <StopIcon fontSize="large" /> : <MicIcon fontSize="large" />}
        </VoiceButton>
      </VoiceButtonContainer>
      
      <StatusText variant="body1">
        {isProcessing ? 'Processing your message...' : 
         isRecording ? 'Listening... Tap to stop' : 
         'Tap to start speaking'}
      </StatusText>
      
      {isProcessing && (
        <ProcessingIndicator>
          <CircularProgress size={24} sx={{ mr: 1.5, color: '#4a6bf5' }} />
          <Typography variant="body2" color="white">
            Analyzing conversation...
          </Typography>
        </ProcessingIndicator>
      )}
      
      {responseText && !isProcessing && (
        <ResponsePaper elevation={3}>
          <Typography variant="body1">{responseText}</Typography>
        </ResponsePaper>
      )}
    </Box>
  );
};

export default VoiceInterface;