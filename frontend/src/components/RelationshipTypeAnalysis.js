import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, Upload } from "lucide-react";
import { relationshipService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import RelationshipAnalyticsEmptyState from "./RelationshipAnalyticsEmptyState";
import RelationshipMetrics from "./RelationshipMetrics";

const RelationshipTypeAnalysis = ({
  relationship,
  refreshData,
  onImportClick,
  hideImportBanner,
}) => {
  const { darkMode } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const [showImportAnimation, setShowImportAnimation] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Enhanced function to determine if we have meaningful analysis data
  const hasAnalysisData = useMemo(() => {
    // If no analysis object at all
    if (!analysis) {
      return false;
    }

    // Check if the API returned "No conversations available for analysis"
    if (
      analysis.message &&
      analysis.message.includes("No conversations available")
    ) {
      return false;
    }

    // Check if metrics object exists and has meaningful data
    if (!analysis.metrics || typeof analysis.metrics !== "object") {
      return false;
    }

    // Check if metrics object is empty
    const metricsKeys = Object.keys(analysis.metrics);
    if (metricsKeys.length === 0) {
      return false;
    }

    // Check if all metric values are null, undefined, or "N/A"
    const hasValidMetrics = metricsKeys.some((key) => {
      const value = analysis.metrics[key];
      if (value === null || value === undefined || value === "N/A") {
        return false;
      }
      if (typeof value === "string" && value.trim() === "") {
        return false;
      }
      return true;
    });

    if (!hasValidMetrics) {
      return false;
    }

    // Check if we have meaningful insights or recommendations
    const hasValidInsights =
      analysis.insights &&
      Array.isArray(analysis.insights) &&
      analysis.insights.length > 0 &&
      !analysis.insights.every(
        (insight) =>
          !insight ||
          insight.trim() === "" ||
          insight.toLowerCase().includes("no conversations") ||
          insight.toLowerCase().includes("import more")
      );

    const hasValidRecommendations =
      analysis.recommendations &&
      Array.isArray(analysis.recommendations) &&
      analysis.recommendations.length > 0 &&
      !analysis.recommendations.every(
        (rec) =>
          !rec ||
          rec.trim() === "" ||
          rec.toLowerCase().includes("no conversations") ||
          rec.toLowerCase().includes("import more")
      );

    // We consider we have data if we have valid metrics OR valid insights/recommendations
    return hasValidMetrics || hasValidInsights || hasValidRecommendations;
  }, [analysis]);

  useEffect(() => {
    // Fetch relationship type-specific analysis if the relationship ID is available
    if (relationshipId && relationship?.relationshipType) {
      fetchAnalysis();
    }
  }, [relationshipId, relationship?.relationshipType]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);

      const timestamp = Date.now();
      const response = await relationshipService.getTypeAnalysis(
        relationshipId,
        {
          params: { timestamp },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (response.data) {
        setAnalysis(response.data);
      } else {
        setAnalysis(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching relationship type analysis:", error);
      setLoading(false);
      setAnalysis(null);
    }
  };

  const handleImportChat = () => {
    setShowImportAnimation(false);

    setTimeout(() => {
      sessionStorage.setItem("refreshRelationshipData", "true");
      sessionStorage.setItem("returnToRelationship", relationshipId);

      if (typeof onImportClick === "function") {
        onImportClick();
      } else {
        navigate(`/relationships/${relationshipId}/import`);
      }
    }, 300);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Get color based on relationship type for styling
  const getRelationshipColor = (type, isDarkMode) => {
    switch (type?.toLowerCase()) {
      case "romantic":
      case "partner":
        return isDarkMode ? "#9f1239" : "#fb7185";
      case "friendship":
      case "friend":
        return isDarkMode ? "#1d4ed8" : "#3b82f6";
      case "professional":
      case "colleague":
        return isDarkMode ? "#0f766e" : "#14b8a6";
      case "family":
        return isDarkMode ? "#a16207" : "#eab308";
      case "mentor":
      case "mentee":
      case "acquaintance":
      case "other":
        return isDarkMode ? "#7e22ce" : "#a855f7";
      default:
        return isDarkMode ? "#4f46e5" : "#6366f1";
    }
  };

  // Get section title based on relationship type
  const getRelationshipTitle = (type) => {
    switch (type?.toLowerCase()) {
      case "romantic":
      case "partner":
        return "Romantic Relationship Analytics";
      case "friendship":
      case "friend":
        return "Friendship Analytics";
      case "professional":
      case "colleague":
        return "Professional Relationship Analytics";
      case "family":
        return "Family Relationship Analytics";
      case "mentor":
      case "mentee":
      case "acquaintance":
      case "other":
        return "Mentor/Mentee Relationship Analytics";
      default:
        return "Relationship Type Analysis";
    }
  };

  const relationshipColor = getRelationshipColor(
    relationship?.relationshipType,
    darkMode
  );

  // Calculate dynamic max height based on content and screen size
  const getMaxHeight = () => {
    if (!expanded) return "0";

    // On mobile, we need much more height for recommendations
    if (isMobile) {
      // If we have analysis data with recommendations, allow much more height
      if (hasAnalysisData && analysis?.recommendations?.length > 0) {
        return "none"; // Remove height constraint completely on mobile
      }
      return "3000px"; // Fallback for mobile
    }

    // Desktop - keep original constraint
    return "2000px";
  };

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: darkMode
          ? "0 4px 12px rgba(0, 0, 0, 0.2)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
        marginBottom: "16px",
        border: darkMode
          ? "1px solid rgba(45, 45, 45, 0.2)"
          : "1px solid rgba(226, 232, 240, 0.8)",
        backgroundColor: darkMode ? "#0d0d0d" : "#ffffff",
      }}
    >
      <div
        style={{
          background: relationshipColor,
          color: "#ffffff",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "18px",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
        }}
        onClick={toggleExpanded}
      >
        <span style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
          {getRelationshipTitle(relationship?.relationshipType)}
        </span>
        <ChevronDown
          size={24}
          style={{
            transition: "transform 0.3s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </div>

      <div
        style={{
          maxHeight: getMaxHeight(),
          overflow:
            isMobile && expanded ? "visible" : expanded ? "auto" : "hidden",
          transition: isMobile ? "none" : "max-height 0.5s ease",
          background: darkMode ? "#121212" : "#ffffff",
          padding: expanded ? "0" : "0",
          // Force expansion on mobile
          ...(isMobile &&
            expanded && {
              height: "auto",
              minHeight: "auto",
              maxHeight: "none",
              overflow: "visible",
            }),
        }}
      >
        {/* Show loading state */}
        {loading && (
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <div
              style={{
                color: darkMode ? "#9ca3af" : "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              Analyzing relationship patterns...
            </div>
          </div>
        )}

        {/* Show empty state when no meaningful analysis data exists */}
        {!loading && !hasAnalysisData && relationship && (
          <div style={{ padding: "24px 20px" }}>
            <RelationshipAnalyticsEmptyState
              relationshipType={relationship?.relationshipType}
              contactName={relationship?.contactName || "your contact"}
              onImportClick={handleImportChat}
            />
          </div>
        )}

        {/* Show metrics only when we have meaningful analysis data */}
        {!loading && hasAnalysisData && (
          <div
            style={{
              padding: "24px 20px",
              // Additional mobile constraints removal
              ...(isMobile && {
                height: "auto",
                minHeight: "auto",
                maxHeight: "none",
                overflow: "visible",
              }),
            }}
          >
            <RelationshipMetrics
              analysis={analysis}
              darkMode={darkMode}
              relationshipColor={relationshipColor}
              relationshipType={relationship?.relationshipType}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipTypeAnalysis;
