import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Box,
  Typography,
  Button,
  Container,
  Avatar,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import { useRelationships } from "../hooks/useRelationships";

// Styled components using CSS variables
const ProfileContainer = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "var(--primary-bg)",
  color: "var(--text-primary)",
  padding: "20px 0",
});

const ProfileHeader = styled(Box)({
  background: "var(--analysis-card-bg)",
  borderRadius: "var(--border-radius-sidebar)",
  padding: "30px",
  marginBottom: "30px",
  backdropFilter: "blur(2.5px)",
});

const ProfileAvatar = styled(Avatar)({
  width: "120px",
  height: "120px",
  backgroundColor: "var(--sidebar-item-active)",
  fontSize: "48px",
  fontWeight: "bold",
  marginBottom: "20px",
  "@media (max-width: 768px)": {
    width: "80px",
    height: "80px",
    fontSize: "32px",
  },
});

const StatsCard = styled(Card)({
  background: "var(--analysis-card-bg)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "var(--border-radius-sidebar)",
  border: "none",
  height: "100%",
});

const StatsIcon = styled(Box)(({ gradient }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "50px",
  height: "50px",
  background: gradient || "var(--sidebar-item-active)",
  borderRadius: "50%",
  marginBottom: "15px",
}));

const ActionButton = styled(Button)({
  background: "var(--button-gradient)",
  color: "var(--text-primary)",
  borderRadius: "30px",
  padding: "10px 25px",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    background: "var(--button-gradient)",
    opacity: 0.9,
  },
});

const SecondaryButton = styled(Button)({
  border: "1px solid var(--border-color)",
  color: "var(--text-primary)",
  borderRadius: "30px",
  padding: "10px 25px",
  fontFamily: "var(--font-family-secondary)",
  fontWeight: 500,
  textTransform: "none",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "var(--hamburger-hover-bg)",
  },
});

const InfoCard = styled(Box)({
  background: "var(--analysis-card-bg)",
  backdropFilter: "blur(2.5px)",
  borderRadius: "var(--border-radius-sidebar)",
  padding: "25px",
  marginBottom: "20px",
});

// Memoized components for better performance
const StatsCardMemo = React.memo(({ stat, isMobile }) => (
  <StatsCard>
    <CardContent sx={{ textAlign: "center", p: 3 }}>
      <StatsIcon gradient={stat.gradient}>{stat.icon}</StatsIcon>
      <Typography
        variant="h3"
        sx={{
          fontFamily: "var(--font-family-secondary)",
          fontWeight: 700,
          color: "var(--text-primary)",
          mb: 1,
          fontSize: isMobile ? "32px" : "40px",
        }}
      >
        {stat.value}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "var(--text-tertiary)",
          fontWeight: 500,
        }}
      >
        {stat.title}
      </Typography>
    </CardContent>
  </StatsCard>
));

const QuickActionButton = React.memo(
  ({ onClick, icon, text, isLogout = false }) => (
    <Button
      onClick={onClick}
      fullWidth
      sx={{
        backgroundColor: "transparent",
        border: `1px solid ${
          isLogout ? "var(--input-border-error)" : "var(--border-color)"
        }`,
        color: isLogout ? "var(--input-border-error)" : "var(--text-primary)",
        justifyContent: "flex-start",
        padding: "12px 16px",
        "&:hover": {
          backgroundColor: isLogout
            ? "rgba(255, 68, 68, 0.1)"
            : "var(--hamburger-hover-bg)",
        },
      }}
    >
      {icon}
      {text}
    </Button>
  )
);

const ProfileAvatarMemo = React.memo(
  ({ profilePhoto, initials, onUploadPhoto, onImageError }) => (
    <Box sx={{ position: "relative", textAlign: "center" }}>
      <ProfileAvatar>
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt="Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={onImageError}
          />
        ) : (
          initials
        )}
      </ProfileAvatar>
      <IconButton
        onClick={onUploadPhoto}
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          backgroundColor: "var(--sidebar-item-active)",
          color: "var(--text-primary)",
          "&:hover": {
            backgroundColor: "var(--sidebar-item-active)",
            opacity: 0.8,
          },
        }}
      >
        <PhotoCameraIcon />
      </IconButton>
    </Box>
  )
);

