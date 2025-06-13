// frontend/src/pages/Profile.js
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import GroupIcon from "@mui/icons-material/Group";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useRelationships } from "../hooks/useRelationships";

// Main Profile Container
const ProfileContainer = styled(Box)({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  background: "#00081E",
  overflow: "hidden",
});

// Blur Background - EXACT POSITIONING
const ProfileBlurBackground = styled(Box)({
  position: "absolute",
  width: "1099px",
  height: "719px",
  right: "-487px",
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
    right: "auto",
    filter: "blur(97.6382px)",
  },
});

// Main Profile Section
const ProfileMainSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  width: "100%",
  maxWidth: "1340px",
  margin: "0 auto",
  padding: "50px 20px",
  position: "relative",
  zIndex: 1,
  "@media (max-width: 768px)": {
    maxWidth: "375px",
    padding: "30px 25px",
    gap: "30px",
  },
});

// Profile Info Container
const ProfileInfoContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "65px",
  width: "100%",
  "@media (max-width: 768px)": {
    flexDirection: "column",
    gap: "30px",
  },
});

// Profile Details Section
const ProfileDetailsSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "216px",
  "@media (max-width: 768px)": {
    width: "150px",
  },
});

// Profile Avatar Container
const ProfileAvatarContainer = styled(Box)({
  position: "relative",
  width: "120px",
  height: "120px",
  marginBottom: "20px",
  "@media (max-width: 768px)": {
    width: "78px",
    height: "78px",
    marginBottom: "15px",
  },
});

// Profile Avatar
const ProfileAvatar = styled(Box)({
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#366EFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#FFFFFF",
  fontSize: "48px",
  fontWeight: "bold",
  fontFamily: "DM Sans",
  "@media (max-width: 768px)": {
    width: "78px",
    height: "78px",
    fontSize: "32px",
  },
});

// Edit Photo Button
const EditPhotoButton = styled(IconButton)({
  position: "absolute",
  width: "42px",
  height: "42px",
  right: "-6px",
  bottom: "-6px",
  backgroundColor: "#366EFF",
  color: "#FFFFFF",
  borderRadius: "37.5px",
  padding: "6px",
  "&:hover": {
    backgroundColor: "#366EFF",
    opacity: 0.8,
  },
  "@media (max-width: 768px)": {
    width: "30px",
    height: "30px",
    right: "-4px",
    bottom: "-4px",
  },
});

// Profile Name
const ProfileName = styled(Typography)({
  fontFamily: "Poppins",
  fontWeight: 400,
  fontSize: "26px",
  lineHeight: "39px",
  textAlign: "center",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
  margin: "10px 0",
  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "30px",
  },
});

// Profile Last Updated
const ProfileLastUpdated = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "21px",
  textAlign: "center",
  letterSpacing: "-0.165px",
  color: "#D1D1D1",
  "@media (max-width: 768px)": {
    fontSize: "14px",
  },
});

// Stats Container
const StatsContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "15px",
  width: "733px",
  "@media (max-width: 768px)": {
    flexDirection: "column",
    width: "325px",
    gap: "12px",
  },
});

// Stats Row for mobile
const StatsRow = styled(Box)({
  display: "contents",
  "@media (max-width: 768px)": {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    width: "100%",
  },
});

// Individual Stat Card
const StatCard = styled(Box)(({ fullWidth }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px 10px",
  gap: "5px",
  backgroundColor: "#2057E7",
  backdropFilter: "blur(20px)",
  borderRadius: "12px",
  flex: 1,
  "@media (max-width: 768px)": {
    width: fullWidth ? "100%" : "calc(50% - 6px)",
    padding: "15px 10px",
    flex: fullWidth ? "none" : 1,
  },
}));

// Stat Value
const StatValue = styled(Typography)({
  fontFamily: "Outfit",
  fontWeight: 700,
  fontSize: "24px",
  lineHeight: "30px",
  textAlign: "center",
  letterSpacing: "0.02em",
  color: "#E6E8FF",
});

// Stat Label
const StatLabel = styled(Typography)({
  fontFamily: "Poppins",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
});

// Relationship Types Container
const RelationshipTypesContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  width: "100%",
  maxWidth: "1340px",
  margin: "40px auto 0",
  "@media (max-width: 768px)": {
    maxWidth: "325px",
    gap: "15px",
    margin: "30px auto 0",
  },
});

// Relationship Type Row
const RelationshipTypeRow = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "15px",
  width: "100%",
  "@media (max-width: 768px)": {
    gap: "12px",
  },
});

