// frontend/src/components/HamburgerMenu.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import CircleIcon from "@mui/icons-material/Circle";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 289;
const collapsedWidth = 100;
const expandedWidth = 289;

// Desktop Persistent Sidebar - Fixed alignment and spacing
const DesktopSidebar = styled(Box)(({ expanded }) => ({
  position: "fixed",
  left: 0,
  top: 0,
  width: expanded ? expandedWidth : collapsedWidth,
  height: "904px",
  background:
    "linear-gradient(180deg, rgba(20, 35, 84, 0.4) 0%, rgba(38, 54, 110, 0.4) 100%)",
  zIndex: "var(--z-index-sidebar)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "width 0.3s ease",
  backdropFilter: "blur(10px)",
  overflow: "hidden", // Prevent background color bleeding
}));

const SidebarContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  alignItems: "center",
});

const SidebarNavigation = styled(Box)(({ expanded }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: expanded ? "50px" : "80px",
  paddingBottom: expanded ? "50px" : "80px",
  gap: "40px",
  flex: 1,
  width: "100%",
  transition: "all 0.3s ease",
  justifyContent: "flex-start", // Align items to top instead of center
}));

// Collapse/Expand Icon Button - Special styling
const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: expanded ? "auto" : "44px", // Approx from 43.82px
  height: expanded ? "auto" : "42px", // Approx from 41.56px. Note: MUI IconButton might enforce square aspect if only one dimension is 'auto'
  padding: expanded ? "5px 4px" : "9px", // Approx from 9.41177px
  borderRadius: "16px",
  backgroundColor: "transparent",
  border: "1px solid transparent",
  minWidth: expanded ? "200px" : "44px",
  transition:
    "width 0.3s ease, min-width 0.3s ease, height 0.3s ease, padding 0.3s ease",
  position: "relative", // For icon positioning
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    // transform: 'translateY(-2px)', // Removed to simplify transition during expand/collapse
  },
  "& .MuiSvgIcon-root": {
    // Targeting the SVG icon directly
    fontSize: expanded ? "19px" : "22px", // Adjusted collapsed size
    color: "#FFFFFF",
    transition: "font-size 0.3s ease", // Removed transform transition as we swap icons
    // transformOrigin: 'center center', // Good practice but may not be needed if not rotating
  },
}));

// Regular navigation items
const SidebarItem = styled(IconButton)(({ active, expanded }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: expanded ? "flex-start" : "center",
  width: expanded ? "auto" : "56px",
  height: "56px",
  padding: expanded ? "16px 24px" : "16px",
  borderRadius: "16px",
  backgroundColor: active ? "rgba(54, 110, 255, 0.15)" : "transparent",
  border: active
    ? "1px solid rgba(54, 110, 255, 0.3)"
    : "1px solid transparent",
  boxShadow: active ? "0 8px 32px rgba(54, 110, 255, 0.2)" : "none",
  minWidth: expanded ? "200px" : "56px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: active
      ? "rgba(54, 110, 255, 0.2)"
      : "rgba(255, 255, 255, 0.08)",
    boxShadow: active
      ? "0 12px 40px rgba(54, 110, 255, 0.3)"
      : "0 4px 16px rgba(255, 255, 255, 0.1)",
    transform: "translateY(-2px)",
  },
}));

const SidebarIcon = styled(Box)(({ expanded, active }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  marginRight: expanded ? "12px" : "0",
  transition: "all 0.3s ease",
  flexShrink: 0,
  // When collapsed, remove any potential margin issues
  ...(expanded === false && {
    margin: "0 auto",
  }),
  "& svg": {
    fontSize: "24px",
    color: "#FFFFFF", // Changed: Always white
    filter: active ? "drop-shadow(0 0 8px rgba(54, 110, 255, 0.5))" : "none", // Active state has shadow
    display: "block",
    margin: "0 auto",
  },
}));

const SidebarText = styled(Typography)(({ expanded, active }) => ({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "18px",
  color: "#FFFFFF", // Changed: Always white
  opacity: expanded ? 1 : 0,
  visibility: expanded ? "visible" : "hidden",
  transition: "all 0.3s ease",
  whiteSpace: "nowrap",
  textShadow: active ? "0 0 8px rgba(54, 110, 255, 0.5)" : "none",
}));

const ExpandText = styled(Typography)(({ expanded }) => ({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "18px",
  color: "#FFFFFF",
  opacity: expanded ? 1 : 0,
  visibility: expanded ? "visible" : "hidden",
  transition: "all 0.3s ease",
  whiteSpace: "nowrap",
  marginLeft: expanded ? "10px" : "0",
}));

// Mobile Drawer (existing functionality)
const SidebarDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    backgroundColor: "var(--primary-bg)",
    color: "var(--text-primary)",
    border: "none",
    zIndex: 1300,
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  },
});

const MobileSidebarContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  padding: "20px 0",
});

const MobileSidebarHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 20px",
  marginBottom: "27px",
});

const SoulSyncLogo = styled(Typography)({
  fontFamily: "var(--font-family-primary)",
  fontWeight: 900,
  fontSize: "18px",
  lineHeight: "23px",
  letterSpacing: "-0.165px",
  background: "linear-gradient(273.89deg, #0046FF -12.54%, #A9C1FF 108.58%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
});

