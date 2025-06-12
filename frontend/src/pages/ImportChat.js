// src/pages/ImportChat.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
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
  Chip,
  Card,
  CardContent,
  IconButton,
  Collapse,
} from "@mui/material";
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
  FileType,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { styled } from "@mui/material/styles";

import { importService, relationshipService } from "../services/api";

// ... (Keep all the existing styled components and PLATFORMS config - unchanged)

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px 20px 0 20px",
  background: "transparent",
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.down("sm")]: {
    padding: "10px 20px 0 20px",
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  left: "20px",
  color: "var(--text-primary)",
  width: "34px",
  height: "34px",
  padding: 0,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
  },
  [theme.breakpoints.down("sm")]: {
    left: "20px",
    width: "32px",
    height: "32px",
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "29px",
  color: "var(--text-primary)",
  letterSpacing: "-0.165px",
  [theme.breakpoints.down("sm")]: {
    fontSize: "18px",
    lineHeight: "24px",
  },
}));

// Platform configurations with export instructions and GIFs
const PLATFORMS = {
  whatsapp: {
    name: "WhatsApp",
    icon: "💬",
    color: "#25D366",
    gifs: {
      android:
        "https://assets.mixkit.co/animations/preview/mixkit-whatsapp-export-android-loop.gif",
      ios: "https://assets.mixkit.co/animations/preview/mixkit-whatsapp-export-ios-loop.gif",
    },
    instructions: {
      android: [
        "Open WhatsApp on your Android device",
        "Open the chat you want to export",
        "Tap the three dots (⋮) in the top right corner",
        "Select 'More' from the menu",
        "Tap 'Export chat'",
        "Choose 'Without media' for faster processing",
        "Select how you want to share the file (Email, Drive, etc.)",
        "Save the .txt file and upload it here",
      ],
      ios: [
        "Open WhatsApp on your iPhone",
        "Open the chat you want to export",
        "Tap the contact/group name at the top",
        "Scroll down and tap 'Export Chat'",
        "Choose 'Without Media' for faster processing",
        "Select how you want to share the file (Mail, Files, etc.)",
        "Save the .txt file and upload it here",
      ],
    },
  },
  imessage: {
    name: "iMessage",
    icon: "💙",
    color: "#007AFF",
    gifs: {
      macos:
        "https://assets.mixkit.co/animations/preview/mixkit-imessage-export-macos-loop.gif",
    },
    instructions: {
      macos: [
        "iMessage export is only available on macOS",
        "Open Messages app on your Mac",
        "Select the conversation you want to export",
        "Use a third-party tool like 'iMazing' or 'TouchCopy'",
        "Export as CSV or TXT format",
        "Ensure format: Date, Sender, Message (one per line)",
        "Upload the exported file here",
      ],
    },
    limitation: "iMessage export is only available on macOS devices",
  },
  instagram: {
    name: "Instagram DMs",
    icon: "📷",
    color: "#E4405F",
    gifs: {
      web: "https://assets.mixkit.co/animations/preview/mixkit-instagram-data-download-loop.gif",
    },
    instructions: {
      web: [
        "Go to Instagram.com and log in",
        "Click on your profile picture (top right)",
        "Go to Settings → Privacy and Security",
        "Click 'Request Download'",
        "Choose 'Messages' data type",
        "Select JSON format",
        "You'll receive a download link via email (may take up to 48 hours)",
        "Download and upload the messages.json file here",
      ],
    },
  },
  email: {
    name: "Email Threads",
    icon: "📧",
    color: "#4285F4",
    gifs: {
      gmail:
        "https://assets.mixkit.co/animations/preview/mixkit-gmail-export-loop.gif",
      outlook:
        "https://assets.mixkit.co/animations/preview/mixkit-outlook-export-loop.gif",
    },
    instructions: {
      gmail: [
        "Open Gmail in your web browser",
        "Search for emails from/to the specific person",
        "Select all emails in the conversation",
        "Use 'Gmail Backup' tools like 'Takeout' or third-party exporters",
        "Export as MBOX or CSV format",
        "Upload the exported file here",
      ],
      outlook: [
        "Open Outlook",
        "Go to File → Open & Export → Import/Export",
        "Choose 'Export to a file'",
        "Select 'Comma Separated Values'",
        "Choose the specific folder/conversation",
        "Save the CSV file and upload it here",
      ],
    },
  },
};

