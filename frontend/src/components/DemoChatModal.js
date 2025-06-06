// frontend/src/components/DemoChatModal.js
import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useGlobal } from "../contexts/GlobalContext";

// Styled components using CSS variables
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    background: "var(--primary-bg)",
    borderRadius: "0px",
    width: "100%",
    maxWidth: "100%",
    height: "100vh",
    margin: 0,
    padding: 0,
    [theme.breakpoints.up("md")]: {
      maxWidth: "420px",
      height: "90vh",
      maxHeight: "800px",
      borderRadius: "16px",
      margin: "auto",
    },
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 8, 30, 0.8)",
    backdropFilter: "blur(10px)",
  },
}));

const MainContainer = styled(Box)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "var(--primary-bg)",
  color: "var(--text-primary)",
  position: "relative",
  overflow: "hidden",
}));

const BlurredBackground = styled(Box)({
  position: "absolute",
  width: "672px",
  height: "496px",
  left: "11px",
  top: "-128px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  opacity: 0.7,
  filter: "blur(97.6382px)",
  zIndex: 0,
});

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "10px 25px",
  gap: "15px",
  height: "66px",
  backgroundColor: "transparent",
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.down("md")]: {
    height: "94px", // Includes status bar space
    paddingTop: "54px", // Account for status bar
  },
}));

const BackButton = styled(IconButton)({
  color: "var(--text-primary)",
  width: "26px",
  height: "26px",
  padding: 0,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

const HeaderTitle = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "21px",
  letterSpacing: "-0.165px",
  color: "var(--text-primary)",
});

const CoupleInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "22px",
  gap: "22px",
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.down("md")]: {
    padding: "16px 22px",
  },
}));

const AvatarContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  position: "relative",
  filter: "drop-shadow(-5.57143px 16.7143px 22.2857px rgba(0, 0, 0, 0.05))",
});

const CoupleAvatar = styled(Avatar)({
  width: "78px",
  height: "78px",
  border: "2px solid #FFFFFF",
  backgroundColor: "#D9D9D9",
});

const OverlapAvatar = styled(Avatar)({
  width: "78px",
  height: "78px",
  backgroundColor: "#FFFFFF",
  marginLeft: "-20px",
  position: "relative",
  zIndex: 1,
});

const CoupleDetails = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "10px",
});

const CoupleNameContainer = styled(Box)({
  background: "rgba(255, 255, 255, 0.08)",
  borderRadius: "21px",
  padding: "5px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "33px",
});

const CoupleName = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: "23px",
  letterSpacing: "-0.115px",
  color: "var(--text-primary)",
});

const RelationshipTag = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "3px 10px",
  gap: "3px",
  background: "var(--topic-affection-gradient)",
  borderRadius: "25px",
  height: "24px",
});

const TagText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "12px",
  lineHeight: "18px",
  letterSpacing: "-0.123px",
  color: "var(--text-primary)",
});

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: "8px 17px",
  display: "flex",
  flexDirection: "column",
  gap: "11px",
  overflowY: "auto",
  position: "relative",
  zIndex: 2,
  marginBottom: "67px", // Space for fixed button
  "&::-webkit-scrollbar": {
    width: "4px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "2px",
  },
}));

const DateSeparator = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "5px 10px",
  width: "100%",
  height: "27px",
});

const DateText = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 400,
  fontSize: "10px",
  lineHeight: "16px",
  textAlign: "center",
  color: "var(--text-primary)",
});

const MessageContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  marginBottom: "15px",
});

const MessageBubble = styled(Box)(({ isUser }) => ({
  alignSelf: isUser ? "flex-end" : "flex-start",
  maxWidth: isUser ? "205px" : "210px",
  padding: "7px 12px",
  borderRadius: isUser
    ? "15.771px 15.771px 0px 15.771px"
    : "15.771px 15.771px 15.771px 0px",
  backgroundColor: isUser ? "#366EFF" : "#151E36",
  marginBottom: "4px",
}));

const MessageText = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: (isUser) => (isUser ? 500 : 400),
  fontSize: "12px",
  lineHeight: "16px",
  color: "var(--text-primary)",
});

const MessageTime = styled(Typography)(({ isUser }) => ({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 400,
  fontSize: "10px",
  lineHeight: "16px",
  color: "var(--text-primary)",
  alignSelf: isUser ? "flex-end" : "flex-start",
  marginTop: "4px",
}));

const UploadSeparator = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px",
  margin: "10px 0",
});

