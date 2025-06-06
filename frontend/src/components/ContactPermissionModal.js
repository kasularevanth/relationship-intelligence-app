// frontend/src/components/ContactPermissionModal.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useGlobal } from "../contexts/GlobalContext";

// Styled components
const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    background: "linear-gradient(180deg, #101C44 0%, #172556 100%)",
    borderRadius: "15px",
    maxWidth: "400px",
    width: "95%",
    margin: "20px",
    padding: "25px 30px",
    "@media (min-width: 600px)": {
      maxWidth: "450px",
      padding: "30px 35px",
    },
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 8, 30, 0.8)",
    backdropFilter: "blur(10px)",
  },
});

const CloseButton = styled(IconButton)({
  position: "absolute",
  top: "12px",
  right: "12px",
  color: "var(--text-primary)",
  width: "32px",
  height: "32px",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

const ContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "32px",
  padding: "20px 0",
});

const TextContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  width: "100%",
  textAlign: "center",
});

const MainTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "20px",
  lineHeight: "28px",
  color: "var(--text-primary)",
  width: "100%",
  "@media (max-width: 600px)": {
    fontSize: "18px",
    lineHeight: "26px",
  },
});

const SubText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 300,
  fontSize: "15px",
  lineHeight: "22px",
  color: "rgba(255, 255, 255, 0.8)",
  width: "100%",
  "@media (max-width: 600px)": {
    fontSize: "14px",
    lineHeight: "20px",
  },
});

const ButtonContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "16px",
  width: "100%",
});

const AllowButton = styled(Button)({
  width: "100%",
  height: "50px",
  background: "linear-gradient(135deg, #366EFF 0%, #4E7FFF 100%)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "21px",
  textTransform: "none",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  "&:hover": {
    background: "linear-gradient(135deg, #2557E5 0%, #366EFF 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(54, 110, 255, 0.4)",
  },
  "&:disabled": {
    background: "rgba(54, 110, 255, 0.3)",
    color: "rgba(255, 255, 255, 0.5)",
    transform: "none",
    boxShadow: "none",
  },
  transition: "all 0.3s ease",
});

const DenyButton = styled(Button)({
  width: "100%",
  height: "50px",
  background: "transparent",
  border: "1.5px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "21px",
  textTransform: "none",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1.5px solid rgba(255, 255, 255, 0.5)",
    transform: "translateY(-2px)",
  },
  transition: "all 0.3s ease",
});

const ContactPermissionModal = () => {
  const navigate = useNavigate();
  const { state, actions } = useGlobal();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestRealContacts = async () => {
    try {
      setIsRequesting(true);

      // Check if browser supports Contact API
      if ("contacts" in navigator && "ContactsManager" in window) {
        const opts = {
          multiple: true,
          includeNames: true,
          includeEmails: false,
          includeTel: false,
        };

        const contacts = await navigator.contacts.select(["name"], opts);

        if (contacts && contacts.length > 0) {
          // Convert browser contacts to our format
          const formattedContacts = contacts.map((contact, index) => ({
            id: `real_${index}`,
            name: contact.name?.[0] || `Contact ${index + 1}`,
            avatar: null,
            isReal: true,
          }));

          // Update global state with real contacts
          actions.setContactList?.(formattedContacts);
          actions.setContactPermission(true);
          actions.hideAllModals();
          actions.showContactSelector();
        } else {
          // No contacts selected
          actions.hideAllModals();
        }
      } else {
        throw new Error("Contact API not supported");
      }
    } catch (error) {
      console.log("Contact permission denied or error:", error);
      // Handle error - redirect to manual entry
      actions.hideAllModals();
      actions.resetFormData();
      navigate("/new-relationship");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAllow = () => {
    requestRealContacts();
  };

  const handleDeny = () => {
    actions.setContactPermission(false);
    actions.hideAllModals();
    // Redirect to manual entry
    actions.resetFormData();
    navigate("/new-relationship");
  };

  const handleClose = () => {
    actions.hideAllModals();
  };

  return (
    <StyledDialog
      open={state.showContactPermission}
      onClose={handleClose}
      maxWidth="sm"
    >
      <DialogContent sx={{ padding: 0, position: "relative" }}>
        <CloseButton onClick={handleClose}>
          <CloseIcon sx={{ fontSize: "18px" }} />
        </CloseButton>

        <ContentContainer>
          <TextContainer>
            <MainTitle>Allow SoulSync to access your contacts</MainTitle>
            <SubText>
              This will allow you to select from your device contacts to quickly
              add someone to reflect on.
            </SubText>
          </TextContainer>

          <ButtonContainer>
            <AllowButton onClick={handleAllow} disabled={isRequesting}>
              {isRequesting ? "Requesting..." : "Allow"}
            </AllowButton>
            <DenyButton onClick={handleDeny}>Don't Allow</DenyButton>
          </ButtonContainer>
        </ContentContainer>
      </DialogContent>
    </StyledDialog>
  );
};

export default ContactPermissionModal;
