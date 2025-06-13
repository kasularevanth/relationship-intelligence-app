// frontend/src/pages/Settings.js
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme as useMuiTheme,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";

// Main Settings Container
const SettingsContainer = styled(Box)({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  background: "#00081E",
  color: "#F5F5F5",
  "@media (max-width: 768px)": {
    width: "375px",
    margin: "0 auto",
  },
});

// Settings Header - Desktop: 1340x60px, Mobile: 375x64px
const SettingsHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "0px 50px",
  gap: "19px",
  width: "1340px",
  height: "60px",
  margin: "0 auto",
  "@media (max-width: 768px)": {
    width: "375px",
    height: "64px",
    padding: "10px 25px",
  },
});

// Back Button Container
const BackButtonContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "28.24px",
  width: "34px",
  height: "34px",
});

// Back Button - 34x34px
const BackButton = styled(IconButton)({
  width: "34px",
  height: "34px",
  color: "#FFFFFF",
  padding: "0px",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
  },
});

// Settings Title - 22px DM Sans 600
const SettingsTitle = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "29px",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "21px",
  },
});

// Profile Avatar in Header - 38x38px
const HeaderProfileAvatar = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "38px",
  height: "38px",
  background: "#FFFCFC",
  borderRadius: "53.2px",
  marginLeft: "auto",
  "@media (max-width: 768px)": {
    display: "none",
  },
});

// Profile Avatar Text - 18.24px DM Sans 700
const ProfileAvatarText = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 700,
  fontSize: "18.24px",
  lineHeight: "24px",
  textAlign: "center",
  letterSpacing: "-0.2508px",
  background: "linear-gradient(273.89deg, #0046FF -12.54%, #A9C1FF 108.58%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
});

// Settings Content Container - Desktop: 907x1031px, Mobile: 328x adjustable
const SettingsContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "40px",
  width: "907px",
  margin: "168px auto 0",
  "@media (max-width: 768px)": {
    width: "328px",
    margin: "32px auto 0",
    gap: "20px",
  },
});

// Profile Information Section - 907x339px
const ProfileInformationSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "30px",
  gap: "15px",
  width: "907px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "20px",
  "@media (max-width: 768px)": {
    width: "328px",
    padding: "20px",
    borderRadius: "16px",
  },
});

// Section Title - 22px DM Sans 500
const SectionTitle = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 500,
  fontSize: "22px",
  lineHeight: "29px",
  letterSpacing: "-0.165px",
  color: "#D1D1D1",
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "21px",
  },
});

// Form Fields Container
const FormFieldsContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "47px",
  width: "100%",
  "@media (max-width: 768px)": {
    flexDirection: "column",
    gap: "20px",
  },
});

// Form Field Group - 400x105px
const FormFieldGroup = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "8px",
  width: "400px",
  "@media (max-width: 768px)": {
    width: "100%",
  },
});

// Field Label - 22px DM Sans 500
const FieldLabel = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 500,
  fontSize: "22px",
  lineHeight: "29px",
  letterSpacing: "-0.165px",
  color: "#D1D1D1",
  "@media (max-width: 768px)": {
    fontSize: "12px",
    lineHeight: "16px",
  },
});

// Field Input - 400x58px
const FieldInput = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "12px 20px",
  width: "400px",
  height: "58px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: "12px",
  "@media (max-width: 768px)": {
    width: "100%",
    height: "48px",
    padding: "12px 16px",
    borderRadius: "8px",
  },
});

// Field Value - 16px DM Sans 500
const FieldValue = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "21px",
  letterSpacing: "-0.165px",
  color: "#DADADA",
  "@media (max-width: 768px)": {
    fontSize: "14px",
    lineHeight: "21px",
  },
});

// Support & Legal Section - 907x361px
const SupportLegalSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "30px",
  gap: "15px",
  width: "907px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "20px",
  "@media (max-width: 768px)": {
    width: "328px",
    padding: "20px",
    borderRadius: "16px",
  },
});

