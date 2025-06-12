// src/pages/RelationshipAnalysisPage.js - FIXED VERSION
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, AlertCircle, Upload } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useRelationships } from "../hooks/useRelationships";
import { useAvatar } from "../contexts/GlobalContext";
import RelationshipTypeAnalysis from "../components/RelationshipTypeAnalysis";
import RelationshipTypeBadge from "../components/RelationshipTypeBadge";

const RelationshipAnalysisPage = () => {
  const { darkMode } = useTheme();
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    getAvatarData,
    getUserInitials,
    getUserPhoto,
    getContactInitials,
    getContactPhoto,
  } = useAvatar();

  // Use the relationships hook instead of direct API calls
  const {
    relationships,
    loading: relationshipsLoading,
    error: relationshipsError,
    refresh: refreshRelationships,
  } = useRelationships();

  const [localError, setLocalError] = useState(null);
  const [forceShowAnalysis, setForceShowAnalysis] = useState(false);

  // Find the specific relationship from the hook data
  const relationship = useMemo(() => {
    if (!relationships || !relationshipId) return null;
    return relationships.find(
      (rel) => rel._id === relationshipId || rel.id === relationshipId
    );
  }, [relationships, relationshipId]);

  // Get avatar data using the utility from context
  const avatarData = useMemo(() => {
    if (!currentUser || !relationship) return null;
    return getAvatarData(currentUser, relationship);
  }, [currentUser, relationship, getAvatarData]);

  // IMPROVED: More comprehensive check for imported data
  const hasImportedData = useMemo(() => {
    if (!relationship) return false;

    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const isFromImport = urlParams.get("from_import") === "true";
    const hasRefreshParam = urlParams.get("refresh");

    if (isFromImport || hasRefreshParam || forceShowAnalysis) {
      return true;
    }

    // Check for conversations/sessions
    const hasConversations =
      (relationship.conversations && relationship.conversations.length > 0) ||
      (relationship.sessions && relationship.sessions.length > 0);

    // Check for metrics - be more flexible
    const hasMetrics =
      relationship.metrics &&
      (relationship.metrics.totalMessages > 0 ||
        relationship.metrics.messageCount > 0 ||
        Object.keys(relationship.metrics).length > 0);

    // Check for any analysis data
    const hasAnalysis =
      relationship.analysis ||
      relationship.importAnalysis ||
      relationship.typeAnalysis;

    // Check for topics
    const hasTopics =
      relationship.topicDistribution &&
      relationship.topicDistribution.length > 0;

    // Check localStorage for recent import
    const recentImport = localStorage.getItem("relationship_data_updated");
    const isRecentImport = recentImport === relationshipId;

    // Check sessionStorage for refresh indication
    const shouldRefresh = sessionStorage.getItem("refreshRelationshipData");

    console.log("Import data check:", {
      relationshipId,
      hasConversations,
      hasMetrics,
      hasAnalysis,
      hasTopics,
      isRecentImport,
      shouldRefresh,
      relationship: relationship,
    });

    return (
      hasConversations ||
      hasMetrics ||
      hasAnalysis ||
      hasTopics ||
      isRecentImport ||
      shouldRefresh === "true"
    );
  }, [relationship, relationshipId, forceShowAnalysis]);

  useEffect(() => {
    // If we have relationship ID but no relationship data, try to refresh
    if (
      relationshipId &&
      !relationshipsLoading &&
      !relationship &&
      !relationshipsError
    ) {
      console.log("Relationship not found, refreshing data...");
      refreshRelationships();
    }
  }, [
    relationshipId,
    relationship,
    relationshipsLoading,
    relationshipsError,
    refreshRelationships,
  ]);

  // Check for updated data from localStorage/sessionStorage
  useEffect(() => {
    const checkForUpdates = () => {
      const dataUpdated = localStorage.getItem("relationship_data_updated");
      const shouldRefresh = sessionStorage.getItem("refreshRelationshipData");

      if (dataUpdated === relationshipId || shouldRefresh === "true") {
        console.log("Data updated detected, refreshing...");
        setForceShowAnalysis(true); // Force show analysis
        refreshRelationships();
        localStorage.removeItem("relationship_data_updated");
        sessionStorage.removeItem("refreshRelationshipData");
      }
    };

    checkForUpdates();

    // Listen for storage events
    window.addEventListener("storage", checkForUpdates);
    return () => window.removeEventListener("storage", checkForUpdates);
  }, [relationshipId, refreshRelationships]);

  // ADDED: Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isFromImport = urlParams.get("from_import") === "true";
    const hasRefreshParam = urlParams.get("refresh");

    if (isFromImport || hasRefreshParam) {
      setForceShowAnalysis(true);
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  const handleBack = () => {
    navigate(`/relationship-circle/${relationshipId}`);
  };

  const handleReflectWithAI = () => {
    navigate(`/relationships/${relationshipId}/questions`);
  };

  const handleImportChat = () => {
    navigate(`/relationship-circle/${relationshipId}/import`);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download analysis");
  };

  const handleAddNewRelationship = () => {
    navigate("/add-relationship");
  };

  // ADDED: Force show analysis function
  const handleForceShowAnalysis = () => {
    setForceShowAnalysis(true);
  };

  // Avatar component using the same logic as RelationshipCircle
  const Avatar = ({ data, className = "", zIndex = 1 }) => {
    const handleImageError = (e) => {
      // Hide image and show initials on error
      e.target.style.display = "none";
      const initialsElement = e.target.nextSibling;
      if (initialsElement) {
        initialsElement.style.display = "flex";
      }
    };

    return (
      <div
        className={`analysis-avatar-container ${className}`}
        style={{ zIndex }}
      >
        <div
          className="analysis-avatar"
          style={{ backgroundColor: data.color }}
        >
          {data.photo && (
            <img
              src={data.photo}
              alt="Avatar"
              className="analysis-avatar-image"
              onError={handleImageError}
            />
          )}
          <div
            className="analysis-avatar-initials"
            style={{ display: data.photo ? "none" : "flex" }}
          >
            {data.initials}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (relationshipsLoading) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-blur"></div>
        <div className="relationship-analysis-loading">
          <div className="loading-spinner"></div>
          <p>Loading relationship analysis...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (relationshipsError || localError) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-blur"></div>
        <div className="relationship-analysis-error">
          <AlertCircle
            size={48}
            color="#ff6b6b"
            style={{ marginBottom: "16px" }}
          />
          <p>
            {relationshipsError?.message ||
              localError ||
              "Failed to load relationship data"}
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleBack} className="btn-secondary">
              Go Back
            </button>
            <button onClick={refreshRelationships} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Relationship not found
  if (!relationship) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-blur"></div>
        <div className="relationship-analysis-error">
          <AlertCircle
            size={48}
            color="#ff6b6b"
            style={{ marginBottom: "16px" }}
          />
          <p>Relationship not found</p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleBack} className="btn-secondary">
              Go Back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MODIFIED: Show import prompt only if no data AND not forced to show analysis
  if (!hasImportedData && !forceShowAnalysis) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-blur"></div>

        {/* Header */}
        <header className="relationship-analysis-header">
          <button
            onClick={handleBack}
            className="back-button"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="page-title">Relationship Analysis</h1>
        </header>

        <main className="relationship-analysis-content">
          {/* Profile section */}
          <div className="profile-section">
            <div className="profile-avatars">
              {avatarData && (
                <>
                  <Avatar
                    data={avatarData.user}
                    className="analysis-user-avatar"
                    zIndex={2}
                  />
                  <Avatar
                    data={avatarData.contact}
                    className="analysis-contact-avatar"
                    zIndex={1}
                  />
                </>
              )}
            </div>

            <div className="profile-info">
              <h2 className="profile-names">
                {avatarData
                  ? avatarData.displayName
                  : `You & ${relationship.contactName}`}
              </h2>
              <RelationshipTypeBadge type={relationship.relationshipType} />
            </div>
          </div>

          {/* Import Required Message */}
          <div className="import-required-container">
            <div className="import-required-content">
              <Upload
                size={64}
                color="#6366f1"
                style={{ marginBottom: "24px" }}
              />
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "var(--text-primary)",
                }}
              >
                Import Chat History to View Analysis
              </h3>
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  marginBottom: "32px",
                  textAlign: "center",
                  maxWidth: "400px",
                }}
              >
                To view detailed relationship analysis and insights, you need to
                import your chat history first.
              </p>

              <div className="import-actions">
                <button
                  onClick={handleImportChat}
                  className="btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <Upload size={20} />
                  Import Chat History
                </button>

                <button
                  onClick={handleReflectWithAI}
                  className="btn-secondary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <Sparkles size={20} />
                  Reflect with AI Instead
                </button>

                {/* DEBUG: Add a force show button for testing */}
                <button
                  onClick={handleForceShowAnalysis}
                  className="btn-outline"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    padding: "8px 16px",
                  }}
                >
                  Force Show Analysis (Debug)
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main analysis view - relationship has imported data OR forced to show
  return (
    <div className="relationship-analysis-page">
      {/* Background blur effect */}
      <div className="relationship-analysis-blur"></div>

      {/* Header */}
      <header className="relationship-analysis-header">
        <button
          onClick={handleBack}
          className="back-button"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title">Relationship Analysis</h1>
      </header>

      {/* Main content */}
      <main className="relationship-analysis-content">
        {/* Action buttons */}
        <div className="action-buttons">
          <button
            onClick={handleReflectWithAI}
            className="btn-primary action-btn"
          >
            <Sparkles size={20} />
            Reflect with AI
          </button>
        </div>

        {/* Profile section */}
        <div className="profile-section">
          <div className="profile-avatars">
            {avatarData && (
              <>
                <Avatar
                  data={avatarData.user}
                  className="analysis-user-avatar"
                  zIndex={2}
                />
                <Avatar
                  data={avatarData.contact}
                  className="analysis-contact-avatar"
                  zIndex={1}
                />
              </>
            )}
          </div>

          <div className="profile-info">
            <h2 className="profile-names">
              {avatarData
                ? avatarData.displayName
                : `You & ${relationship.contactName}`}
            </h2>
            <RelationshipTypeBadge type={relationship.relationshipType} />
          </div>
        </div>

        {/* Relationship Analysis */}
        <div className="analysis-container">
          <RelationshipTypeAnalysis
            relationship={relationship}
            refreshData={refreshRelationships}
            onImportClick={handleImportChat}
            hideImportBanner={true}
            forceShowAnalysis={forceShowAnalysis}
          />
        </div>

        {/* Bottom action buttons */}
        <div className="bottom-actions">
          <button onClick={handleDownload} className="btn-primary bottom-btn">
            Download
          </button>
          <button
            onClick={handleAddNewRelationship}
            className="btn-secondary bottom-btn"
          >
            Add New Relationship
          </button>
        </div>
      </main>
    </div>
  );
};

export default RelationshipAnalysisPage;
