// frontend/src/components/VoiceQuestionInterface.js
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, CircularProgress, Fade, Paper } from "@mui/material";
import { styled } from "@mui/system";
import LottieVoiceAssistant from "./LottieVoiceAssistant";
import { questionService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

const ProcessingIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(5px)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
}));

const ResponsePaper = styled(Paper)(({ theme, darkMode }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(4),
  backgroundColor: darkMode
    ? "rgba(30, 30, 30, 0.9)"
    : "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
  transition: "all 0.3s ease",
  opacity: 0,
  transform: "translateY(20px)",
  "&.visible": {
    opacity: 1,
    transform: "translateY(0)",
  },
}));

const VoiceQuestionInterface = ({
  relationshipId,
  onQuestionAnswered,
  currentQuestion = null,
  isStructured = false,
  questionIndex = 0,
  mode = "voice", // voice | integrated | minimal
}) => {
  // Get theme context
  const { darkMode } = useTheme();

  // States for voice recording and processing
  const [status, setStatus] = useState("idle"); // idle, listening, processing, speaking
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [responseVisible, setResponseVisible] = useState(false);

  // Refs for audio handling
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const speechVisualizerRef = useRef(null);
  const audioAnalysisRef = useRef(null);

  useEffect(() => {
    // Initialize speech synthesis on component mount
    window.speechSynthesis.getVoices();

    // Force load voices (some browsers need this)
    const loadVoices = () => {
      const voices = speechSynthesisRef.current.getVoices();
      console.log(`Loaded ${voices.length} voices`);
    };

    speechSynthesisRef.current.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // Handle activating the voice assistant
  const handleActivateVoice = () => {
    if (status === "idle") {
      startRecording();
    } else if (status === "listening") {
      stopRecording();
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      setError(null);
      setTranscript("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // Create a function to update animation based on audio levels
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAnimation = () => {
        if (status !== "listening") return;

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedValue = average / 256; // 0-1 range

        // Update animation based on audio level
        if (speechVisualizerRef.current) {
          speechVisualizerRef.current.simulateWordEmphasis(normalizedValue * 2);
        }

        requestAnimationFrame(updateAnimation);
      };

      const animationFrameId = requestAnimationFrame(updateAnimation);

      // Store this for cleanup
      audioAnalysisRef.current = {
        audioContext,
        animationFrameId,
        cleanUp: () => {
          cancelAnimationFrame(animationFrameId);
          audioContext.close();
        },
      };

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
      setStatus("listening");
    } catch (error) {
      console.error("Error starting voice recording:", error);
      setError("Could not access microphone. Please check permissions.");
      setStatus("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "listening") {
      mediaRecorderRef.current.stop();

      // Stop all tracks in the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      if (audioAnalysisRef.current) {
        audioAnalysisRef.current.cleanUp();
      }
    }
  };

  const processRecording = async () => {
    try {
      setStatus("processing");

      // Create an audio blob from the recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Prepare additional data for structured questions
      const additionalData = isStructured
        ? {
            isStructured: true,
            questionIndex,
            currentQuestion,
          }
        : {};

      // Use the questionService to submit voice question
      const response = await questionService.askVoiceQuestion(
        relationshipId,
        audioBlob,
        additionalData
      );

      const data = response.data;

      if (data.success) {
        // Update transcript and response
        setTranscript(data.transcription);

        if (isStructured) {
          // For structured questions, we just need the transcription
          setResponse("");

          // Notify parent component with structured data
          if (onQuestionAnswered) {
            onQuestionAnswered({
              transcription: data.transcription,
              answer: data.transcription, // For structured, the transcription IS the answer
              isStructured: true,
              questionIndex: data.questionIndex,
              isComplete: data.isComplete,
              nextQuestionIndex: data.nextQuestionIndex,
            });
          }
        } else {
          // For open-ended questions, we get both question and AI response
          setResponse(data.answer);

          // Notify parent component
          if (onQuestionAnswered) {
            onQuestionAnswered({
              question: data.transcription,
              answer: data.answer,
              transcription: data.transcription,
              aiResponse: data.answer,
              isStructured: false,
            });
          }

          // Start speaking the response for open-ended questions
          speakResponse(data.answer);
        }

        // For structured questions, go back to idle immediately
        if (isStructured) {
          setStatus("idle");
        }
      } else {
        setError(data.message || "Failed to process your input");
        setStatus("idle");
      }
    } catch (error) {
      console.error("Error processing voice input:", error);
      setError("Failed to process your input. Please try again.");
      setStatus("idle");
    }
  };

  // Speak the response using speech synthesis (only for open-ended questions)
  const speakResponse = (text) => {
    if (!speechSynthesisRef.current || isStructured) return;

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    setStatus("speaking");
    setResponseVisible(true);

    // Create a simple utterance without SSML for better compatibility
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice settings
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get available voices and use the first available English one
    const voices = speechSynthesisRef.current.getVoices();
    const englishVoices = voices.filter(
      (voice) => voice.lang && voice.lang.includes("en")
    );

    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }

    // Connect to 3D visualization
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        if (speechVisualizerRef && speechVisualizerRef.current) {
          const wordEmphasis = Math.random() * 0.5 + 0.5;
          speechVisualizerRef.current.simulateWordEmphasis(wordEmphasis);
        }
      }
    };

    // Handle speech events with better logging
    utterance.onstart = () => {
      console.log("Speech started");
      setStatus("speaking");
    };

    utterance.onend = () => {
      console.log("Speech ended");
      setTimeout(() => setStatus("idle"), 500);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setStatus("idle");
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

      if (mediaRecorderRef.current && status === "listening") {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [status]);

  // Helper text based on status and mode
  const getStatusText = () => {
    if (isStructured) {
      switch (status) {
        case "idle":
          return "Tap to answer by voice";
        case "listening":
          return "Listening... Click again to stop";
        case "processing":
          return "Processing your answer...";
        default:
          return "";
      }
    } else {
      switch (status) {
        case "idle":
          return "Tap to ask a question by voice";
        case "listening":
          return "Listening... Click again to stop";
        case "processing":
          return "Processing your question...";
        case "speaking":
          return "Speaking...";
        default:
          return "";
      }
    }
  };

  const getInstructionText = () => {
    if (isStructured) {
      return "Answer the question by voice or text. Your answers help us understand your relationship better.";
    } else {
      return "You can ask questions by voice or text. The AI will use your relationship data to provide personalized responses.";
    }
  };

  if (mode === "integrated" || mode === "minimal") {
    // Minimal integration for use within other components
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          minHeight: mode === "minimal" ? "160px" : "200px",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <LottieVoiceAssistant
          status={status}
          onActivate={handleActivateVoice}
          size={mode === "minimal" ? 120 : 140}
          speechVisualizerRef={speechVisualizerRef}
          mode={mode === "minimal" ? "minimal" : "full"}
          showStatusText={mode !== "minimal"}
          customStatusText={getStatusText()}
        />

        {mode !== "minimal" && (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              opacity: 0.8,
              color: "#60a5fa",
              fontSize: "16px",
              fontWeight: 500,
              fontFamily: "DM Sans",
            }}
          >
            {getStatusText()}
          </Typography>
        )}

        {status === "processing" && (
          <ProcessingIndicator>
            <CircularProgress size={24} sx={{ mr: 1.5, color: "#4a6bf5" }} />
            <Typography variant="body2" color="white">
              {isStructured
                ? "Processing your answer..."
                : "Analyzing your question..."}
            </Typography>
          </ProcessingIndicator>
        )}

        {error && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mt: 2, textAlign: "center", fontSize: "14px" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        width: "100%",
        p: 2,
      }}
    >
      {/* Show current question for structured mode */}
      {isStructured && currentQuestion && (
        <Box sx={{ mb: 4, textAlign: "center", maxWidth: "600px" }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "22px",
              color: "#FFFFFF",
              mb: 2,
            }}
          >
            {isStructured ? "Answer the question" : "Ask your question"}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "DM Sans",
              fontSize: "16px",
              color: "#D1D1D1",
              mb: 3,
            }}
          >
            {getInstructionText()}
          </Typography>
          <Paper
            sx={{
              p: 3,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: "DM Sans",
                fontSize: "18px",
                color: "#FFFFFF",
                fontWeight: 500,
              }}
            >
              {currentQuestion}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* The Voice Assistant */}
      <LottieVoiceAssistant
        status={status}
        onActivate={handleActivateVoice}
        size={240}
        speechVisualizerRef={speechVisualizerRef}
        mode="full"
        showStatusText={true}
        customStatusText={getStatusText()}
      />

      {/* Processing indicator */}
      {status === "processing" && (
        <ProcessingIndicator>
          <CircularProgress size={24} sx={{ mr: 1.5, color: "#4a6bf5" }} />
          <Typography variant="body2" color="white">
            {isStructured
              ? "Processing your answer..."
              : "Analyzing your question..."}
          </Typography>
        </ProcessingIndicator>
      )}

      {/* Transcript display for structured questions */}
      {transcript && isStructured && (
        <Box sx={{ mt: 3, textAlign: "center", maxWidth: "600px" }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "bold",
              color: "#60a5fa",
              mb: 1,
              fontFamily: "DM Sans",
            }}
          >
            Your answer:
          </Typography>
          <Paper
            sx={{
              p: 2,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#FFFFFF",
                fontFamily: "DM Sans",
              }}
            >
              {transcript}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Transcript and response display for open-ended questions */}
      {(transcript || response) && !isStructured && mode === "voice" && (
        <Fade in={responseVisible}>
          <ResponsePaper
            className={responseVisible ? "visible" : ""}
            darkMode={darkMode}
          >
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
                  color={darkMode ? "white" : "text.primary"}
                  sx={{ mb: 2 }}
                >
                  {transcript}
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
                  color={darkMode ? "white" : "text.primary"}
                >
                  {response.split("\n\n").map((paragraph, idx) => (
                    <React.Fragment key={idx}>
                      {paragraph}
                      <br />
                      <br />
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
          sx={{ mt: 2, textAlign: "center" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default VoiceQuestionInterface;
