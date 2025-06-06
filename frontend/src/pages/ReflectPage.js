// frontend/src/pages/ReflectPage.js
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MicIcon from "@mui/icons-material/Mic";
import AssessmentIcon from "@mui/icons-material/Assessment";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useRelationships } from "../hooks/useRelationships";

// Styled components using exact CSS specifications
const PageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  background: "var(--primary-bg)",
  display: "flex",
  flexDirection: "column",
  color: "var(--text-primary)",
  overflow: "hidden",
  "@media (max-width: 768px)": {
    minHeight: "calc(100vh - 80px)",
  },
});

const BlurredBackground = styled(Box)({
  position: "absolute",
  width: "1099px",
  height: "719px",
  left: "612px",
  top: "-180px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  filter: "blur(151.688px)",
  zIndex: 0,
  "@media (max-width: 768px)": {
    width: "672px",
    height: "496px",
    left: "35px",
    top: "-17px",
    filter: "blur(97.6382px)",
  },
});

const ContentContainer = styled(Box)({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0px",
  gap: "30px",
  width: "1031px",
  height: "746px",
  margin: "151px auto 0",
  "@media (max-width: 768px)": {
    width: "260px",
    height: "460px",
    margin: "142px auto 0",
    gap: "33px",
  },
});

const MainSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0px",
  gap: "50px",
  width: "1031px",
  height: "556px",
  "@media (max-width: 768px)": {
    width: "260px",
    height: "427px",
    gap: "33px",
  },
});

const RelationshipsSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0px",
  gap: "20px",
  width: "1031px",
  height: "491px",
  "@media (max-width: 768px)": {
    width: "260px",
    height: "394px",
    gap: "13px",
  },
});

const PageTitle = styled(Typography)({
  width: "1031px",
  height: "33px",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "33px",
  textAlign: "center",
  letterSpacing: "-0.175532px",
  color: "#FFFFFF",
  "@media (max-width: 768px)": {
    width: "250px",
    height: "33px",
    fontSize: "20px",
    lineHeight: "33px",
  },
});

const RelationshipsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0px",
  gap: "23px",
  width: "1031px",
  height: "438px",
  "@media (max-width: 768px)": {
    width: "260px",
    height: "361px",
    gap: "7.72px",
  },
});

const RelationshipsGrid = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "14.8415px",
  gap: "14.84px",
  width: "1031px",
  height: "438px",
  "@media (max-width: 768px)": {
    padding: "0px",
    gap: "7.72px",
    width: "260px",
    height: "313.23px",
  },
});

const GridRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  padding: "0px",
  width: "1000.32px",
  height: "408px",
  "@media (max-width: 768px)": {
    width: "260px",
    height: "313.23px",
    flexDirection: "column",
    gap: "7.72px",
  },
});

const GridColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "0px",
  gap: "14.84px",
  width: "500.16px",
  height: "602.56px",
  "@media (max-width: 768px)": {
    width: "260px",
    height: "313.23px",
    gap: "7.72px",
  },
});

const ContactItem = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "14.8415px 0px",
  gap: "13.35px",
  width: "161.48px",
  height: "198.26px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
  },
  "@media (max-width: 768px)": {
    padding: "7.71513px 0px",
    gap: "6.94px",
    width: "83.94px",
    height: "103.31px",
  },
});

const ContactContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0px",
  gap: "20.02px",
  width: "161.48px",
  height: "168.58px",
  "@media (max-width: 768px)": {
    gap: "10.41px",
    width: "83.94px",
    height: "87.88px",
  },
});

const ContactAvatar = styled(Avatar)({
  width: "103.89px",
  height: "103.89px",
  "@media (max-width: 768px)": {
    width: "54.01px",
    height: "54.01px",
  },
});

const ContactInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0px",
  gap: "6.67px",
  width: "161.48px",
  height: "44.67px",
  "@media (max-width: 768px)": {
    gap: "3.47px",
    width: "83.94px",
    height: "23.47px",
  },
});

const ContactName = styled(Typography)({
  width: "161.48px",
  height: "23px",
  fontFamily: "var(--font-family-primary)",
  fontWeight: 500,
  fontSize: "17.8098px",
  lineHeight: "23px",
  textAlign: "center",
  letterSpacing: "-0.220196px",
  color: "var(--text-primary)",
  "@media (max-width: 768px)": {
    width: "83.94px",
    height: "12px",
    fontSize: "9.25816px",
    lineHeight: "12px",
    letterSpacing: "-0.114466px",
  },
});