// Menu Items Container
const MenuItemsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px 5px",
  gap: "20px",
  width: "100%",
  "@media (max-width: 768px)": {
    gap: "13px",
  },
});

// Menu Item - 837x69px
const MenuItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "20px",
  gap: "13px",
  width: "837px",
  height: "69px",
  background: "linear-gradient(180deg, #101C44 0%, #172556 100%)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "linear-gradient(180deg, #1a2654 0%, #243166 100%)",
    transform: "translateY(-1px)",
  },
  "@media (max-width: 768px)": {
    width: "100%",
    height: "auto",
    padding: "15px",
    borderRadius: "8px",
  },
});

// Menu Item Icon - 18.2x18.2px
const MenuItemIcon = styled(Box)({
  width: "18.2px",
  height: "18.2px",
  color: "#F5F5F5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// Menu Item Text - 22px DM Sans 500
const MenuItemText = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 500,
  fontSize: "22px",
  lineHeight: "29px",
  color: "#F5F5F5",
  "@media (max-width: 768px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

// Preferences Section - 907x193px
const PreferencesSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "30px",
  gap: "15px",
  width: "907px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "20px",
  "@media (max-width: 768px)": {
    width: "328px",
    padding: "20px",
    borderRadius: "16px",
    display: "none", // Hide on mobile as per design
  },
});

// Notification Toggle Item - 847x79px
const NotificationToggleItem = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  gap: "15px",
  width: "847px",
  height: "79px",
  background: "linear-gradient(180deg, #101C44 0%, #172556 100%)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: "12px",
  "@media (max-width: 768px)": {
    width: "100%",
    height: "auto",
    padding: "10px 0px",
    background: "transparent",
    border: "none",

    borderRadius: "0px",
  },
});

// Toggle Left Section
const ToggleLeftSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "15px",
});

// Toggle Icon - 14x19.6px
const ToggleIcon = styled(Box)({
  width: "14px",
  height: "19.6px",
  color: "#F5F5F5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// Toggle Text - 22px DM Sans 500
const ToggleText = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 500,
  fontSize: "22px",
  lineHeight: "29px",
  color: "#F5F5F5",
  "@media (max-width: 768px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

// Custom Switch - 90.1x39px
const CustomSwitch = styled(Switch)({
  width: "90.1px",
  height: "39px",
  padding: 0,
  "& .MuiSwitch-switchBase": {
    margin: "3.88px",
    padding: 0,
    transform: "translateX(0px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(51.12px)",
      "& .MuiSwitch-thumb": {
        backgroundColor: "#FFFFFF",
        width: "31.08px",
        height: "31.08px",
      },
      "& + .MuiSwitch-track": {
        backgroundColor: "#366EFF",
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#FFFFFF",
    width: "31.08px",
    height: "31.08px",
    boxShadow: "0px 2px 4px rgba(39, 39, 39, 0.1)",
  },
  "& .MuiSwitch-track": {
    borderRadius: "194.253px",
    backgroundColor: "#D2D5DA",
    opacity: 1,
    transition: "background-color 0.2s",
  },
  "@media (max-width: 768px)": {
    width: "35px",
    height: "19.44px",
    "& .MuiSwitch-switchBase": {
      margin: "1.95px",
      "&.Mui-checked": {
        transform: "translateX(15.5px)",
        "& .MuiSwitch-thumb": {
          width: "15.56px",
          height: "15.56px",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      width: "15.56px",
      height: "15.56px",
    },
    "& .MuiSwitch-track": {
      borderRadius: "97.2222px",
    },
  },
});

// Delete Account Button - 907x58px
const DeleteAccountButton = styled(Button)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "12px 121px",
  gap: "10px",
  width: "907px",
  height: "58px",
  background: "#CB034B",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  "&:hover": {
    background: "#B8032C",
  },
  "@media (max-width: 768px)": {
    width: "328px",
    padding: "12px 121px",
    borderRadius: "8px",
  },
});

// Delete Button Text - 22px DM Sans 800
const DeleteButtonText = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 800,
  fontSize: "22px",
  lineHeight: "23px",
  textAlign: "center",
  color: "#FFFFFF",
  textTransform: "none",
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "23px",
  },
});

