// frontend/src/pages/RelationshipCircle.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobal } from "../contexts/GlobalContext";
import { useRelationships } from "../hooks/useRelationships";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Container,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { navigateToVoiceQuestion } from "../utils/navigationUtils";

// Styled Components - Exact design matching the images
const StyledContainer = styled(Container)({
  background: "var(--primary-bg)",
  minHeight: "100vh",
  padding: 0,
  maxWidth: "100% !important",
  position: "relative",
  overflow: "hidden",
  "@media (max-width: 768px)": {
    maxWidth: "100% !important",
    padding: "0 !important",
    margin: "0 !important",
    minHeight: "100dvh",
  },
});

// Background blur effect matching the CSS specs
const BlurBackground = styled(Box)({
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
    left: "11px",
    top: "-128px",
    opacity: 0.6,
    filter: "blur(97.6382px)",
  },
});

const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "50px 20px 0 20px",
  gap: "19px",
  background: "transparent",
  position: "relative",
  zIndex: 2,
  "@media (max-width: 768px)": {
    padding: "10px 25px 0 25px",
    gap: "15px",
  },
});

const BackButton = styled(IconButton)({
  color: "var(--text-primary)",
  width: "34px",
  height: "34px",
  padding: 0,
  "& .MuiSvgIcon-root": {
    fontSize: "24px",
  },
  "@media (max-width: 768px)": {
    width: "24px",
    height: "24px",
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
    },
  },
});

const HeaderTitle = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "22px",
  lineHeight: "29px",
  color: "var(--text-primary)",
  letterSpacing: "-0.165px",
  "@media (max-width: 768px)": {
    fontSize: "18px",
    lineHeight: "24px",
  },
});

const ProfileSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px 20px",
  gap: "22px",
  position: "relative",
  zIndex: 2,
  "@media (max-width: 768px)": {
    padding: "40px 20px",
    gap: "22px",
  },
});

const AvatarContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  position: "relative",
  marginBottom: "20px",
  filter: "drop-shadow(-7.99419px 23.9826px 31.9767px rgba(0, 0, 0, 0.05))",
  "@media (max-width: 768px)": {
    filter: "drop-shadow(-5.57143px 16.7143px 22.2857px rgba(0, 0, 0, 0.05))",
  },
});

const UserAvatar = styled(Avatar)({
  width: "111.92px",
  height: "111.92px",
  border: "3px solid #FFFFFF",
  zIndex: 2,
  fontSize: "28px",
  fontWeight: 600,
  fontFamily: "var(--font-family-secondary)",
  background: "#4A90E2",
  "@media (max-width: 768px)": {
    width: "78px",
    height: "78px",
    fontSize: "22px",
  },
});

const PartnerAvatar = styled(Avatar)({
  width: "111.92px",
  height: "111.92px",
  border: "3px solid #FFFFFF",
  marginLeft: "-30px",
  zIndex: 1,
  fontSize: "28px",
  fontWeight: 600,
  fontFamily: "var(--font-family-secondary)",
  background: "#F5A623",
  "@media (max-width: 768px)": {
    width: "78px",
    height: "78px",
    fontSize: "22px",
    marginLeft: "-20px",
  },
});

const CoupleNameContainer = styled(Box)({
  background: "rgba(255, 255, 255, 0.08)",
  borderRadius: "20.9766px",
  padding: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "15px",
  "@media (max-width: 768px)": {
    padding: "5.59375px 6.99219px",
    marginBottom: "10px",
  },
});

const CoupleName = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: "23px",
  color: "#FFFFFF",
  letterSpacing: "-0.115371px",
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "21px",
  },
});

const RelationshipTag = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "3px 10px",
  gap: "3px",
  background: "linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)",
  borderRadius: "25px",
  "@media (max-width: 768px)": {
    padding: "3px 10px",
    gap: "3px",
  },
});

const TagText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "12px",
  lineHeight: "18px",
  color: "#FFFFFF",
  letterSpacing: "-0.122735px",
  "@media (max-width: 768px)": {
    fontSize: "10px",
    lineHeight: "15px",
  },
});

const ActionSection = styled(Box)({
  padding: "0 100px 100px 100px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  flex: 1,
  position: "relative",
  zIndex: 2,
  "@media (max-width: 768px)": {
    padding: "0 25px 100px 25px",
    gap: "20px",
  },
});

