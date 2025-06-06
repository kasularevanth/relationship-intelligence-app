// frontend/src/pages/Dashboard.js
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Avatar,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useRelationships } from "../hooks/useRelationships";
import { useGlobal } from "../contexts/GlobalContext";

// Import the components
import ContactPermissionModal from "../components/ContactPermissionModal";
import ContactSelectorModal from "../components/ContactSelectorModal";
import DemoChatModal from "../components/DemoChatModal";
import DemoAnalysisModal from "../components/DemoAnalysisModal";

// Fixed relationship types
const FIXED_RELATIONSHIP_TYPES = [
  "romantic",
  "family",
  "friend",
  "professional",
];

const RELATIONSHIP_TYPE_MAPPING = {
  romantic: ["romantic", "Partner"],
  professional: ["professional", "colleague"],
  family: ["family"],
  friend: ["Friend", "friendship"],
};

// Styled components using CSS variables
const PageContainer = styled(Box)({
  backgroundColor: "var(--primary-bg)",
  minHeight: "calc(100vh - 80px)", // Subtract TopBar height
  display: "flex",
  flexDirection: "column",
  color: "var(--text-primary)",
  padding: "0 20px 20px 20px",
  width: "100%",
  "@media (max-width: 768px)": {
    padding: "0 16px 20px 16px",
    minHeight: "calc(100vh - 60px)", // Subtract mobile TopBar height
  },
});

const HeaderContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 0",
  position: "relative",
  width: "100%",
  "@media (max-width: 768px)": {
    padding: "20px 0",
  },
});

const HeaderTitle = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "30px",
  lineHeight: "39px",
  color: "var(--text-primary)",
  letterSpacing: "-0.165px",
  "@media (max-width: 768px)": {
    fontSize: "24px",
    lineHeight: "32px",
  },
});

const SearchContainer = styled(Box)({
  marginBottom: "16px",
  width: "100%",
});

const SearchField = styled(TextField)({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    background: "var(--input-bg)",
    borderRadius: "16px",
    height: "52px",
    color: "var(--text-primary)",
    fontSize: "16px",
    fontFamily: "var(--font-family-primary)",
    "& fieldset": {
      border: "1px solid var(--input-border)",
    },
    "&:hover fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    "&.Mui-focused fieldset": {
      border: "1px solid var(--input-border-focus)",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "12px 20px",
    "&::placeholder": {
      color: "var(--text-placeholder)",
      opacity: 1,
    },
  },
  "@media (max-width: 768px)": {
    "& .MuiOutlinedInput-root": {
      height: "48px",
      fontSize: "15px",
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px 16px",
    },
  },
});

const FilterContainer = styled(Box)({
  marginBottom: "16px",
  width: "100%",
});

const StyledTabs = styled(Tabs)({
  width: "100%",
  "& .MuiTabs-indicator": {
    backgroundColor: "var(--text-primary)",
    height: "2px",
    borderRadius: "1px",
  },
  "& .MuiTab-root": {
    color: "var(--text-tertiary)",
    textTransform: "none",
    fontSize: "16px",
    fontWeight: 400,
    fontFamily: "var(--font-family-primary)",
    minWidth: "auto",
    padding: "8px 12px",
    letterSpacing: "-0.165px",
    transition: "all 0.2s ease",
    "&.Mui-selected": {
      color: "var(--text-primary)",
      fontWeight: 600,
    },
    "&:hover": {
      color: "var(--text-secondary)",
    },
  },
  "& .MuiTabs-flexContainer": {
    gap: "32px",
  },
  "@media (max-width: 768px)": {
    "& .MuiTabs-flexContainer": {
      gap: "16px",
    },
    "& .MuiTab-root": {
      fontSize: "14px",
      minWidth: "60px",
      padding: "6px 8px",
    },
  },
});

// New Floating Add Button - matching the exact design from the image
const FloatingAddButton = styled(IconButton)({
  position: "fixed",
  bottom: "24px",
  right: "24px",
  width: "56px",
  height: "56px",
  background: "var(--button-gradient)",
  color: "#FFFFFF",
  borderRadius: "50%",
  boxShadow: "var(--button-shadow)",
  zIndex: 1000,
  "&:hover": {
    background: "linear-gradient(135deg, #2557E5 0%, #366EFF 100%)",
    transform: "scale(1.05)",
    boxShadow: "var(--button-shadow-hover)",
  },
  transition: "all 0.3s ease",
  "@media (max-width: 768px)": {
    width: "56px",
    height: "56px",
    bottom: "24px",
    right: "24px",
  },
});

