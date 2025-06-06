// src/hooks/useBodyClass.js
import { useEffect } from "react";

export const useBodyClass = (className, condition) => {
  useEffect(() => {
    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove(className);
    };
  }, [className, condition]);
};

// src/components/DevTools.js (Optional - for testing)
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useApp } from "../contexts/AppContext";

const DevTools = () => {
  const { resetOnboarding, hasSeenOnboarding } = useApp();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 10000,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography variant="caption">Dev Tools</Typography>
      <Typography variant="caption">
        Onboarding seen: {hasSeenOnboarding ? "Yes" : "No"}
      </Typography>
      <Button
        size="small"
        variant="contained"
        onClick={resetOnboarding}
        sx={{ fontSize: "10px" }}
      >
        Reset Onboarding
      </Button>
    </Box>
  );
};

export default DevTools;