const UploadButton = styled(Button)({
  width: "441px",
  height: "58px",
  background:
    "linear-gradient(90.81deg, #4E7FFF 4.7%, #0047FF 96.51%) !important",
  borderRadius: "30px",
  color: "#F5F5F5 !important",
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "20px",
  lineHeight: "26px",
  textTransform: "none",
  letterSpacing: "-0.165px",
  position: "relative",
  "&:hover": {
    background:
      "linear-gradient(90.81deg, #2557E5 4.7%, #0047FF 96.51%) !important",
    transform: "translateY(-1px)",
  },
  transition: "all 0.2s ease",
  "@media (max-width: 768px)": {
    width: "325px",
    height: "41px",
    fontSize: "16px",
    lineHeight: "21px",
  },
});

const AnalyzeButton = styled(Button)({
  width: "441px",
  height: "58px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: "30px",
  color: "#F5F5F5",
  fontFamily: "var(--font-family-primary)",
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: "26px",
  textTransform: "none",
  letterSpacing: "-0.165px",
  "&:hover": {
    background:
      "linear-gradient(180deg, rgba(20, 35, 84, 0.6) 0%, rgba(38, 54, 110, 0.6) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    transform: "translateY(-1px)",
  },
  transition: "all 0.2s ease",
  "@media (max-width: 768px)": {
    width: "325px",
    height: "41px",
    fontSize: "16px",
    lineHeight: "21px",
  },
});

const ErrorMessage = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  color: "var(--text-secondary)",
  textAlign: "center",
  padding: "20px",
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "12px",
  margin: "20px",
});

