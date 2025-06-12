// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { GlobalProvider } from "./contexts/GlobalContext";
import { useTheme } from "./contexts/ThemeContext";
import { getTheme } from "./theme";

// Components
import SplashScreen from "./components/SplashScreen";
import OnboardingScreens from "./components/OnboardingScreens";

// Modal Components
import ContactPermissionModal from "./components/ContactPermissionModal";
import ContactSelectorModal from "./components/ContactSelectorModal";
import DemoChatModal from "./components/DemoChatModal";
import DemoAnalysisModal from "./components/DemoAnalysisModal";

// Pages
import Home from "./pages/Home";
import DemoChatPage from "./pages/DemoChatPage";
import DemoAnalysisPage from "./pages/DemoAnalysisPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NewRelationship from "./pages/NewRelationship";
import RelationshipCircle from "./pages/RelationshipCircle";
import ConversationPage from "./pages/ConversationPage";
import VoiceSession from "./pages/VoiceSession";
import RelationshipProfile from "./pages/RelationshipProfile";
import ConversationNew from "./pages/ConversationNew";
import AuthCallback from "./pages/AuthCallback";
import ImportChat from "./pages/ImportChat";
import VoiceQuestionPage from "./pages/VoiceQuestionPage";
import RelationshipSelectionPage from "./pages/RelationshipSelectionPage";
import ReflectPage from "./pages/ReflectPage";
import RelationshipAnalysisPage from "./pages/RelationshipAnalysisPage";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import "./App.css";

// Protected route component
import ProtectedRoute from "./components/ProtectedRoute";

// Navigation handler component
const NavigationHandler = () => {
  const navigate = useNavigate();
  const { shouldNavigateToRegister, clearNavigateToRegister } = useApp();

  React.useEffect(() => {
    if (shouldNavigateToRegister) {
      navigate("/register");
      clearNavigateToRegister();
    }
  }, [shouldNavigateToRegister, navigate, clearNavigateToRegister]);

  return null;
};

const AppContent = () => {
  const { darkMode } = useTheme();
  const {
    showSplash,
    showOnboarding,
    handleSplashComplete,
    handleOnboardingComplete,
    handleSkipOnboarding,
  } = useApp();
  const theme = getTheme(darkMode);

  // Import the hook
  const useBodyClass = (className, condition) => {
    React.useEffect(() => {
      if (condition) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
      return () => {
        document.body.classList.remove(className);
      };
    }, [className, condition]);
  };

  // Prevent scrolling during splash and onboarding
  useBodyClass("splash-active", showSplash);
  useBodyClass("onboarding-active", showOnboarding);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show onboarding after splash
  if (showOnboarding) {
    return (
      <OnboardingScreens
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  // Main app content
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <NavigationHandler />
          <Routes>
            {/* Auth routes - NO SIDEBAR */}
            <Route path="/login" element={<AuthLayout />}>
              <Route index element={<Login />} />
            </Route>

            <Route path="/register" element={<AuthLayout />}>
              <Route index element={<Register />} />
            </Route>

            <Route path="/auth/callback" element={<AuthLayout />}>
              <Route index element={<AuthCallback />} />
            </Route>

            {/* Main app routes - WITH SIDEBAR */}
            <Route path="/" element={<MainLayout />}>
              {/* Public route */}
              <Route index element={<Home />} />

              {/* New Relationship Selection Page */}
              <Route
                path="add-relationship"
                element={
                  <ProtectedRoute>
                    <RelationshipSelectionPage />
                  </ProtectedRoute>
                }
              />

              {/* New Reflect Page */}
              <Route
                path="reflect"
                element={
                  <ProtectedRoute>
                    <ReflectPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="new-relationship"
                element={
                  <ProtectedRoute>
                    <NewRelationship />
                  </ProtectedRoute>
                }
              />

              {/* UPDATED: Dynamic relationship circle route - both with and without ID */}
              <Route
                path="relationship-circle"
                element={
                  <ProtectedRoute>
                    <RelationshipCircle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="relationship-circle/:relationshipId"
                element={
                  <ProtectedRoute>
                    <RelationshipCircle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="relationships/:relationshipId"
                element={
                  <ProtectedRoute>
                    <RelationshipProfile />
                  </ProtectedRoute>
                }
              />

              {/* NEW: Relationship Analysis Page */}
              <Route
                path="relationship-circle/:relationshipId/analysis"
                element={
                  <ProtectedRoute>
                    <RelationshipAnalysisPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="conversations/new/:relationshipId"
                element={<ConversationNew />}
              />

              <Route
                path="conversations/:conversationId"
                element={
                  <ProtectedRoute>
                    <ConversationPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="relationship-circle/:relationshipId/import"
                element={
                  <ProtectedRoute>
                    <ImportChat />
                  </ProtectedRoute>
                }
              />

              <Route
                path="voice-session/:conversationId"
                element={
                  <ProtectedRoute>
                    <VoiceSession />
                  </ProtectedRoute>
                }
              />

              <Route
                path="relationships/:relationshipId/questions"
                element={
                  <ProtectedRoute>
                    <VoiceQuestionPage />
                  </ProtectedRoute>
                }
              />

              {/* Demo Pages */}
              <Route
                path="demo/chat"
                element={
                  <ProtectedRoute>
                    <DemoChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="demo/analysis"
                element={
                  <ProtectedRoute>
                    <DemoAnalysisPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>

          {/* Global Modals */}
          <ContactPermissionModal />
          <ContactSelectorModal />
          <DemoChatModal />
          <DemoAnalysisModal />
        </Router>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <GlobalProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </GlobalProvider>
    </ThemeProvider>
  );
}

export default App;
