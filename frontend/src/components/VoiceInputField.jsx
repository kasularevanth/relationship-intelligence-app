import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { styled, keyframes } from '@mui/system';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

// Animations
const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled components
const AnimatedMicIcon = styled(MicIcon)(({ theme, isrecording }) => ({
  color: isrecording === 'true' ? theme.palette.error.main : theme.palette.primary.main,
  animation: isrecording === 'true' ? `${pulse} 1.5s infinite ease-in-out` : 'none',
}));

const SoundWave = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  height: '20px',
  marginLeft: theme.spacing(1),
  animation: `${fadeIn} 0.3s ease-in-out`,
}));

const SoundBar = styled(Box)(({ height, delay, theme }) => ({
  width: '3px',
  height: `${height}px`,
  backgroundColor: theme.palette.error.main,
  borderRadius: '1px',
  animation: `${pulse} 1s infinite ease-in-out`,
  animationDelay: `${delay}s`,
}));

/**
 * VoiceInputField - A text field with voice input capability
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.value - Current field value
 * @param {function} props.onChange - Function to handle value changes
 * @param {string} props.name - Field name for form data
 * @param {Object} props.inputProps - Additional props for TextField
 */
const VoiceInputField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  inputProps = {}, 
  placeholder,
  fullWidth = true,
  required = false,
  multiline = false,
  rows = 1,
  ...rest
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Configure recognition
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      // Set up event handlers
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        // Update the field value
        handleChange({ target: { name, value: transcript } });
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setErrorMessage(`Error: ${event.error}`);
        stopRecording();
      };
      
      recognitionInstance.onend = () => {
        // End of recording
        setIsProcessing(true);
        // Add a short delay to show processing state
        setTimeout(() => {
          setIsProcessing(false);
          setIsRecording(false);
        }, 500);
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  // Handle value change
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  // Start voice recording
  const startRecording = () => {
    if (recognition) {
      try {
        recognition.start();
        setIsRecording(true);
        setErrorMessage('');
      } catch (error) {
        console.error('Error starting speech recognition', error);
        setErrorMessage('Could not start voice recording');
      }
    } else {
      setErrorMessage('Speech recognition not supported by your browser');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Render sound wave animation when recording
  const renderSoundWave = () => (
    <SoundWave>
      <SoundBar height={8} delay={0} />
      <SoundBar height={16} delay={0.2} />
      <SoundBar height={12} delay={0.4} />
      <SoundBar height={18} delay={0.6} />
      <SoundBar height={10} delay={0.8} />
    </SoundWave>
  );

  return (
    <Box>
      <TextField
        label={label}
        value={value}
        onChange={handleChange}
        name={name}
        fullWidth={fullWidth}
        required={required}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder}
        InputProps={{
          ...inputProps,
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={isRecording ? "Stop recording" : "Use voice input"}>
                <IconButton
                  edge="end"
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                  color={isRecording ? "error" : "primary"}
                >
                  {isProcessing ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isRecording ? (
                    <StopIcon />
                  ) : (
                    <AnimatedMicIcon isrecording={isRecording.toString()} />
                  )}
                </IconButton>
              </Tooltip>
              {isRecording && renderSoundWave()}
            </InputAdornment>
          )
        }}
        {...rest}
      />
      {errorMessage && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default VoiceInputField;