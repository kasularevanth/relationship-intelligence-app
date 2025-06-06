// frontend/src/components/RelationshipSelection.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useGlobal } from "../contexts/GlobalContext";

// Styled components using CSS variables
const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    background: "var(--primary-bg)",
    borderRadius: "24px",
    maxWidth: "375px",
    width: "95%",
    margin: "20px",
    padding: "0",
    border: "none",
    "@media (min-width: 600px)": {
      maxWidth: "400px",
      margin: "20px",
    },
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 8, 30, 0.8)",
    backdropFilter: "blur(10px)",
  },
});

const DialogContentStyled = styled(DialogContent)({
  padding: "25px 25px 35px 25px",
  position: "relative",
  background: "var(--primary-bg)",
  color: "var(--text-primary)",
  "&:first-of-type": {
    paddingTop: "25px",
  },
});

const BlurredBackground = styled(Box)({
  position: "absolute",
  width: "672px",
  height: "496px",
  left: "11px",
  top: "-128px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  filter: "blur(97.6382px)",
  zIndex: -1,
});

const CloseButton = styled(IconButton)({
  position: "absolute",
  top: "15px",
  right: "15px",
  color: "var(--text-primary)",
  width: "32px",
  height: "32px",
  zIndex: 10,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

const MainTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 400,
  fontSize: "26px",
  lineHeight: "39px",
  letterSpacing: "-0.165px",
  color: "var(--text-primary)",
  textAlign: "center",
  marginBottom: "32px",
  marginTop: "20px",
  maxWidth: "325px",
  margin: "20px auto 32px auto",
  "@media (max-width: 600px)": {
    fontSize: "24px",
    lineHeight: "36px",
    marginBottom: "28px",
  },
});

const OptionsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  width: "100%",
  maxWidth: "325px",
  margin: "0 auto",
});

const OptionButton = styled(Box)({
  width: "100%",
  height: "54px",
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

const RelationshipSelection = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { state, actions } = useGlobal();

  const handleUploadFromContacts = () => {
    onClose();
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
    onClose();
    // Reset form and go directly to new relationship form
    actions.resetFormData();
    navigate("/new-relationship");
  };

  const handleDemoCouple = () => {
    onClose();
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
    <StyledDialog open={open} onClose={onClose} maxWidth="sm">
      <DialogContentStyled>
        <BlurredBackground />

        <CloseButton onClick={onClose}>
          <CloseIcon sx={{ fontSize: "18px" }} />
        </CloseButton>

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
      </DialogContentStyled>
    </StyledDialog>
  );
};

export default RelationshipSelection;
