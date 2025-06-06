// frontend/src/pages/Settings.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Box,
  Typography,
  Container,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme as useMuiTheme,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";

// Styled components using CSS variables
const SettingsContainer = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "var(--primary-bg)",
  color: "var(--text-primary)",
  padding: "20px 0",
});

const SettingsCard = styled(Box)({
  background: "var(--analysis-card-bg)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "var(--border-radius-sidebar)",
  padding: "25px",
  marginBottom: "20px",
});

const SettingsHeader = styled(Box)({
  background: "var(--analysis-card-bg)",
  borderRadius: "var(--border-radius-sidebar)",
  padding: "20px 30px",
  marginBottom: "30px",
  backdropFilter: "blur(2.5px)",
  display: "flex",
  alignItems: "center",
  gap: "15px",
});

const SettingItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "15px 0",
  borderBottom: "1px solid var(--border-color)",
  "&:last-child": {
    borderBottom: "none",
  },
});

const SettingIcon = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  backgroundColor: "var(--sidebar-item-active)",
  borderRadius: "50%",
  marginRight: "15px",
});

const ActionButton = styled(Button)({
  background: "var(--button-gradient)",
  color: "var(--text-primary)",
  borderRadius: "30px",
  padding: "10px 25px",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    background: "var(--button-gradient)",
    opacity: 0.9,
  },
});

const DangerButton = styled(Button)({
  backgroundColor: "var(--input-border-error)",
  color: "var(--text-primary)",
  borderRadius: "30px",
  padding: "10px 25px",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "var(--input-border-error)",
    opacity: 0.8,
  },
});

const SecondaryButton = styled(Button)({
  border: "1px solid var(--border-color)",
  color: "var(--text-primary)",
  borderRadius: "30px",
  padding: "10px 25px",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  textTransform: "none",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "var(--hamburger-hover-bg)",
  },
});