const CloseButton = styled(IconButton)({
  color: "var(--text-primary)",
  display: "block",
});

const MenuButton = styled(IconButton)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-primary)",
  width: "40px",
  height: "40px",
  padding: "8px",
  minWidth: "40px",
  backgroundColor: "transparent",
  border: "none",
  position: "absolute",
  top: "10px",
  left: "10px",
  zIndex: 1100,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
  },
  "& .MuiSvgIcon-root": {
    color: "var(--text-primary)",
    fontSize: "24px",
  },
});

const HamburgerMenu = ({ showMenuButton = true }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSidebarToggle = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);

    // Broadcast sidebar state change
    window.dispatchEvent(
      new CustomEvent("sidebarStateChange", {
        detail: { expanded: newState },
      })
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isActivePath = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path === "/dashboard" && location.pathname === "/dashboard")
      return true;
    if (path === "/reflect" && location.pathname === "/reflect") return true;
    if (path === "/settings" && location.pathname === "/settings") return true;
    return false;
  };

  // Navigation items (excluding expand/collapse for mobile)
  const navigationItems = [
    {
      text: "Home",
      icon: <HomeIcon />,
      path: "/",
      id: "home",
    },
    {
      text: "My Circle",
      icon: <CircleIcon />,
      path: "/dashboard",
      protected: true,
      id: "circle",
    },
    // {
    //   text: "Reflect",
    //   icon: <AutoAwesomeIcon />,
    //   path: "/reflect",
    //   protected: true,
    //   id: "reflect",
    // },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
      id: "settings",
    },
  ];

  // Mobile drawer content (excluding expand button)
  const mobileDrawer = (
    <MobileSidebarContent>
      <MobileSidebarHeader>
        {/* SoulSync Typography removed to match design */}
        <Box sx={{ flexGrow: 1 }} />{" "}
        {/* This will push the close icon to the right */}
        <IconButton onClick={() => setDrawerOpen(false)}>
          <CloseIcon sx={{ color: "var(--text-primary)" }} />
        </IconButton>
      </MobileSidebarHeader>

      <List sx={{ flex: 1, padding: "0 10px" }}>
        {navigationItems.map(
          (item) =>
            (!item.protected || currentUser) && (
              <ListItemButton
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  backgroundColor: isActivePath(item.path)
                    ? "#FFFFFF"
                    : "transparent",
                  borderRadius: "12px",
                  marginBottom: "5px",
                  padding: "12px 20px",
                  "&:hover": {
                    backgroundColor: isActivePath(item.path)
                      ? "#FFFFFF"
                      : "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "25px",
                    height: "25px",
                    marginRight: "11.76px",
                    "& svg": {
                      fontSize: "25px",
                      color: isActivePath(item.path)
                        ? "#366EFF"
                        : "var(--text-primary)",
                    },
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-family-primary)",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "21px",
                    color: isActivePath(item.path)
                      ? "#366EFF"
                      : "var(--text-primary)",
                  }}
                >
                  {item.text}
                </Typography>
              </ListItemButton>
            )
        )}
      </List>
    </MobileSidebarContent>
  );

  // Desktop sidebar content
  const desktopSidebar = (
    <SidebarContent>
      <SidebarNavigation expanded={sidebarExpanded}>
        {/* Expand/Collapse Button - Always first */}
        <ExpandButton
          expanded={sidebarExpanded}
          onClick={handleSidebarToggle}
          title={sidebarExpanded ? "Collapse" : "Expand"}
        >
          {sidebarExpanded ? <KeyboardDoubleArrowLeftIcon /> : <MenuIcon />}
          {sidebarExpanded && (
            <ExpandText expanded={sidebarExpanded}>Collapse</ExpandText>
          )}
        </ExpandButton>

        {/* Navigation Items */}
        {navigationItems.map((item) => {
          if (item.protected && !currentUser) return null;

          const isActive = isActivePath(item.path);

          return (
            <SidebarItem
              key={item.id}
              active={isActive}
              expanded={sidebarExpanded}
              onClick={() => handleNavigation(item.path)}
              title={!sidebarExpanded ? item.text : ""} // Tooltip when collapsed
            >
              <SidebarIcon expanded={sidebarExpanded} active={isActive}>
                {item.icon}
              </SidebarIcon>
              {sidebarExpanded && (
                <SidebarText expanded={sidebarExpanded} active={isActive}>
                  {item.text}
                </SidebarText>
              )}
            </SidebarItem>
          );
        })}
      </SidebarNavigation>
    </SidebarContent>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      {!isMobile && (
        <DesktopSidebar expanded={sidebarExpanded}>
          {desktopSidebar}
        </DesktopSidebar>
      )}

      {/* Mobile Menu Button and Drawer */}
      {isMobile && showMenuButton && (
        <>
          <MenuButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </MenuButton>

          <SidebarDrawer
            variant="temporary"
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {mobileDrawer}
          </SidebarDrawer>
        </>
      )}
    </>
  );
};

export default HamburgerMenu;