// Dialog Styles
const StyledDialog = styled(Dialog)({
  "& .MuiPaper-root": {
    backgroundColor: "#091024",
    color: "#F5F5F5",
    borderRadius: "16px",
    minWidth: "400px",
    "@media (max-width: 768px)": {
      minWidth: "300px",
      margin: "20px",
    },
  },
});

const DialogButton = styled(Button)(({ variant }) => ({
  borderRadius: "30px",
  padding: "10px 25px",
  fontFamily: "DM Sans",
  fontWeight: 600,
  textTransform: "none",
  ...(variant === "delete"
    ? {
        backgroundColor: "#CB034B",
        color: "#FFFFFF",
        "&:hover": {
          backgroundColor: "#B8032C",
        },
      }
    : {
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: "#F5F5F5",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        },
      }),
}));

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [notifications, setNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [message, setMessage] = useState("");

  // Profile data from auth context
  const profileData = {
    name: currentUser?.displayName || currentUser?.name || "NA",
    mobile: currentUser?.phoneNumber || "NA",
    email: currentUser?.email || "NA",
  };

  // Get user initials for avatar
  const getInitials = useCallback((name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const userInitials = getInitials(profileData.name);

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotificationToggle = (event) => {
    setNotifications(event.target.checked);
    setMessage(
      `Notifications ${event.target.checked ? "enabled" : "disabled"}`
    );
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      console.log("Delete account requested");
      setShowDeleteDialog(false);
      setMessage("Account deletion request submitted");
    } catch (error) {
      setMessage("Failed to delete account");
    }
  };

  const handleMenuItemClick = (item) => {
    switch (item) {
      case "faq":
        console.log("FAQ clicked");
        break;
      case "terms":
        setShowTermsDialog(true);
        break;
      case "privacy":
        setShowPrivacyDialog(true);
        break;
      default:
        break;
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
      {/* Header */}
      <SettingsHeader>
        <BackButtonContainer>
          <BackButton onClick={handleBack}>
            <ArrowBackIcon sx={{ fontSize: "24px" }} />
          </BackButton>
        </BackButtonContainer>
        <SettingsTitle>Settings</SettingsTitle>
      </SettingsHeader>

      {/* Content */}
      <SettingsContentContainer>
        {message && (
          <Alert
            severity="success"
            sx={{
              backgroundColor: "rgba(74, 222, 128, 0.1)",
              color: "#4ade80",
              mb: 3,
              width: "100%",
            }}
          >
            {message}
          </Alert>
        )}

        {/* Profile Information Section */}
        <ProfileInformationSection>
          <SectionTitle>
            {isMobile ? "Profile Information" : "Profile Information"}
          </SectionTitle>
          <FormFieldsContainer>
            <FormFieldGroup>
              <FieldLabel>Name</FieldLabel>
              <FieldInput>
                <FieldValue>{profileData.name}</FieldValue>
              </FieldInput>
            </FormFieldGroup>
            <FormFieldGroup>
              <FieldLabel>Mobile Number</FieldLabel>
              <FieldInput>
                <FieldValue>{profileData.mobile}</FieldValue>
              </FieldInput>
            </FormFieldGroup>
          </FormFieldsContainer>
          {isMobile && (
            <FormFieldGroup>
              <FieldLabel>Email Address</FieldLabel>
              <FieldInput>
                <FieldValue>{profileData.email}</FieldValue>
              </FieldInput>
            </FormFieldGroup>
          )}
          {!isMobile && (
            <FormFieldGroup>
              <FieldLabel>Email Address</FieldLabel>
              <FieldInput>
                <FieldValue>{profileData.email}</FieldValue>
              </FieldInput>
            </FormFieldGroup>
          )}
        </ProfileInformationSection>

        {/* Support & Legal Section */}
        <SupportLegalSection>
          <SectionTitle>
            {isMobile ? "Support & Legal" : "Support & Legal"}
          </SectionTitle>
          <MenuItemsContainer>
            {/* Notifications Toggle - Mobile shows in this section */}
            {isMobile && (
              <NotificationToggleItem>
                <ToggleLeftSection>
                  <ToggleIcon>
                    <NotificationsIcon sx={{ fontSize: "10px" }} />
                  </ToggleIcon>
                  <ToggleText>Notifications</ToggleText>
                </ToggleLeftSection>
                <CustomSwitch
                  checked={notifications}
                  onChange={handleNotificationToggle}
                />
              </NotificationToggleItem>
            )}

            <MenuItem onClick={() => handleMenuItemClick("faq")}>
              <MenuItemIcon>
                <HelpOutlineIcon sx={{ fontSize: "18.2px" }} />
              </MenuItemIcon>
              <MenuItemText>FAQ</MenuItemText>
            </MenuItem>

            <MenuItem onClick={() => handleMenuItemClick("terms")}>
              <MenuItemIcon>
                <DescriptionIcon sx={{ fontSize: "18.2px" }} />
              </MenuItemIcon>
              <MenuItemText>Terms and Conditions</MenuItemText>
            </MenuItem>

            <MenuItem onClick={() => handleMenuItemClick("privacy")}>
              <MenuItemIcon>
                <PrivacyTipIcon sx={{ fontSize: "18.2px" }} />
              </MenuItemIcon>
              <MenuItemText>Privacy Policy</MenuItemText>
            </MenuItem>
          </MenuItemsContainer>
        </SupportLegalSection>

        {/* Preferences Section - Desktop Only */}
        {!isMobile && (
          <PreferencesSection>
            <SectionTitle>Preferences</SectionTitle>
            <NotificationToggleItem>
              <ToggleLeftSection>
                <ToggleIcon>
                  <NotificationsIcon sx={{ fontSize: "14px" }} />
                </ToggleIcon>
                <ToggleText>Notifications</ToggleText>
              </ToggleLeftSection>
              <CustomSwitch
                checked={notifications}
                onChange={handleNotificationToggle}
              />
            </NotificationToggleItem>
          </PreferencesSection>
        )}

        {/* Delete Account Button */}
        <DeleteAccountButton onClick={() => setShowDeleteDialog(true)}>
          <DeleteButtonText>
            {isMobile ? "Delete My Account" : "Delete My Account"}
          </DeleteButtonText>
        </DeleteAccountButton>
      </SettingsContentContainer>

      {/* Delete Account Dialog */}
      <StyledDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure? Deleting your account will erase your data permanently
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 2, padding: 3 }}>
          <DialogButton onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </DialogButton>
          <DialogButton variant="delete" onClick={handleDeleteAccount}>
            Delete My Account
          </DialogButton>
        </DialogActions>
      </StyledDialog>

      {/* Privacy Policy Dialog */}
      <StyledDialog
        open={showPrivacyDialog}
        onClose={() => setShowPrivacyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogContent>
          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "DM Sans",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {privacyPolicyContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <DialogButton onClick={() => setShowPrivacyDialog(false)}>
            Close
          </DialogButton>
        </DialogActions>
      </StyledDialog>

      {/* Terms of Service Dialog */}
      <StyledDialog
        open={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Terms of Service</DialogTitle>
        <DialogContent>
          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "DM Sans",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {termsOfServiceContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <DialogButton onClick={() => setShowTermsDialog(false)}>
            Close
          </DialogButton>
        </DialogActions>
      </StyledDialog>
    </SettingsContainer>
  );
};

export default Settings;
