// frontend/src/layouts/MainLayout.js
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import HamburgerMenu from "../components/HamburgerMenu";
import TopBar from "../components/TopBar";
import { useGlobal } from "../contexts/GlobalContext";

// Styled components using CSS variables
const LayoutContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "var(--primary-bg)",
  width: "100%",
  position: "relative",
});

const MainContent = styled(Box)(({ theme, isMobile, sidebarExpanded }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: "var(--primary-bg)",
  color: "var(--text-primary)",
  width: "100%",

  // Dynamic margin based on sidebar state
  marginLeft: isMobile
    ? 0
    : sidebarExpanded
    ? "var(--sidebar-width)"
    : "var(--sidebar-width-collapsed)",
  transition: "margin-left 0.3s ease",

  // Ensure mobile gets no margin
  [theme.breakpoints.down("md")]: {
    marginLeft: "0 !important",
  },
}));

const ContentWrapper = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  backgroundColor: "var(--primary-bg)",
  position: "relative",
});

const PageContent = styled(Box)({
  flex: 1,
  width: "100%",
  backgroundColor: "var(--primary-bg)",
});

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { state } = useGlobal();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Listen for sidebar expansion changes
  useEffect(() => {
    // You can get sidebar state from global context or implement a way to track it
    // For now, we'll use a simple state that can be updated by the sidebar
    const handleSidebarChange = (expanded) => {
      setSidebarExpanded(expanded);
    };

    // Add event listener for sidebar state changes
    window.addEventListener("sidebarStateChange", (event) => {
      setSidebarExpanded(event.detail.expanded);
    });

    return () => {
      window.removeEventListener("sidebarStateChange", (event) => {
        setSidebarExpanded(event.detail.expanded);
      });
    };
  }, []);

  return (
    <LayoutContainer>
      {/* Hamburger Menu / Persistent Sidebar */}
      <HamburgerMenu />

      {/* Main Content Area */}
      <MainContent
        isMobile={isMobile}
        theme={theme}
        sidebarExpanded={sidebarExpanded}
      >
        <ContentWrapper>
          {/* Top Bar with SoulSync Logo and Profile */}
          <TopBar />

          {/* Page Content */}
          <PageContent>
            <Outlet />
          </PageContent>
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
};

export default MainLayout;
