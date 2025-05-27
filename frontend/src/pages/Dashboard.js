import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Grid,
  Avatar,
  CircularProgress,
  Button,
  Chip,
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import { relationshipService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

// Styled components
const PageContainer = styled(Box)(({ theme, darkMode }) => ({
  backgroundColor: darkMode ? "#121212" : "#fff",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: "0 16px",
}));

const HeaderContainer = styled(Box)(({ darkMode }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 16px",
  color: darkMode ? "#fff" : "#000",
}));

const HeaderTitle = styled(Typography)(({ darkMode }) => ({
  fontWeight: 700,
  fontSize: "24px",
  color: darkMode ? "#fff" : "#000",
}));

const FilterContainer = styled(Box)(({ darkMode }) => ({
  padding: "0 16px 16px 16px",
  borderBottom: darkMode
    ? "1px solid rgba(255,255,255,0.1)"
    : "1px solid rgba(0,0,0,0.1)",
  marginBottom: "16px",
}));

const StyledTabs = styled(Tabs)(({ darkMode }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: darkMode ? "#6366f1" : "#3f51b5",
  },
  "& .MuiTab-root": {
    color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    textTransform: "none",
    fontSize: "14px",
    fontWeight: 500,
    minWidth: "auto",
    padding: "8px 16px",
    "&.Mui-selected": {
      color: darkMode ? "#6366f1" : "#3f51b5",
    },
  },
}));

const AddCircleButton = styled(IconButton)(({ darkMode }) => ({
  backgroundColor: darkMode ? "#333" : "#000",
  color: "#fff",
  width: 32,
  height: 32,
  "&:hover": {
    backgroundColor: darkMode ? "#444" : "#333",
  },
}));

const FilterButton = styled(IconButton)(({ darkMode }) => ({
  backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
  color: darkMode ? "#fff" : "#000",
  width: 32,
  height: 32,
  marginLeft: 8,
  "&:hover": {
    backgroundColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
  },
}));

const CircularContactItem = styled(Box)(({ darkMode }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  borderRadius: "8px",
  position: "relative",
  "&:hover": {
    backgroundColor: darkMode
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.03)",
  },
}));

const ContactAvatar = styled(Avatar)(({ darkMode }) => ({
  width: 68,
  height: 68,
  marginBottom: 8,
  boxShadow: darkMode
    ? "0 4px 8px rgba(0, 0, 0, 0.3)"
    : "0 2px 8px rgba(0, 0, 0, 0.1)",
  backgroundColor: darkMode ? "#333" : "#D3D3D3",
  border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
  "@media (min-width: 600px)": {
    width: 78,
    height: 78,
  },
}));

const ContactName = styled(Typography)(({ darkMode }) => ({
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: 1.2,
  color: darkMode ? "#e0e0e0" : "inherit",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const TimeAgo = styled(Typography)(({ darkMode }) => ({
  fontSize: "12px",
  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
}));

const ConnectionTypeChip = styled(Chip)(({ darkMode, connectiontype }) => ({
  position: "absolute",
  top: 4,
  right: 4,
  height: 20,
  fontSize: "10px",
  fontWeight: 500,
  backgroundColor: getConnectionTypeColor(connectiontype, darkMode).bg,
  color: getConnectionTypeColor(connectiontype, darkMode).text,
  border: `1px solid ${
    getConnectionTypeColor(connectiontype, darkMode).border
  }`,
  "& .MuiChip-label": {
    padding: "0 6px",
  },
}));

const MicButtonContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  margin: "24px auto",
});

const MicButton = styled(Button)(({ darkMode }) => ({
  backgroundColor: darkMode ? "#333" : "#000",
  color: "#fff",
  width: "80%",
  maxWidth: "260px",
  height: 48,
  borderRadius: "24px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: darkMode ? "#444" : "#333",
  },
}));

const EmptyStateContainer = styled(Box)(({ darkMode }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 24px",
  minHeight: 400,
  textAlign: "center",
  color: darkMode ? "#e0e0e0" : "inherit",
  backgroundColor: darkMode ? "#1e1e1e" : "transparent",
  borderRadius: "12px",
}));

// Helper function to get icon for connection type
function getIconForType(type) {
  const lowerType = type.toLowerCase();
  if (
    lowerType.includes("romantic") ||
    lowerType.includes("partner") ||
    lowerType.includes("love")
  ) {
    return <FavoriteIcon />;
  }
  if (
    lowerType.includes("family") ||
    lowerType.includes("parent") ||
    lowerType.includes("sibling")
  ) {
    return <FamilyRestroomIcon />;
  }
  if (lowerType.includes("friend") || lowerType.includes("buddy")) {
    return <PeopleIcon />;
  }
  if (
    lowerType.includes("work") ||
    lowerType.includes("professional") ||
    lowerType.includes("colleague")
  ) {
    return <WorkIcon />;
  }
  return <PersonIcon />;
}

