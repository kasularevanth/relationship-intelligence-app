// frontend/src/components/Home.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RouteIcon from "@mui/icons-material/Route";
import WorkIcon from "@mui/icons-material/Work";
import TargetIcon from "@mui/icons-material/GpsFixed";
import ZapIcon from "@mui/icons-material/Bolt";
import StarsIcon from "@mui/icons-material/Stars";
import { useAuth } from "../contexts/AuthContext";

// Styled components using CSS variables
const AnalysisContainer = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "var(--primary-bg)",
  color: "var(--text-primary)",
  padding: "20px 0",
});

const MainTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "28px",
  lineHeight: "42px",
  letterSpacing: "-0.175532px",
  color: "var(--text-primary)",
  marginBottom: "17px",
});

const UploadButton = styled(Button)({
  background: "var(--button-gradient)",
  borderRadius: "30px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "18px",
  lineHeight: "27px",
  letterSpacing: "-0.165px",
  padding: "8px 20px",
  textTransform: "none",
  marginBottom: "20px",
  "&:hover": {
    background: "var(--button-gradient)",
    opacity: 0.9,
  },
});

const SubtitleText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 300,
  fontSize: "18px",
  lineHeight: "27px",
  letterSpacing: "-0.175532px",
  color: "var(--text-primary)",
  marginBottom: "40px",
});

const AnalysisSection = styled(Box)({
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "12px",
  padding: "10px",
  marginBottom: "20px",
});

const SectionTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "24px",
  color: "var(--text-primary)",
  marginBottom: "15px",
});

const TopicCard = styled(Box)({
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "6px",
  padding: "10px 20px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  height: "110px",
});

const TopicIcon = styled(Box)(({ gradient }) => ({
  display: "flex",
  alignItems: "center",
  padding: "5.45455px",
  width: "30px",
  height: "30px",
  background: gradient,
  borderRadius: "68.1818px",
}));

const TopicContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: "5px",
  flex: 1,
});

const TopicName = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "22px",
  lineHeight: "33px",
  letterSpacing: "-0.165px",
  color: "var(--text-primary)",
});

const TopicPercentage = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "28px",
  lineHeight: "42px",
  textAlign: "center",
  letterSpacing: "-0.165px",
  color: "var(--text-primary)",
});

const InsightCard = styled(Box)({
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "12px",
  padding: "20px 15px",
  height: "138px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

const InsightHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "5px",
});

const InsightIconContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "7.27273px",
  width: "44.55px",
  height: "44.55px",
  borderRadius: "9.09091px",
});

const InsightTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "33px",
  color: "var(--text-primary)",
});

const InsightText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  color: "var(--text-primary)",
  flex: 1,
});

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const topicsData = [
    {
      name: "Affection",
      percentage: "--%",
      icon: <FavoriteIcon sx={{ fontSize: "19.09px", color: "#F5F5F5" }} />,
      gradient: "linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)",
    },
    {
      name: "Logistics",
      percentage: "--%",
      icon: <RouteIcon sx={{ fontSize: "19.09px", color: "#F5F5F5" }} />,
      gradient: "linear-gradient(275.48deg, #AA00FF -5.24%, #4A74FF 101.68%)",
    },
    {
      name: "Work",
      percentage: "--%",
      icon: <WorkIcon sx={{ fontSize: "19.09px", color: "#F5F5F5" }} />,
      gradient: "linear-gradient(151.07deg, #D80051 13.14%, #FF8774 85.75%)",
    },
    {
      name: "Future Plan",
      percentage: "--%",
      icon: <TargetIcon sx={{ fontSize: "19.09px", color: "#F5F5F5" }} />,
      gradient: "linear-gradient(151.07deg, #DD1B0A 13.14%, #FF8000 84.35%)",
    },
  ];

  const insightsData = [
    {
      title: "Power Dynamics",
      text: "You initiate 85% of conversations. You apologize 2x more often.",
      icon: <ZapIcon sx={{ fontSize: "30px", color: "#F5F5F5" }} />,
    },
    {
      title: "AI Observations",
      text: "There's emotional effort, but unmet needs beneath the surface",
      icon: <StarsIcon sx={{ fontSize: "25.45px", color: "#F5F5F5" }} />,
    },
  ];

  const handleGetStarted = () => {
    if (currentUser) {
      // If user is logged in, go to the relationship selection page
      navigate("/add-relationship");
    } else {
      // If user is not logged in, go to register
      navigate("/register");
    }
  };

  return (
    <AnalysisContainer>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <MainTitle>
            What does AI really think about your relationship?
          </MainTitle>

          <UploadButton onClick={handleGetStarted}>Get Started</UploadButton>

          <SubtitleText>Upload your conversations and get.</SubtitleText>
        </Box>

        {/* Topics Section */}
        <AnalysisSection>
          <Box sx={{ p: "10px" }}>
            <SectionTitle>Topics You Talk About Most</SectionTitle>

            <Grid container spacing={2}>
              {topicsData.map((topic, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <TopicCard>
                    <TopicContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          mb: 1,
                        }}
                      >
                        <TopicIcon gradient={topic.gradient}>
                          {topic.icon}
                        </TopicIcon>
                        <TopicName>{topic.name}</TopicName>
                      </Box>
                    </TopicContent>
                    <TopicPercentage>{topic.percentage}</TopicPercentage>
                  </TopicCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </AnalysisSection>

        {/* Insights Section */}
        <Grid container spacing={2}>
          {insightsData.map((insight, index) => (
            <Grid item xs={12} md={6} key={index}>
              <InsightCard>
                <InsightHeader>
                  <InsightIconContainer>{insight.icon}</InsightIconContainer>
                  <InsightTitle>{insight.title}</InsightTitle>
                </InsightHeader>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    px: "5px",
                  }}
                >
                  <InsightText>{insight.text}</InsightText>
                </Box>
              </InsightCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </AnalysisContainer>
  );
};

export default Home;