const CustomSwitch = styled(Switch)({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "var(--sidebar-item-active)",
    "&:hover": {
      backgroundColor: "rgba(54, 110, 255, 0.08)",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "var(--sidebar-item-active)",
  },
  "& .MuiSwitch-track": {
    backgroundColor: "var(--border-color)",
  },
});

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [privacy, setPrivacy] = useState({
    analytics: true,
    marketing: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [message, setMessage] = useState("");

  const handleNotificationChange = (type) => (event) => {
    setNotifications({
      ...notifications,
      [type]: event.target.checked,
    });
    setMessage(
      `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${
        event.target.checked ? "enabled" : "disabled"
      }`
    );
    setTimeout(() => setMessage(""), 3000);
  };

  const handlePrivacyChange = (type) => (event) => {
    setPrivacy({
      ...privacy,
      [type]: event.target.checked,
    });
    setMessage(
      `${type.charAt(0).toUpperCase() + type.slice(1)} ${
        event.target.checked ? "enabled" : "disabled"
      }`
    );
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      // Add delete account logic here
      console.log("Delete account requested");
      setShowDeleteDialog(false);
      setMessage("Account deletion request submitted");
    } catch (error) {
      setMessage("Failed to delete account");
    }
  };

  const handleExportData = async () => {
    try {
      // Add export data logic here
      console.log("Export data requested");
      setMessage("Data export started. You'll receive an email when ready.");
    } catch (error) {
      setMessage("Failed to export data");
    }
  };

  const privacyPolicyContent = `
Last updated: ${new Date().toLocaleDateString()}

SoulSync Privacy Policy

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, upload chat conversations, or contact us for support.

2. How We Use Your Information
- To provide and improve our relationship analysis services
- To communicate with you about your account
- To analyze relationship patterns and provide insights

3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Your Rights
You have the right to access, update, or delete your personal information at any time.

6. Contact Us
If you have questions about this Privacy Policy, please contact us at privacy@soulsync.com.
  `;

  const termsOfServiceContent = `
Last updated: ${new Date().toLocaleDateString()}

SoulSync Terms of Service

1. Acceptance of Terms
By using SoulSync, you agree to be bound by these Terms of Service.

2. Description of Service
SoulSync is a relationship intelligence platform that analyzes your communication patterns to provide insights about your relationships.

3. User Accounts
You are responsible for maintaining the confidentiality of your account credentials.

4. Acceptable Use
You agree not to use the service for any unlawful purpose or in any way that could damage or impair the service.

5. Privacy
Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.

6. Limitation of Liability
SoulSync shall not be liable for any indirect, incidental, special, or consequential damages.

7. Termination
We may terminate your account at any time for violation of these terms.

8. Changes to Terms
We reserve the right to modify these terms at any time.

For questions about these terms, contact us at legal@soulsync.com.
  `;

  return (
    <SettingsContainer>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {message && (
          <Alert
            severity="success"
            sx={{
              backgroundColor: "var(--alert-error-bg)",
              color: "var(--text-primary)",
              mb: 3,
            }}
          >
            {message}
          </Alert>
        )}

        {/* Settings Header */}
        <SettingsHeader>
          <Button
            onClick={() => navigate(-1)}
            sx={{
              color: "var(--text-primary)",
              minWidth: "auto",
              padding: "8px",
            }}
          >
            <ArrowBackIcon />
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "var(--font-family-secondary)",
              fontWeight: 600,
              color: "var(--text-primary)",
              fontSize: isMobile ? "24px" : "32px",
            }}
          >
            Settings
          </Typography>
        </SettingsHeader>

        <Grid container spacing={3}>
          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <SettingsCard>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  mb: 3,
                }}
              >
                Appearance
              </Typography>

              <SettingItem>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SettingIcon>
                    {darkMode ? (
                      <DarkModeIcon sx={{ color: "var(--text-primary)" }} />
                    ) : (
                      <LightModeIcon sx={{ color: "var(--text-primary)" }} />
                    )}
                  </SettingIcon>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      Dark Mode
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-tertiary)" }}
                    >
                      Switch between light and dark themes
                    </Typography>
                  </Box>
                </Box>
                <CustomSwitch checked={darkMode} onChange={toggleDarkMode} />
              </SettingItem>
            </SettingsCard>

            {/* Notification Settings */}
            <SettingsCard>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  mb: 3,
                }}
              >
                Notifications
              </Typography>

              <SettingItem>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SettingIcon>
                    <NotificationsIcon sx={{ color: "var(--text-primary)" }} />
                  </SettingIcon>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      Email Notifications
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-tertiary)" }}
                    >
                      Receive updates via email
                    </Typography>
                  </Box>
                </Box>
                <CustomSwitch
                  checked={notifications.email}
                  onChange={handleNotificationChange("email")}
                />
              </SettingItem>

              <SettingItem>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SettingIcon>
                    <NotificationsIcon sx={{ color: "var(--text-primary)" }} />
                  </SettingIcon>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      Push Notifications
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-tertiary)" }}
                    >
                      Receive push notifications
                    </Typography>
                  </Box>
                </Box>
                <CustomSwitch
                  checked={notifications.push}
                  onChange={handleNotificationChange("push")}
                />
              </SettingItem>
            </SettingsCard>
          </Grid>

          {/* Privacy & Security */}
          <Grid item xs={12} md={6}>
            <SettingsCard>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  mb: 3,
                }}
              >
                Privacy & Security
              </Typography>

              <SettingItem>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SettingIcon>
                    <SecurityIcon sx={{ color: "var(--text-primary)" }} />
                  </SettingIcon>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      Analytics
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-tertiary)" }}
                    >
                      Help improve our service
                    </Typography>
                  </Box>
                </Box>
                <CustomSwitch
                  checked={privacy.analytics}
                  onChange={handlePrivacyChange("analytics")}
                />
              </SettingItem>

              <SettingItem>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowPrivacyDialog(true)}
                >
                  <SettingIcon>
                    <PrivacyTipIcon sx={{ color: "var(--text-primary)" }} />
                  </SettingIcon>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      Privacy Policy
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-tertiary)" }}
                    >
                      View our privacy policy
                    </Typography>
                  </Box>
                </Box>
              </SettingItem>

              <SettingItem>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowTermsDialog(true)}
                >
                  <SettingIcon>
                    <DescriptionIcon sx={{ color: "var(--text-primary)" }} />
                  </SettingIcon>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      Terms of Service
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-tertiary)" }}
                    >
                      View terms and conditions
                    </Typography>
                  </Box>
                </Box>
              </SettingItem>
            </SettingsCard>

            {/* Data Management */}
            <SettingsCard>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  mb: 3,
                }}
              >
                Data Management
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <ActionButton
                  onClick={handleExportData}
                  startIcon={<CloudDownloadIcon />}
                  fullWidth
                >
                  Export My Data
                </ActionButton>

                <DangerButton
                  onClick={() => setShowDeleteDialog(true)}
                  startIcon={<DeleteIcon />}
                  fullWidth
                >
                  Delete Account
                </DangerButton>
              </Box>
            </SettingsCard>
          </Grid>
        </Grid>

        {/* App Information */}
        <SettingsCard>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "var(--font-family-secondary)",
              fontWeight: 600,
              color: "var(--text-primary)",
              mb: 3,
            }}
          >
            About SoulSync
          </Typography>

          <Accordion
            sx={{
              backgroundColor: "transparent",
              color: "var(--text-primary)",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon sx={{ color: "var(--text-primary)" }} />
              }
              sx={{ padding: 0 }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <InfoIcon sx={{ mr: 2, color: "var(--text-tertiary)" }} />
                <Typography>App Information</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "16px 0 0 0" }}>
              <Box sx={{ pl: 5 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--text-tertiary)", mb: 1 }}
                >
                  Version: 1.0.0
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--text-tertiary)", mb: 1 }}
                >
                  Build: 2024.06.03
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--text-tertiary)" }}
                >
                  © 2024 SoulSync. All rights reserved.
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        </SettingsCard>

        {/* Delete Account Dialog */}
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          PaperProps={{
            sx: {
              backgroundColor: "var(--content-bg)",
              color: "var(--text-primary)",
            },
          }}
        >
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete your account? This action cannot
              be undone. All your data, including relationships and
              conversations, will be permanently deleted.
            </Typography>
          </DialogContent>
          <DialogActions>
            <SecondaryButton onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </SecondaryButton>
            <DangerButton onClick={handleDeleteAccount}>
              Delete Account
            </DangerButton>
          </DialogActions>
        </Dialog>

        {/* Privacy Policy Dialog */}
        <Dialog
          open={showPrivacyDialog}
          onClose={() => setShowPrivacyDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "var(--content-bg)",
              color: "var(--text-primary)",
              maxHeight: "80vh",
            },
          }}
        >
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogContent>
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-family-secondary)",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              {privacyPolicyContent}
            </Typography>
          </DialogContent>
          <DialogActions>
            <SecondaryButton onClick={() => setShowPrivacyDialog(false)}>
              Close
            </SecondaryButton>
          </DialogActions>
        </Dialog>

        {/* Terms of Service Dialog */}
        <Dialog
          open={showTermsDialog}
          onClose={() => setShowTermsDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "var(--content-bg)",
              color: "var(--text-primary)",
              maxHeight: "80vh",
            },
          }}
        >
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogContent>
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-family-secondary)",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              {termsOfServiceContent}
            </Typography>
          </DialogContent>
          <DialogActions>
            <SecondaryButton onClick={() => setShowTermsDialog(false)}>
              Close
            </SecondaryButton>
          </DialogActions>
        </Dialog>
      </Container>
    </SettingsContainer>
  );
};

export default Settings;