// Relationship Type Card
const RelationshipTypeCard = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "10px 20px",
  gap: "10px",
  width: "328px",
  height: "93px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  borderRadius: "12px",
  "@media (max-width: 768px)": {
    width: "calc(50% - 6px)",
    height: "93px",
    padding: "8px 15px",
    borderRadius: "6px",
  },
});

// Relationship Info Section
const RelationshipInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: "5px",
  flex: 1,
});

// Relationship Header
const RelationshipHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "5px 0px",
  gap: "10px",
  width: "100%",
});

// Relationship Type Icon
const RelationshipTypeIcon = styled(Box)(({ gradient }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  width: "22px",
  height: "22px",
  background: gradient,
  borderRadius: "50px",
}));

// Relationship Type Name
const RelationshipTypeName = styled(Typography)({
  fontFamily: "Poppins",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "21px",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
});

// Relationship Count
const RelationshipCount = styled(Typography)({
  fontFamily: "Poppins",
  fontWeight: 600,
  fontSize: "24px",
  lineHeight: "36px",
  textAlign: "center",
  letterSpacing: "-0.165px",
  color: "#F5F5F5",
});

// Logout Button
const LogoutButton = styled(Button)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "12px 121px",
  gap: "10px",
  width: "500px",
  height: "58px",
  background: "linear-gradient(90.81deg, #4E7FFF 4.7%, #0047FF 96.51%)",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  margin: "40px auto 0",
  "@media (max-width: 768px)": {
    width: "325px",
    padding: "12px 60px",
    margin: "30px auto 0",
  },
});