const ImportChat = () => {
  const { darkMode } = useTheme();
  const { relationshipId } = useParams();
  const navigate = useNavigate();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [importStats, setImportStats] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importAnalysis, setImportAnalysis] = useState(null);
  const [expandedInstructions, setExpandedInstructions] = useState({});
  const [topicsProcessed, setTopicsProcessed] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(false);

  const pollingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const steps = [
    "Select Source",
    "Upload File",
    "Process Import",
    "Review Analysis",
  ];

  const allowedFileTypes = [".txt", ".csv", ".json", ".zip", ".html"];

  // ... (Keep all the existing useEffect hooks and other functions - unchanged until we get to navigation functions)

  // Cleanup and status checking effects (keeping existing logic)
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (
      conversationId &&
      importStatus !== "completed" &&
      importStatus !== "analyzed" &&
      importStatus !== "failed"
    ) {
      pollingIntervalRef.current = setInterval(checkImportStatus, 1500);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [conversationId, importStatus]);

  useEffect(() => {
    if (
      (importStatus === "completed" || importStatus === "analyzed") &&
      conversationId &&
      !importAnalysis
    ) {
      fetchImportAnalysis();
    }
  }, [importStatus, conversationId]);

  useEffect(() => {
    if (topicsProcessed) {
      setUpdateNotification(true);
    }
  }, [topicsProcessed]);

  // Keep existing backend integration functions
  const checkImportStatus = async () => {
    try {
      if (!conversationId) return;

      const response = await importService.getImportStatus(conversationId);
      const { status, progress = 0 } = response.data;

      setImportStatus(status);

      if (
        progress === 0 &&
        importProgress < 95 &&
        status !== "completed" &&
        status !== "analyzed" &&
        status !== "failed"
      ) {
        const increment =
          importProgress < 40
            ? 15
            : importProgress < 70
            ? 10
            : importProgress < 90
            ? 5
            : 2;
        setImportProgress((prev) => Math.min(prev + increment, 95));
      } else if (progress > 0) {
        setImportProgress(progress);
      }

      if (
        status === "completed" ||
        status === "analyzed" ||
        status === "failed"
      ) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        if (status === "completed" || status === "analyzed") {
          setSuccess(true);
          setImportProgress(100);
          setActiveStep(3);
        } else if (status === "failed") {
          setError("Import failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error checking import status:", err);
      setError(err.response?.data?.message || "Error checking import status");

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  const fetchImportAnalysis = async () => {
    try {
      const response = await importService.getImportAnalysis(conversationId);

      const analysisData = {
        topSenders: response.data.topSenders || {},
        topTopics: response.data.topTopics || [],
        timeRange: response.data.timeRange || "",
        insights:
          typeof response.data.insights === "object"
            ? response.data.insights.insightsText || "Analysis in progress..."
            : response.data.insights || "Analysis in progress...",
        summary: {
          ...response.data.summary,
          emotionalDynamics: response.data.summary?.emotionalDynamics || {
            overall: "balanced",
            user: "engaged",
            contact: "responsive",
            trends: "consistent",
          },
          keyInsights: response.data.summary?.keyInsights || [],
          areasForGrowth: response.data.summary?.areasForGrowth || [],
        },
        messageCount: response.data.messageCount || 0,
        sentimentScore: response.data.sentimentScore,
        sentimentLabel: response.data.sentimentLabel,
        communicationBalance: response.data.communicationBalance,
        primaryTopics: response.data.primaryTopics,
        topicDistribution: response.data.topicDistribution,
        connectionScore: response.data.connectionScore,
        relationshipLevel: response.data.relationshipLevel,
        challengesBadges: response.data.challengesBadges,
        nextMilestone: response.data.nextMilestone,
        communicationStyle: response.data.communicationStyle,
        loveLanguage: response.data.loveLanguage,
        trustLevel: response.data.trustLevel,
        theirValues: response.data.theirValues,
        theirInterests: response.data.theirInterests,
        communicationPreferences: response.data.communicationPreferences,
        importantDates: response.data.importantDates,
      };

      setImportAnalysis(analysisData);

      if (analysisData.topTopics && analysisData.topTopics.length > 0) {
        await processTopicsForRelationship(analysisData.topTopics);
      }
      localStorage.setItem("relationship_data_updated", relationshipId);
      sessionStorage.setItem("refreshRelationshipData", "true");
    } catch (err) {
      console.error("Error fetching import analysis:", err);
      setError(err.response?.data?.message || "Error fetching import analysis");

      setImportAnalysis({
        topSenders: { You: 1, Contact: 1 },
        topTopics: [],
        timeRange: "",
        insights: "Unable to load analysis data.",
        summary: {},
        sentimentScore: 0,
        sentimentLabel: "",
        communicationBalance: "",
        messageCount: 0,
        primaryTopics: [],
        topicDistribution: [],
        connectionScore: 0,
        relationshipLevel: 0,
        challengesBadges: [],
        nextMilestone: "",
        communicationStyle: {},
      });
    }
  };

  const forceUpdateRelationshipMetrics = async () => {
    try {
      const response = await relationshipService.recalculateMetrics(
        relationshipId
      );
      localStorage.setItem("relationship_data_updated", relationshipId);
      sessionStorage.setItem("refreshRelationshipData", "true");
      return true;
    } catch (err) {
      console.error("Error updating relationship metrics:", err);
      return false;
    }
  };

  const processTopicsForRelationship = async (topTopics) => {
    try {
      const hasConversations =
        await relationshipService.checkIfRelationshipHasConversations(
          relationshipId
        );

      if (hasConversations) {
        await relationshipService.analyzeTopics(relationshipId);
      } else {
        const topicsForUpdate = topTopics.map((topic) => ({
          name: topic.name,
          percentage: topic.percentage,
        }));
        await relationshipService.updateTopicDistribution(
          relationshipId,
          topicsForUpdate
        );
      }

      const metricsUpdated = await forceUpdateRelationshipMetrics();
      if (metricsUpdated) {
        setTopicsProcessed(true);
      }
    } catch (err) {
      console.error("Error updating relationship topics:", err);
      await forceUpdateRelationshipMetrics();
    }
  };

  // File handling
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileSize(selectedFile.size);
      setError("");
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileSize(droppedFile.size);
      setError("");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setFile(null);
    setFileSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Navigation functions
  const handleHeaderBack = () => {
    // Navigate back to relationship circle
    navigate(`/relationship-circle/${relationshipId}`);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPlatform) {
      setError("Please select a chat source");
      return;
    }

    if (activeStep === 1 && !file) {
      setError("Please select a file to upload");
      return;
    }

    if (activeStep === 2) {
      handleImport();
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
    setError("");
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(`/relationship-circle/${relationshipId}`);
    } else {
      setActiveStep((prevStep) => prevStep - 1);
      setError("");
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError("");
      setImportProgress(40);

      const formData = new FormData();
      formData.append("chatFile", file);
      formData.append("source", selectedPlatform);

      const response = await importService.importChat(relationshipId, formData);

      const newConversationId = response.data.conversationId;
      setConversationId(newConversationId);

      setImportStats({
        messageCount: response.data.messageCount || 0,
      });
      setImportStatus("processing");
      setImportProgress(40);
    } catch (err) {
      console.error("Import error:", err);
      setError(err.response?.data?.message || "Error importing chat history");
    } finally {
      setLoading(false);
    }
  };

  const goToRelationship = async () => {
    try {
      await forceUpdateRelationshipMetrics();
      localStorage.removeItem("relationshipData_" + relationshipId);
      navigate(`/relationship-circle/${relationshipId}?refresh=${Date.now()}`);
    } catch (err) {
      console.error("Error updating metrics before navigation:", err);
      navigate(`/relationship-circle/${relationshipId}?refresh=${Date.now()}`);
    }
  };

  const goToConversation = async () => {
    try {
      await forceUpdateRelationshipMetrics();
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

  // FIXED: Navigate to analysis page
  const goToAnalysis = async () => {
    try {
      await forceUpdateRelationshipMetrics();
      localStorage.removeItem("relationshipData_" + relationshipId);
      localStorage.setItem("relationship_data_updated", relationshipId);
      sessionStorage.setItem("refreshRelationshipData", "true");

      // Navigate with from_import parameter to force show analysis
      navigate(
        `/relationship-circle/${relationshipId}/analysis?from_import=true&refresh=${Date.now()}`
      );
    } catch (err) {
      console.error("Error updating metrics before navigation:", err);
      navigate(
        `/relationship-circle/${relationshipId}/analysis?from_import=true&refresh=${Date.now()}`
      );
    }
  };

  const handleReflectWithAI = () => {
    navigate(`/relationships/${relationshipId}/questions`);
  };

  const toggleInstructions = (platform, device) => {
    const key = `${platform}-${device}`;
    setExpandedInstructions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ... (Keep all the render functions for platform selection, file upload - unchanged until processing and analysis)

  const renderPlatformSelection = () => (
    <Box className="import-step">
      {/* Desktop Title */}
      <Box sx={{ display: { xs: "none", sm: "block" }, mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          className="step-title"
          gutterBottom
        >
          Choose How to Import
        </Typography>
        <Typography variant="body1" className="step-subtitle" paragraph>
          Where is this chat stored?
        </Typography>
      </Box>

      {/* Mobile Title */}
      <Box sx={{ display: { xs: "block", sm: "none" }, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom textAlign="center">
          Choose How to Import
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          textAlign="center"
        >
          Where is this chat stored
        </Typography>
      </Box>

      {/* Platform Selection Section */}
      <Box sx={{ mb: 4, width: "100%" }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            mb: 2,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            fontWeight: 600,
            textAlign: { xs: "left", sm: "center" },
          }}
        >
          Select Chat Source
        </Typography>

        <Box className="platform-grid">
          {Object.entries(PLATFORMS).map(([key, platform]) => (
            <Card
              key={key}
              className={`platform-option ${
                selectedPlatform === key ? "selected" : ""
              }`}
              onClick={() => setSelectedPlatform(key)}
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor:
                  selectedPlatform === key
                    ? platform.color
                    : "var(--platform-option-bg)",
                border:
                  selectedPlatform === key
                    ? `2px solid ${platform.color}`
                    : "var(--platform-option-border)",
                "&:hover": {
                  backgroundColor:
                    selectedPlatform === key
                      ? platform.color
                      : "var(--platform-option-hover-bg)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                minHeight: { xs: 56, sm: 64 },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  "&:last-child": { pb: { xs: 2, sm: 2.5 } },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      className="platform-icon"
                      sx={{
                        fontSize: { xs: "20px", sm: "24px" },
                        width: { xs: 24, sm: 30 },
                        height: { xs: 24, sm: 30 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {platform.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      className="platform-name"
                      sx={{
                        fontSize: { xs: "0.95rem", sm: "1.1rem" },
                        fontWeight: 500,
                        color:
                          selectedPlatform === key
                            ? "#ffffff"
                            : "var(--text-primary)",
                      }}
                    >
                      {platform.name}
                    </Typography>
                  </Box>
                  {selectedPlatform === key && (
                    <CheckCircle size={20} color="#ffffff" />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {selectedPlatform && (
        <Box className="export-instructions" sx={{ mt: 4, width: "100%" }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              mb: { xs: 2, sm: 3 },
            }}
          >
            How to export from {PLATFORMS[selectedPlatform].name}
          </Typography>

          {PLATFORMS[selectedPlatform].limitation && (
            <Alert
              severity="info"
              sx={{ mb: 2, fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
            >
              {PLATFORMS[selectedPlatform].limitation}
            </Alert>
          )}

          {Object.entries(PLATFORMS[selectedPlatform].instructions).map(
            ([device, steps]) => (
              <Card key={device} className="instruction-card" sx={{ mb: 2 }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => toggleInstructions(selectedPlatform, device)}
                    sx={{ cursor: "pointer" }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      {device === "android" && <Smartphone size={20} />}
                      {device === "ios" && <Smartphone size={20} />}
                      {device === "macos" && <Monitor size={20} />}
                      {device === "web" && <Monitor size={20} />}
                      {device === "gmail" && <Monitor size={20} />}
                      {device === "outlook" && <Monitor size={20} />}
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                      >
                        {device.charAt(0).toUpperCase() + device.slice(1)}{" "}
                        Instructions
                        {PLATFORMS[selectedPlatform].gifs?.[device] && (
                          <Box
                            component="span"
                            sx={{
                              ml: 1,
                              fontSize: "0.75rem",
                              color: PLATFORMS[selectedPlatform].color,
                              fontWeight: 500,
                            }}
                          >
                            📹 Video Tutorial
                          </Box>
                        )}
                      </Typography>
                    </Box>
                    {expandedInstructions[`${selectedPlatform}-${device}`] ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </Box>

                  <Collapse
                    in={expandedInstructions[`${selectedPlatform}-${device}`]}
                  >
                    <Box sx={{ mt: 2 }}>
                      {/* GIF Preview */}
                      {PLATFORMS[selectedPlatform].gifs?.[device] && (
                        <Box
                          sx={{
                            mb: 3,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "2px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <img
                            src={PLATFORMS[selectedPlatform].gifs[device]}
                            alt={`${device} export tutorial`}
                            style={{
                              width: "100%",
                              height: "auto",
                              maxHeight: "250px",
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              // Hide GIF if it fails to load
                              e.target.style.display = "none";
                            }}
                          />
                        </Box>
                      )}

                      {/* Text Instructions */}
                      {steps.map((step, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="flex-start"
                          gap={2}
                          sx={{ mb: 1.5 }}
                        >
                          <Box
                            className="step-number"
                            sx={{
                              minWidth: { xs: 20, sm: 24 },
                              height: { xs: 20, sm: 24 },
                              borderRadius: "50%",
                              backgroundColor:
                                PLATFORMS[selectedPlatform].color,
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: { xs: "0.7rem", sm: "0.8rem" },
                              fontWeight: 600,
                              mt: 0.5,
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              lineHeight: 1.6,
                              fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            }}
                          >
                            {step}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            )
          )}

          {/* Help Section */}
          <Card
            sx={{
              mt: 3,
              background: "var(--import-chat-card-gradient)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  lineHeight: 1.5,
                  color: "var(--text-primary)",
                }}
              >
                <strong>Need help?</strong> Each option includes step-by-step
                tutorials to guide you through the process.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );

  const renderFileUpload = () => (
    <Box className="import-step">
      {/* Desktop Title */}
      <Box sx={{ display: { xs: "none", sm: "block" }, mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          className="step-title"
          gutterBottom
        >
          Import Chat History
        </Typography>
        <Typography variant="body1" className="step-subtitle" paragraph>
          Import your existing conversations to quickly build relationship
          insights
        </Typography>
      </Box>

      {/* Mobile Title */}
      <Box sx={{ display: { xs: "block", sm: "none" }, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom textAlign="center">
          {selectedPlatform
            ? PLATFORMS[selectedPlatform].name
            : "Import Chat History"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          textAlign="center"
        >
          {selectedPlatform &&
            `Export chat from ${PLATFORMS[selectedPlatform].name} Settings > Export Chat > Without Media`}
        </Typography>
      </Box>

      {!file ? (
        <Card
          className="upload-area"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          sx={{
            border: "var(--upload-area-border)",
            backgroundColor: "var(--upload-area-bg)",
            borderRadius: { xs: 3, sm: 2 },
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              border: "var(--upload-area-border-hover)",
              transform: "translateY(-2px)",
            },
            width: "100%",
            maxWidth: { xs: "none", sm: 600 },
            margin: "0 auto",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Box className="upload-icon" sx={{ mb: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                width: { xs: 48, sm: 60 },
                height: { xs: 48, sm: 60 },
                borderRadius: "50%",
                background: "var(--button-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Upload size={24} color="white" />
            </Box>
          </Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: 700,
              mb: 1,
            }}
          >
            Upload Chat
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
              lineHeight: 1.4,
            }}
          >
            Drag and drop your file here or click to browse
          </Typography>
        </Card>
      ) : (
        <Card
          className="file-uploaded"
          sx={{
            border: "var(--upload-success-border)",
            backgroundColor: "var(--upload-success-bg)",
            borderRadius: { xs: 3, sm: 2 },
            p: { xs: 2.5, sm: 3 },
            width: "100%",
            maxWidth: { xs: "none", sm: 600 },
            margin: "0 auto",
          }}
        >
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
            <CheckCircle size={24} color="var(--import-chat-success-text)" />
            <Typography
              variant="h6"
              color="var(--import-chat-success-text)"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              Chat Uploaded
            </Typography>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: { xs: 1.5, sm: 2 },
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: 1,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <FileText size={20} color="var(--text-primary)" />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    fontWeight: 500,
                  }}
                >
                  {file.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                >
                  {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                  {file.type || "Unknown type"}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={removeFile}
              size="small"
              sx={{
                color: "var(--text-secondary)",
                "&:hover": { color: "var(--text-primary)" },
              }}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedFileTypes.join(",")}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{
          mt: 2,
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
        }}
      >
        Supported file types: {allowedFileTypes.join(", ")}
      </Typography>
    </Box>
  );

  const renderProcessing = () => (
    <Box className="import-step">
      {/* Desktop Title */}
      <Box sx={{ display: { xs: "none", sm: "block" }, mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          className="step-title"
          gutterBottom
        >
          Import Chat History
        </Typography>
        <Typography variant="body1" className="step-subtitle" paragraph>
          Import your existing conversations to quickly build relationship
          insights
        </Typography>
      </Box>

      <Card
        className="processing-card"
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 4,
          background: "var(--progress-container-bg)",
          border: "var(--progress-container-border)",
          borderRadius: 2,
          width: "100%",
          maxWidth: { xs: "none", sm: 600 },
          margin: "0 auto",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          display="flex"
          alignItems="center"
          gap={2}
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {importProgress === 100 ? "Chats Analyzed" : "Analyzing Chats"}
        </Typography>

        {importStats && (
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
          >
            {importStats.messageCount} messages
          </Typography>
        )}

        <Box sx={{ mt: 3, mb: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              Analysis Progress
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              {importProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={importProgress}
            sx={{
              height: { xs: 12, sm: 15 },
              borderRadius: "var(--progress-bar-radius)",
              backgroundColor: "var(--import-chat-progress-bg)",
              "& .MuiLinearProgress-bar": {
                background: "var(--import-chat-progress-fill)",
                borderRadius: "var(--progress-bar-radius)",
              },
            }}
          />
        </Box>

        {/* Show additional message during processing */}
        {importProgress < 100 && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.85rem", sm: "0.875rem" },
                lineHeight: 1.5,
                mb: 2,
              }}
            >
              While we Import & Analyze your chats would you like to talk to AI
              about your relationship
            </Typography>
          </Box>
        )}
      </Card>

      {/* Action Buttons */}
      {importProgress < 100 ? (
        <Box display="flex" justifyContent="center" width="100%">
          <Button
            variant="contained"
            onClick={handleReflectWithAI}
            startIcon={<Sparkles size={18} />}
            sx={{
              background: "var(--button-gradient)",
              borderRadius: { xs: 8, sm: 8 },
              px: { xs: 4, sm: 6 },
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.95rem", sm: "1rem" },
              minWidth: { xs: 200, sm: 250 },
              maxWidth: { xs: 280, sm: 350 },
              width: "100%",
            }}
          >
            Reflect with AI
          </Button>
        </Box>
      ) : (
        <Box
          display="flex"
          gap={2}
          justifyContent="center"
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          <Button
            variant="contained"
            onClick={handleReflectWithAI}
            startIcon={<Sparkles size={18} />}
            sx={{
              background: "var(--button-gradient)",
              flex: 1,
              py: { xs: 1.5, sm: 1.5 },
              fontSize: { xs: "0.95rem", sm: "1rem" },
              order: { xs: 1, sm: 1 },
            }}
          >
            Reflect with AI
          </Button>
          <Button
            variant="outlined"
            onClick={goToAnalysis}
            sx={{
              flex: 1,
              py: { xs: 1.5, sm: 1.5 },
              fontSize: { xs: "0.95rem", sm: "1rem" },
              order: { xs: 2, sm: 2 },
            }}
          >
            View Analysis
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderAnalysis = () => (
    <Box className="import-step">
      {/* Desktop Title */}
      <Box sx={{ display: { xs: "none", sm: "block" }, mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          className="step-title"
          gutterBottom
        >
          Import Chat History
        </Typography>
        <Typography variant="body1" className="step-subtitle" paragraph>
          Import your existing conversations to quickly build relationship
          insights
        </Typography>
      </Box>

      <Card
        className="processing-card"
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 4,
          background: "var(--progress-container-bg)",
          border: "var(--progress-container-border)",
          borderRadius: 2,
          width: "100%",
          maxWidth: { xs: "none", sm: 600 },
          margin: "0 auto",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Chats Analyzed
        </Typography>

        {importStats && (
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
          >
            {importStats.messageCount} messages
          </Typography>
        )}

        <Box sx={{ mt: 3, mb: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              Analysis Progress
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              100%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              height: { xs: 12, sm: 15 },
              borderRadius: "var(--progress-bar-radius)",
              backgroundColor: "var(--import-chat-progress-bg)",
              "& .MuiLinearProgress-bar": {
                background: "var(--import-chat-progress-fill)",
                borderRadius: "var(--progress-bar-radius)",
              },
            }}
          />
        </Box>
      </Card>

      {/* Action Buttons */}
      <Box
        display="flex"
        gap={2}
        justifyContent="center"
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        <Button
          variant="contained"
          onClick={handleReflectWithAI}
          startIcon={<Sparkles size={18} />}
          sx={{
            background: "var(--button-gradient)",
            flex: 1,
            py: { xs: 1.5, sm: 1.5 },
            fontSize: { xs: "0.95rem", sm: "1rem" },
            order: { xs: 1, sm: 1 },
          }}
        >
          Reflect with AI
        </Button>
        <Button
          variant="outlined"
          onClick={goToAnalysis}
          sx={{
            flex: 1,
            py: { xs: 1.5, sm: 1.5 },
            fontSize: { xs: "0.95rem", sm: "1rem" },
            order: { xs: 2, sm: 2 },
          }}
        >
          View Analysis
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box className="import-chat-container">
      {/* Header with Back Arrow - Shows on all screens */}
      <HeaderContainer>
        <BackButton onClick={handleHeaderBack}>
          <ArrowLeft size={20} />
        </BackButton>
        <HeaderTitle>Import Chat History</HeaderTitle>
      </HeaderContainer>

      <Container
        maxWidth="md"
        sx={{
          px: { xs: 0, sm: 3 },
          py: { xs: 0, sm: 3 },
        }}
      >
        <Paper
          elevation={3}
          className="import-chat-paper"
          sx={{
            p: { xs: 2, sm: 4 },
            my: { xs: 0, sm: 4 },
            background: "var(--import-chat-content-bg)",
            borderRadius: { xs: 0, sm: 2 },
            minHeight: { xs: "calc(100vh - 140px)", sm: "auto" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Desktop Header - Hidden since we have header above */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              textAlign="center"
              sx={{ mt: 2 }}
            >
              Import your existing conversations to quickly build relationship
              insights
            </Typography>

            <Divider sx={{ my: 3 }} />
          </Box>

          {/* Mobile Header Content - Hidden since we have header above */}
          <Box sx={{ display: { xs: "block", sm: "none" }, mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              paragraph
              textAlign="center"
            >
              Import your existing conversations to quickly build relationship
              insights
            </Typography>
          </Box>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: { xs: 2, sm: 4 },
              "& .MuiStepLabel-label": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box className="step-content" sx={{ flexGrow: 1 }}>
            {activeStep === 0 && renderPlatformSelection()}
            {activeStep === 1 && renderFileUpload()}
            {activeStep === 2 && renderProcessing()}
            {activeStep === 3 && renderAnalysis()}
          </Box>

          {/* Navigation Buttons */}
          {activeStep !== 3 && (
            <Box
              className="mobile-bottom-nav"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mt: "auto",
                pt: 3,
                borderTop: {
                  xs: "1px solid rgba(255, 255, 255, 0.1)",
                  sm: "none",
                },
                position: { xs: "sticky", sm: "static" },
                bottom: { xs: 0, sm: "auto" },
                backgroundColor: {
                  xs: "var(--import-chat-content-bg)",
                  sm: "transparent",
                },
                zIndex: 10,
              }}
            >
              <Button
                onClick={handleBack}
                disabled={
                  activeStep === 2 &&
                  (importStatus === "processing" || importProgress > 0)
                }
                variant="outlined"
                sx={{
                  flex: { xs: 1, sm: "none" },
                  minWidth: { xs: "auto", sm: 100 },
                  display:
                    activeStep === 2 &&
                    (importStatus === "processing" || importProgress > 0)
                      ? "none"
                      : "flex",
                }}
              >
                Back
              </Button>

              {activeStep < 2 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    flex: { xs: 1, sm: "none" },
                    minWidth: { xs: "auto", sm: 100 },
                  }}
                >
                  Next
                </Button>
              )}

              {activeStep === 2 && !importStatus && importProgress === 0 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    flex: { xs: 1, sm: "none" },
                    minWidth: { xs: "auto", sm: 100 },
                  }}
                >
                  Start Import
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ImportChat;
