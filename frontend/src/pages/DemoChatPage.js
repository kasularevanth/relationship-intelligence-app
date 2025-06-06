// frontend/src/pages/DemoChatPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu";
import TopBar from "../components/TopBar";

// Main container with exact CSS positioning
const MainContainer = styled(Box)(({ sidebarExpanded, isMobile }) => ({
  position: "relative",
  width: "1440px",
  height: "904px",
  background: "#00081E",
  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
  marginLeft: isMobile ? 0 : sidebarExpanded ? "289px" : "0px",
  transition: "margin-left 0.3s ease",
  overflow: "hidden",
}));

// Blurred background - exact CSS positioning
const BlurredBackground = styled(Box)({
  position: "absolute",
  width: "1099px",
  height: "719px",
  left: "612px",
  top: "-180px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  filter: "blur(151.688px)",
});

// Header - exact CSS positioning
const Header = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px 50px",
  gap: "19px",
  position: "absolute",
  width: "1340px",
  height: "34px",
  left: "100px",
  top: "72px",
});

const BackButton = styled(IconButton)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "28.24px",
  width: "34px",
  height: "34px",
  color: "#FFFFFF",
  "& .MuiSvgIcon-root": {
    fontSize: "34px",
  },
});

const HeaderTitle = styled(Typography)({
  width: "1031px",
  height: "29px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "29px",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
});

// Main content container - exact CSS positioning
const ContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "40px",
  position: "absolute",
  width: "1141px",
  height: "549.8px",
  left: "199px",
  top: "126px",
});

// Couple info section
const CoupleInfoSection = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "0px",
  gap: "60px",
  width: "1141px",
  height: "111.92px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const AvatarContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  width: "201px",
  height: "111.92px",
  filter: "drop-shadow(-7.99419px 23.9826px 31.9767px rgba(0, 0, 0, 0.05))",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const CoupleAvatar = styled(Avatar)({
  position: "absolute",
  width: "111.92px",
  height: "111.92px",
  left: "0px",
  top: "0px",
  background: "#D9D9D9",
});

const OverlapAvatar = styled(Avatar)({
  width: "111.92px",
  height: "111.92px",
  background: "#FFFFFF",
  marginLeft: "89.08px",
  flex: "none",
  order: 1,
  flexGrow: 0,
});

const CoupleDetails = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "0px",
  gap: "15px",
  width: "191px",
  height: "85px",
  flex: "none",
  order: 1,
  flexGrow: 0,
});

const CoupleNameContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px",
  gap: "2px",
  width: "191px",
  height: "40px",
  background: "rgba(255, 255, 255, 0.08)",
  borderRadius: "20.9766px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const CoupleName = styled(Typography)({
  width: "109px",
  height: "23px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: "23px",
  display: "flex",
  alignItems: "center",
  letterSpacing: "-0.115371px",
  color: "#FFFFFF",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const RelationshipTag = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "3px 10px",
  gap: "3px",
  width: "117px",
  height: "30px",
  background: "linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)",
  borderRadius: "25px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 1,
});

const TagText = styled(Typography)({
  width: "59px",
  height: "18px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "12px",
  lineHeight: "18px",
  letterSpacing: "-0.122735px",
  color: "#FFFFFF",
  flex: "none",
  order: 1,
  flexGrow: 0,
});

// Chat container
const ChatContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px 10px",
  gap: "9px",
  width: "1141px",
  height: "397.89px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

// Date separator
const DateSeparator = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "5.11098px 10.222px",
  gap: "5px",
  width: "1121px",
  height: "28px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const DateText = styled(Typography)({
  width: "1100.56px",
  height: "17px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "13px",
  lineHeight: "16px",
  textAlign: "center",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  flexGrow: 1,
});

// Messages container
const MessagesContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "5px",
  width: "1121px",
  height: "229.89px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

// AI message groups
const AIMessageGroup = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "10px",
  width: "430px",
  height: "146px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const AIMessageShort = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  gap: "8.18px",
  width: "164px",
  height: "37px",
  background: "#151E36",
  borderRadius: "15.771px 15.771px 15.771px 0px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const AIMessageShortText = styled(Typography)({
  width: "124px",
  height: "17px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "16px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const AIMessageLongContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "4.38px",
  width: "430px",
  height: "99px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const AIMessageLong = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  gap: "8.18px",
  width: "430px",
  height: "74px",
  background: "#151E36",
  borderRadius: "15.771px 15.771px 15.771px 0px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const AIMessageLongText = styled(Typography)({
  width: "390px",
  height: "54px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "18px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const AIMessageTime = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "10.22px",
  width: "430px",
  height: "12px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const TimeText = styled(Typography)({
  width: "45px",
  height: "12px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "16px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

// User message
const UserMessageContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  padding: "0px",
  gap: "7.89px",
  width: "1121px",
  height: "78.89px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const UserMessage = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  gap: "8.18px",
  width: "330px",
  height: "54px",
  background: "linear-gradient(90.81deg, #4E7FFF 4.7%, #0047FF 96.51%)",
  borderRadius: "15.771px 15.771px 0px 15.771px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const UserMessageText = styled(Typography)({
  width: "280px",
  height: "34px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "18px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const UserMessageTime = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  padding: "0px",
  gap: "10.22px",
  width: "1121px",
  height: "17px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const UserTimeText = styled(Typography)({
  width: "45px",
  height: "17px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "16px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

