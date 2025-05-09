// frontend/src/components/VoiceQuestionInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Fade, Paper } from '@mui/material';
import { styled } from '@mui/system';
import SiriStyleVoiceAssistant from './SiriStyleVoiceAssistant';
import { useTheme } from '../contexts/ThemeContext';

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

const ResponsePaper = styled(Paper)(({ theme, darkMode }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(4),
  backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  transition: 'all 0.3s ease',
  opacity: 0,
  transform: 'translateY(20px)',
  '&.visible': {
    opacity: 1,
    transform: 'translateY(0)',
  }
}));

const VoiceQuestionInterface = ({ relationshipId, onQuestionAnswered }) => {
   // Get theme context
   const { darkMode } = useTheme();
  
  // States for voice recording and processing
  const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [responseVisible, setResponseVisible] = useState(false);

  // Refs for audio handling
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const speechVisualizerRef = useRef(null);


  useEffect(() => {
    // Initialize speech synthesis on component mount
    window.speechSynthesis.getVoices();
    
    // Force load voices (some browsers need this)
    const loadVoices = () => {
      const voices = speechSynthesisRef.current.getVoices();
      console.log(`Loaded ${voices.length} voices`);
    };
    
    speechSynthesisRef.current.onvoiceschanged = loadVoices;
    
    // Initial load attempt
    loadVoices();
  }, []);


    // Handle activating the voice assistant
    const handleActivateVoice = () => {
      if (status === 'idle') {
        startRecording();
      } else if (status === 'listening') {
        stopRecording();
      }
    };
  
    // Start recording audio
  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');

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
        processRecording();
      };
      
      mediaRecorder.start();
      setStatus('listening');
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setError('Could not access microphone. Please check permissions.');
      setStatus('idle');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'listening') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const processRecording = async () => {
    try {
      setStatus('processing');
      
      // Create an audio blob from the recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('audio', audioBlob, 'question.webm');
      
      // Make a direct API call to the new endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/relationships/${relationshipId}/voice-question`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
          // Update transcript and response
          setTranscript(data.transcription);
          setResponse(data.answer);
          
          // Notify parent component
        if (onQuestionAnswered) {
          onQuestionAnswered({
            question: data.transcription,
            answer: data.answer
          });
        }
        
        // Start speaking the response
        speakResponse(data.answer);
      } else {
        setError(data.message || 'Failed to process your question');
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error processing voice question:', error);
      setError('Failed to process your question. Please try again.');
      setStatus('idle');
    }
  };
  
  // Speak the response using speech synthesis
  const speakResponse = (text) => {
    if (!speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    setStatus('speaking');
    setResponseVisible(true);
    
    // Create a simple utterance without SSML for better compatibility
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get available voices and use the first available English one
    const voices = speechSynthesisRef.current.getVoices();
    const englishVoices = voices.filter(voice => 
      voice.lang && voice.lang.includes('en')
    );
    
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }
    
    // Connect to 3D visualization
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        if (speechVisualizerRef && speechVisualizerRef.current) {
          const wordEmphasis = Math.random() * 0.5 + 0.5;
          speechVisualizerRef.current.simulateWordEmphasis(wordEmphasis);
        }
      }
    };
    
    // Handle speech events with better logging
    utterance.onstart = () => {
      console.log('Speech started');
      setStatus('speaking');
    };
    
    utterance.onend = () => {
      console.log('Speech ended');
      setTimeout(() => setStatus('idle'), 500);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setStatus('idle');
    };
    
    // Store reference and start speaking with a slight delay
    utteranceRef.current = utterance;
    setTimeout(() => {
      speechSynthesisRef.current.speak(utterance);
    }, 100);
  };
    
    // Cancel speech when component unmounts
    useEffect(() => {
      return () => {
        if (speechSynthesisRef.current && utteranceRef.current) {
          speechSynthesisRef.current.cancel();
        }
        
        if (mediaRecorderRef.current && status === 'listening') {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      };
    }, [status]);

    // Helper text based on status
  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Tap to ask a question by voice';
      case 'listening':
        return 'Listening... Click again to stop';
      case 'processing':
        return 'Processing your question...';
      case 'speaking':
        return 'Speaking...';
      default:
        return '';
    }
  };
  
  return (
    <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          width: '100%',
          p: 2
        }}>
          {/* The 3D Voice Assistant */}
          <SiriStyleVoiceAssistant 
            status={status}
            onActivate={handleActivateVoice}
            size={240}
            speechVisualizerRef={speechVisualizerRef}
          />
          
          {/* Status text */}
          <Typography 
            variant="body1" 
            color="text.secondary"
            fontWeight={500}
            sx={{ 
              mt: 1, 
              textAlign: 'center',
              minHeight: '24px',
              opacity: 0.8
            }}
          >
            {/* {getStatusText()} */}
          </Typography>
          
          {/* Processing indicator */}
          {status === 'processing' && (
            <ProcessingIndicator>
              <CircularProgress size={24} sx={{ mr: 1.5, color: '#4a6bf5' }} />
              <Typography variant="body2" color="white">
                Analyzing your question...
              </Typography>
            </ProcessingIndicator>
          )}
          
          {/* Transcript and response display */}
          {(transcript || response) && (
            <Fade in={responseVisible}>
              <ResponsePaper className={responseVisible ? 'visible' : ''} darkMode={darkMode}>
                          {transcript && (
                            <>
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold" 
                                color="primary" 
                                gutterBottom
                              >
                                Your question:
                              </Typography>
                              <Typography 
                                variant="body1" 
                                paragraph
                                color={darkMode ? 'white' : 'text.primary'}
                                sx={{ mb: 2 }}
                              >
                                {transcript || 'No data available'}
                              </Typography>
                            </>
                          )}
                          
                          {response && (
                            <>
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold" 
                                color="primary" 
                                gutterBottom
                              >
                                Response:
                              </Typography>
                              <Typography 
                                variant="body1"
                                color={darkMode ? 'white' : 'text.primary'}
                              >
                                {response.split('\n\n').map((paragraph, idx) => (
                                  <React.Fragment key={idx}>
                                    {paragraph}
                                    <br /><br />
                                  </React.Fragment>
                                ))}
                              </Typography>
                            </>
                          )}
                        </ResponsePaper>
                      </Fade>
          )}
          
          {/* Error message */}
          {error && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ mt: 2, textAlign: 'center' }}
            >
              {error}
            </Typography>
          )}
        </Box>
      );
    };
    
    export default VoiceQuestionInterface;