const ContactTimestamp = styled(Typography)({
  width: "161.48px",
  height: "15px",
  fontFamily: "var(--font-family-primary)",
  fontStyle: "italic",
  fontWeight: 500,
  fontSize: "11.8732px",
  lineHeight: "15px",
  textAlign: "center",
  letterSpacing: "-0.220196px",
  color: "var(--text-tertiary)",
  "@media (max-width: 768px)": {
    width: "83.94px",
    height: "8px",
    fontSize: "6.17211px",
    lineHeight: "8px",
    letterSpacing: "-0.114466px",
  },
});

const PaginationContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0px",
  gap: "20px",
  width: "85px",
  height: "15px",
  "@media (max-width: 768px)": {
    gap: "6px",
    width: "42px",
    height: "10px",
  },
});

const PaginationDot = styled(Box)(({ active }) => ({
  width: "15px",
  height: "15px",
  background: active ? "#FFFFFF" : "rgba(255, 255, 255, 0.28)",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "@media (max-width: 768px)": {
    width: "10px",
    height: "10px",
  },
}));

const ActionButtonsContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "10px 20px",
  gap: "36px",
  width: "372px",
  height: "160px",
  position: "absolute",
  bottom: "0px",
  left: "50%",
  transform: "translateX(-50%)",
  "@media (max-width: 768px)": {
    width: "340px",
    height: "160px",
    bottom: "651px",
    position: "absolute",
  },
});

const ActionButton = styled(IconButton)(({ variant }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: variant === "primary" ? "15.3774px" : "13.6364px",
  gap: variant === "primary" ? "20.52px" : "17.05px",
  width: variant === "primary" ? "80px" : "60px",
  height: variant === "primary" ? "80px" : "60px",
  background: variant === "primary" ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)",
  border: variant === "primary" ? "none" : "1.36364px solid #353535",
  borderRadius: variant === "primary" ? "61.5565px" : "51.1364px",
  color: variant === "primary" ? "#000000" : "#FFFFFF",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    background: variant === "primary" ? "#f5f5f5" : "rgba(255, 255, 255, 0.12)",
  },
  "@media (max-width: 768px)": {
    padding: variant === "primary" ? "11.306px" : "10px",
    gap: variant === "primary" ? "15.09px" : "12.5px",
    width: variant === "primary" ? "58.82px" : "44px",
    height: variant === "primary" ? "58.82px" : "44px",
    borderRadius: variant === "primary" ? "45.2586px" : "37.5px",
  },
}));

const LoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "400px",
  width: "100%",
});

const ReflectPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Use the relationships hook
  const { relationships, loading, error } = useRelationships();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  // Constants for pagination
  const itemsPerPage = isMobile ? 9 : 6; // 3x3 on mobile, 2x3 on desktop

  // Calculate pagination
  const totalPages = Math.ceil(relationships.length / itemsPerPage);
  const currentRelationships = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return relationships.slice(startIndex, startIndex + itemsPerPage);
  }, [relationships, currentPage, itemsPerPage]);

  // Helper function to get initials
  const getInitials = useCallback((name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Helper function to format timestamp
  const getTimeAgo = useCallback((date) => {
    if (!date) return "Last: Recently";
    const now = new Date();
    const interactionDate = new Date(date);
    const diffMinutes = Math.floor((now - interactionDate) / (1000 * 60));

    if (diffMinutes < 60) {
      return `Last: ${diffMinutes || 1} min ago`;
    } else if (diffMinutes < 24 * 60) {
      const diffHours = Math.floor(diffMinutes / 60);
      return `Last: ${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffMinutes / (60 * 24));
      return `Last: ${diffDays}d ago`;
    }
  }, []);

  // Event handlers
  const handleContactClick = useCallback(
    (contactId) => {
      navigate(`/relationships/${contactId}`);
    },
    [navigate]
  );

  const handlePaginationClick = useCallback((pageIndex) => {
    setCurrentPage(pageIndex);
  }, []);

  const handleVoiceAction = useCallback(() => {
    // Navigate to voice session or show voice modal
    console.log("Voice action triggered");
  }, []);

  const handleAnalysisAction = useCallback(() => {
    // Navigate to analysis page
    navigate("/demo/analysis");
  }, [navigate]);

  const handleKeyboardAction = useCallback(() => {
    // Navigate to text input or conversation
    console.log("Keyboard action triggered");
  }, []);

  // Render relationships in grid format
  const renderRelationships = () => {
    if (isMobile) {
      // Mobile: 3x3 grid in single column
      const rows = [];
      for (let i = 0; i < currentRelationships.length; i += 3) {
        const rowItems = currentRelationships.slice(i, i + 3);
        rows.push(
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "7.72px",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {rowItems.map((relationship) => (
              <ContactItem
                key={relationship.id || relationship._id}
                onClick={() =>
                  handleContactClick(relationship.id || relationship._id)
                }
              >
                <ContactContent>
                  <ContactAvatar src={relationship.photoUrl}>
                    {!relationship.photoUrl &&
                      getInitials(relationship.contactName)}
                  </ContactAvatar>
                  <ContactInfo>
                    <ContactName>{relationship.contactName}</ContactName>
                    <ContactTimestamp>
                      {getTimeAgo(
                        relationship.lastInteraction || relationship.updatedAt
                      )}
                    </ContactTimestamp>
                  </ContactInfo>
                </ContactContent>
              </ContactItem>
            ))}
          </Box>
        );
      }
      return rows;
    } else {
      // Desktop: 2 columns x 3 rows
      const leftColumn = [];
      const rightColumn = [];

      currentRelationships.forEach((relationship, index) => {
        const contactElement = (
          <ContactItem
            key={relationship.id || relationship._id}
            onClick={() =>
              handleContactClick(relationship.id || relationship._id)
            }
            sx={{
              position: "absolute",
              left: index % 2 === 0 ? "0px" : "171.67px",
              top: `${Math.floor(index / 2) * 205.8}px`,
            }}
          >
            <ContactContent>
              <ContactAvatar src={relationship.photoUrl}>
                {!relationship.photoUrl &&
                  getInitials(relationship.contactName)}
              </ContactAvatar>
              <ContactInfo>
                <ContactName>{relationship.contactName}</ContactName>
                <ContactTimestamp>
                  {getTimeAgo(
                    relationship.lastInteraction || relationship.updatedAt
                  )}
                </ContactTimestamp>
              </ContactInfo>
            </ContactContent>
          </ContactItem>
        );

        if (index % 2 === 0) {
          leftColumn.push(contactElement);
        } else {
          rightColumn.push(contactElement);
        }
      });

      return (
        <GridRow>
          <GridColumn sx={{ position: "relative" }}>{leftColumn}</GridColumn>
          <GridColumn sx={{ position: "relative" }}>{rightColumn}</GridColumn>
        </GridRow>
      );
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <BlurredBackground />
        <LoadingContainer>
          <CircularProgress sx={{ color: "var(--text-primary)" }} />
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <BlurredBackground />
        <LoadingContainer>
          <Typography color="error">
            Failed to load relationships: {error.message}
          </Typography>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BlurredBackground />

      <ContentContainer>
        <MainSection>
          <RelationshipsSection>
            <PageTitle>Tap into your connection</PageTitle>

            <RelationshipsContainer>
              <RelationshipsGrid>
                {isMobile ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7.72px",
                    }}
                  >
                    {renderRelationships()}
                  </Box>
                ) : (
                  renderRelationships()
                )}
              </RelationshipsGrid>

              {/* Pagination dots */}
              {totalPages > 1 && (
                <PaginationContainer>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <PaginationDot
                      key={index}
                      active={currentPage === index}
                      onClick={() => handlePaginationClick(index)}
                    />
                  ))}
                </PaginationContainer>
              )}
            </RelationshipsContainer>
          </RelationshipsSection>
        </MainSection>

        {/* Action buttons */}
        <ActionButtonsContainer>
          <ActionButton variant="secondary" onClick={handleAnalysisAction}>
            <AssessmentIcon sx={{ fontSize: isMobile ? "24px" : "32.73px" }} />
          </ActionButton>

          <ActionButton variant="primary" onClick={handleVoiceAction}>
            <MicIcon sx={{ fontSize: isMobile ? "36.21px" : "49.25px" }} />
          </ActionButton>

          <ActionButton variant="secondary" onClick={handleKeyboardAction}>
            <KeyboardIcon sx={{ fontSize: isMobile ? "24px" : "32.73px" }} />
          </ActionButton>
        </ActionButtonsContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default ReflectPage;
