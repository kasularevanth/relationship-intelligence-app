// frontend/src/components/DemoAnalysisModal.js
import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
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
      maxHeight: "900px",
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

const PieChart = styled(Box)({
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  position: "relative",
  background: `conic-gradient(
    #AF40FF 0deg 43.2deg,
    #4A74FF 43.2deg 360deg
  )`,
});

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
    height: "94px",
    paddingTop: "54px",
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
  flexDirection: "column",
  alignItems: "center",
  padding: "10px 22px",
  gap: "10px",
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.down("md")]: {
    padding: "10px 22px",
  },
}));

const AvatarContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  position: "relative",
  filter: "drop-shadow(-5.57143px 16.7143px 22.2857px rgba(0, 0, 0, 0.05))",
  marginBottom: "10px",
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

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: "0 25px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  overflowY: "auto",
  position: "relative",
  zIndex: 2,
  paddingBottom: "40px",
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

const AnalysisCard = styled(Box)({
  background: "var(--analysis-card-bg)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "12px",
  padding: "20px 15px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

const SectionTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "24px",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

const ScoreContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

const ScoreRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const ScoreLabel = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "21px",
  letterSpacing: "-0.175px",
  color: "var(--text-tertiary)",
});

const ScoreValue = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "21px",
  letterSpacing: "-0.175px",
  color: "var(--text-tertiary)",
});

const ProgressBar = styled(LinearProgress)({
  width: "100%",
  height: "10px",
  borderRadius: "35px",
  backgroundColor: "rgba(255, 255, 255, 0.14)",
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#FF9D00",
    borderRadius: "35px",
  },
});

const InsightCard = styled(Box)({
  background: "var(--analysis-card-bg)",
  borderRadius: "6px",
  padding: "10px 15px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

const InsightTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "21px",
  letterSpacing: "-0.165px",
  color: "var(--text-primary)",
});

const InsightValue = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "20px",
  lineHeight: "30px",
  letterSpacing: "-0.237px",
  color: "var(--text-primary)",
});

const InsightText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "18px",
  letterSpacing: "-0.237px",
  color: "var(--text-primary)",
});

const ChartContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "39px",
  padding: "20px 0",
});

const ChartCircle = styled(Box)({
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  position: "relative",
  background: `conic-gradient(
    var(--topic-affection-gradient) 0deg 43.2deg,
    var(--topic-logistics-gradient) 43.2deg 360deg
  )`,
});

const ChartLegend = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

const LegendItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

const LegendColor = styled(Box)(({ color }) => ({
  width: "16px",
  height: "16px",
  borderRadius: "20px",
  background: color,
}));

const LegendText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "18px",
  letterSpacing: "-0.123px",
  color: "var(--text-primary)",
});

const DemoAnalysisModal = () => {
  const { state, actions } = useGlobal();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleBack = () => {
    actions.showDemoChat();
  };

  return (
    <StyledDialog
      open={state.showDemoAnalysis}
      onClose={() => actions.hideAllModals()}
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

            <CoupleNameContainer>
              <CoupleName>Alex & Jordan</CoupleName>
            </CoupleNameContainer>

            <RelationshipTag>
              <FavoriteIcon
                sx={{ fontSize: "14px", color: "var(--text-primary)" }}
              />
              <TagText>Romantic</TagText>
            </RelationshipTag>
          </CoupleInfo>

          {/* Analysis Content */}
          <ContentContainer>
            {/* Emotional Health Score */}
            <AnalysisCard>
              <SectionTitle>
                <SentimentSatisfiedIcon sx={{ fontSize: "20px" }} />
                Emotional Health Score
              </SectionTitle>

              <ScoreContainer>
                <ScoreRow>
                  <ScoreLabel>Emotionally healthy</ScoreLabel>
                  <ScoreValue>76%</ScoreValue>
                </ScoreRow>
                <ProgressBar variant="determinate" value={76} />
              </ScoreContainer>
            </AnalysisCard>

            {/* Conflict Analysis */}
            <AnalysisCard>
              <SectionTitle>
                Conflict frequency & escalation patterns
              </SectionTitle>

              <InsightCard>
                <InsightTitle>Arguments occur every</InsightTitle>
                <InsightValue>10–14 day</InsightValue>
                <InsightText>
                  You tend to avoid while they escalate the Situation
                </InsightText>
              </InsightCard>

              <InsightCard>
                <InsightTitle>Conflict repair attempts</InsightTitle>
                <InsightText>
                  Apologies occur after 70% of disagreements
                </InsightText>
              </InsightCard>
            </AnalysisCard>

            {/* Conversation Ratios */}
            <AnalysisCard>
              <SectionTitle>
                Affection vs. logistical conversation ratios
              </SectionTitle>

              <ChartContainer>
                <PieChart />
                <ChartLegend>
                  <LegendItem>
                    <LegendColor color="linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)" />
                    <LegendText>Affection</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="linear-gradient(275.48deg, #AA00FF -5.24%, #4A74FF 101.68%)" />
                    <LegendText>Logistics</LegendText>
                  </LegendItem>
                </ChartLegend>
              </ChartContainer>
            </AnalysisCard>

            {/* Intimacy Detection */}
            <AnalysisCard>
              <SectionTitle>Intimacy sentiment detection</SectionTitle>
              <InsightText>
                Emotional vulnerability was last expressed 18 days ago
              </InsightText>
            </AnalysisCard>

            {/* Attachment Indicators */}
            <AnalysisCard>
              <SectionTitle>Attachment indicators</SectionTitle>
              <InsightText>
                Signs of anxious attachment: frequent reassurance seeking
              </InsightText>
            </AnalysisCard>
          </ContentContainer>
        </MainContainer>
      </DialogContent>
    </StyledDialog>
  );
};

export default DemoAnalysisModal;
