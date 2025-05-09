import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { getTheme } from './theme';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewRelationship from './pages/NewRelationship';
import ConversationPage from './pages/ConversationPage';
import VoiceSession from './pages/VoiceSession'; // Fixed import path
import RelationshipProfile from './pages/RelationshipProfile';
import ConversationNew from './pages/ConversationNew';
import AuthCallback from './pages/AuthCallback'; // Import the new component
import ImportChat from './pages/ImportChat';
import VoiceQuestionPage from './pages/VoiceQuestionPage';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Protected route component
import ProtectedRoute from './components/ProtectedRoute';


const ThemedApp = () => {
  const { darkMode } = useTheme();
  const theme = getTheme(darkMode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes with AuthLayout */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} /> {/* Add this route */}
            </Route>
            
            {/* Public route with MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>
            
            {/* Protected routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-relationship"
                element={
                  <ProtectedRoute>
                    <NewRelationship />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relationships/:relationshipId"
                element={
                  <ProtectedRoute>
                    <RelationshipProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/conversations/new/:relationshipId" element={<ConversationNew />} />
              <Route
                path="/conversations/:conversationId"
                element={
                  <ProtectedRoute>
                    <ConversationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relationships/:relationshipId/import"
                element={
                  <ProtectedRoute>
                    <ImportChat />
                  </ProtectedRoute>
                }
              />
              {/* Added Voice Session route */}
              <Route
                path="/voice-session/:conversationId"
                element={
                  <ProtectedRoute>
                    <VoiceSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relationships/:relationshipId/questions"
                element={
                  <ProtectedRoute>
                    <VoiceQuestionPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;