const Profile = React.memo(() => {
  const { currentUser, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Use relationships hook - single API call with caching (shared with Dashboard)
  const { statistics, loading, error, isCached } = useRelationships();

  // Memoized helper functions
  const getInitials = useCallback((name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return "Unknown";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Memoized profile data
  const profileData = useMemo(
    () => ({
      displayName: currentUser?.displayName || currentUser?.name || "User",
      email: currentUser?.email || "",
      photoURL: currentUser?.photoURL || currentUser?.avatar || null,
      googleId: currentUser?.googleId || null,
      accountType: currentUser?.accountType || "Free Account",
    }),
    [currentUser]
  );

  // Memoized user join date
  const joinDate = useMemo(() => {
    if (currentUser?.metadata?.creationTime) {
      return new Date(currentUser.metadata.creationTime);
    } else if (currentUser?.createdAt) {
      return new Date(currentUser.createdAt);
    } else {
      return new Date(2024, 0, 15); // Default fallback
    }
  }, [currentUser]);

  // Memoized initials
  const userInitials = useMemo(() => {
    return getInitials(profileData.displayName || currentUser?.email);
  }, [getInitials, profileData.displayName, currentUser?.email]);

  // Memoized profile photo
  const profilePhoto = useMemo(() => {
    return profileData.photoURL || currentUser?.photoURL;
  }, [profileData.photoURL, currentUser?.photoURL]);

  // Memoized stats data
  const statsData = useMemo(
    () => [
      {
        title: "Relationships",
        value: statistics?.totalRelationships || 0,
        icon: <FavoriteIcon sx={{ fontSize: "24px", color: "#FFF" }} />,
        gradient: "var(--topic-affection-gradient)",
      },
      {
        title: "Conversations",
        value: statistics?.totalConversations || 0,
        icon: <ChatIcon sx={{ fontSize: "24px", color: "#FFF" }} />,
        gradient: "var(--topic-logistics-gradient)",
      },
      {
        title: "Total Messages",
        value: statistics?.totalMessages || 0,
        icon: <TrendingUpIcon sx={{ fontSize: "24px", color: "#FFF" }} />,
        gradient: "var(--topic-work-gradient)",
      },
    ],
    [statistics]
  );

  // Memoized formatted date
  const formattedJoinDate = useMemo(
    () => formatDate(joinDate),
    [formatDate, joinDate]
  );

  // Optimized event handlers with useCallback
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }, [logout, navigate]);

  const handleEditProfile = useCallback(() => {
    console.log("Edit profile clicked");
  }, []);

  const handleUploadPhoto = useCallback(() => {
    console.log("Upload photo clicked");
  }, []);

  const handleImageError = useCallback(
    (e) => {
      console.error("Error loading profile image:", e.target.src);
      e.target.style.display = "none";
      e.target.parentElement.innerHTML = userInitials;
    },
    [userInitials]
  );

  // Navigation handlers
  const navigateToAnalysis = useCallback(
    () => navigate("/analysis"),
    [navigate]
  );
  const navigateToDashboard = useCallback(
    () => navigate("/dashboard"),
    [navigate]
  );
  const navigateToSettings = useCallback(
    () => navigate("/settings"),
    [navigate]
  );

  if (loading) {
    return (
      <ProfileContainer>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress sx={{ color: "var(--text-primary)" }} />
          </Box>
        </Container>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              backgroundColor: "var(--alert-error-bg)",
              color: "var(--alert-error-text)",
              mb: 3,
            }}
          >
            Failed to load profile data: {error.message}
          </Alert>
        )}

        {/* Profile Header */}
        <ProfileHeader>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "flex-start",
              gap: 3,
            }}
          >
            {/* Profile Picture */}
            <ProfileAvatarMemo
              profilePhoto={profilePhoto}
              initials={userInitials}
              onUploadPhoto={handleUploadPhoto}
              onImageError={handleImageError}
            />

            {/* Profile Info */}
            <Box sx={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  mb: 1,
                  fontSize: isMobile ? "24px" : "32px",
                }}
              >
                {profileData.displayName}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "var(--text-tertiary)",
                  mb: 2,
                  fontSize: "16px",
                }}
              >
                {profileData.email}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: isMobile ? "center" : "flex-start",
                  mb: 3,
                }}
              >
                <CalendarTodayIcon
                  sx={{ fontSize: "18px", color: "var(--text-quaternary)" }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "var(--text-quaternary)" }}
                >
                  Joined {formattedJoinDate}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: "center",
                }}
              >
                <ActionButton
                  onClick={handleEditProfile}
                  startIcon={<EditIcon />}
                >
                  Edit Profile
                </ActionButton>
                <SecondaryButton
                  onClick={navigateToSettings}
                  startIcon={<SettingsIcon />}
                >
                  Settings
                </SecondaryButton>
              </Box>
            </Box>
          </Box>
        </ProfileHeader>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={stat.title}>
              <StatsCardMemo stat={stat} isMobile={isMobile} />
            </Grid>
          ))}
        </Grid>

        {/* Account Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  mb: 2,
                }}
              >
                Account Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-quaternary)", mb: 0.5 }}
                  >
                    Email Address
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "var(--text-primary)" }}
                  >
                    {profileData.email}
                  </Typography>
                </Box>
                <Divider sx={{ backgroundColor: "var(--border-color)" }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-quaternary)", mb: 0.5 }}
                  >
                    Login Method
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "var(--text-primary)" }}
                  >
                    {profileData.googleId
                      ? "Google Account"
                      : "Email & Password"}
                  </Typography>
                </Box>
                <Divider sx={{ backgroundColor: "var(--border-color)" }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-quaternary)", mb: 0.5 }}
                  >
                    Account Type
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "var(--text-primary)" }}
                  >
                    {profileData.accountType}
                  </Typography>
                </Box>
                <Divider sx={{ backgroundColor: "var(--border-color)" }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--text-quaternary)", mb: 0.5 }}
                  >
                    Member Since
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "var(--text-primary)" }}
                  >
                    {formattedJoinDate}
                  </Typography>
                </Box>
              </Box>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "var(--font-family-secondary)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  mb: 2,
                }}
              >
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <QuickActionButton
                  onClick={navigateToAnalysis}
                  icon={<TrendingUpIcon sx={{ mr: 2 }} />}
                  text="View Analysis Overview"
                />
                <QuickActionButton
                  onClick={navigateToDashboard}
                  icon={<FavoriteIcon sx={{ mr: 2 }} />}
                  text="Manage Relationships"
                />
                <QuickActionButton
                  onClick={navigateToSettings}
                  icon={<SettingsIcon sx={{ mr: 2 }} />}
                  text="Account Settings"
                />
                <Divider
                  sx={{ backgroundColor: "var(--border-color)", my: 1 }}
                />
                <QuickActionButton
                  onClick={handleLogout}
                  icon={<LogoutIcon sx={{ mr: 2 }} />}
                  text="Sign Out"
                  isLogout={true}
                />
              </Box>
            </InfoCard>
          </Grid>
        </Grid>
      </Container>
    </ProfileContainer>
  );
});

Profile.displayName = "Profile";

export default React.memo(Profile);