// Helper function to get connection type colors
function getConnectionTypeColor(connectionType, darkMode) {
  const colors = {
    romantic: {
      bg: darkMode ? "rgba(236, 72, 153, 0.2)" : "rgba(236, 72, 153, 0.1)",
      text: darkMode ? "#f472b6" : "#be185d",
      border: darkMode ? "rgba(236, 72, 153, 0.4)" : "rgba(236, 72, 153, 0.3)",
    },
    family: {
      bg: darkMode ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
      text: darkMode ? "#4ade80" : "#15803d",
      border: darkMode ? "rgba(34, 197, 94, 0.4)" : "rgba(34, 197, 94, 0.3)",
    },
    friend: {
      bg: darkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
      text: darkMode ? "#60a5fa" : "#1d4ed8",
      border: darkMode ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.3)",
    },
    professional: {
      bg: darkMode ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.1)",
      text: darkMode ? "#a78bfa" : "#7c3aed",
      border: darkMode ? "rgba(168, 85, 247, 0.4)" : "rgba(168, 85, 247, 0.3)",
    },
    acquaintance: {
      bg: darkMode ? "rgba(156, 163, 175, 0.2)" : "rgba(156, 163, 175, 0.1)",
      text: darkMode ? "#9ca3af" : "#6b7280",
      border: darkMode
        ? "rgba(156, 163, 175, 0.4)"
        : "rgba(156, 163, 175, 0.3)",
    },
  };

  return colors[connectionType?.toLowerCase()] || colors.acquaintance;
}

// Helper function to get connection type icon
function getConnectionTypeIcon(connectionType) {
  const icons = {
    romantic: <FavoriteIcon sx={{ fontSize: 12 }} />,
    family: <FamilyRestroomIcon sx={{ fontSize: 12 }} />,
    friend: <PeopleIcon sx={{ fontSize: 12 }} />,
    professional: <WorkIcon sx={{ fontSize: 12 }} />,
    acquaintance: <PersonIcon sx={{ fontSize: 12 }} />,
  };

  return icons[connectionType?.toLowerCase()] || icons.acquaintance;
}