const RelationshipCircle = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { relationshipId } = useParams();
  const { state, actions } = useGlobal();
  const { currentUser } = useAuth();
  const [currentRelationship, setCurrentRelationship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get relationships from hook as fallback
  const { relationships: hookRelationships } = useRelationships();

  // FIXED: Optimized useEffect with stable dependencies only
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const findAndSetRelationship = () => {
      // Early exit if no relationship identifier
      if (!relationshipId && !state.selectedRelationship) {
        if (isMounted) {
          setError("No relationship selected");
          setIsLoading(false);
          setTimeout(() => {
            if (isMounted) navigate("/dashboard");
          }, 2000);
        }
        return;
      }

      let relationship = null;

      // Try to find relationship by ID
      if (relationshipId) {
        // First check global state
        relationship = state.relationships?.find(
          (rel) => (rel.id || rel._id) === relationshipId
        );

        // Then check hook relationships
        if (!relationship && hookRelationships?.length > 0) {
          relationship = hookRelationships.find(
            (rel) => (rel.id || rel._id) === relationshipId
          );
        }
      }

      // Fallback to selected relationship
      if (!relationship && state.selectedRelationship) {
        relationship = state.selectedRelationship;
      }

      if (isMounted) {
        if (relationship) {
          setCurrentRelationship(relationship);
          setError(null);

          // Only update global state if it's different
          if (
            actions.setSelectedRelationship &&
            (!state.selectedRelationship ||
              (state.selectedRelationship.id ||
                state.selectedRelationship._id) !==
                (relationship.id || relationship._id))
          ) {
            actions.setSelectedRelationship(relationship);
          }
        } else if (relationshipId) {
          setError(`Relationship with ID ${relationshipId} not found`);
          setTimeout(() => {
            if (isMounted) navigate("/dashboard");
          }, 3000);
        }

        setIsLoading(false);
      }
    };

    findAndSetRelationship();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [relationshipId]); // MINIMAL DEPENDENCIES - only relationshipId changes should trigger this

  // Separate effect for handling relationship data updates
  useEffect(() => {
    if (
      !isLoading &&
      !currentRelationship &&
      (state.relationships?.length > 0 || hookRelationships?.length > 0)
    ) {
      // Re-try finding relationship if data becomes available
      if (relationshipId) {
        const relationship =
          state.relationships?.find(
            (rel) => (rel.id || rel._id) === relationshipId
          ) ||
          hookRelationships?.find(
            (rel) => (rel.id || rel._id) === relationshipId
          );
        if (relationship) {
          setCurrentRelationship(relationship);
          setError(null);
        }
      }
    }
  }, [
    state.relationships,
    hookRelationships,
    relationshipId,
    isLoading,
    currentRelationship,
  ]);

  // Get the first name for display
  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "Friend";
  };

  // Get user initials from current user
  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } else if (currentUser?.name) {
      return currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } else if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return "Y";
  };

  // Get partner initials
  const getPartnerInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user profile photo
  const getUserPhoto = () => {
    return currentUser?.photoURL || currentUser?.avatar || null;
  };

  // FIXED: Get partner photo or initials
  const getPartnerPhoto = () => {
    return currentRelationship?.photoUrl || currentRelationship?.photo || null;
  };

  // Get icon for relationship type
  const getRelationshipIcon = (type) => {
    const lowerType = type?.toLowerCase();
    switch (lowerType) {
      case "romantic":
        return <FavoriteIcon sx={{ fontSize: "17px", color: "#FFFFFF" }} />;
      case "family":
        return (
          <FamilyRestroomIcon sx={{ fontSize: "17px", color: "#FFFFFF" }} />
        );
      case "friendship":
        return <PeopleIcon sx={{ fontSize: "17px", color: "#FFFFFF" }} />;
      case "professional":
        return <WorkIcon sx={{ fontSize: "17px", color: "#FFFFFF" }} />;
      case "mentor":
        return <SchoolIcon sx={{ fontSize: "17px", color: "#FFFFFF" }} />;
      case "other":
        return <MoreHorizIcon sx={{ fontSize: "17px", color: "#FFFFFF" }} />;
      default:
        return <PersonIcon sx={{ fontSize: "17px", color: "#FFFFFF" }} />;
    }
  };

  const handleUploadChats = () => {
    console.log(
      "Navigating to import chat page for:",
      currentRelationship?.contactName
    );
    navigate(`/relationship-circle/${relationshipId}/import`);
  };

  // UPDATED: Navigate to voice question page instead of demo chat
  const handleAnalyzeWithoutChats = () => {
    // Simple navigation to questions page - no parameters needed since no conversations
    navigate(`/relationships/${relationshipId}/questions`);
  };
  const handleBackClick = () => {
    navigate("/dashboard");
  };

  // Loading state
  if (isLoading) {
    return (
      <StyledContainer>
        <BlurBackground />
        <Header>
          <BackButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </BackButton>
          <HeaderTitle>My Circle</HeaderTitle>
        </Header>
      </StyledContainer>
    );
  }

  // Error state
  if (error && !currentRelationship) {
    return (
      <StyledContainer>
        <BlurBackground />
        <Header>
          <BackButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </BackButton>
          <HeaderTitle>My Circle</HeaderTitle>
        </Header>
        <ErrorMessage>
          {error}
          <br />
          <br />
          Redirecting to dashboard...
        </ErrorMessage>
      </StyledContainer>
    );
  }

  // No relationship found
  if (!currentRelationship) {
    return (
      <StyledContainer>
        <BlurBackground />
        <Header>
          <BackButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </BackButton>
          <HeaderTitle>My Circle</HeaderTitle>
        </Header>
        <ErrorMessage>
          Relationship not found. Redirecting to dashboard...
        </ErrorMessage>
      </StyledContainer>
    );
  }

  const userPhoto = getUserPhoto();
  const userInitials = getUserInitials();
  const partnerPhoto = getPartnerPhoto();
  const partnerInitials = getPartnerInitials(currentRelationship.contactName);

  // Capitalize relationship type for display
  const displayRelationshipType = currentRelationship.relationshipType
    ? currentRelationship.relationshipType.charAt(0).toUpperCase() +
      currentRelationship.relationshipType.slice(1).toLowerCase()
    : "Relationship";

  return (
    <StyledContainer>
      <BlurBackground />

      {/* Header - ALWAYS LEFT ARROW + MY CIRCLE */}
      <Header>
        <BackButton onClick={handleBackClick}>
          <ArrowBackIcon />
        </BackButton>
        <HeaderTitle>My Circle</HeaderTitle>
      </Header>

      {/* Profile Section */}
      <ProfileSection>
        <AvatarContainer>
          {/* User Avatar - Left Side - Shows photo if available, otherwise initials */}
          <UserAvatar src={userPhoto} sx={{ backgroundColor: "#4A90E2" }}>
            {!userPhoto && userInitials}
          </UserAvatar>

          {/* Partner Avatar - Right Side - Shows photo if available, otherwise initials */}
          <PartnerAvatar src={partnerPhoto} sx={{ backgroundColor: "#F5A623" }}>
            {!partnerPhoto && partnerInitials}
          </PartnerAvatar>
        </AvatarContainer>

        <CoupleNameContainer>
          <CoupleName>
            You & {getFirstName(currentRelationship.contactName)}
          </CoupleName>
        </CoupleNameContainer>

        <RelationshipTag>
          {getRelationshipIcon(currentRelationship.relationshipType)}
          <TagText>{displayRelationshipType}</TagText>
        </RelationshipTag>
      </ProfileSection>

      {/* Action Section - CENTERED BUTTONS */}
      <ActionSection>
        <AnalyzeButton onClick={handleAnalyzeWithoutChats}>
          Tell CLO About this Person
        </AnalyzeButton>
        <UploadButton onClick={handleUploadChats}>Upload My Chats</UploadButton>
      </ActionSection>
    </StyledContainer>
  );
};

export default RelationshipCircle;
