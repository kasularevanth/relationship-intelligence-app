// src/contexts/AppContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    const onboardingComplete = localStorage.getItem("soulSync_onboarding_complete");
    return onboardingComplete === "true";
  });
  const [shouldNavigateToRegister, setShouldNavigateToRegister] =
    useState(false);



  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => { // When user finishes all onboarding steps
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    localStorage.setItem("soulSync_onboarding_complete", "true");
    setShouldNavigateToRegister(true); // Navigate to register after completing onboarding
  };

  const handleSkipOnboarding = () => { // When user clicks skip on onboarding
    setShowOnboarding(false);
    setHasSeenOnboarding(true); // They've interacted, so mark as seen
    localStorage.setItem("soulSync_onboarding_complete", "true");
    setShouldNavigateToRegister(true); // Navigate to register on skip
  };

  const markOnboardingAsCompleted = () => { // To be called after login/registration
    setHasSeenOnboarding(true);
    localStorage.setItem("soulSync_onboarding_complete", "true");
    setShowOnboarding(false); // Ensure onboarding doesn't pop up
  };

  const clearNavigateToRegister = () => {
    setShouldNavigateToRegister(false);
  };

  const resetOnboarding = () => {
    // For testing purposes or if you want to show onboarding again
    localStorage.removeItem("soulSync_onboarding_complete");
    setHasSeenOnboarding(false);
    setShowSplash(true);
    setShouldNavigateToRegister(false);
  };

  const value = {
    showSplash,
    showOnboarding,
    hasSeenOnboarding,
    shouldNavigateToRegister,
    handleSplashComplete,
    handleOnboardingComplete,
    handleSkipOnboarding,
    markOnboardingAsCompleted, // Expose the new function
    clearNavigateToRegister,
    resetOnboarding,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