// Upload separator
const UploadSeparator = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "5.11098px 10.222px",
  gap: "10px",
  width: "1121px",
  height: "36px",
  flex: "none",
  order: 2,
  alignSelf: "stretch",
  flexGrow: 0,
});

const UploadText = styled(Typography)({
  width: "1100.56px",
  height: "17px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "13px",
  lineHeight: "16px",
  textAlign: "center",
  color: "#8C909A",
  flex: "none",
  order: 0,
  flexGrow: 1,
});

// Analysis result message
const AnalysisMessageContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  padding: "0px",
  gap: "7.89px",
  width: "1121px",
  height: "98px",
  flex: "none",
  order: 3,
  alignSelf: "stretch",
  flexGrow: 0,
});

const AnalysisMessageGroup = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "4.38px",
  width: "1121px",
  height: "98px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const AnalysisMessage = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  gap: "8.18px",
  width: "430px",
  height: "74px",
  background: "#151E36",
  borderRadius: "15.771px 15.771px 15.771px 0px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const AnalysisMessageText = styled(Typography)({
  width: "390px",
  height: "54px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "18px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const AnalysisMessageTime = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "10.22px",
  width: "1121px",
  height: "17px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

// Fixed button at bottom
const FixedButtonContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 25px",
  gap: "10px",
  position: "absolute",
  width: "610px",
  height: "67px",
  left: "calc(50% - 610px/2 + 24px)",
  top: "836px",
  background: "linear-gradient(90.89deg, #4E7FFF -33.6%, #0047FF 96.52%)",
  borderRadius: "30px 30px 0px 0px",
  cursor: "pointer",
});

const ViewAnalysisText = styled(Typography)({
  width: "130px",
  height: "26px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "20px",
  lineHeight: "26px",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const DemoChatPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (event) => {
      setSidebarExpanded(event.detail.expanded);
    };

    window.addEventListener("sidebarStateChange", handleSidebarChange);
    return () =>
      window.removeEventListener("sidebarStateChange", handleSidebarChange);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewAnalysis = () => {
    navigate("/demo/analysis");
  };

  return (
    <>
      <HamburgerMenu />
      {isMobile && <TopBar />}

      <MainContainer sidebarExpanded={sidebarExpanded} isMobile={isMobile}>
        <BlurredBackground />

        <Header>
          <BackButton onClick={handleBack}>
            <ArrowBackIcon />
          </BackButton>
          <HeaderTitle>Analyzing Relationship</HeaderTitle>
        </Header>

        <ContentContainer>
          <CoupleInfoSection>
            <AvatarContainer>
              <CoupleAvatar alt="You" src="/path/to/avatar1.jpg" />
              <OverlapAvatar alt="Jordan" src="/path/to/avatar2.jpg" />
            </AvatarContainer>
            <CoupleDetails>
              <CoupleNameContainer>
                <CoupleName>You & Jordan</CoupleName>
              </CoupleNameContainer>
              <RelationshipTag>
                <FavoriteIcon
                  sx={{ width: "17px", height: "17px", color: "#FFFFFF" }}
                />
                <TagText>Romantic</TagText>
              </RelationshipTag>
            </CoupleDetails>
          </CoupleInfoSection>

          <ChatContainer>
            <DateSeparator>
              <DateText>Dec 9, 2024</DateText>
            </DateSeparator>

            <MessagesContainer>
              {/* First AI message group */}
              <AIMessageGroup>
                <AIMessageShort>
                  <AIMessageShortText>Hey Niko!</AIMessageShortText>
                </AIMessageShort>

                <AIMessageLongContainer>
                  <AIMessageLong>
                    <AIMessageLongText>
                      Hello! I'm here to help you analyze your relationship
                      communication patterns. Please upload your chat history
                      and I'll provide detailed insights.
                    </AIMessageLongText>
                  </AIMessageLong>

                  <AIMessageTime>
                    <TimeText>11:45 PM</TimeText>
                  </AIMessageTime>
                </AIMessageLongContainer>
              </AIMessageGroup>

              {/* User message */}
              <UserMessageContainer>
                <UserMessage>
                  <UserMessageText>
                    HI! I've exported my WhatsApp chat, Can you analyze our
                    communication
                  </UserMessageText>
                </UserMessage>

                <UserMessageTime>
                  <UserTimeText>11:45 PM</UserTimeText>
                </UserMessageTime>
              </UserMessageContainer>

              {/* Upload separator */}
              <UploadSeparator>
                <UploadText>New chat was uploaded</UploadText>
              </UploadSeparator>

              {/* Analysis result */}
              <AnalysisMessageContainer>
                <AnalysisMessageGroup>
                  <AnalysisMessage>
                    <AnalysisMessageText>
                      I've analyzed your chat history! Here are the key
                      findings: Conversation balance- Logistics:68%,
                      Affection:12%, Playfull: 5%
                    </AnalysisMessageText>
                  </AnalysisMessage>

                  <AnalysisMessageTime>
                    <TimeText>11:45 PM</TimeText>
                  </AnalysisMessageTime>
                </AnalysisMessageGroup>
              </AnalysisMessageContainer>
            </MessagesContainer>
          </ChatContainer>
        </ContentContainer>

        <FixedButtonContainer onClick={handleViewAnalysis}>
          <ViewAnalysisText>View Analysis</ViewAnalysisText>
        </FixedButtonContainer>
      </MainContainer>
    </>
  );
};

export default DemoChatPage;