const CircularContactItem = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "16px 8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  borderRadius: "12px",
  position: "relative",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transform: "translateY(-4px)",
  },
});

const ContactAvatar = styled(Avatar)({
  width: 100,
  height: 100,
  marginBottom: 16,
  backgroundColor: "#366EFF",
  border: "2px solid rgba(255, 255, 255, 0.1)",
  fontSize: "28px",
  fontWeight: 600,
  fontFamily: "var(--font-family-primary)",
  "@media (max-width: 768px)": {
    width: 80,
    height: 80,
    fontSize: "22px",
    marginBottom: 12,
  },
});

const ContactName = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  color: "var(--text-primary)",
  textAlign: "center",
  letterSpacing: "-0.2px",
  marginBottom: "4px",
  maxWidth: "120px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media (max-width: 768px)": {
    fontSize: "14px",
    lineHeight: "18px",
    maxWidth: "100px",
  },
});

const TimeAgo = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontStyle: "italic",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: "16px",
  color: "var(--text-tertiary)",
  textAlign: "center",
  letterSpacing: "-0.2px",
});

const EmptyStateContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 24px",
  minHeight: 400,
  textAlign: "center",
  color: "var(--text-primary)",
});

const StyledButton = styled(Button)({
  background: "var(--button-gradient)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  borderRadius: "12px",
  textTransform: "none",
  padding: "12px 24px",
  fontSize: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  "&:hover": {
    background: "linear-gradient(135deg, #2557E5 0%, #366EFF 100%)",
    transform: "translateY(-2px)",
    boxShadow: "var(--button-shadow-hover)",
  },
  transition: "all 0.3s ease",
});

const ContentGrid = styled(Grid)({
  width: "100%",
  margin: 0,
});

// Helper function to get icon for relationship type
const getIconForType = (type) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("romantic") || lowerType.includes("partner")) {
    return <FavoriteIcon />;
  }
  if (lowerType.includes("family")) {
    return <FamilyRestroomIcon />;
  }
  if (lowerType.includes("friend")) {
    return <PeopleIcon />;
  }
  if (lowerType.includes("professional")) {
    return <WorkIcon />;
  }
  return <PersonIcon />;
};

// Memoized Components
const ContactItemMemo = React.memo(
  ({ contact, onContactClick, getInitials, getTimeAgo }) => {
    const handleContactClick = useCallback(() => {
      onContactClick(contact._id || contact.id);
    }, [onContactClick, contact._id, contact.id]);

    return (
      <CircularContactItem onClick={handleContactClick}>
        <ContactAvatar src={contact.photoUrl}>
          {!contact.photoUrl && getInitials(contact.contactName)}
        </ContactAvatar>
        <ContactName>{contact.contactName}</ContactName>
        <TimeAgo>
          {getTimeAgo(contact.lastInteraction || contact.updatedAt)}
        </TimeAgo>
      </CircularContactItem>
    );
  }
);

const EmptyStateMemo = React.memo(
  ({ activeFilter, filterLabel, onAddContact }) => (
    <EmptyStateContainer>
      <Avatar
        sx={{
          width: 100,
          height: 100,
          mb: 3,
          background: "var(--button-gradient)",
        }}
      >
        <PersonAddIcon sx={{ fontSize: 50, color: "var(--text-primary)" }} />
      </Avatar>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-family-primary)",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        {activeFilter === "all"
          ? "Your Circle is Empty"
          : `No ${filterLabel} Contacts`}
      </Typography>
      <Typography
        variant="body2"
        paragraph
        sx={{
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-family-primary)",
          marginBottom: "24px",
          maxWidth: "300px",
        }}
      >
        {activeFilter === "all"
          ? "Add your first contact to begin building your circle."
          : `You haven't added any ${filterLabel?.toLowerCase()} contacts yet.`}
      </Typography>
      <StyledButton startIcon={<AddIcon />} onClick={onAddContact}>
        {activeFilter === "all" ? "Add First Contact" : "Add Contact"}
      </StyledButton>
    </EmptyStateContainer>
  )
);

