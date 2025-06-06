// frontend/src/pages/RelationshipCircle.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../contexts/GlobalContext";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Container,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";

// Random avatar images from internet
const RANDOM_AVATARS = {
  male: [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face",
  ],
  female: [
    "https://images.unsplash.com/photo-1494790108755-2616b612b829?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  ],
  user: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
};

// Styled Components
const StyledContainer = styled(Container)({
  background: "var(--primary-bg)",
  minHeight: "100vh",
  padding: 0,
  maxWidth: "100% !important",
  "@media (max-width: 768px)": {
    maxWidth: "100% !important",
    padding: "0 !important",
    margin: "0 !important",
  },
});

const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "15px 20px",
  gap: "15px",
  background: "var(--primary-bg)",
});

const MenuButton = styled(IconButton)({
  color: "var(--text-primary)",
  width: "26px",
  height: "26px",
  padding: 0,
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
  },
});

const HeaderTitle = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "18px",
  lineHeight: "24px",
  color: "var(--text-primary)",
});

const ProfileSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px 20px",
  gap: "20px",
});

const AvatarContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  position: "relative",
  marginBottom: "20px",
});

const ProfileAvatar = styled(Avatar)({
  width: "100px",
  height: "100px",
  border: "3px solid #FFFFFF",
  zIndex: 2,
  fontSize: "16px",
  fontWeight: 600,
  fontFamily: "var(--font-family-secondary)",
});

const PartnerAvatar = styled(Avatar)({
  width: "100px",
  height: "100px",
  border: "3px solid #FFFFFF",
  marginLeft: "-30px",
  zIndex: 1,
  fontSize: "16px",
  fontWeight: 600,
  fontFamily: "var(--font-family-secondary)",
});

const CoupleNameContainer = styled(Box)({
  background: "rgba(255, 255, 255, 0.08)",
  borderRadius: "25px",
  padding: "8px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "12px",
});

const CoupleName = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: "24px",
  color: "#FFFFFF",
});

const RelationshipTag = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 16px",
  gap: "6px",
  background: "linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)",
  borderRadius: "25px",
});

const TagText = styled(Typography)({
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "12px",
  lineHeight: "18px",
  color: "#FFFFFF",
});

const ActionSection = styled(Box)({
  padding: "0 20px 100px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  flex: 1,
});

const UploadButton = styled(Button)({
  width: "100%",
  height: "60px",
  background: "#366EFF !important",
  borderRadius: "30px",
  color: "#FFFFFF !important",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  fontSize: "18px",
  lineHeight: "24px",
  textTransform: "none",
  "&:hover": {
    background: "#2557FF !important",
    transform: "translateY(-1px)",
  },
  transition: "all 0.2s ease",
});

const AnalyzeButton = styled(Button)({
  width: "100%",
  height: "60px",
  background: "transparent",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "30px",
  color: "#FFFFFF",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  fontSize: "18px",
  lineHeight: "24px",
  textTransform: "none",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.5)",
    transform: "translateY(-1px)",
  },
  transition: "all 0.2s ease",
});

const RelationshipCircle = () => {
  const navigate = useNavigate();
  const { state, actions } = useGlobal();
  const formData = state.newRelationshipForm;

  // Get the first name for display
  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "Friend";
  };

  // Get random avatar based on name
  const getRandomAvatar = (name, gender = "male") => {
    if (!name) return RANDOM_AVATARS.user;

    const avatars = RANDOM_AVATARS[gender];
    const index = name.charCodeAt(0) % avatars.length;
    return avatars[index];
  };

  // Determine gender from relationship type or name (simple heuristic)
  const getGenderFromContext = (name, relationshipType) => {
    const femaleNames = [
      "ana",
      "anna",
      "maria",
      "sarah",
      "jane",
      "emily",
      "lisa",
      "amy",
      "jessica",
      "ashley",
      "bhavana",
    ];
    const lowerName = name.toLowerCase();

    if (femaleNames.some((fName) => lowerName.includes(fName))) {
      return "female";
    }

    if (relationshipType === "Romantic") {
      // 50/50 chance for romantic relationships
      return Math.random() > 0.5 ? "female" : "male";
    }

    return "male"; // default
  };

  const handleUploadChats = () => {
    // Handle chat upload functionality
    console.log("Upload chats clicked");
    alert(
      "📁 Chat upload functionality would be implemented here.\n\nThis would allow users to upload WhatsApp chat exports for analysis."
    );
  };

  const handleAnalyzeWithoutChats = () => {
    // Show demo chat modal
    actions.showDemoChat();
  };

  const handleMenuClick = () => {
    // Handle menu/sidebar opening
    console.log("Menu clicked");
    navigate("/dashboard");
  };

  // Generate initials for avatars as fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get partner gender and avatar
  const partnerGender = getGenderFromContext(
    formData.name,
    formData.relationshipType
  );
  const partnerAvatar = getRandomAvatar(formData.name, partnerGender);
  const userAvatar = RANDOM_AVATARS.user;

  return (
    <StyledContainer>
      {/* Header - SINGLE HEADER ONLY */}
      <Header>
        <MenuButton onClick={handleMenuClick}>
          <MenuIcon />
        </MenuButton>
        <HeaderTitle>My Circle</HeaderTitle>
      </Header>

      {/* Profile Section */}
      <ProfileSection>
        <AvatarContainer>
          <ProfileAvatar
            src={userAvatar}
            sx={{ backgroundColor: "#4A90E2" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          >
            Y
          </ProfileAvatar>
          <ProfileAvatar
            src={partnerAvatar}
            sx={{
              backgroundColor: "#F5A623",
              marginLeft: "-30px",
              zIndex: 1,
              display: "none",
            }}
          >
            {getInitials("You")}
          </ProfileAvatar>

          <PartnerAvatar
            src={partnerAvatar}
            sx={{ backgroundColor: "#F5A623" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          >
            {getInitials(formData.name)}
          </PartnerAvatar>
          <PartnerAvatar
            sx={{
              backgroundColor: "#F5A623",
              display: "none",
            }}
          >
            {getInitials(formData.name)}
          </PartnerAvatar>
        </AvatarContainer>

        <CoupleNameContainer>
          <CoupleName>You & {getFirstName(formData.name)}</CoupleName>
        </CoupleNameContainer>

        <RelationshipTag>
          <FavoriteIcon sx={{ fontSize: "16px", color: "#FFFFFF" }} />
          <TagText>{formData.relationshipType || "Relationship"}</TagText>
        </RelationshipTag>
      </ProfileSection>

      {/* Action Section */}
      <ActionSection>
        <UploadButton onClick={handleUploadChats}>Upload My Chats</UploadButton>

        <AnalyzeButton onClick={handleAnalyzeWithoutChats}>
          Analyze without chats
        </AnalyzeButton>
      </ActionSection>
    </StyledContainer>
  );
};

export default RelationshipCircle;
