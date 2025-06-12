// frontend/src/pages/DemoAnalysisPage.js
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
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu";
import TopBar from "../components/TopBar";
import menImage from "../assets/men.jpg";
import womenImage from "../assets/women.jpg";

// Main container with exact CSS positioning
const MainContainer = styled(Box)(({ sidebarExpanded, isMobile }) => ({
  position: "relative",
  width: "1440px",
  height: "988px",
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
  alignItems: "center",
  padding: "0px",
  gap: "40px",
  position: "absolute",
  width: "1135px",
  height: "769.92px",
  left: "calc(50% - 1135px/2 + 52.5px)",
  top: "126px",
});

// Couple info section
const CoupleInfoSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "0px",
  gap: "22px",
  width: "1135px",
  height: "218.92px",
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

// Main content areas
const MainContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "39px",
  width: "1135px",
  height: "511px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const TopRowContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "21px",
  width: "1135px",
  height: "370px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const LeftColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "21px",
  width: "557px",
  height: "370px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

// Emotional Health Score Card
const ScoreCard = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "20px 15px",
  gap: "20px",
  width: "557px",
  height: "155px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "12px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ScoreHeader = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "5px",
  margin: "0 auto",
  width: "298px",
  height: "33px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const ScoreIconContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "5.81818px",
  gap: "14.55px",
  width: "32px",
  height: "32px",
  borderRadius: "7.27273px",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const ScoreTitle = styled(Typography)({
  width: "261px",
  height: "33px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "33px",
  color: "#F5F5F5",
  flex: "none",
  order: 1,
  flexGrow: 0,
});

const ScoreDetails = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px 5px",
  gap: "20px",
  margin: "0 auto",
  width: "527px",
  height: "59px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ScoreRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0px",
  gap: "141px",
  width: "517px",
  height: "21px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ScoreLabel = styled(Typography)({
  width: "146px",
  height: "21px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "21px",
  textAlign: "center",
  letterSpacing: "-0.175532px",
  color: "#D1D1D1",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const ScoreValue = styled(Typography)({
  width: "31px",
  height: "21px",
  fontFamily: "'DM Sans'",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "21px",
  textAlign: "center",
  letterSpacing: "-0.175532px",
  color: "#D1D1D1",
  flex: "none",
  order: 1,
  flexGrow: 0,
});

const ProgressBarContainer = styled(Box)({
  width: "517px",
  height: "10px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
  position: "relative",
});

const ProgressBackground = styled(Box)({
  position: "absolute",
  width: "525px",
  height: "10px",
  left: "0px",
  top: "-0.92px",
  background: "rgba(255, 255, 255, 0.14)",
  borderRadius: "35.9166px",
});

const ProgressFill = styled(Box)({
  position: "absolute",
  width: "356px",
  height: "10px",
  left: "0px",
  top: "-0.92px",
  background: "#FF9D00",
  borderRadius: "35.9166px",
});

// Chart Card
const ChartCard = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "20px",
  gap: "20px",
  width: "557px",
  height: "193px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "6px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ChartTitle = styled(Typography)({
  width: "517px",
  height: "33px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "22px",
  lineHeight: "33px",
  letterSpacing: "-0.122735px",
  color: "#FFFFFF",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ChartContent = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "0px",
  gap: "39px",
  width: "517px",
  height: "100px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ChartCircle = styled(Box)({
  width: "100px",
  height: "100px",
  flex: "none",
  order: 0,
  flexGrow: 0,
  position: "relative",
});

const ChartCircleBase = styled(Box)({
  position: "absolute",
  width: "100px",
  height: "100px",
  left: "0px",
  top: "0px",
  background: "rgba(255, 255, 255, 0.15)",
  borderRadius: "50%",
});

const ChartCircleAffection = styled(Box)({
  position: "absolute",
  width: "100px",
  height: "100px",
  left: "0px",
  top: "0px",
  background: "linear-gradient(138.05deg, #AF40FF 22.72%, #FB3A83 60.33%)",
  borderRadius: "50%",
  clipPath: "polygon(50% 50%, 50% 0%, 85% 15%)",
});

const ChartCircleLogistics = styled(Box)({
  position: "absolute",
  width: "100px",
  height: "100px",
  left: "0px",
  top: "0px",
  background: "linear-gradient(275.48deg, #AA00FF -5.24%, #4A74FF 101.68%)",
  borderRadius: "50%",
  clipPath: "polygon(50% 50%, 85% 15%, 100% 100%, 50% 100%)",
});

const ChartLegend = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "10px",
  width: "98px",
  height: "52px",
  flex: "none",
  order: 1,
  flexGrow: 0,
});

const LegendItem = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "10px",
  width: "98px",
  height: "24px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const LegendColorBox = styled(Box)(({ gradient }) => ({
  width: "16px",
  height: "16px",
  background: gradient,
  borderRadius: "20px",
  flex: "none",
  order: 0,
  flexGrow: 0,
}));

const LegendText = styled(Typography)(({ primary }) => ({
  width: primary ? "72px" : "51px",
  height: primary ? "24px" : "18px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: primary ? "16px" : "12px",
  lineHeight: primary ? "24px" : "18px",
  letterSpacing: "-0.122735px",
  color: "#FFFFFF",
  flex: "none",
  order: 1,
  flexGrow: 0,
}));

// Right Column - Conflict Analysis
const RightColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "10px",
  gap: "10px",
  width: "557px",
  height: "370px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "12px",
  flex: "none",
  order: 1,
  flexGrow: 0,
});

const RightColumnContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px",
  gap: "25px",
  width: "537px",
  height: "350px",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ConflictTitle = styled(Typography)({
  width: "517px",
  height: "33px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "33px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ConflictCard = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "10px 15px",
  gap: "10px",
  width: "517px",
  height: "121px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "6px",
  flex: "none",
  order: 0,
  flexGrow: 1,
});

const ConflictContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "0px",
  gap: "5px",
  width: "487px",
  height: "101px",
  flex: "none",
  order: 0,
  flexGrow: 1,
});

const ConflictHeader = styled(Typography)({
  width: "212px",
  height: "27px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "18px",
  lineHeight: "27px",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const ConflictFrequency = styled(Typography)({
  width: "487px",
  height: "30px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "20px",
  lineHeight: "30px",
  letterSpacing: "-0.237288px",
  color: "#F5F5F5",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const ConflictDescription = styled(Typography)({
  width: "487px",
  height: "24px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "-0.237288px",
  color: "#FFFFFF",
  flex: "none",
  order: 2,
  alignSelf: "stretch",
  flexGrow: 0,
});

const RepairCard = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "10px 15px",
  gap: "10px",
  width: "517px",
  height: "86px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "6px",
  flex: "none",
  order: 0,
  flexGrow: 1,
});

const RepairContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "0px",
  gap: "5px",
  width: "487px",
  height: "66px",
  flex: "none",
  order: 0,
  flexGrow: 1,
});

const RepairHeader = styled(Typography)({
  width: "217px",
  height: "27px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "18px",
  lineHeight: "27px",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
  flex: "none",
  order: 0,
  flexGrow: 0,
});

const RepairDescription = styled(Typography)({
  width: "487px",
  height: "24px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "-0.237288px",
  color: "#FFFFFF",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

// Bottom Row
const BottomRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "21px",
  width: "1135px",
  height: "120px",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const BottomCard = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  gap: "10px",
  width: "557px",
  height: "120px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "12px",
  flex: "none",
  order: 0,
  flexGrow: 1,
});

const BottomCardTitle = styled(Typography)({
  width: "517px",
  height: "27px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "18px",
  lineHeight: "27px",
  letterSpacing: "-0.237288px",
  color: "#FFFFFF",
  flex: "none",
  order: 0,
  alignSelf: "stretch",
  flexGrow: 0,
});

const BottomCardDescription = styled(Typography)({
  width: "517px",
  height: "24px",
  fontFamily: "'Poppins'",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "-0.237288px",
  color: "#FFFFFF",
  flex: "none",
  order: 1,
  alignSelf: "stretch",
  flexGrow: 0,
});

const DemoAnalysisPage = () => {
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
              <CoupleAvatar alt="You" src={menImage} />
              <OverlapAvatar alt="Jordan" src={womenImage} />
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

          <MainContentContainer>
            <TopRowContainer>
              <LeftColumn>
                <ScoreCard>
                  <ScoreHeader>
                    <ScoreIconContainer>
                      <SentimentSatisfiedIcon
                        sx={{
                          width: "20.36px",
                          height: "20.36px",
                          color: "#F5F5F5",
                        }}
                      />
                    </ScoreIconContainer>
                    <ScoreTitle>Emotional Health Score</ScoreTitle>
                  </ScoreHeader>

                  <ScoreDetails>
                    <ScoreRow>
                      <ScoreLabel>Emotionally healthy</ScoreLabel>
                      <ScoreValue>76%</ScoreValue>
                    </ScoreRow>

                    <ProgressBarContainer>
                      <ProgressBackground />
                      <ProgressFill />
                    </ProgressBarContainer>
                  </ScoreDetails>
                </ScoreCard>

                <ChartCard>
                  <ChartTitle>
                    Affection vs. logistical conversation ratios
                  </ChartTitle>
                  <ChartContent>
                    <ChartCircle>
                      <ChartCircleBase />
                      <ChartCircleAffection />
                      <ChartCircleLogistics />
                    </ChartCircle>

                    <ChartLegend>
                      <LegendItem>
                        <LegendColorBox gradient="linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)" />
                        <LegendText primary>Affection</LegendText>
                      </LegendItem>
                      <LegendItem>
                        <LegendColorBox gradient="linear-gradient(275.48deg, #AA00FF -5.24%, #4A74FF 101.68%)" />
                        <LegendText>Logistics</LegendText>
                      </LegendItem>
                    </ChartLegend>
                  </ChartContent>
                </ChartCard>
              </LeftColumn>

              <RightColumn>
                <RightColumnContent>
                  <ConflictTitle>
                    Conflict frequency & escalation patterns
                  </ConflictTitle>

                  <ConflictCard>
                    <ConflictContent>
                      <ConflictHeader>Arguments occur every</ConflictHeader>
                      <ConflictFrequency>10–14 day</ConflictFrequency>
                      <ConflictDescription>
                        You tend to avoid while they escalate the Situation
                      </ConflictDescription>
                    </ConflictContent>
                  </ConflictCard>

                  <RepairCard>
                    <RepairContent>
                      <RepairHeader>Conflict repair attempts</RepairHeader>
                      <RepairDescription>
                        Apologies occur after 70% of disagreements
                      </RepairDescription>
                    </RepairContent>
                  </RepairCard>
                </RightColumnContent>
              </RightColumn>
            </TopRowContainer>

            <BottomRow>
              <BottomCard>
                <BottomCardTitle>Intimacy sentiment detection</BottomCardTitle>
                <BottomCardDescription>
                  Emotional vulnerability was last expressed 18 days ago
                </BottomCardDescription>
              </BottomCard>

              <BottomCard>
                <BottomCardTitle>Attachment indicators</BottomCardTitle>
                <BottomCardDescription>
                  Signs of anxious attachment: frequent reassurance seeking
                </BottomCardDescription>
              </BottomCard>
            </BottomRow>
          </MainContentContainer>
        </ContentContainer>
      </MainContainer>
    </>
  );
};

export default DemoAnalysisPage;
