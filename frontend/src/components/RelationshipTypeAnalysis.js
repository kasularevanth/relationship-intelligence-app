// src/components/RelationshipTypeAnalysis.js
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { relationshipService } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import RelationshipMetrics from "./RelationshipMetrics";

const RelationshipTypeAnalysis = ({
  relationship,
  refreshData,
  onImportClick,
  hideImportBanner,
}) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { relationshipId } = useParams();

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
      if (typeof value === "string") {
        const normalizedValue = value.trim().toLowerCase();
        // Check for formatted N/A values like "You: N/A | Them: N/A"
        if (normalizedValue.includes("n/a")) return false;
        if (normalizedValue.includes("unknown")) return false;
        if (normalizedValue.includes("not available")) return false;
        if (normalizedValue.includes("not enough data")) return false;
        if (normalizedValue === "") return false;
        // Check for placeholder texts that indicate no data
        if (
          normalizedValue.includes("building") &&
          normalizedValue.includes("profile")
        )
          return false;
        if (
          normalizedValue.includes("waiting for") &&
          normalizedValue.includes("data")
        )
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

  // Show loading state
  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing relationship patterns...</p>
      </div>
    );
  }

  // Show metrics when we have analysis data
  if (hasAnalysisData) {
    return (
      <div className="relationship-analysis-metrics">
        <RelationshipMetrics
          analysis={analysis}
          darkMode={darkMode}
          relationshipType={relationship?.relationshipType}
          contactName={relationship?.contactName}
        />
      </div>
    );
  }

  // Show empty state when no data is available
  return (
    <div className="analysis-empty-state">
      <div className="empty-state-content">
        <div className="empty-state-icon">
          <span className="icon-placeholder">📊</span>
        </div>
        <h3 className="empty-state-title">
          Ready to Analyze Your Relationship
        </h3>
        <p className="empty-state-description">
          Import your chat history with{" "}
          {relationship?.contactName || "this contact"} to unlock detailed
          relationship insights and analytics.
        </p>
        <button onClick={onImportClick} className="btn-primary empty-state-btn">
          Import Chat History
        </button>
      </div>
    </div>
  );
};

export default RelationshipTypeAnalysis;