// Logout Button Text
const LogoutButtonText = styled(Typography)({
  fontFamily: "DM Sans",
  fontWeight: 900,
  fontSize: "22px",
  lineHeight: "23px",
  textAlign: "center",
  color: "#FFFFFF",
  textTransform: "none",
  "@media (max-width: 768px)": {
    fontSize: "18px",
  },
});

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const { statistics, loading, error, relationships } = useRelationships();
  const [uploading, setUploading] = useState(false);

  // Dynamic avatar logic
  const getInitials = useCallback((name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const profileData = useMemo(
    () => ({
      displayName: currentUser?.displayName || currentUser?.name || "John Beri",
      email: currentUser?.email || "",
      photoURL: currentUser?.photoURL || currentUser?.avatar || null,
    }),
    [currentUser]
  );

  const userInitials = useMemo(() => {
    return getInitials(profileData.displayName || currentUser?.email);
  }, [getInitials, profileData.displayName, currentUser?.email]);

  // Dynamic last updated date calculation
  const lastUpdatedDate = useMemo(() => {
    // Priority order for determining last updated date:
    // 1. User's profile updatedAt field
    // 2. User's profile lastModified field
    // 3. Most recent relationship update
    // 4. User account creation/update date
    // 5. Current date as fallback

    let lastUpdateTimestamp = null;

    // Check user data for update timestamps
    if (currentUser?.updatedAt) {
      lastUpdateTimestamp = new Date(currentUser.updatedAt);
    } else if (currentUser?.lastModified) {
      lastUpdateTimestamp = new Date(currentUser.lastModified);
    } else if (currentUser?.profileUpdatedAt) {
      lastUpdateTimestamp = new Date(currentUser.profileUpdatedAt);
    }

    // Check relationships for most recent update
    if (
      relationships &&
      Array.isArray(relationships) &&
      relationships.length > 0
    ) {
      const relationshipDates = relationships
        .map((rel) => {
          // Check various possible date fields
          const dateFields = [
            rel.updatedAt,
            rel.lastUpdated,
            rel.modifiedAt,
            rel.createdAt,
            rel.dateModified,
            rel.lastModified,
          ];

          for (const dateField of dateFields) {
            if (dateField) {
              const parsedDate = new Date(dateField);
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
              }
            }
          }
          return null;
        })
        .filter((date) => date !== null);

      if (relationshipDates.length > 0) {
        const mostRecentRelationshipDate = new Date(
          Math.max(...relationshipDates)
        );

        // Use the most recent between user update and relationship update
        if (
          !lastUpdateTimestamp ||
          mostRecentRelationshipDate > lastUpdateTimestamp
        ) {
          lastUpdateTimestamp = mostRecentRelationshipDate;
        }
      }
    }

    // Fallback to current date if no timestamps found
    if (!lastUpdateTimestamp) {
      lastUpdateTimestamp = new Date();
    }

    // Format the date in a user-friendly way
    const formatDate = (date) => {
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        return "Today";
      } else if (diffInDays === 1) {
        return "Yesterday";
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        // Format as "Month Day, Year"
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    };

    return formatDate(lastUpdateTimestamp);
  }, [currentUser, relationships]);

  // Dynamic relationship type calculations
  const relationshipTypeStats = useMemo(() => {
    if (!relationships || !Array.isArray(relationships)) {
      // Default data for display
      return [
        {
          key: "professional",
          name: "Professional",
          icon: <WorkIcon sx={{ fontSize: "14px", color: "#F5F5F5" }} />,
          gradient:
            "linear-gradient(151.07deg, #D80051 13.14%, #FF8774 85.75%)",
          count: 7,
        },
        {
          key: "family",
          name: "Family",
          icon: <GroupIcon sx={{ fontSize: "14px", color: "#FFFFFF" }} />,
          gradient:
            "linear-gradient(151.07deg, #D5382C 13.14%, #F57E0B 85.75%)",
          count: 11,
        },
        {
          key: "romantic",
          name: "Romantic",
          icon: <FavoriteIcon sx={{ fontSize: "9px", color: "#FFFFFF" }} />,
          gradient:
            "linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)",
          count: 2,
        },
        {
          key: "friends",
          name: "Friends",
          icon: <PeopleIcon sx={{ fontSize: "14px", color: "#FFFFFF" }} />,
          gradient:
            "linear-gradient(275.48deg, #AA00FF -5.24%, #4A74FF 101.68%)",
          count: 5,
        },
        {
          key: "mentor",
          name: "Mentor",
          icon: <SchoolIcon sx={{ fontSize: "14px", color: "#FFFFFF" }} />,
          gradient:
            "linear-gradient(151.07deg, #024AFB 13.14%, #06ABF0 85.75%)",
          count: 2,
        },
        {
          key: "others",
          name: "Others",
          icon: <MoreHorizIcon sx={{ fontSize: "13px", color: "#FFFFFF" }} />,
          gradient:
            "linear-gradient(151.07deg, #D61563 13.14%, #1E76DE 85.75%)",
          count: 1,
        },
      ];
    }

    const typeMap = new Map();
    relationships.forEach((rel) => {
      const type = rel.relationshipType || rel.type || rel.category || "Others";
      const normalizedType = type.toLowerCase().trim();
      typeMap.set(normalizedType, (typeMap.get(normalizedType) || 0) + 1);
    });

    const typeConfigs = [
      {
        key: "professional",
        name: "Professional",
        icon: <WorkIcon sx={{ fontSize: "14px", color: "#F5F5F5" }} />,
        gradient: "linear-gradient(151.07deg, #D80051 13.14%, #FF8774 85.75%)",
      },
      {
        key: "family",
        name: "Family",
        icon: <GroupIcon sx={{ fontSize: "14px", color: "#FFFFFF" }} />,
        gradient: "linear-gradient(151.07deg, #D5382C 13.14%, #F57E0B 85.75%)",
      },
      {
        key: "romantic",
        name: "Romantic",
        icon: <FavoriteIcon sx={{ fontSize: "9px", color: "#FFFFFF" }} />,
        gradient: "linear-gradient(151.07deg, #AF40FF 13.14%, #FB3A83 85.75%)",
      },
      {
        key: "friendship",
        name: "Friendship",
        icon: <PeopleIcon sx={{ fontSize: "14px", color: "#FFFFFF" }} />,
        gradient: "linear-gradient(275.48deg, #AA00FF -5.24%, #4A74FF 101.68%)",
      },
      {
        key: "mentor",
        name: "Mentor",
        icon: <SchoolIcon sx={{ fontSize: "14px", color: "#FFFFFF" }} />,
        gradient: "linear-gradient(151.07deg, #024AFB 13.14%, #06ABF0 85.75%)",
      },
      {
        key: "others",
        name: "Others",
        icon: <MoreHorizIcon sx={{ fontSize: "13px", color: "#FFFFFF" }} />,
        gradient: "linear-gradient(151.07deg, #D61563 13.14%, #1E76DE 85.75%)",
      },
    ];

    return typeConfigs.map((config) => ({
      ...config,
      count: typeMap.get(config.key) || 0,
    }));
  }, [relationships]);

  const statsData = useMemo(
    () => [
      {
        label: "Relationships",
        value: statistics?.totalRelationships || 28,
      },
      {
        label: "Uploaded Chats",
        value: statistics?.totalConversations || 40,
      },
      {
        label: "Total messages",
        value: statistics?.totalMessages || 2640,
      },
    ],
    [statistics]
  );

  const handleUploadPhoto = useCallback(async () => {
    try {
      setUploading(true);
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log("Photo upload:", file);
        }
      };

      input.click();
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }, [logout, navigate]);

  const handleImageError = useCallback((e) => {
    console.error("Error loading profile image:", e.target.src);
    e.target.style.display = "none";
  }, []);

  if (loading) {
    return (
      <ProfileContainer>
        <ProfileBlurBackground />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <CircularProgress sx={{ color: "#F5F5F5" }} />
        </Box>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileBlurBackground />

      <ProfileMainSection>
        <ProfileInfoContainer>
          {/* Profile Details */}
          <ProfileDetailsSection>
            <ProfileAvatarContainer>
              <ProfileAvatar>
                {profileData.photoURL ? (
                  <img
                    src={profileData.photoURL}
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
              <EditPhotoButton onClick={handleUploadPhoto} disabled={uploading}>
                <EditIcon sx={{ fontSize: "18px" }} />
              </EditPhotoButton>
            </ProfileAvatarContainer>

            <ProfileName>{profileData.displayName}</ProfileName>
            <ProfileLastUpdated>
              Last updated {lastUpdatedDate}
            </ProfileLastUpdated>
          </ProfileDetailsSection>

          {/* Stats */}
          <StatsContainer>
            {isMobile ? (
              <>
                {/* Mobile Layout: 2 cards in first row */}
                <StatsRow>
                  <StatCard>
                    <StatValue>{statsData[0].value}</StatValue>
                    <StatLabel>{statsData[0].label}</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{statsData[1].value}</StatValue>
                    <StatLabel>{statsData[1].label}</StatLabel>
                  </StatCard>
                </StatsRow>
                {/* Full width card in second row */}
                <StatCard fullWidth>
                  <StatValue>{statsData[2].value}</StatValue>
                  <StatLabel>{statsData[2].label}</StatLabel>
                </StatCard>
              </>
            ) : (
              // Desktop Layout: All 3 cards in a row
              statsData.map((stat) => (
                <StatCard key={stat.label}>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatCard>
              ))
            )}
          </StatsContainer>
        </ProfileInfoContainer>

        {/* Relationship Types */}
        <RelationshipTypesContainer>
          {/* First Row */}
          <RelationshipTypeRow>
            {relationshipTypeStats.slice(0, isMobile ? 2 : 3).map((type) => (
              <RelationshipTypeCard key={type.key}>
                <RelationshipInfo>
                  <RelationshipHeader>
                    <RelationshipTypeIcon gradient={type.gradient}>
                      {type.icon}
                    </RelationshipTypeIcon>
                    <RelationshipTypeName>{type.name}</RelationshipTypeName>
                  </RelationshipHeader>
                </RelationshipInfo>
                <RelationshipCount>{type.count}</RelationshipCount>
              </RelationshipTypeCard>
            ))}
          </RelationshipTypeRow>

          {/* Second Row */}
          <RelationshipTypeRow>
            {relationshipTypeStats
              .slice(isMobile ? 2 : 3, isMobile ? 4 : 6)
              .map((type) => (
                <RelationshipTypeCard key={type.key}>
                  <RelationshipInfo>
                    <RelationshipHeader>
                      <RelationshipTypeIcon gradient={type.gradient}>
                        {type.icon}
                      </RelationshipTypeIcon>
                      <RelationshipTypeName>{type.name}</RelationshipTypeName>
                    </RelationshipHeader>
                  </RelationshipInfo>
                  <RelationshipCount>{type.count}</RelationshipCount>
                </RelationshipTypeCard>
              ))}
          </RelationshipTypeRow>

          {/* Third Row - Mobile only */}
          {isMobile && (
            <RelationshipTypeRow>
              {relationshipTypeStats.slice(4, 6).map((type) => (
                <RelationshipTypeCard key={type.key}>
                  <RelationshipInfo>
                    <RelationshipHeader>
                      <RelationshipTypeIcon gradient={type.gradient}>
                        {type.icon}
                      </RelationshipTypeIcon>
                      <RelationshipTypeName>{type.name}</RelationshipTypeName>
                    </RelationshipHeader>
                  </RelationshipInfo>
                  <RelationshipCount>{type.count}</RelationshipCount>
                </RelationshipTypeCard>
              ))}
            </RelationshipTypeRow>
          )}
        </RelationshipTypesContainer>

        {/* Logout Button */}
        <LogoutButton onClick={handleLogout}>
          <LogoutButtonText>Logout</LogoutButtonText>
        </LogoutButton>
      </ProfileMainSection>
    </ProfileContainer>
  );
};

export default Profile;
