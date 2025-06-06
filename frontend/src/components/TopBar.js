// frontend/src/components/TopBar.js
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const TopBarContainer = styled(Box)(({ isMobile }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: isMobile ? "16px 20px" : "24px 40px",
  backgroundColor: "var(--primary-bg)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  width: "100%",
  minHeight: isMobile ? "60px" : "80px",
  position: "relative",
  zIndex: 10,
}));

const LeftSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    marginLeft: "50px", // Space for the hamburger menu button
  },
}));

const SoulSyncLogo = styled(Typography)(({ isMobile }) => ({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 900,
  fontSize: isMobile ? "24px" : "36px",
  lineHeight: isMobile ? "31px" : "47px",
  letterSpacing: "-0.310588px",
  background: "linear-gradient(277.34deg, #1152FF -7.69%, #ABC3FF 96.27%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

const RightSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const ProfileAvatar = styled(Avatar)(({ isMobile }) => ({
  width: isMobile ? "36px" : "44px",
  height: isMobile ? "36px" : "44px",
  backgroundColor: "#FFFFFF",
  color: "#366EFF",
  fontFamily: "var(--font-family-primary)",
  fontWeight: 700,
  fontSize: isMobile ? "16px" : "18px",
  cursor: "pointer",
  border: "2px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
    border: "2px solid #366EFF",
  },
}));

const TopBar = ({ showProfile = true }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Memoized helper function for getting initials
  const getInitials = useCallback((name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Memoized profile data similar to Profile component
  const profileData = useMemo(
    () => ({
      displayName: currentUser?.displayName || currentUser?.name || "",
      email: currentUser?.email || "",
      photoURL: currentUser?.photoURL || currentUser?.avatar || null,
    }),
    [currentUser]
  );

  // Memoized initials
  const userInitials = useMemo(() => {
    return getInitials(profileData.displayName || profileData.email);
  }, [getInitials, profileData.displayName, profileData.email]);

  // Memoized profile photo
  const profilePhoto = useMemo(() => {
    return profileData.photoURL;
  }, [profileData.photoURL]);

  // Handle image error
  const handleImageError = useCallback((e) => {
    console.error("Error loading profile image:", e.target.src);
    // Hide the image and show initials instead
    e.target.style.display = "none";
  }, []);

  return (
    <TopBarContainer isMobile={isMobile}>
      <LeftSection>
        <SoulSyncLogo isMobile={isMobile} onClick={handleLogoClick}>
          SoulSync
        </SoulSyncLogo>
      </LeftSection>

      <RightSection>
        {showProfile && currentUser && (
          <IconButton onClick={handleProfileClick} sx={{ padding: 0 }}>
            <ProfileAvatar isMobile={isMobile}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  onError={handleImageError}
                />
              ) : (
                userInitials
              )}
            </ProfileAvatar>
          </IconButton>
        )}
      </RightSection>
    </TopBarContainer>
  );
};

export default TopBar;
