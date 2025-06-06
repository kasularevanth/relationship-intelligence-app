// frontend/src/pages/RelationshipSelectionPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { useGlobal } from "../contexts/GlobalContext";

// Styled components using CSS variables and exact design specifications
const PageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  background: "var(--primary-bg)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  overflow: "hidden",
  "@media (max-width: 768px)": {
    padding: "25px",
    minHeight: "calc(100vh - 80px)", // Account for mobile header
  },
});

const BlurredBackground = styled(Box)({
  position: "absolute",
  width: "1099px",
  height: "719px",
  right: "-487px",
  top: "-180px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  filter: "blur(151.688px)",
  zIndex: 0,
  "@media (max-width: 768px)": {
    width: "672px",
    height: "496px",
    left: "11px",
    top: "-128px",
    right: "auto",
    filter: "blur(97.6382px)",
  },
});

const ContentContainer = styled(Box)({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "1340px",
  "@media (max-width: 768px)": {
    maxWidth: "375px",
  },
});

const MainTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 400,
  fontSize: "28px",
  lineHeight: "42px",
  letterSpacing: "-0.165px",
  color: "var(--text-primary)",
  textAlign: "center",
  marginBottom: "40px",
  maxWidth: "639px",
  "@media (max-width: 768px)": {
    fontFamily: "var(--font-family-secondary)",
    fontWeight: 400,
    fontSize: "26px",
    lineHeight: "39px",
    letterSpacing: "-0.165px",
    marginBottom: "32px",
    maxWidth: "325px",
  },
});

const OptionsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  width: "100%",
  maxWidth: "400px",
  "@media (max-width: 768px)": {
    maxWidth: "325px",
  },
});

const OptionButton = styled(Box)({
  width: "100%",
  height: "50px",
  background: "linear-gradient(180deg, #101C44 0%, #172556 100%)",
  borderRadius: "30px",
  display: "flex",
  alignItems: "center",
  padding: "15px 20px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: "none",
  "&:hover": {
    transform: "translateY(-2px)",
    background: "linear-gradient(180deg, #1a2654 0%, #243166 100%)",
  },
  "&:active": {
    transform: "translateY(0px)",
  },
  "@media (max-width: 768px)": {
    height: "54px",
  },
});

const OptionContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "15px",
  width: "100%",
});

const IconContainer = styled(Box)({
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    fontSize: "20px",
    color: "var(--text-primary)",
  },
});

const OptionText = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "21px",
  letterSpacing: "-0.165px",
  color: "var(--text-primary)",
  flex: 1,
});

const RelationshipSelectionPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { state, actions } = useGlobal();

  const handleUploadFromContacts = () => {
    // Check if we're on mobile and browser supports contacts
    const isMobileDevice =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (
      isMobileDevice &&
      "contacts" in navigator &&
      "ContactsManager" in window
    ) {
      // Request real contacts on mobile
      actions.showContactPermission();
    } else {
      // Desktop - show appropriate message
      if (isMobile) {
        alert(
          "Contact access is only available on mobile devices with supported browsers."
        );
      } else {
        alert(
          "Contact access is not available on desktop. Please use 'Manually enter Name' option."
        );
      }
    }
  };

  const handleManualEntry = () => {
    // Reset form and go directly to new relationship form
    actions.resetFormData();
    navigate("/new-relationship");
  };

  const handleDemoCouple = () => {
    if (isMobile) {
      actions.showDemoChat();
    } else {
      navigate("/demo/chat");
    }
  };

  const options = [
    {
      id: "contacts",
      text: "Upload from contacts",
      icon: <PersonIcon />,
      onClick: handleUploadFromContacts,
    },
    {
      id: "manual",
      text: "Manually enter Name",
      icon: <EditIcon />,
      onClick: handleManualEntry,
    },
    {
      id: "demo",
      text: "Explore Demo Couple",
      icon: <PlayCircleIcon />,
      onClick: handleDemoCouple,
    },
  ];

  return (
    <PageContainer>
      <BlurredBackground />

      <ContentContainer>
        <MainTitle>Who do you want to reflect on first?</MainTitle>

        <OptionsContainer>
          {options.map((option) => (
            <OptionButton key={option.id} onClick={option.onClick}>
              <OptionContent>
                <IconContainer>{option.icon}</IconContainer>
                <OptionText>{option.text}</OptionText>
              </OptionContent>
            </OptionButton>
          ))}
        </OptionsContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default RelationshipSelectionPage;