const UploadText = styled(Typography)({
  fontFamily: "Franklin Gothic Medium",
  fontWeight: 400,
  fontSize: "10px",
  lineHeight: "16px",
  color: "#9C9C9C",
});

const ViewAnalysisButton = styled(Button)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  width: "100%",
  height: "67px",
  background: "linear-gradient(90.89deg, #4E7FFF -33.6%, #0047FF 96.52%)",
  borderRadius: "30px 30px 0px 0px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "18px",
  lineHeight: "23px",
  letterSpacing: "-0.165px",
  textTransform: "none",
  zIndex: 1000,
  "&:hover": {
    background: "linear-gradient(90.89deg, #4E7FFF -33.6%, #0047FF 96.52%)",
    opacity: 0.9,
  },
  [theme.breakpoints.up("md")]: {
    position: "absolute",
    maxWidth: "420px",
    margin: "0 auto",
  },
}));

const DemoChatModal = () => {
  const { state, actions } = useGlobal();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const messages = [
    { id: 1, text: "Hey Niko!", isUser: false, time: "11:45 PM" },
    {
      id: 2,
      text: "Hello! I'm here to help you analyze your relationship communication patterns. Please upload your chat history and I'll provide detailed insights.",
      isUser: false,
      time: "11:45 PM",
    },
    {
      id: 3,
      text: "HI! I've exported my WhatsApp chat, Can you analyze our communnication",
      isUser: true,
      time: "11:45 PM",
    },
    {
      id: 4,
      text: "I've analyzed your chat history! Here are the key findings: Conversation balance- Logistics:68%, Affection:12%, Playfull: 5%",
      isUser: false,
      time: "11:45 PM",
    },
    {
      id: 5,
      text: "Wow, that's a lot of logistics! Is that normal for couples?",
      isUser: true,
      time: "11:45 PM",
    },
  ];

  const handleBack = () => {
    actions.hideAllModals();
  };

  const handleViewAnalysis = () => {
    actions.showDemoAnalysis();
  };

  return (
    <StyledDialog
      open={state.showDemoChat}
      onClose={handleBack}
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <DialogContent sx={{ padding: 0, height: "100%", position: "relative" }}>
        <MainContainer>
          <BlurredBackground />

          {/* Header */}
          <Header>
            <BackButton onClick={handleBack}>
              <ArrowBackIcon sx={{ fontSize: "20px" }} />
            </BackButton>
            <HeaderTitle>Analyzing Relationship</HeaderTitle>
          </Header>

          {/* Couple Info */}
          <CoupleInfo>
            <AvatarContainer>
              <CoupleAvatar src="/demo-avatar-1.jpg" />
              <OverlapAvatar src="/demo-avatar-2.jpg" />
            </AvatarContainer>

            <CoupleDetails>
              <CoupleNameContainer>
                <CoupleName>Alex & Jordan</CoupleName>
              </CoupleNameContainer>

              <RelationshipTag>
                <FavoriteIcon
                  sx={{ fontSize: "14px", color: "var(--text-primary)" }}
                />
                <TagText>Romantic</TagText>
              </RelationshipTag>
            </CoupleDetails>
          </CoupleInfo>

          {/* Chat Messages */}
          <ChatContainer>
            <DateSeparator>
              <DateText>Dec 9, 2024</DateText>
            </DateSeparator>

            {messages.slice(0, 2).map((message) => (
              <MessageContainer key={message.id}>
                <MessageBubble isUser={message.isUser}>
                  <MessageText isUser={message.isUser}>
                    {message.text}
                  </MessageText>
                </MessageBubble>
                <MessageTime isUser={message.isUser}>
                  {message.time}
                </MessageTime>
              </MessageContainer>
            ))}

            <UploadSeparator>
              <UploadText>
                —————————— New chat was uploaded ——————————
              </UploadText>
            </UploadSeparator>

            {messages.slice(2).map((message) => (
              <MessageContainer key={message.id}>
                <MessageBubble isUser={message.isUser}>
                  <MessageText isUser={message.isUser}>
                    {message.text}
                  </MessageText>
                </MessageBubble>
                <MessageTime isUser={message.isUser}>
                  {message.time}
                </MessageTime>
              </MessageContainer>
            ))}
          </ChatContainer>

          {/* View Analysis Button */}
          <ViewAnalysisButton onClick={handleViewAnalysis}>
            View Analysis
          </ViewAnalysisButton>
        </MainContainer>
      </DialogContent>
    </StyledDialog>
  );
};

export default DemoChatModal;
