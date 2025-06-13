// src/components/OnboardingScreens.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowForward, ArrowBack } from "@mui/icons-material";

// Custom Chat Icon based on your specifications
const CustomChatIcon = ({ size = 49.4 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        background: "#F5F5F5",
        borderRadius: "45.6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        animation: isVisible ? "bounceIn 0.8s ease-out" : "none",
        "@keyframes bounceIn": {
          "0%": {
            transform: "scale(0.3)",
            opacity: 0,
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: 0.8,
          },
          "70%": {
            transform: "scale(0.9)",
            opacity: 1,
          },
          "100%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
      }}
    >
      {/* Frame container */}
      <Box
        sx={{
          position: "absolute",
          width: "27.17px",
          height: "27.74px",
          left: "11.4px",
          top: "11.4px",
        }}
      >
        {/* First Vector - Main chat bubble */}
        <Box
          sx={{
            position: "absolute",
            left: "0%",
            right: "2.1%",
            top: "0%",
            bottom: "0%",
            background: "#153999",
            border: "2.31179px solid #153999",
            borderRadius: "8px 8px 8px 2px",
            animation: isVisible
              ? "slideInLeft 0.6s ease-out 0.3s both"
              : "none",
            "@keyframes slideInLeft": {
              "0%": {
                transform: "translateX(-20px)",
                opacity: 0,
              },
              "100%": {
                transform: "translateX(0)",
                opacity: 1,
              },
            },
          }}
        />

        {/* Second Vector - Reply bubble */}
        <Box
          sx={{
            position: "absolute",
            left: "44.76%",
            right: "0%",
            top: "43.83%",
            bottom: "2.06%",
            background: "#1D47B5",
            border: "2.40161px solid #F5F5F5",
            borderRadius: "6px 6px 2px 6px",
            animation: isVisible
              ? "slideInRight 0.6s ease-out 0.5s both"
              : "none",
            "@keyframes slideInRight": {
              "0%": {
                transform: "translateX(20px)",
                opacity: 0,
              },
              "100%": {
                transform: "translateX(0)",
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {/* Floating dots animation */}
      <Box
        sx={{
          position: "absolute",
          width: "4px",
          height: "4px",
          backgroundColor: "#153999",
          borderRadius: "50%",
          top: "16px",
          left: "16px",
          animation: isVisible ? "pulse 2s infinite 1s" : "none",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 0.3 },
            "50%": { opacity: 1 },
          },
        }}
      />
    </Box>
  );
};

// Custom Security Icon based on your specifications
const CustomSecurityIcon = ({ size = 50 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        background: "#F5F5F5",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        animation: isVisible ? "secureEntry 1s ease-out" : "none",
        "@keyframes secureEntry": {
          "0%": {
            transform: "scale(0) rotate(180deg)",
            opacity: 0,
          },
          "70%": {
            transform: "scale(1.05) rotate(-10deg)",
            opacity: 0.8,
          },
          "100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: 1,
          },
        },
      }}
    >
      {/* Main shield shape */}
      <Box
        sx={{
          position: "absolute",
          left: "12.5%",
          right: "12.5%",
          top: "8.33%",
          bottom: "8.33%",

          borderRadius: "4px 4px 0 0",
          animation: isVisible ? "shieldBuild 0.8s ease-out 0.3s both" : "none",
          "@keyframes shieldBuild": {
            "0%": {
              transform: "scaleY(0)",
              transformOrigin: "bottom",
            },
            "100%": {
              transform: "scaleY(1)",
              transformOrigin: "bottom",
            },
          },
        }}
      />

      {/* Lock body */}
      <Box
        sx={{
          position: "absolute",
          left: "35.42%",
          right: "35.41%",
          top: "43.25%",
          bottom: "33.31%",
          background: "#133690",
          border: "3.53365px solid #133690",
          borderRadius: "2px",
          animation: isVisible ? "lockSlide 0.6s ease-out 0.8s both" : "none",
          "@keyframes lockSlide": {
            "0%": {
              transform: "translateY(-10px)",
              opacity: 0,
            },
            "100%": {
              transform: "translateY(0)",
              opacity: 1,
            },
          },
        }}
      />

      {/* Lock top/shackle */}
      <Box
        sx={{
          position: "absolute",
          left: "42.71%",
          right: "42.64%",
          top: "29.17%",
          bottom: "58.5%",
          border: "3.53365px solid #133690",
          borderRadius: "6px 6px 0 0",
          borderBottom: "none",
          background: "transparent",
          animation: isVisible ? "lockClose 0.5s ease-out 1s both" : "none",
          "@keyframes lockClose": {
            "0%": {
              transform: "rotate(-20deg)",
              transformOrigin: "bottom center",
            },
            "100%": {
              transform: "rotate(0deg)",
              transformOrigin: "bottom center",
            },
          },
        }}
      />

      {/* Security particles */}
      {[...Array(4)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: "2px",
            height: "2px",
            backgroundColor: "#133690",
            borderRadius: "50%",
            animation: isVisible
              ? `securityParticle${i} 3s ease-in-out infinite ${1.5 + i * 0.3}s`
              : "none",
            [`@keyframes securityParticle${i}`]: {
              "0%": {
                transform: `translate(25px, 25px) scale(0)`,
                opacity: 0,
              },
              "30%": {
                transform: `translate(${25 + i * 8}px, ${
                  25 - i * 4
                }px) scale(1)`,
                opacity: 1,
              },
              "100%": {
                transform: `translate(${25 + i * 15}px, ${
                  25 - i * 8
                }px) scale(0)`,
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

// Animated Heart Icon with Lottie-like animation (keeping the original)
const AnimatedHeartIcon = ({ size = 40 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "#F5F5F5",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: isVisible ? "zoomIn 0.8s ease-out" : "none",
        "@keyframes zoomIn": {
          "0%": {
            transform: "scale(0)",
            opacity: 0,
          },
          "60%": {
            transform: "scale(1.1)",
            opacity: 0.8,
          },
          "100%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
      }}
    >
      {/* Heart shape with animated beat */}
      <Box
        sx={{
          width: "20px",
          height: "18px",
          position: "relative",
          animation: isVisible
            ? "heartbeat 1.5s ease-in-out infinite 0.5s"
            : "none",
          "@keyframes heartbeat": {
            "0%, 50%, 100%": {
              transform: "scale(1)",
            },
            "25%": {
              transform: "scale(1.1)",
            },
          },
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            width: "10px",
            height: "16px",
            backgroundColor: "#112E80",
            borderRadius: "10px 10px 0 0",
            transform: "rotate(-45deg)",
            transformOrigin: "0 100%",
            animation: isVisible
              ? "heartGlow 2s ease-in-out infinite 1s"
              : "none",
          },
          "&::before": {
            left: "10px",
          },
          "&::after": {
            left: "0px",
            transform: "rotate(45deg)",
            transformOrigin: "100% 100%",
          },
          "@keyframes heartGlow": {
            "0%, 100%": {
              filter: "brightness(1)",
            },
            "50%": {
              filter: "brightness(1.2)",
            },
          },
        }}
      />
      {/* Floating hearts */}
      {[...Array(3)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: "3px",
            height: "3px",
            backgroundColor: "#112E80",
            borderRadius: "50%",
            animation: isVisible
              ? `floatHeart${i} 3s ease-in-out infinite ${1 + i * 0.5}s`
              : "none",
            [`@keyframes floatHeart${i}`]: {
              "0%": {
                transform: `translate(${i * 5}px, 5px)`,
                opacity: 0,
              },
              "50%": {
                transform: `translate(${i * 8}px, -10px)`,
                opacity: 1,
              },
              "100%": {
                transform: `translate(${i * 10}px, -20px)`,
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

const OnboardingScreens = ({ onComplete, onSkip }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const screens = [
    {
      title: "Welcome to Soulsync",
      description:
        "Your AI-Powered relationship advisor. Understand your emotional patterns and improve how you connect with those who matter.",
      icon: null,
    },
    {
      title: "Analyze WhatsApp Chats",
      description:
        "Upload your WhatsApp conversations and let SoulSync decode tone, trends & emotional Cues in your relationship",
      icon: <CustomChatIcon size={isMobile ? 57 : 49.4} />,
    },
    {
      title: "Smart Relationship Advice",
      description:
        "Receive helpful insights to navigate conflict, deepen bonds, & grow mutual understanding",
      icon: <AnimatedHeartIcon size={isMobile ? 57 : 49} />,
    },
    {
      title: "Private & Secure",
      description:
        "Your data is never shared everything is analyzed locally and Securely",
      icon: <CustomSecurityIcon size={isMobile ? 57 : 50} />,
    },
  ];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const BackgroundEllipses = () => (
    <>
      {/* Ellipse 10 */}
      <Box
        sx={{
          position: "absolute",
          width: isMobile ? "365.91px" : "786.16px",
          height: isMobile ? "507.85px" : "1091.12px",
          left: isMobile ? "-30px" : "-21.61px",
          top: isMobile ? "28.46px" : "823.6px",
          background: "#184EE0",
          filter: isMobile ? "blur(50px)" : "blur(107.424px)",
          transform: isMobile ? "rotate(-16.26deg)" : "rotate(-48.69deg)",
          zIndex: 1,
        }}
      />
      {/* Ellipse 8 */}
      <Box
        sx={{
          position: "absolute",
          width: isMobile ? "282.36px" : "606.65px",
          height: isMobile ? "146.68px" : "315.13px",
          left: isMobile ? "-84px" : "-112.73px",
          top: isMobile ? "34.36px" : "896.51px",
          background: "#184FE1",
          filter: isMobile ? "blur(50px)" : "blur(107.424px)",
          transform: isMobile ? "rotate(-29.81deg)" : "rotate(-62.24deg)",
          zIndex: 1,
        }}
      />
      {/* Ellipse 9 */}
      <Box
        sx={{
          position: "absolute",
          width: isMobile ? "282.36px" : "606.65px",
          height: isMobile ? "146.68px" : "315.13px",
          left: isMobile ? "125.96px" : "487.21px",
          top: isMobile ? "224.6px" : "999.56px",
          background: "#6A95FF",
          filter: isMobile ? "blur(50px)" : "blur(107.424px)",
          transform: isMobile ? "rotate(-16.26deg)" : "rotate(-48.69deg)",
          zIndex: 1,
        }}
      />
      {/* Ellipse 11 */}
      <Box
        sx={{
          position: "absolute",
          width: isMobile ? "189.02px" : "406.1px",
          height: isMobile ? "98.19px" : "210.95px",
          left: isMobile ? "-106px" : "15.1px",
          top: isMobile ? "179.93px" : "1185.83px",
          background: "#6A95FF",
          opacity: 0.2,
          filter: isMobile ? "blur(33.4707px)" : "blur(71.9113px)",
          transform: isMobile ? "rotate(-16.26deg)" : "rotate(-48.69deg)",
          zIndex: 1,
        }}
      />
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "rgba(23, 23, 23, 0.1)",
          backdropFilter: "blur(0px)",
          zIndex: 2,
        }}
      />
    </>
  );

  const ProgressDots = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        zIndex: 10,
        position: "relative",
        width: isMobile ? "90px" : "180px",
      }}
    >
      {screens.map((_, index) => (
        <Box
          key={index}
          sx={{
            width:
              index === currentScreen
                ? isMobile
                  ? "30px"
                  : "69px"
                : isMobile
                ? "15px"
                : "34px",
            height: isMobile ? "5px" : "10px",
            background:
              index === currentScreen ? "#F5F5F5" : "rgba(255, 255, 255, 0.33)",
            borderRadius: "15px",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#00081E",
        overflow: "hidden",
        zIndex: 9998,
      }}
    >
      <BackgroundEllipses />

      {/* Header - Logo and Skip on same line for mobile */}
      <Box
        sx={{
          position: "absolute",
          top: isMobile ? "40px" : "84px",
          left: isMobile ? "20px" : "100px",
          right: isMobile ? "20px" : "100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
          height: isMobile ? "60px" : "auto", // Fixed height for mobile alignment
        }}
      >
        {/* Logo */}
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? "20px" : "36px",
            lineHeight: isMobile ? "26px" : "47px",
            letterSpacing: isMobile ? "-0.165px" : "-0.310588px",
            color: "#F5F5F5",
          }}
        >
          SoulSync
        </Typography>

        {/* Skip Button */}
        <Button
          onClick={onSkip}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: isMobile ? "8px 24px" : "3.72414px 37.2414px",
            width: isMobile ? "auto" : "137px",
            height: isMobile ? "40px" : "58px",
            minWidth: isMobile ? "80px" : "137px",
            background: "rgba(255, 255, 255, 0.18)",
            borderRadius: isMobile ? "20px" : "27.931px",
            color: "#F5F5F5",
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            fontSize: isMobile ? "16px" : "18px",
            textTransform: "none",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.25)",
            },
          }}
        >
          Skip
        </Button>
      </Box>

      {/* Main Content - Scrollable Area */}
      <Box
        sx={{
          position: "absolute",
          top: isMobile ? "120px" : "180px", // Adjusted for new header height
          left: 0,
          right: 0,
          bottom: isMobile ? "120px" : "140px", // Above navigation
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? "20px" : "60px",
          zIndex: 10,
          overflow: "auto",
          padding: isMobile ? "15px" : "40px",
        }}
      >
        {/* Icon */}
        {screens[currentScreen].icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: isMobile ? "10px" : "15px",
            }}
          >
            {screens[currentScreen].icon}
          </Box>
        )}

        {/* Title */}
        <Typography
          sx={{
            fontFamily:
              currentScreen === 0
                ? '"DM Sans", sans-serif'
                : '"Poppins", sans-serif',
            fontWeight: currentScreen === 0 ? 500 : 600,
            fontSize: isMobile
              ? currentScreen === 0
                ? "36px"
                : "20px"
              : currentScreen === 0
              ? "36px"
              : "28px",
            lineHeight: isMobile
              ? currentScreen === 0
                ? "48px"
                : "30px"
              : currentScreen === 0
              ? "55px"
              : "42px",
            letterSpacing: "-0.165px",
            color: "#F5F5F5",
            maxWidth: isMobile ? "250px" : "600px",
            textAlign: "center",
          }}
        >
          {screens[currentScreen].title}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 300,
            fontSize: isMobile ? "24px" : "22px",
            lineHeight: "140%",
            letterSpacing: "-0.165px",
            color: "#D1D1D1",
            maxWidth: isMobile ? "313px" : "1020px",
            textAlign: "center",
          }}
        >
          {screens[currentScreen].description}
        </Typography>

        {/* Progress Dots */}
        <ProgressDots />
      </Box>

      {/* Navigation - Fixed at Bottom */}
      <Box
        sx={{
          position: "fixed",
          bottom: isMobile ? "40px" : "50px",
          right: isMobile ? "25px" : "100px",
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "17px" : "20px",
          zIndex: 1000, // High z-index to ensure visibility
          ...(currentScreen === screens.length - 1 &&
            !isMobile && {
              left: "50%",
              right: "auto",
              transform: "translateX(-50%)",
            }),
        }}
      >
        {/* Previous Button */}
        {currentScreen > 0 && (
          <IconButton
            onClick={handlePrevious}
            sx={{
              width: isMobile ? "52px" : "48px",
              height: isMobile ? "52px" : "48px",
              border: isMobile
                ? "2px solid #AFAFAF"
                : "1.84615px solid #AFAFAF",
              borderRadius: "50%",
              color: "#AFAFAF",
              backgroundColor: "rgba(0, 8, 30, 0.8)", // Semi-transparent background
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(175, 175, 175, 0.1)",
              },
            }}
          >
            <ArrowBack sx={{ fontSize: isMobile ? "24px" : "20px" }} />
          </IconButton>
        )}

        {/* Next/Get Started Button */}
        {currentScreen === screens.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{
              width: isMobile ? "256px" : "200px",
              height: isMobile ? "52px" : "48px",
              backgroundColor: "#F5F5F5",
              color: "#000000",
              borderRadius: isMobile ? "26px" : "24px",
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "26px",
              letterSpacing: "-0.165px",
              textTransform: "none",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(245, 245, 245, 0.9)",
                boxShadow: "0 6px 25px rgba(0, 0, 0, 0.4)",
              },
            }}
          >
            Get Started
          </Button>
        ) : (
          <IconButton
            onClick={handleNext}
            sx={{
              width: isMobile ? "52px" : "48px",
              height: isMobile ? "52px" : "48px",
              backgroundColor: "#F5F5F5",
              color: "#1D1D1D",
              borderRadius: "50%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(245, 245, 245, 0.9)",
                boxShadow: "0 6px 25px rgba(0, 0, 0, 0.4)",
              },
            }}
          >
            <ArrowForward sx={{ fontSize: isMobile ? "24px" : "20px" }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default OnboardingScreens;