// Sound Wave SVG component
const SoundWave = ({ darkMode }) => (
  <Box sx={{ display: "flex", alignItems: "center", height: 24, mx: 1 }}>
    <Box
      sx={{
        width: 2,
        height: 8,
        mx: 0.5,
        bgcolor: darkMode ? "#aaa" : "white",
      }}
    />
    <Box
      sx={{
        width: 2,
        height: 14,
        mx: 0.5,
        bgcolor: darkMode ? "#aaa" : "white",
      }}
    />
    <Box
      sx={{
        width: 2,
        height: 18,
        mx: 0.5,
        bgcolor: darkMode ? "#aaa" : "white",
      }}
    />
    <Box
      sx={{
        width: 2,
        height: 14,
        mx: 0.5,
        bgcolor: darkMode ? "#aaa" : "white",
      }}
    />
    <Box
      sx={{
        width: 2,
        height: 8,
        mx: 0.5,
        bgcolor: darkMode ? "#aaa" : "white",
      }}
    />
  </Box>
);

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [relationships, setRelationships] = useState([]);
  const [filteredRelationships, setFilteredRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Base connection type filters
  const baseConnectionFilters = [
    { id: "all", label: "All", icon: <PeopleIcon /> },
    { id: "romantic", label: "Romantic", icon: <FavoriteIcon /> },
    { id: "family", label: "Family", icon: <FamilyRestroomIcon /> },
    { id: "friend", label: "Friends", icon: <PeopleIcon /> },
    { id: "professional", label: "Work", icon: <WorkIcon /> },
    { id: "acquaintance", label: "Others", icon: <PersonIcon /> },
  ];

  // Backup sample images for contacts without photos
  const sampleImages = {
    test: "https://randomuser.me/api/portraits/men/32.jpg",
    vineeth: "https://randomuser.me/api/portraits/men/33.jpg",
    Revanth: "https://randomuser.me/api/portraits/men/34.jpg",
    "MASA MALLIK": "https://randomuser.me/api/portraits/men/35.jpg",
    divya: "https://randomuser.me/api/portraits/women/32.jpg",
    test1: "https://randomuser.me/api/portraits/women/33.jpg",
  };

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const response = await relationshipService.getAll();
        console.log("Relationships data:", response.data);

        if (!Array.isArray(response.data)) {
          console.error("API returned non-array data:", response.data);
          setRelationships([]);
          return;
        }

        // Process relationships to ensure we properly handle the photo URL
        const enhancedRelationships = response.data.map((relationship) => {
          const baseApiUrl =
            process.env.NODE_ENV === "production"
              ? ""
              : "http://localhost:5000";

          if (relationship.photo) {
            if (relationship.photo.startsWith("/uploads")) {
              const fullPhotoUrl = `${baseApiUrl}${relationship.photo}`;
              return { ...relationship, photoUrl: fullPhotoUrl };
            } else {
              return { ...relationship, photoUrl: relationship.photo };
            }
          }

          if (relationship.photoUrl) {
            return relationship;
          }

          const photoUrl = sampleImages[relationship.contactName] || null;
          return { ...relationship, photoUrl };
        });

        setRelationships(enhancedRelationships);
        setFilteredRelationships(enhancedRelationships);

        // Generate dynamic filters based on actual data
        const uniqueTypes = [
          ...new Set(
            enhancedRelationships
              .map((rel) => rel.relationshipType || rel.type || rel.category)
              .filter(Boolean)
              .map((type) => type.toLowerCase().trim())
          ),
        ];

        console.log("=== DATA ANALYSIS ===");
        console.log("Unique connection types found:", uniqueTypes);

        // Create dynamic filters based on actual data
        const dynamicFilterList = [
          { id: "all", label: "All", icon: <PeopleIcon /> },
          ...uniqueTypes.map((type) => {
            const capitalizedType =
              type.charAt(0).toUpperCase() + type.slice(1);
            return {
              id: type,
              label: capitalizedType,
              icon: getIconForType(type),
            };
          }),
        ];

        setDynamicFilters(dynamicFilterList);
        console.log("Dynamic filters created:", dynamicFilterList);
        console.log("=== END DATA ANALYSIS ===");
      } catch (error) {
        console.error("Error fetching relationships:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, []);

  // Filter relationships based on active filter
  useEffect(() => {
    console.log("=== FILTERING DEBUG ===");
    console.log("Active filter:", activeFilter);
    console.log("Total relationships:", relationships.length);

    // Log all unique connection types found in data
    const allTypes = [
      ...new Set(
        relationships
          .map((rel) => rel.relationshipType || rel.type || rel.category)
          .filter(Boolean)
      ),
    ];
    console.log("All unique connection types in data:", allTypes);

    if (activeFilter === "all") {
      setFilteredRelationships(relationships);
      console.log("Showing all relationships:", relationships.length);
    } else {
      const filtered = relationships.filter((relationship) => {
        const connectionType =
          relationship.relationshipType ||
          relationship.type ||
          relationship.category;

        if (!connectionType) {
          console.log(`${relationship.contactName}: No connection type found`);
          return false;
        }

        const normalizedType = connectionType.toLowerCase().trim();
        const normalizedFilter = activeFilter.toLowerCase().trim();

        console.log(
          `${relationship.contactName}: "${connectionType}" -> "${normalizedType}" | Filter: "${normalizedFilter}"`
        );

        // Simple exact match first
        const matches = normalizedType === normalizedFilter;
        console.log(`Match result: ${matches}`);

        return matches;
      });

      console.log(`Filtered results for "${activeFilter}":`, filtered.length);
      console.log(
        "Filtered contacts:",
        filtered.map((r) => r.contactName)
      );
      setFilteredRelationships(filtered);
    }
    console.log("=== END FILTERING DEBUG ===");
  }, [activeFilter, relationships]);

  // Get count for each connection type
  const getConnectionTypeCount = (type) => {
    if (type === "all") return relationships.length;

    const count = relationships.filter((rel) => {
      const connectionType = rel.relationshipType || rel.type || rel.category;
      if (!connectionType) return false;

      const normalizedType = connectionType.toLowerCase().trim();
      const normalizedFilter = type.toLowerCase().trim();

      return normalizedType === normalizedFilter;
    }).length;

    console.log(`Count for ${type}:`, count);
    return count;
  };

  const handleFilterChange = (event, newValue) => {
    setActiveFilter(newValue);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterMenuSelect = (filterId) => {
    setActiveFilter(filterId);
    handleFilterMenuClose();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (date) => {
    if (!date) return "No interactions yet";

    const now = new Date();
    const interactionDate = new Date(date);
    const diffMinutes = Math.floor((now - interactionDate) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes || 1} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffMinutes < 24 * 60) {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      const diffDays = Math.floor(diffMinutes / (60 * 24));
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  const renderContacts = () => (
    <Grid container spacing={2} sx={{ px: 2 }}>
      {filteredRelationships.map((contact, index) => (
        <Grid item xs={4} key={contact.id || contact._id || index}>
          <CircularContactItem
            darkMode={darkMode}
            onClick={() =>
              navigate(`/relationships/${contact._id || contact.id}`)
            }
          >
            {/* Connection Type Chip */}
            {contact.connectionType && (
              <ConnectionTypeChip
                darkMode={darkMode}
                connectiontype={contact.connectionType}
                label={contact.connectionType}
                size="small"
                icon={getConnectionTypeIcon(contact.connectionType)}
              />
            )}

            <ContactAvatar
              src={contact.photoUrl}
              darkMode={darkMode}
              onError={(e) => {
                console.error("Error loading image:", e.target.src);
                e.target.onerror = null;
                e.target.src = "";
              }}
            >
              {getInitials(contact.contactName)}
            </ContactAvatar>
            <ContactName darkMode={darkMode}>{contact.contactName}</ContactName>
            <TimeAgo darkMode={darkMode}>
              {getTimeAgo(contact.lastInteraction || contact.updatedAt)}
            </TimeAgo>
          </CircularContactItem>
        </Grid>
      ))}
    </Grid>
  );

  const EmptyState = () => (
    <EmptyStateContainer darkMode={darkMode}>
      <Avatar sx={{ width: 100, height: 100, mb: 3, bgcolor: "primary.main" }}>
        <PersonAddIcon sx={{ fontSize: 50 }} />
      </Avatar>
      <Typography variant="h6" gutterBottom>
        {activeFilter === "all"
          ? "Your Circle is Empty"
          : `No ${
              (dynamicFilters.length > 0
                ? dynamicFilters
                : baseConnectionFilters
              ).find((f) => f.id === activeFilter)?.label
            } Contacts`}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {activeFilter === "all"
          ? "Add your first contact to begin building your circle."
          : `You haven't added any ${(dynamicFilters.length > 0
              ? dynamicFilters
              : baseConnectionFilters
            )
              .find((f) => f.id === activeFilter)
              ?.label.toLowerCase()} contacts yet.`}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate("/new-relationship")}
      >
        {activeFilter === "all" ? "Add First Contact" : "Add Contact"}
      </Button>
    </EmptyStateContainer>
  );

  return (
    <PageContainer darkMode={darkMode}>
      <HeaderContainer darkMode={darkMode}>
        <HeaderTitle darkMode={darkMode}>My Circle</HeaderTitle>
        <Box display="flex" alignItems="center">
          <AddCircleButton
            darkMode={darkMode}
            onClick={() => navigate("/new-relationship")}
          >
            <AddIcon fontSize="small" />
          </AddCircleButton>
          <FilterButton darkMode={darkMode} onClick={handleFilterMenuOpen}>
            <FilterListIcon fontSize="small" />
          </FilterButton>
        </Box>
      </HeaderContainer>

      {/* Filter Tabs */}
      {!loading && relationships.length > 0 && (
        <FilterContainer darkMode={darkMode}>
          <StyledTabs
            value={activeFilter}
            onChange={handleFilterChange}
            variant="scrollable"
            scrollButtons="auto"
            darkMode={darkMode}
          >
            {(dynamicFilters.length > 0
              ? dynamicFilters
              : baseConnectionFilters
            ).map((filter) => (
              <Tab
                key={filter.id}
                value={filter.id}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {React.cloneElement(filter.icon, { sx: { fontSize: 16 } })}
                    <span>{filter.label}</span>
                    <Chip
                      label={getConnectionTypeCount(filter.id)}
                      size="small"
                      sx={{
                        height: "16px",
                        fontSize: "10px",
                        minWidth: "20px",
                        backgroundColor: darkMode ? "#6366f1" : "#3f51b5",
                        color: "#fff",
                        marginLeft: "4px",
                        "& .MuiChip-label": {
                          padding: "0 4px",
                        },
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </StyledTabs>
        </FilterContainer>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000",
          },
        }}
      >
        {(dynamicFilters.length > 0
          ? dynamicFilters
          : baseConnectionFilters
        ).map((filter) => (
          <MenuItem
            key={filter.id}
            onClick={() => handleFilterMenuSelect(filter.id)}
            selected={activeFilter === filter.id}
          >
            <ListItemIcon sx={{ color: darkMode ? "#fff" : "#000" }}>
              {filter.icon}
            </ListItemIcon>
            <ListItemText
              primary={`${filter.label} (${getConnectionTypeCount(filter.id)})`}
            />
          </MenuItem>
        ))}
      </Menu>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredRelationships.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {renderContacts()}
          <MicButtonContainer>
            <MicButton
              darkMode={darkMode}
              onClick={() => console.log("Mic button clicked")}
              startIcon={
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                  }}
                >
                  <SoundWave darkMode={darkMode} />
                </Box>
              }
            />
          </MicButtonContainer>
        </>
      )}
    </PageContainer>
  );
};

export default Dashboard;
