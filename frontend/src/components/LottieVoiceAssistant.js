// frontend/src/components/LottieVoiceAssistant.js
import React, { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Lottie from "lottie-react";
// Import your JSON file
import AIchatbotData from "../assets/animations/voiceorb.json";
import { useTheme } from "../contexts/ThemeContext";

const LottieVoiceAssistant = ({
  status = "idle",
  onActivate,
  size = 240,
  speechVisualizerRef,
  showStatusText = true,
  customStatusText = null,
  mode = "full", // "full" | "minimal" | "icon-only"
}) => {
  const lottieRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const { darkMode } = useTheme();

  // Control animation based on status
  useEffect(() => {
    if (!lottieRef.current) return;

    // Different behavior based on status
    switch (status) {
      case "idle":
        lottieRef.current.goToAndStop(0, true);
        break;
      case "listening":
        lottieRef.current.play();
        lottieRef.current.setSpeed(1.2);
        break;
      case "processing":
        lottieRef.current.play();
        lottieRef.current.setSpeed(0.8);
        break;
      case "speaking":
        lottieRef.current.play();
        lottieRef.current.setSpeed(1.5);
        break;
      default:
        lottieRef.current.goToAndStop(0, true);
        break;
    }
  }, [status]);

  // Set up speech visualizer reference
  useEffect(() => {
    if (speechVisualizerRef) {
      speechVisualizerRef.current = {
        simulateWordEmphasis: (emphasisLevel) => {
          if (lottieRef.current) {
            // Adjust animation speed based on emphasis level
            const newSpeed = 1 + emphasisLevel * 0.5;
            lottieRef.current.setSpeed(newSpeed);

            // Reset speed after a short delay
            setTimeout(() => {
              if (lottieRef.current && status === "speaking") {
                lottieRef.current.setSpeed(1);
              }
            }, 200);
          }
        },
      };
    }
  }, [speechVisualizerRef, status]);

  const getStatusText = () => {
    if (customStatusText) return customStatusText;

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
  };

  const getContainerStyles = () => {
    const baseStyles = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      transition: "all 0.3s ease",
    };

    switch (mode) {
      case "minimal":
        return {
          ...baseStyles,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: "transparent",
        };
      case "icon-only":
        return {
          ...baseStyles,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: "transparent",
          borderRadius: "50%",
        };
      case "full":
      default:
        return {
          ...baseStyles,
          width: "100%",
          minHeight: "300px",
        };
    }
  };

  const getGlowStyles = () => {
    if (mode === "icon-only") return { display: "none" };

    const glowIntensity = darkMode ? 0.6 : 0.3;
    const glowColor =
      status === "speaking"
        ? "rgba(66, 153, 225, 0.15)"
        : status === "listening"
        ? "rgba(78, 127, 255, 0.15)"
        : status === "processing"
        ? "rgba(255, 107, 139, 0.15)"
        : "rgba(78, 127, 255, 0.05)";

    return {
      position: "absolute",
      width: `${size * 1.5}px`,
      height: `${size * 1.5}px`,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${glowColor} 0%, rgba(0, 0, 0, 0) 70%)`,
      filter: "blur(25px)",
      opacity: status === "idle" ? 0.3 : glowIntensity,
      zIndex: 0,
      transition: "all 0.5s ease",
    };
  };

  const getLottieContainerStyles = () => {
    const baseTransform =
      isHovered && status === "idle" ? "scale(1.05)" : "scale(1)";
    const statusTransform =
      status === "processing"
        ? "scale(1.1)"
        : status === "listening"
        ? "scale(1.08)"
        : "scale(1)";
    const finalTransform = status !== "idle" ? statusTransform : baseTransform;

    return {
      position: "relative",
      width: `${size}px`,
      height: `${size}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: onActivate ? "pointer" : "default",
      zIndex: 1,
      transform: finalTransform,
      transition: "transform 0.3s ease",
      filter:
        mode === "full" && darkMode
          ? "drop-shadow(0 0 10px rgba(66, 153, 225, 0.3))"
          : "none",
    };
  };

  const getStatusTextStyles = () => {
    const baseStyles = {
      textAlign: "center",
      minHeight: "24px",
      opacity: 0.8,
      zIndex: 1,
      transition: "all 0.3s ease",
      fontFamily: "DM Sans",
      fontWeight: 500,
    };

    switch (mode) {
      case "minimal":
      case "icon-only":
        return {
          ...baseStyles,
          display: "none",
        };
      case "full":
      default:
        return {
          ...baseStyles,
          mt: 3,
          color: "#60a5fa",
          fontSize: "16px",
        };
    }
  };

  const getAnimationFilter = () => {
    switch (status) {
      case "processing":
        return "hue-rotate(45deg) saturate(1.2)";
      case "listening":
        return "hue-rotate(20deg) saturate(1.1)";
      case "speaking":
        return "hue-rotate(-20deg) saturate(1.3)";
      default:
        return "none";
    }
  };

  return (
    <Box sx={getContainerStyles()}>
      {/* Ambient glow effect */}
      <Box sx={getGlowStyles()} />

      {/* Main Lottie container */}
      <Box
        onClick={onActivate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={getLottieContainerStyles()}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={AIchatbotData}
          loop={status !== "idle"}
          autoplay={status !== "idle"}
          style={{
            width: "100%",
            height: "100%",

            filter: getAnimationFilter(),
          }}
        />
      </Box>

      {/* Status text */}
      {showStatusText && mode === "full" && (
        <Typography variant="body1" sx={getStatusTextStyles()}>
          {getStatusText()}
        </Typography>
      )}
    </Box>
  );
};

export default LottieVoiceAssistant;
