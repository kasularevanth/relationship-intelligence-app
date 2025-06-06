// src/components/SplashScreen.js
import React, { useEffect } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

const SplashScreen = ({ onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

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

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#00081E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
        // Removed mobile constraints for full screen coverage
      }}
    >
      <BackgroundEllipses />

      <Typography
        sx={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 900,
          fontSize: isMobile ? "42px" : "65px",
          lineHeight: isMobile ? "55px" : "85px",
          letterSpacing: isMobile ? "-0.165px" : "-0.310588px",
          background:
            "linear-gradient(135deg, #F5F5F5 0%, #B8D4FF 50%, #6A95FF 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textAlign: "center",
          zIndex: 10,
          // Removed fixed positioning and dimensions for better text visibility
          maxWidth: "90vw", // Ensure text doesn't overflow screen
          wordWrap: "break-word",
          animation: "fadeInScale 1.5s ease-out",
          "@keyframes fadeInScale": {
            "0%": {
              opacity: 0,
              transform: "scale(0.8)",
            },
            "50%": {
              opacity: 0.5,
              transform: "scale(1.05)",
            },
            "100%": {
              opacity: 1,
              transform: "scale(1)",
            },
          },
        }}
      >
        SoulSync
      </Typography>
    </Box>
  );
};

export default SplashScreen;
