// frontend/src/pages/VoiceQuestionPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import MicIcon from "@mui/icons-material/Mic";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import DescriptionIcon from "@mui/icons-material/Description";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import LottieVoiceAssistant from "../components/LottieVoiceAssistant";
import VoiceQuestionInterface from "../components/VoiceQuestionInterface";
import { useTheme } from "../contexts/ThemeContext";
import {
  questionService,
  relationshipService,
  importService,
} from "../services/api";
import { format } from "date-fns";

const VoiceQuestionPage = () => {
  const { darkMode } = useTheme();
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Core state
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Import progress state
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [fromImport, setFromImport] = useState(false);

  // Profile state
  const [profileStatus, setProfileStatus] = useState(null);
  const [structuredQuestions, setStructuredQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionHistory, setQuestionHistory] = useState([]);

  // UI state
  const [currentMode, setCurrentMode] = useState("voice"); // voice, text, transcript
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showAITyping, setShowAITyping] = useState(false);

  // Voice interaction state
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentQuestionSpoken, setCurrentQuestionSpoken] = useState(false);

  // Dialog state
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  // Error handling state
  const [errorType, setErrorType] = useState(null); // 'rate_limit', 'network', 'audio', etc.
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);

  // Voice refs
  const speechSynthesisRef = React.useRef(window.speechSynthesis);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const speechVisualizerRef = React.useRef();

  // Import progress polling ref
  const importPollingRef = React.useRef(null);

  // Suggested questions for open-ended mode
  const suggestedQuestions = ["Empathize", "Analyze", "Problem Solving"];

  useEffect(() => {
    // Check URL parameters for import progress
    const urlParams = new URLSearchParams(location.search);
    const progressParam = urlParams.get("progress");
    const importingParam = urlParams.get("importing");
    const fromImportParam = urlParams.get("from_import");

    console.log("URL Params:", {
      progressParam,
      importingParam,
      fromImportParam,
    });

    if (fromImportParam === "true") {
      setFromImport(true);
      if (progressParam) {
        const progress = parseInt(progressParam);
        setImportProgress(progress);
        console.log("Setting import progress:", progress);
      }
      if (importingParam === "true") {
        setIsImporting(true);
        console.log("Starting import progress polling");
        startImportProgressPolling();
      }
    }

    fetchInitialData();
  }, [relationshipId, location.search]);

  useEffect(() => {
    return () => {
      // Cleanup import polling on unmount
      if (importPollingRef.current) {
        clearInterval(importPollingRef.current);
      }
    };
  }, []);

  // Start polling for import progress
  const startImportProgressPolling = () => {
    if (importPollingRef.current) {
      clearInterval(importPollingRef.current);
    }

    importPollingRef.current = setInterval(async () => {
      try {
        // Simulate progress update or fetch from API if available
        setImportProgress((prev) => {
          const increment = Math.random() * 5 + 2; // Random increment between 2-7
          const newProgress = Math.min(prev + increment, 100);

          console.log("Progress update:", { prev, newProgress });

          if (newProgress >= 100) {
            setIsImporting(false);
            console.log("Import completed!");
            if (importPollingRef.current) {
              clearInterval(importPollingRef.current);
              importPollingRef.current = null;
            }
          }
          return newProgress;
        });
      } catch (err) {
        console.error("Error polling import progress:", err);
      }
    }, 1500); // Update every 1.5 seconds
  };

  // Auto-speak current question when it changes
  useEffect(() => {
    if (
      isStructuredMode() &&
      getCurrentQuestion() &&
      !currentQuestionSpoken &&
      currentMode === "voice"
    ) {
      setTimeout(() => {
        speakQuestion(getCurrentQuestion());
      }, 1000);
    }
  }, [currentQuestionIndex, structuredQuestions, currentMode]);

  // Clear error after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
        setErrorType(null);
        setShowRetryButton(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const relationshipResponse = await relationshipService.getById(
        relationshipId
      );
      setRelationship(relationshipResponse.data);

      const statusResponse = await questionService.getProfileStatus(
        relationshipId
      );
      setProfileStatus(statusResponse.data);

      if (!statusResponse.data.canAskOpenQuestions) {
        const questionsResponse = await questionService.getStructuredQuestions(
          relationshipId
        );
        setStructuredQuestions(questionsResponse.data.questions);
        setCurrentQuestionIndex(questionsResponse.data.currentIndex);
      }

      const historyResponse = await questionService.getQuestionHistory(
        relationshipId
      );
      setQuestionHistory(historyResponse.data.questions || []);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      handleError(
        err,
        "Failed to load relationship data. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced error handling function
  const handleError = (error, fallbackMessage = "An error occurred") => {
    console.error("Error details:", error);

    if (error.response?.data) {
      const { code, message } = error.response.data;

      switch (code) {
        case "RATE_LIMIT_EXCEEDED":
          setError(
            "AI services are experiencing high demand. Please wait a moment and try again."
          );
          setErrorType("rate_limit");
          setShowRetryButton(true);
          break;

        case "TRANSCRIPTION_FAILED":
          setError(
            "Could not process your audio. Please try speaking more clearly or check your microphone."
          );
          setErrorType("audio");
          setShowRetryButton(true);
          break;

        case "AI_SERVICE_UNAVAILABLE":
          setError(
            "AI services are temporarily unavailable. Please try again in a moment."
          );
          setErrorType("service");
          setShowRetryButton(true);
          break;

        case "FILE_TOO_LARGE":
          setError(
            "Recording too long. Please record a shorter message (maximum 2 minutes)."
          );
          setErrorType("audio");
          setShowRetryButton(false);
          break;

        case "REQUEST_TIMEOUT":
          setError(
            "Request timed out. Please try again with a shorter recording."
          );
          setErrorType("timeout");
          setShowRetryButton(true);
          break;

        case "NETWORK_ERROR":
          setError(
            "Network connection issue. Please check your internet and try again."
          );
          setErrorType("network");
          setShowRetryButton(true);
          break;

        case "INVALID_FILE_TYPE":
          setError("Invalid audio format. Please try recording again.");
          setErrorType("audio");
          setShowRetryButton(false);
          break;

        default:
          setError(message || fallbackMessage);
          setErrorType("general");
          setShowRetryButton(true);
      }
    } else if (error.response?.status === 503) {
      setError(
        "Services are temporarily unavailable. Please try again in a few moments."
      );
      setErrorType("service");
      setShowRetryButton(true);
    } else if (error.response?.status === 429) {
      setError("Too many requests. Please wait a moment before trying again.");
      setErrorType("rate_limit");
      setShowRetryButton(true);
    } else if (error.response?.status >= 500) {
      setError(
        "Server error. Please try again or contact support if the issue persists."
      );
      setErrorType("server");
      setShowRetryButton(true);
    } else if (error.name === "NetworkError" || !navigator.onLine) {
      setError(
        "No internet connection. Please check your network and try again."
      );
      setErrorType("network");
      setShowRetryButton(true);
    } else {
      setError(fallbackMessage);
      setErrorType("general");
      setShowRetryButton(true);
    }
  };

  const clearError = () => {
    setError(null);
    setErrorType(null);
    setShowRetryButton(false);
    setRetryCount(0);
  };

  const retryLastAction = () => {
    setRetryCount((prev) => prev + 1);
    clearError();

    // Retry based on error type
    if (errorType === "audio" && audioChunksRef.current.length > 0) {
      processRecording();
    } else if (errorType === "network" || errorType === "service") {
      fetchInitialData();
    }
  };

  const speakQuestion = (questionText) => {
    if (!speechSynthesisRef.current || isAISpeaking) return;

    setIsAISpeaking(true);
    setCurrentQuestionSpoken(true);

    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = speechSynthesisRef.current.getVoices();
    const englishVoices = voices.filter(
      (voice) => voice.lang && voice.lang.includes("en")
    );
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }

    utterance.onend = () => {
      setIsAISpeaking(false);
      setTimeout(() => {
        startListening();
      }, 500);
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
    };

    speechSynthesisRef.current.speak(utterance);
  };

  // Function to speak AI responses for open-ended questions
  const speakAIResponse = (responseText) => {
    if (!speechSynthesisRef.current || isStructuredMode()) return;

    setIsAISpeaking(true);
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(responseText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = speechSynthesisRef.current.getVoices();
    const englishVoices = voices.filter(
      (voice) => voice.lang && voice.lang.includes("en")
    );
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }

    utterance.onend = () => {
      setIsAISpeaking(false);
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
    };

    speechSynthesisRef.current.speak(utterance);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      clearError(); // Clear any previous errors

      // Check for microphone permission
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
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      // Auto-stop after 10 seconds (to prevent too long recordings)
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopListening();
        }
      }, 10000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsListening(false);

      if (error.name === "NotAllowedError") {
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
        setErrorType("permission");
        setShowRetryButton(false);
      } else if (error.name === "NotFoundError") {
        setError(
          "No microphone found. Please check that your microphone is connected."
        );
        setErrorType("audio");
        setShowRetryButton(false);
      } else {
        setError(
          "Could not access microphone. Please check your microphone settings and try again."
        );
        setErrorType("audio");
        setShowRetryButton(true);
      }
    }
  };

  const stopListening = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processRecording = async () => {
    try {
      setIsProcessing(true);
      clearError(); // Clear any previous errors

      // Check if we have audio data
      if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
        throw new Error("No audio data recorded. Please try recording again.");
      }

      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Check audio blob size (25MB limit)
      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error(
          "Recording is too large. Please record a shorter message."
        );
      }

      const additionalData = isStructuredMode()
        ? {
            isStructured: true,
            questionIndex: currentQuestionIndex,
            currentQuestion: getCurrentQuestion(),
          }
        : {};

      const response = await questionService.askVoiceQuestion(
        relationshipId,
        audioBlob,
        additionalData
      );

      const data = response.data;

      if (data.success) {
        // Reset retry count on success
        setRetryCount(0);

        if (isStructuredMode()) {
          const newEntry = {
            question: getCurrentQuestion(),
            answer: data.transcription,
            createdAt: new Date().toISOString(),
            _id: data._id || Date.now().toString(),
            isStructured: true,
            questionIndex: currentQuestionIndex,
          };

          setQuestionHistory((prev) => [newEntry, ...prev]);

          if (
            data.isComplete ||
            currentQuestionIndex >= structuredQuestions.length - 1
          ) {
            setProfileStatus((prev) => ({
              ...prev,
              hasStructuredProfile: true,
              canAskOpenQuestions: true,
            }));
          } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setCurrentQuestionSpoken(false);
          }
        } else {
          // Handle open-ended question
          const newEntry = {
            question: data.transcription,
            answer: data.answer,
            createdAt: new Date().toISOString(),
            _id: data._id,
            isStructured: false,
          };

          setQuestionHistory((prev) => [newEntry, ...prev]);

          // Speak the AI response in voice mode
          if (currentMode === "voice" && data.answer) {
            setTimeout(() => {
              speakAIResponse(data.answer);
            }, 500);
          }
        }
      } else {
        throw new Error(data.message || "Failed to process recording");
      }
    } catch (error) {
      handleError(error, "Failed to process your recording. Please try again.");
    } finally {
      setIsProcessing(false);
      setShowAITyping(false);
    }
  };

  const handleMicClick = () => {
    if (isAISpeaking) {
      speechSynthesisRef.current.cancel();
      setIsAISpeaking(false);
      startListening();
    } else if (isListening) {
      stopListening();
    } else if (isStructuredMode() && !currentQuestionSpoken) {
      speakQuestion(getCurrentQuestion());
    } else {
      startListening();
    }
  };

  const handleStructuredAnswer = async (answer, isVoice = false) => {
    if (!answer.trim() || currentQuestionIndex >= structuredQuestions.length)
      return;

    setIsProcessing(true);
    clearError(); // Clear any previous errors

    try {
      const currentQuestion = structuredQuestions[currentQuestionIndex];

      const response = await questionService.submitStructuredAnswer(
        relationshipId,
        {
          questionIndex: currentQuestionIndex,
          question: currentQuestion,
          answer: answer.trim(),
          transcription: isVoice ? answer : null,
        }
      );

      if (response.data.success) {
        // Reset retry count on success
        setRetryCount(0);

        const newEntry = {
          question: currentQuestion,
          answer: answer.trim(),
          createdAt: new Date().toISOString(),
          _id: response.data._id,
          isStructured: true,
          questionIndex: currentQuestionIndex,
        };

        setQuestionHistory((prev) => [newEntry, ...prev]);

        if (response.data.isComplete) {
          setProfileStatus((prev) => ({
            ...prev,
            hasStructuredProfile: true,
            canAskOpenQuestions: true,
          }));
          setCurrentQuestionIndex(structuredQuestions.length);
        } else {
          setCurrentQuestionIndex(response.data.nextQuestionIndex);
          setCurrentQuestionSpoken(false);
        }

        setTextInput("");
        setIsUserTyping(false);
        setShowAITyping(false);
      }
    } catch (error) {
      handleError(error, "Failed to submit answer. Please try again.");
    } finally {
      setIsProcessing(false);
      setShowAITyping(false);
    }
  };

  const handleOpenEndedQuestion = async (question, isVoice = false) => {
    if (!question.trim()) return;

    setIsProcessing(true);
    clearError(); // Clear any previous errors

    try {
      const response = await questionService.askQuestion(
        relationshipId,
        question.trim()
      );

      if (response.data.success) {
        // Reset retry count on success
        setRetryCount(0);

        const newEntry = {
          question: question.trim(),
          answer: response.data.answer,
          createdAt: new Date().toISOString(),
          _id: response.data._id,
          isStructured: false,
        };

        setQuestionHistory((prev) => [newEntry, ...prev]);
        setTextInput("");

        // Speak the AI response in voice mode
        if (currentMode === "voice" && response.data.answer) {
          setTimeout(() => {
            speakAIResponse(response.data.answer);
          }, 500);
        }
      }
    } catch (error) {
      handleError(error, "Failed to submit question. Please try again.");
    } finally {
      setIsProcessing(false);
      setShowAITyping(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      setIsUserTyping(false);
      setShowAITyping(true);

      if (profileStatus?.canAskOpenQuestions) {
        handleOpenEndedQuestion(textInput);
      } else {
        handleStructuredAnswer(textInput);
      }
    }
  };

  // Handle typing indicator
  const handleTextInputChange = (e) => {
    setTextInput(e.target.value);
    setIsUserTyping(e.target.value.length > 0 && !isProcessing);
  };

  useEffect(() => {
    if (!isProcessing) {
      setShowAITyping(false);
    }
  }, [isProcessing]);

  // Clear user typing when form is submitted
  useEffect(() => {
    if (isProcessing) {
      setIsUserTyping(false);
    }
  }, [isProcessing]);

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    if (isListening) {
      stopListening();
    }
    setIsAISpeaking(false);
    setIsListening(false);
    setIsUserTyping(false);
    setShowAITyping(false);
    clearError(); // Clear errors when switching modes
  };

  const handleBack = () => {
    navigate(`/relationships/${relationshipId}`);
  };

  const handleUploadChat = () => {
    navigate(`/relationship-circle/${relationshipId}/import`);
  };

  const handleViewAnalysis = () => {
    navigate(`/relationship-circle/${relationshipId}/analysis`);
  };

  const getCurrentQuestion = () => {
    if (profileStatus?.canAskOpenQuestions) {
      return null;
    }
    return structuredQuestions[currentQuestionIndex] || null;
  };

  const isStructuredMode = () => {
    return (
      !profileStatus?.canAskOpenQuestions &&
      currentQuestionIndex < structuredQuestions.length
    );
  };

  const getMicButtonColor = () => {
    if (isAISpeaking) return "#ff6b6b";
    if (isListening) return "#51cf66";
    if (isProcessing) return "#ffd43b";
    return "#ffffff";
  };

  const getMicButtonText = () => {
    if (isAISpeaking) return "AI is speaking...";
    if (isListening) return "Listening... Tap to stop";
    if (isProcessing) return "Processing...";
    if (isStructuredMode() && !currentQuestionSpoken)
      return "Tap to hear question";
    return "Tap to answer by voice";
  };

  // Error display component
  const renderErrorDisplay = () => {
    if (!error) return null;

    const getErrorIcon = () => {
      switch (errorType) {
        case "rate_limit":
        case "service":
          return <WarningIcon sx={{ color: "#ffd43b", fontSize: "20px" }} />;
        case "network":
        case "timeout":
          return <ErrorIcon sx={{ color: "#ff6b6b", fontSize: "20px" }} />;
        default:
          return <ErrorIcon sx={{ color: "#ff6b6b", fontSize: "20px" }} />;
      }
    };

    const getErrorColor = () => {
      switch (errorType) {
        case "rate_limit":
        case "service":
          return {
            bg: "rgba(255, 212, 59, 0.1)",
            border: "rgba(255, 212, 59, 0.3)",
            text: "#ffd43b",
          };
        case "network":
        case "timeout":
          return {
            bg: "rgba(255, 107, 107, 0.1)",
            border: "rgba(255, 107, 107, 0.3)",
            text: "#ff6b6b",
          };
        default:
          return {
            bg: "rgba(255, 107, 107, 0.1)",
            border: "rgba(255, 107, 107, 0.3)",
            text: "#ff6b6b",
          };
      }
    };

    const colors = getErrorColor();

    return (
      <Box
        sx={{
          position: "fixed",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          maxWidth: "90%",
          width: "500px",
        }}
      >
        <Paper
          sx={{
            p: 2,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            {getErrorIcon()}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: colors.text,
                  fontSize: "14px",
                  fontFamily: "DM Sans",
                  fontWeight: 500,
                  mb: showRetryButton ? 1 : 0,
                }}
              >
                {error}
              </Typography>
              {showRetryButton && (
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    onClick={retryLastAction}
                    sx={{
                      color: colors.text,
                      borderColor: colors.text,
                      fontSize: "12px",
                      minWidth: "auto",
                      px: 2,
                      py: 0.5,
                    }}
                    variant="outlined"
                  >
                    Retry {retryCount > 0 && `(${retryCount})`}
                  </Button>
                  <Button
                    size="small"
                    onClick={clearError}
                    sx={{
                      color: colors.text,
                      fontSize: "12px",
                      minWidth: "auto",
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    Dismiss
                  </Button>
                </Box>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={clearError}
              sx={{ color: colors.text, mt: -0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderHeader = () => (
    <>
      <Box
        className="voice-question-header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "space-between" },
          position: "relative",
          width: "100%",
          px: { xs: 0, md: 4 },
          pt: { xs: 0, md: 2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleBack} className="voice-back-button">
            <ArrowBackIcon />
          </IconButton>
          <Typography className="voice-page-title" sx={{ ml: 2 }}>
            Reflect with AI
          </Typography>
        </Box>
        <IconButton
          onClick={() => setShowDownloadDialog(true)}
          sx={{
            color: "#fff",
            position: { xs: "absolute", md: "static" },
            right: { xs: 16, md: "auto" },
            top: { xs: 16, md: "auto" },
            zIndex: 2,
          }}
        >
          <DownloadIcon />
        </IconButton>
      </Box>
      {/* Desktop only: action buttons below header, right-aligned */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          mt: 2,
          pr: 4,
        }}
      >
        <Button
          onClick={handleUploadChat}
          sx={{
            minWidth: 0,
            px: 4,
            py: 1.5,
            background: "linear-gradient(180deg, #101C44 0%, #172556 100%)",
            borderRadius: "30px",
            color: "#F5F5F5",
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "16px",
            boxShadow: "none",
            "&:hover": {
              background: "linear-gradient(180deg, #1a2858 0%, #21306a 100%)",
            },
          }}
        >
          Upload Chat
        </Button>
        <Button
          onClick={handleViewAnalysis}
          sx={{
            minWidth: 0,
            px: 4,
            py: 1.5,
            background:
              "linear-gradient(89.75deg, #4E7FFF -31.41%, #0047FF 96.04%)",
            borderRadius: "30px",
            color: "#F5F5F5",
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "16px",
            boxShadow: "none",
            "&:hover": {
              background:
                "linear-gradient(89.75deg, #5a8bff -31.41%, #1a57ff 96.04%)",
            },
          }}
        >
          View Analysis
        </Button>
      </Box>
    </>
  );

  const renderActionButtons = () => {
    console.log("Render Action Buttons - State:", {
      fromImport,
      isImporting,
      importProgress,
      canAskOpenQuestions: profileStatus?.canAskOpenQuestions,
    });

    // Show progress bar if importing and from import flow
    if (fromImport && isImporting && importProgress < 100) {
      return (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            mt: 3,
            mb: 2,
            zIndex: 10,
          }}
        >
          <Paper
            sx={{
              width: { xs: "90%", md: 553 },
              height: 86,
              borderRadius: 6,
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              background: "rgba(255,255,255,0.08)",
              boxShadow: "0px 1px 10.6px rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: 18,
                color: "#F5F5F5",
                flex: 1,
              }}
            >
              Uploading Chat {Math.round(importProgress)}%
            </Typography>
            <Box
              sx={{
                width: 200,
                height: 16,
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: `${importProgress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(89.75deg, #4E7FFF -31.41%, #0047FF 96.04%)",
                  borderRadius: "6px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Paper>
        </Box>
      );
    }

    // On mobile, show buttons below download as before; on desktop, buttons are now in header
    if (
      profileStatus?.canAskOpenQuestions ||
      (fromImport && importProgress >= 100) ||
      (!fromImport && !isImporting)
    ) {
      return (
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            gap: "12px",
            mt: 2,
          }}
        >
          <Button
            onClick={handleUploadChat}
            sx={{
              minWidth: 0,
              px: 4,
              py: 1.5,
              background: "linear-gradient(180deg, #101C44 0%, #172556 100%)",
              borderRadius: "30px",
              color: "#F5F5F5",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "16px",
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(180deg, #1a2858 0%, #21306a 100%)",
              },
            }}
          >
            Upload Chat
          </Button>
          <Button
            onClick={handleViewAnalysis}
            sx={{
              minWidth: 0,
              px: 4,
              py: 1.5,
              background:
                "linear-gradient(89.75deg, #4E7FFF -31.41%, #0047FF 96.04%)",
              borderRadius: "30px",
              color: "#F5F5F5",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "16px",
              boxShadow: "none",
              "&:hover": {
                background:
                  "linear-gradient(89.75deg, #5a8bff -31.41%, #1a57ff 96.04%)",
              },
            }}
          >
            View Analysis
          </Button>
        </Box>
      );
    }

    return null;
  };

  const renderVoiceMode = () => (
    <Box className="voice-main-content">
      <Box className="voice-title-section">
        <Typography className="voice-main-title">
          Analyzing your bond with
        </Typography>

        <Box className="voice-name-container">
          <Box className="voice-name-text">{relationship?.contactName}</Box>
          <Box className="voice-type-container">
            <Typography className="voice-type-text">
              {relationship?.relationshipType || "Friend"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <LottieVoiceAssistant
          status={
            isAISpeaking
              ? "speaking"
              : isListening
              ? "listening"
              : isProcessing
              ? "processing"
              : "idle"
          }
          size={200}
          speechVisualizerRef={speechVisualizerRef}
          mode="full"
          showStatusText={false}
        />
      </Box>

      {/* Show current question for structured mode only */}
      {isStructuredMode() && getCurrentQuestion() && (
        <>
          <Typography className="voice-question-title">
            Answer the question
          </Typography>
          <Typography className="voice-instruction-text">
            You will be asked 7 questions one after the other to help us
            understand your relationship with {relationship?.contactName}
          </Typography>

          <Box className="voice-chat-container">
            <Box className="question-left">
              <Box className="question-bubble">
                <Typography
                  sx={{
                    fontFamily: "DM Sans",
                    fontSize: "16px",
                    color: "#F5F5F5",
                  }}
                >
                  {getCurrentQuestion()}
                </Typography>
              </Box>
            </Box>

            {/* Show only the latest answer if available */}
            {questionHistory.length > 0 &&
              questionHistory[0].questionIndex === currentQuestionIndex - 1 && (
                <Box className="answer-right">
                  <Box className="answer-bubble">
                    <Typography
                      sx={{
                        fontFamily: "DM Sans",
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#F5F5F5",
                      }}
                    >
                      {questionHistory[0].answer}
                    </Typography>
                  </Box>
                </Box>
              )}
          </Box>

          <Typography className="question-progress">
            Question {currentQuestionIndex + 1} of {structuredQuestions.length}
          </Typography>
        </>
      )}

      <Typography className="voice-status-text">
        {getMicButtonText()}
      </Typography>

      <Box className="voice-action-buttons">
        <IconButton
          onClick={() => handleModeChange("transcript")}
          className="voice-action-button transcript"
        >
          <DescriptionIcon sx={{ color: "#FFFFFF", fontSize: "24px" }} />
        </IconButton>

        <IconButton
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`main-microphone-button ${
            isListening ? "listening" : isAISpeaking ? "speaking" : ""
          }`}
        >
          {isProcessing ? (
            <CircularProgress size={32} sx={{ color: "#000" }} />
          ) : isListening ? (
            <CloseIcon sx={{ color: "#000", fontSize: "32px" }} />
          ) : (
            <MicIcon sx={{ color: "#000", fontSize: "32px" }} />
          )}
        </IconButton>

        <IconButton
          onClick={() => handleModeChange("text")}
          className="voice-action-button keyboard"
        >
          <KeyboardIcon sx={{ color: "#FFFFFF", fontSize: "24px" }} />
        </IconButton>
      </Box>
    </Box>
  );

  // --- Chat container ref for auto-scroll ---
  const chatContainerRef = React.useRef(null);
  const endOfMessagesRef = React.useRef(null);

  // Auto-scroll to bottom on new message/typing
  React.useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [questionHistory, isUserTyping, showAITyping]);

  const renderTextMode = () => (
    <Box className="text-mode-container">
      <Box className="text-mode-title">
        <Typography className="text-mode-title-text">
          Analyzing your bond with
        </Typography>

        <Box className="voice-name-container">
          <Typography className="voice-name-text" sx={{ fontSize: "14px" }}>
            {relationship?.contactName}
          </Typography>
          <Box className="voice-type-container">
            <Typography className="voice-type-text" sx={{ fontSize: "13px" }}>
              {relationship?.relationshipType || "Friend"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Chat history display with proper message placement */}
      {(questionHistory.length > 0 || isUserTyping || showAITyping) && (
        <Box
          ref={chatContainerRef}
          sx={{
            width: "100%",
            maxWidth: "1000px",

            display: "flex",
            flexDirection: "column",
            gap: "15px",
            mb: 4,

            overflowY: "auto",

            paddingBottom: "200px",
          }}
        >
          {[...questionHistory].reverse().map((item, index) => (
            <Box
              key={item._id}
              sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {/* For structured questions: Show AI question first, then user answer */}
              {item.isStructured && (
                <>
                  {/* AI Question - LEFT SIDE */}
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Box
                      sx={{
                        padding: "10px 20px",
                        background: "#151E36",
                        borderRadius: "15.771px 15.771px 15.771px 0px",
                        maxWidth: "70%",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "DM Sans",
                          fontSize: "16px",
                          color: "#F5F5F5",
                        }}
                      >
                        {item.question}
                      </Typography>
                    </Box>
                  </Box>

                  {/* User Answer - RIGHT SIDE */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box
                      sx={{
                        padding: "10px 20px",
                        background:
                          "linear-gradient(90.81deg, #4E7FFF 4.7%, #0047FF 96.51%)",
                        borderRadius: "15.771px 15.771px 0px 15.771px",
                        maxWidth: "70%",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "DM Sans",
                          fontSize: "16px",
                          fontWeight: 500,
                          color: "#F5F5F5",
                        }}
                      >
                        {item.answer}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              {/* For open-ended questions: Show user question first, then AI response */}
              {!item.isStructured && (
                <>
                  {/* User Question - RIGHT SIDE */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box
                      sx={{
                        padding: "10px 20px",
                        background:
                          "linear-gradient(90.81deg, #4E7FFF 4.7%, #0047FF 96.51%)",
                        borderRadius: "15.771px 15.771px 0px 15.771px",
                        maxWidth: "70%",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "DM Sans",
                          fontSize: "16px",
                          fontWeight: 500,
                          color: "#F5F5F5",
                        }}
                      >
                        {item.question}
                      </Typography>
                    </Box>
                  </Box>

                  {/* AI Response - LEFT SIDE */}
                  {item.answer && (
                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                      <Box
                        sx={{
                          padding: "10px 20px",
                          background: "#151E36",
                          borderRadius: "15.771px 15.771px 15.771px 0px",
                          maxWidth: "70%",
                          wordWrap: "break-word",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "DM Sans",
                            fontSize: "16px",
                            color: "#F5F5F5",
                          }}
                        >
                          {item.answer}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          ))}

          {/* User typing indicator - RIGHT SIDE */}
          {isUserTyping && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box
                sx={{
                  padding: "15px 20px",
                  background:
                    "linear-gradient(90.81deg, #4E7FFF 4.7%, #0047FF 96.51%)",
                  borderRadius: "15.771px 15.771px 0px 15.771px",
                  maxWidth: "70%",
                }}
              >
                <Box className="typing-indicator">
                  <Box className="typing-dot" />
                  <Box className="typing-dot" />
                  <Box className="typing-dot" />
                </Box>
              </Box>
            </Box>
          )}

          {/* AI typing indicator - LEFT SIDE */}
          {showAITyping && (
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Box
                sx={{
                  padding: "15px 20px",
                  background: "#151E36",
                  borderRadius: "15.771px 15.771px 15.771px 0px",
                  maxWidth: "70%",
                }}
              >
                <Box className="typing-indicator">
                  <Box className="typing-dot" />
                  <Box className="typing-dot" />
                  <Box className="typing-dot" />
                </Box>
              </Box>
            </Box>
          )}
          {/* Scroll anchor for auto-scroll */}
          <div ref={endOfMessagesRef} />
        </Box>
      )}

      <Box className="text-input-area">
        <form onSubmit={handleTextSubmit}>
          <Box className="text-input-field-container">
            <TextField
              fullWidth
              variant="standard"
              placeholder={
                isStructuredMode() ? "Type your answer..." : "Ask anything"
              }
              value={textInput}
              onChange={handleTextInputChange}
              disabled={isProcessing}
              InputProps={{
                disableUnderline: true,
                sx: {
                  color: "#C8C8C8",
                  fontSize: "16px",
                  fontFamily: "DM Sans",
                  "& input": { padding: "0 15px" },
                },
              }}
            />

            <IconButton
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              sx={{
                width: "50px",
                height: "50px",
                marginRight: "10px",
              }}
            >
              {isProcessing ? (
                <CircularProgress size={24} sx={{ color: "#E9E9E9" }} />
              ) : (
                <SendIcon sx={{ color: "#E9E9E9", fontSize: "24px" }} />
              )}
            </IconButton>

            {/* AI chatbot icon - switches to voice mode */}
            <Box
              sx={{
                width: "60px",
                height: "60px",
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => handleModeChange("voice")}
            >
              <LottieVoiceAssistant size={60} status="idle" mode="icon-only" />
            </Box>
          </Box>
        </form>

        {profileStatus?.canAskOpenQuestions && (
          <Box className="suggested-buttons-container">
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                onClick={() => setTextInput(question)}
                className={`suggested-button ${
                  question === "Empathize" ? "active" : "inactive"
                }`}
              >
                {question}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderTranscriptMode = () => (
    <Box className="voice-main-content">
      {/* Keep the same title section */}
      <Box className="voice-title-section">
        <Typography className="voice-main-title">
          Analyzing your bond with
        </Typography>

        <Box className="voice-name-container">
          <Box className="voice-name-text">{relationship?.contactName}</Box>
          <Box className="voice-type-container">
            <Typography className="voice-type-text">
              {relationship?.relationshipType || "Friend"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Keep the AI Assistant visible */}
      <Box sx={{ mb: 3 }}>
        <LottieVoiceAssistant
          status={
            isAISpeaking
              ? "speaking"
              : isListening
              ? "listening"
              : isProcessing
              ? "processing"
              : "idle"
          }
          size={200}
          speechVisualizerRef={speechVisualizerRef}
          mode="full"
          showStatusText={false}
        />
      </Box>

      {/* Transcript overlay with same width as text mode */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "400px",
          overflowY: "auto",
          padding: "20px",

          backdropFilter: "blur(10px)",

          mb: 4,
        }}
      >
        {/* Chat Messages */}
        {questionHistory.map((item, index) => (
          <Box
            key={item._id}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              mb: 3,
            }}
          >
            {/* AI Question */}
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Box
                sx={{
                  padding: "10px 20px",
                  background: "#2A3441",
                  borderRadius: "15.771px 15.771px 15.771px 0px",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "DM Sans",
                    fontSize: "16px",
                    color: "#F5F5F5",
                  }}
                >
                  {item.question}
                </Typography>
              </Box>
            </Box>

            {/* User Answer */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box
                sx={{
                  padding: "10px 20px",
                  background:
                    "linear-gradient(90.81deg, #4E7FFF 4.7%, #0047FF 96.51%)",
                  borderRadius: "15.771px 15.771px 0px 15.771px",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "DM Sans",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#F5F5F5",
                  }}
                >
                  {item.isStructured ? item.answer : item.question}
                </Typography>
              </Box>
            </Box>

            {/* AI Response (for open-ended questions) */}
            {!item.isStructured && item.answer && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Box
                  sx={{
                    padding: "10px 20px",
                    background: "#2A3441",
                    borderRadius: "15.771px 15.771px 15.771px 0px",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "DM Sans",
                      fontSize: "16px",
                      color: "#F5F5F5",
                    }}
                  >
                    {item.answer}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Keep all buttons with same functionality */}
      <Box className="voice-action-buttons">
        <IconButton
          onClick={() => handleModeChange("voice")}
          className="voice-action-button transcript"
        >
          <CloseIcon sx={{ color: "#FFFFFF", fontSize: "24px" }} />
        </IconButton>

        {/* Main Microphone Button */}
        <IconButton
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`main-microphone-button ${
            isListening ? "listening" : isAISpeaking ? "speaking" : ""
          }`}
        >
          {isProcessing ? (
            <CircularProgress size={32} sx={{ color: "#000" }} />
          ) : isListening ? (
            <CloseIcon sx={{ color: "#000", fontSize: "32px" }} />
          ) : (
            <MicIcon sx={{ color: "#000", fontSize: "32px" }} />
          )}
        </IconButton>

        <IconButton
          onClick={() => handleModeChange("text")}
          className="voice-action-button keyboard"
        >
          <KeyboardIcon sx={{ color: "#FFFFFF", fontSize: "24px" }} />
        </IconButton>
      </Box>
    </Box>
  );

  const renderDownloadDialog = () => (
    <Dialog
      open={showDownloadDialog}
      onClose={() => setShowDownloadDialog(false)}
      PaperProps={{
        sx: {
          background: "var(--download-dialog-bg)",
          borderRadius: "15px",
          width: "420px",
          height: "272px",
        },
      }}
    >
      <DialogTitle className="download-dialog-title">
        Confirm Download
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography className="download-dialog-text">
          Do you want to download this chat?
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{ flexDirection: "column", gap: "20px", padding: "30px" }}
      >
        <Button fullWidth className="download-button">
          Download
        </Button>
        <Button
          fullWidth
          onClick={() => setShowDownloadDialog(false)}
          className="download-cancel-button"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box className="voice-loading-container">
        <CircularProgress size={60} thickness={4} />
        <Typography>Loading relationship data...</Typography>
      </Box>
    );
  }

  if (error && !relationship) {
    return (
      <Box className="voice-error-container">
        <Typography variant="h5" color="error">
          Unable to Load Relationship
        </Typography>
        <Typography>{error || "Could not find relationship data."}</Typography>
        <Button variant="contained" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box className="voice-question-page">
      <Box className="voice-question-blur" />

      {renderHeader()}
      {renderActionButtons()}

      {/* Enhanced Error Display */}
      {renderErrorDisplay()}

      <Box sx={{ position: "relative", flex: 1, pt: 8 }}>
        {currentMode === "voice" && renderVoiceMode()}
        {currentMode === "text" && renderTextMode()}
        {currentMode === "transcript" && renderTranscriptMode()}
      </Box>

      {renderDownloadDialog()}
    </Box>
  );
};

export default VoiceQuestionPage;
