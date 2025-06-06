// frontend/src/components/ContactSelectorModal.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useGlobal } from "../contexts/GlobalContext";

// Styled components
const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    background: "linear-gradient(180deg, #101C44 0%, #172556 100%)",
    borderRadius: "15px",
    maxWidth: "400px",
    width: "95%",
    height: "80vh",
    maxHeight: "700px",
    margin: "20px",
    padding: "20px",
    "@media (min-width: 600px)": {
      maxWidth: "450px",
      padding: "25px",
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
  gap: "24px",
  height: "100%",
  padding: "32px 0 0 0",
});

const Title = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "20px",
  lineHeight: "28px",
  color: "var(--text-primary)",
  textAlign: "center",
  marginBottom: "8px",
});

const SearchContainer = styled(Box)({
  width: "100%",
});

const SearchField = styled(TextField)({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    height: "48px",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontFamily: "var(--font-family-secondary)",
    "& fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    "&:hover fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.3)",
    },
    "&.Mui-focused fieldset": {
      border: "1px solid #366EFF",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "12px 16px",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
      opacity: 1,
      fontFamily: "var(--font-family-secondary)",
    },
  },
});

const ContactsList = styled(List)({
  flex: 1,
  padding: 0,
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "rgba(255, 255, 255, 0.3)",
  },
});

const ContactItem = styled(ListItem)({
  padding: "12px 16px",
  cursor: "pointer",
  borderRadius: "10px",
  marginBottom: "6px",
  transition: "all 0.3s ease",
  border: "1px solid transparent",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transform: "translateX(4px)",
  },
});

const ContactAvatar = styled(Avatar)({
  width: "36px",
  height: "36px",
  marginRight: "14px",
  fontSize: "14px",
  fontWeight: 600,
  backgroundColor: "#366EFF",
  color: "#FFFFFF",
  fontFamily: "var(--font-family-secondary)",
});

const ContactName = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "22px",
  color: "var(--text-primary)",
});

const SelectButton = styled(Button)({
  width: "100%",
  height: "52px",
  background: "linear-gradient(135deg, #366EFF 0%, #4E7FFF 100%)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "21px",
  textTransform: "none",
  marginTop: "auto",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  "&:hover": {
    background: "linear-gradient(135deg, #2557E5 0%, #366EFF 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(54, 110, 255, 0.4)",
  },
  "&:disabled": {
    background: "rgba(54, 110, 255, 0.3)",
    opacity: 0.6,
    color: "rgba(255, 255, 255, 0.5)",
    transform: "none",
    boxShadow: "none",
  },
  transition: "all 0.3s ease",
});

const NoResultsText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 400,
  fontSize: "15px",
  lineHeight: "22px",
  color: "rgba(255, 255, 255, 0.6)",
  textAlign: "center",
  padding: "40px 20px",
});

const ContactSelectorModal = () => {
  const navigate = useNavigate();
  const { state, actions } = useGlobal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Use real contacts from global state
  const contacts = state.contactList || [];

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSelect = (contact) => {
    setSelectedContactId(contact.id);
    actions.setSelectedContact(contact);
  };

  const handleSelect = () => {
    if (selectedContactId) {
      const selectedContact = contacts.find((c) => c.id === selectedContactId);
      if (selectedContact) {
        // Set the selected contact name in form data
        actions.setFormData({
          contactName: selectedContact.name,
          relationshipType: "",
        });
        actions.hideAllModals();
        navigate("/new-relationship");
      }
    }
  };

  const handleClose = () => {
    actions.hideAllModals();
    setSelectedContactId(null);
    setSearchQuery("");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#AED6F1",
      "#F8C471",
      "#82E0AA",
      "#D7BDE2",
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <StyledDialog
      open={state.showContactSelector}
      onClose={handleClose}
      maxWidth="sm"
    >
      <DialogContent sx={{ padding: 0, position: "relative", height: "100%" }}>
        <CloseButton onClick={handleClose}>
          <CloseIcon sx={{ fontSize: "18px" }} />
        </CloseButton>

        <ContentContainer>
          <Title>Select Contact</Title>

          {/* Search */}
          <SearchContainer>
            <SearchField
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: "20px",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </SearchContainer>

          {/* Contacts List */}
          <ContactsList>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  sx={{
                    backgroundColor:
                      selectedContactId === contact.id
                        ? "rgba(54, 110, 255, 0.3)"
                        : "transparent",
                    border:
                      selectedContactId === contact.id
                        ? "1px solid #366EFF"
                        : "1px solid transparent",
                  }}
                >
                  <ContactAvatar
                    sx={{
                      backgroundColor: getRandomColor(contact.name),
                    }}
                  >
                    {getInitials(contact.name)}
                  </ContactAvatar>
                  <ContactName>{contact.name}</ContactName>
                </ContactItem>
              ))
            ) : (
              <NoResultsText>
                {searchQuery
                  ? `No contacts found matching "${searchQuery}"`
                  : "No contacts available"}
              </NoResultsText>
            )}
          </ContactsList>

          {/* Select Button */}
          <SelectButton onClick={handleSelect} disabled={!selectedContactId}>
            Select Contact
          </SelectButton>
        </ContentContainer>
      </DialogContent>
    </StyledDialog>
  );
};

export default ContactSelectorModal;