const FilterTabsMemo = React.memo(
  ({ filters, activeFilter, onFilterChange }) => (
    <FilterContainer>
      <StyledTabs
        value={activeFilter}
        onChange={onFilterChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {filters.map((filter) => (
          <Tab key={filter.id} value={filter.id} label={filter.label} />
        ))}
      </StyledTabs>
    </FilterContainer>
  )
);

const Dashboard = React.memo(() => {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Global state
  const { state, actions } = useGlobal();

  // Local state for UI interactions
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Use relationships hook
  const {
    relationships: hookRelationships,
    loading,
    error,
  } = useRelationships();

  // Combine hook relationships with global state relationships
  const allRelationships = useMemo(() => {
    const globalRels = state.relationships || [];
    const hookRels = hookRelationships || [];
    const combined = [...globalRels, ...hookRels];
    const uniqueRels = combined.filter(
      (rel, index, self) =>
        index === self.findIndex((r) => (r.id || r._id) === (rel.id || rel._id))
    );
    return uniqueRels;
  }, [state.relationships, hookRelationships]);

  // Helper functions
  const getInitials = useCallback((name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

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

  // Filters based on fixed relationship types
  const dynamicFilters = useMemo(() => {
    const baseFilters = [{ id: "all", label: "All", icon: <PeopleIcon /> }];

    const typeFilters = FIXED_RELATIONSHIP_TYPES.map((type) => {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      return {
        id: type,
        label: capitalizedType,
        icon: getIconForType(type),
      };
    });

    return [...baseFilters, ...typeFilters];
  }, []);

  // Filter relationships
  const filteredRelationships = useMemo(() => {
    let filtered = allRelationships;

    // Apply filter
    if (activeFilter !== "all") {
      const allowedTypes = RELATIONSHIP_TYPE_MAPPING[activeFilter] || [
        activeFilter,
      ];
      filtered = filtered.filter((rel) => {
        const relType = rel.relationshipType?.toLowerCase();
        return allowedTypes.some((type) => type.toLowerCase() === relType);
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter((rel) =>
        rel.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allRelationships, activeFilter, searchQuery]);

  // Event handlers
  const handleFilterChange = useCallback((event, newValue) => {
    setActiveFilter(newValue);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleContactClick = useCallback(
    (contactId) => {
      navigate(`/relationships/${contactId}`);
    },
    [navigate]
  );

  // Updated to navigate to the new page instead of showing modal
  const handleAddContact = useCallback(() => {
    navigate("/add-relationship");
  }, [navigate]);

  const currentFilterLabel = useMemo(() => {
    return dynamicFilters.find((f) => f.id === activeFilter)?.label;
  }, [dynamicFilters, activeFilter]);

  // Render contacts
  const renderContacts = useMemo(
    () => (
      <ContentGrid container spacing={2}>
        {filteredRelationships.map((contact) => (
          <Grid item xs={4} sm={3} md={2} key={contact.id || contact._id}>
            <ContactItemMemo
              contact={contact}
              onContactClick={handleContactClick}
              getInitials={getInitials}
              getTimeAgo={getTimeAgo}
            />
          </Grid>
        ))}
      </ContentGrid>
    ),
    [filteredRelationships, handleContactClick, getInitials, getTimeAgo]
  );

  return (
    <>
      <PageContainer>
        <HeaderContainer>
          <HeaderTitle>My Circle</HeaderTitle>
          {/* Removed the header add button */}
        </HeaderContainer>

        {/* Search */}
        <SearchContainer>
          <SearchField
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "var(--text-placeholder)" }} />
                </InputAdornment>
              ),
            }}
          />
        </SearchContainer>

        {/* Filter Tabs */}
        {!loading && allRelationships.length > 0 && (
          <FilterTabsMemo
            filters={dynamicFilters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Content */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress sx={{ color: "var(--text-primary)" }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Typography color="error">
              Failed to load relationships: {error.message}
            </Typography>
          </Box>
        ) : filteredRelationships.length === 0 ? (
          <EmptyStateMemo
            activeFilter={activeFilter}
            filterLabel={currentFilterLabel}
            onAddContact={handleAddContact}
          />
        ) : (
          renderContacts
        )}

        {/* Floating Add Button - now shows for both mobile and desktop */}
        <FloatingAddButton onClick={handleAddContact}>
          <AddIcon fontSize="large" />
        </FloatingAddButton>
      </PageContainer>

      {/* Global Modals */}
      <ContactPermissionModal />
      <ContactSelectorModal />
      <DemoChatModal />
      <DemoAnalysisModal />
    </>
  );
});

Dashboard.displayName = "Dashboard";

export default React.memo(Dashboard);
