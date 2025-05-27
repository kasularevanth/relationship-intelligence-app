import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Styled Components
const MetricsContainer = styled.div`
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1025px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MetricCard = styled.div`
  padding: 1.25rem;
  background-color: ${({ darkMode }) => (darkMode ? "#1e1e1e" : "#ffffff")};
  border-radius: 0.75rem;
  border: 1px solid
    ${({ darkMode }) =>
      darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 100%;
  min-height: 140px;
  transition: all 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 120px;
  }
`;

// Add this enhanced MetricCard component to your styled components
const EnhancedMetricCard = styled.div`
  padding: 1.25rem;
  background-color: ${({ darkMode }) => (darkMode ? "#1e1e1e" : "#ffffff")};
  border-radius: 0.75rem;
  border: 1px solid
    ${({ darkMode }) =>
      darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 100%;
  min-height: 160px; /* Increased for progress bars */
  transition: all 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${(props) => props.accentColor || "#6366f1"};
  }

  .progress-container {
    width: 100%;
    margin-top: 0.75rem;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: ${({ darkMode }) => (darkMode ? "#374151" : "#e5e7eb")};
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      ${(props) => props.accentColor || "#6366f1"},
      ${(props) => props.accentColor || "#8b5cf6"}
    );
    transition: width 1s ease-out;
    border-radius: 2px;
  }

  .progress-text {
    font-size: 0.75rem;
    color: ${({ darkMode }) => (darkMode ? "#9ca3af" : "#6b7280")};
    margin-top: 0.375rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 140px;
  }
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ darkMode }) => (darkMode ? "#9ca3af" : "#6b7280")};
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ darkMode }) => (darkMode ? "#fff" : "#111827")};
  display: flex;
  align-items: center;
  word-break: break-word;
  hyphens: auto;
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const MetricFooter = styled.div`
  font-size: 0.75rem;
  color: ${({ darkMode }) => (darkMode ? "#6b7280" : "#9ca3af")};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TopicsContainer = styled.div`
  margin-bottom: 2.5rem;
  background-color: ${({ darkMode }) => (darkMode ? "#1e1e1e" : "#ffffff")};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid
    ${({ darkMode }) =>
      darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"};
  animation: ${fadeIn} 0.7s ease-out;
`;

const SectionTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: ${({ darkMode }) => (darkMode ? "#fff" : "#111827")};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const IconBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background-color: ${(props) => props.bgColor || "rgba(99, 102, 241, 0.2)"};
  color: ${(props) => props.color || "#818cf8"};
`;

const TopicsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const TopicTag = styled.div`
  padding: 0.5rem 1rem;
  background-color: ${({ darkMode }) =>
    darkMode ? "rgba(31, 41, 55, 0.5)" : "rgba(243, 244, 246, 0.8)"};
  border-radius: 9999px;
  font-size: 0.875rem;
  color: ${({ darkMode }) => (darkMode ? "#e5e7eb" : "#4b5563")};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid
    ${({ darkMode }) =>
      darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const PercentBadge = styled.span`
  background-color: ${({ darkMode }) =>
    darkMode ? "rgba(55, 65, 81, 0.7)" : "rgba(209, 213, 219, 0.8)"};
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  color: ${({ darkMode }) => (darkMode ? "#d1d5db" : "#4b5563")};
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    display: flex;
    flex-direction: column;
  }
`;

const InsightsCard = styled.div`
  background-color: ${({ darkMode }) => (darkMode ? "#1e1e1e" : "#ffffff")};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid
    ${({ darkMode }) =>
      darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"};
  animation: ${slideInLeft} 0.5s ease-out;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
`;

const RecommendationsCard = styled.div`
  background-color: ${({ darkMode }) => (darkMode ? "#1e1e1e" : "#ffffff")};
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid
    ${({ darkMode }) =>
      darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"};
  animation: ${slideInRight} 0.5s ease-out;
  width: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }

  /* Desktop styles */
  @media (min-width: 769px) {
    transition: all 0.3s ease;
  }

  /* Mobile styles - completely disable constraints */
  @media (max-width: 768px) {
    padding: 1.25rem !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
    flex: none !important;
    transition: none !important;

    /* Force expansion class when applied */
    &.mobile-expanded {
      height: auto !important;
      min-height: auto !important;
      max-height: none !important;
      overflow: visible !important;
    }
  }
`;

const ListContainer = styled.ul`
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${({ darkMode }) => (darkMode ? "#d1d5db" : "#4b5563")};
  list-style-type: disc;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-grow: 1;

  @media (max-width: 768px) {
    padding-left: 1rem !important;
    margin-bottom: 0 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    min-height: fit-content !important;
    display: block !important;
    width: 100% !important;
    padding-right: 0.5rem !important;
    line-height: 1.6 !important;
    flex: none !important;
    position: relative !important;

    /* Force expansion class when applied */
    &.mobile-expanded {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      min-height: fit-content !important;
    }
  }
`;

const ListItem = styled.li`
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem !important;
    margin-bottom: 1rem !important;
    line-height: 1.7 !important;
    white-space: normal !important;
    word-break: break-word !important;
    hyphens: auto !important;
    padding-right: 0.25rem !important;
    min-height: auto !important;
    display: block !important;

    &:last-child {
      margin-bottom: 0.5rem !important;
    }
  }
`;

const LastUpdated = styled.div`
  margin-top: 1.5rem;
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
`;

const RelationshipMetrics = ({
  analysis,
  darkMode,
  relationshipColor,
  relationshipType,
}) => {
  const recommendationsSectionRef = useRef(null);
  const recommendationsListRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [forceExpansion, setForceExpansion] = useState(false);

  // Add this function at the top of your RelationshipMetrics component
  const getMetricDisplayData = (
    metricType,
    rawValue,
    relationshipType,
    conversationCount = 0
  ) => {
    const hasImportedData = conversationCount > 0;

    // Enhanced N/A detection - check for various N/A formats
    const isNAValue = (value) => {
      if (value === null || value === undefined) return true;
      if (value === "N/A") return true;
      if (typeof value === "string") {
        const normalizedValue = value.trim().toLowerCase();
        // Check for formatted N/A values like "You: N/A | Them: N/A"
        if (normalizedValue.includes("n/a")) return true;
        if (normalizedValue.includes("unknown")) return true;
        if (normalizedValue.includes("not available")) return true;
        if (normalizedValue.includes("not enough data")) return true;
        if (normalizedValue === "") return true;
        // Check for placeholder texts that indicate no data
        if (
          normalizedValue.includes("building") &&
          normalizedValue.includes("profile")
        )
          return true;
        if (
          normalizedValue.includes("waiting for") &&
          normalizedValue.includes("data")
        )
          return true;
      }
      return false;
    };

    // Always use contextual messages when there's no valid data OR no imported data
    if (isNAValue(rawValue) || !hasImportedData) {
      return getContextualMessage(
        metricType,
        relationshipType,
        hasImportedData,
        conversationCount
      );
    }

    // If we have a valid value and imported data, return it
    return {
      display: rawValue,
      subtitle: getMetricSubtitle(metricType, relationshipType),
      color: "#14b8a6",
      showProgress: false,
    };
  };

  const getMetricSubtitle = (metricType, relationshipType) => {
    const subtitles = {
      // Romantic relationship subtitles
      emotionalHealthScore: "Overall relationship satisfaction indicator",
      conflictFrequency: "How often disagreements occur",
      attachmentStyle: "Based on communication patterns",
      affectionLogisticsRatio: "Balance between emotional and practical talks",
      intimacyLevel: "Depth of emotional connection",
      conflictResolutionPattern: "How conflicts are typically resolved",

      // Friendship subtitles
      initiationBalance: "Who typically starts conversations",
      humorDepthRatio: "Light conversations vs serious topics",
      vulnerabilityIndex: "Level of personal sharing",
      longestGap: "Longest period without contact",
      topicDiversity: "Variety in conversation subjects",
      engagementConsistency: "Consistency of communication",

      // Professional subtitles
      professionalTone: "Level of formality in communication",
      powerDynamic: "Leadership patterns in conversations",
      responseTime: "Average time to respond to messages",
      taskSocialRatio: "Work-focused vs relationship-building",
      clarityIndex: "Clearness of communication",
      boundaryMaintenance: "Professional vs personal boundary",

      // Family subtitles
      familyPattern: "Primary interaction style",
      emotionalWarmth: "Level of affection expressed",
      familyRole: "Your primary role in the family",
      interactionFrequency: "How often you communicate",
      generationGap: "Generational differences detected",
      traditionAutonomyBalance: "Balance of values expressed",

      // Mentor subtitles
      guidanceStyle: "Direction vs collaborative approach",
      feedbackBalance: "Encouragement vs constructive criticism",
      growthFocus: "Primary development area",
      followThrough: "Completion of commitments",
      knowledgeTransfer: "Teaching effectiveness",
      goalSetting: "Structure of objectives",
    };

    return subtitles[metricType] || "Analyzing relationship patterns";
  };

  const getContextualMessage = (
    metricType,
    relationshipType,
    hasImportedData,
    conversationCount
  ) => {
    const type = relationshipType?.toLowerCase() || "";

    // Base messages for insufficient data
    const baseMessages = {
      // Professional relationship messages
      professionalTone: {
        display: hasImportedData
          ? "Analyzing formality level"
          : "How formal is your communication?",
        subtitle: "Import work conversations to measure tone",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 25 : 10,
      },
      powerDynamic: {
        display: hasImportedData
          ? "Studying leadership patterns"
          : "Who leads your conversations?",
        subtitle: "Analyzing directional communication patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 35 : 10,
      },
      responseTime: {
        display: hasImportedData
          ? "Calculating response patterns"
          : "How quickly do you both respond?",
        subtitle: "Import timestamps needed for response analysis",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 20 : 10,
      },
      taskSocialRatio: {
        display: hasImportedData
          ? "Measuring work vs personal balance"
          : "Business or relationship building?",
        subtitle: "Categorizing professional conversation topics",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },
      clarityIndex: {
        display: hasImportedData
          ? "Assessing communication clarity"
          : "How clear is your communication?",
        subtitle: "Analyzing message comprehension patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 40 : 10,
      },
      boundaryMaintenance: {
        display: hasImportedData
          ? "Evaluating professional boundaries"
          : "Professional or personal conversations?",
        subtitle: "Measuring boundary maintenance patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 35 : 10,
      },

      // Romantic relationship messages
      emotionalHealthScore: {
        display: hasImportedData
          ? "Building emotional profile"
          : "Ready to analyze your connection",
        subtitle:
          "Import your chat history to see relationship health insights",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },
      conflictFrequency: {
        display: hasImportedData
          ? "Learning conflict patterns"
          : "How often do you disagree?",
        subtitle: "Need more conversations to detect disagreement patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 25 : 10,
      },
      attachmentStyle: {
        display: hasImportedData
          ? "Analyzing communication style"
          : "What's your attachment style?",
        subtitle: "Import chats to discover attachment patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 35 : 10,
      },
      affectionLogisticsRatio: {
        display: hasImportedData
          ? "Measuring conversation balance"
          : "Romance vs daily logistics?",
        subtitle: "Import more messages to see this balance",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },
      intimacyLevel: {
        display: hasImportedData
          ? "Assessing emotional depth"
          : "How intimate are your conversations?",
        subtitle: "Analyzing intimacy requires more conversation history",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 40 : 10,
      },
      conflictResolutionPattern: {
        display: hasImportedData
          ? "Studying resolution methods"
          : "How do you resolve disagreements?",
        subtitle: "Patterns emerge after analyzing conflicts",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 25 : 10,
      },

      // Friendship messages
      initiationBalance: {
        display: hasImportedData
          ? "Tracking conversation starters"
          : "Who initiates your conversations?",
        subtitle: "Import chat history to see initiation patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 35 : 10,
      },
      humorDepthRatio: {
        display: hasImportedData
          ? "Measuring conversation depth"
          : "Fun conversations or deep talks?",
        subtitle: "Discovering balance between fun and serious topics",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },
      vulnerabilityIndex: {
        display: hasImportedData
          ? "Assessing openness level"
          : "How open are your conversations?",
        subtitle: "Personal sharing patterns need more data",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 40 : 10,
      },
      longestGap: {
        display: hasImportedData
          ? "Calculating communication gaps"
          : "What's your longest silence?",
        subtitle: "Analyzing conversation timeline patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 20 : 10,
      },
      topicDiversity: {
        display: hasImportedData
          ? "Measuring topic variety"
          : "What do you talk about most?",
        subtitle: "Need more conversations to measure diversity",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 35 : 10,
      },
      engagementConsistency: {
        display: hasImportedData
          ? "Tracking communication patterns"
          : "How consistent is your friendship?",
        subtitle: "Building consistency profile from chat history",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },

      // Family messages
      familyPattern: {
        display: hasImportedData
          ? "Learning family dynamics"
          : "What's your family communication style?",
        subtitle: "Analyzing primary interaction patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },
      emotionalWarmth: {
        display: hasImportedData
          ? "Measuring affection levels"
          : "How affectionate is your family?",
        subtitle: "Analyzing emotional expression patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 35 : 10,
      },
      familyRole: {
        display: hasImportedData
          ? "Identifying your family role"
          : "What role do you play in the family?",
        subtitle: "Discovering your primary family position",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 40 : 10,
      },
      interactionFrequency: {
        display: hasImportedData
          ? "Tracking communication frequency"
          : "How often do you stay in touch?",
        subtitle: "Building family contact pattern profile",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 25 : 10,
      },
      generationGap: {
        display: hasImportedData
          ? "Detecting generational differences"
          : "Any generational communication gaps?",
        subtitle: "Analyzing age-related communication patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 45 : 10,
      },
      traditionAutonomyBalance: {
        display: hasImportedData
          ? "Measuring values balance"
          : "Traditional or modern family values?",
        subtitle: "Analyzing expressed values in conversations",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 50 : 10,
      },

      // Mentor messages
      guidanceStyle: {
        display: hasImportedData
          ? "Analyzing guidance approach"
          : "Directive or collaborative mentoring?",
        subtitle: "Understanding mentorship communication style",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 40 : 10,
      },
      feedbackBalance: {
        display: hasImportedData
          ? "Measuring feedback patterns"
          : "Encouragement vs constructive criticism?",
        subtitle: "Analyzing feedback delivery style",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 35 : 10,
      },
      growthFocus: {
        display: hasImportedData
          ? "Identifying development areas"
          : "What growth areas are discussed?",
        subtitle: "Discovering primary development focus",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 45 : 10,
      },
      followThrough: {
        display: hasImportedData
          ? "Tracking commitment completion"
          : "How well are commitments kept?",
        subtitle: "Analyzing follow-through patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },
      knowledgeTransfer: {
        display: hasImportedData
          ? "Assessing teaching effectiveness"
          : "How effective is knowledge sharing?",
        subtitle: "Measuring learning and teaching patterns",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 50 : 10,
      },
      goalSetting: {
        display: hasImportedData
          ? "Analyzing goal structure"
          : "How are objectives set and tracked?",
        subtitle: "Understanding goal-setting approach",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 40 : 10,
      },

      // General metrics
      messageCount: {
        display: hasImportedData
          ? `${conversationCount} conversations analyzed`
          : "Ready to count your messages",
        subtitle: "Import chat history to see total message count",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 50 : 10,
      },
      sentimentLabel: {
        display: hasImportedData
          ? "Analyzing emotional tone"
          : "What's your conversation mood?",
        subtitle: "Sentiment analysis requires message history",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 40 : 10,
      },
      averageResponseTime: {
        display: hasImportedData
          ? "Calculating response speed"
          : "How quickly do you both respond?",
        subtitle: "Response time analysis needs timestamps",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      },
    };

    // Return the appropriate message or a default
    return (
      baseMessages[metricType] || {
        display: hasImportedData
          ? "Building relationship insights"
          : "Ready to analyze your connection",
        subtitle: "Import chat history to unlock this insight",
        color: "#6b7280",
        showProgress: true,
        progressValue: hasImportedData ? 30 : 10,
      }
    );
  };

  // Add this function to your RelationshipMetrics component
  const renderEnhancedMetric = (
    metricType,
    rawValue,
    label,
    accentColor,
    relationshipType,
    conversationCount
  ) => {
    // Always use getMetricDisplayData to determine what to display
    const displayData = getMetricDisplayData(
      metricType,
      rawValue,
      relationshipType,
      conversationCount
    );

    return (
      <EnhancedMetricCard
        darkMode={darkMode}
        accentColor={displayData.color}
        key={metricType}
      >
        <div style={{ width: "100%" }}>
          <MetricLabel darkMode={darkMode}>{label}</MetricLabel>
          <MetricValue darkMode={darkMode} style={{ color: displayData.color }}>
            {displayData.display}
          </MetricValue>
        </div>

        <MetricFooter darkMode={darkMode}>
          <span>{displayData.subtitle}</span>
        </MetricFooter>

        {displayData.showProgress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${displayData.progressValue}%`,
                  background: `linear-gradient(90deg, ${displayData.color}, ${displayData.color}80)`,
                }}
              />
            </div>
            <div className="progress-text">
              {displayData.progressValue < 30
                ? "Import chat history to unlock"
                : "Building insights..."}
            </div>
          </div>
        )}
      </EnhancedMetricCard>
    );
  };

  const hasValidAnalysisData = (analysis, conversationCount) => {
    // Check if we have actual imported conversations
    if (!conversationCount || conversationCount === 0) {
      return false;
    }

    // Check if insights are meaningful (not just placeholder text)
    const hasValidInsights =
      analysis.insights &&
      analysis.insights.length > 0 &&
      !analysis.insights.some(
        (insight) =>
          insight.toLowerCase().includes("import more") ||
          insight.toLowerCase().includes("need more data") ||
          insight.toLowerCase().includes("analyze more conversations")
      );

    // Check if recommendations are meaningful
    const hasValidRecommendations =
      analysis.recommendations &&
      analysis.recommendations.length > 0 &&
      !analysis.recommendations.some(
        (rec) =>
          rec.toLowerCase().includes("import more") ||
          rec.toLowerCase().includes("need more data") ||
          rec.toLowerCase().includes("add more conversations")
      );

    return hasValidInsights || hasValidRecommendations;
  };

  // Empty state component for insights/recommendations
  const InsightsEmptyState = ({ darkMode, relationshipType, contactName }) => {
    const getRelationshipSpecificMessage = (type) => {
      switch (type?.toLowerCase()) {
        case "romantic":
        case "partner":
          return {
            title: "Relationship Insights Coming Soon",
            description: `Import your chat history with ${contactName} to discover emotional patterns, conflict resolution styles, and intimacy insights.`,
            icon: "💕",
          };
        case "friendship":
        case "friend":
          return {
            title: "Friendship Insights Awaiting",
            description: `Upload conversations with ${contactName} to analyze humor patterns, vulnerability levels, and friendship consistency.`,
            icon: "👫",
          };
        case "professional":
        case "colleague":
          return {
            title: "Professional Insights Pending",
            description: `Import work conversations with ${contactName} to analyze communication styles, power dynamics, and collaboration patterns.`,
            icon: "💼",
          };
        case "family":
          return {
            title: "Family Dynamics Analysis Ready",
            description: `Upload family chats with ${contactName} to discover interaction patterns, emotional warmth, and generational communication styles.`,
            icon: "👨‍👩‍👧‍👦",
          };
        case "mentor":
        case "mentee":
          return {
            title: "Mentorship Insights Waiting",
            description: `Import conversations with ${contactName} to analyze guidance styles, feedback patterns, and knowledge transfer effectiveness.`,
            icon: "🎯",
          };
        default:
          return {
            title: "Relationship Insights Coming Soon",
            description: `Import your conversation history with ${contactName} to unlock personalized relationship insights and recommendations.`,
            icon: "🔍",
          };
      }
    };

    const message = getRelationshipSpecificMessage(relationshipType);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          textAlign: "center",
          backgroundColor: darkMode ? "#1a1a1a" : "#f8fafc",
          border: `2px dashed ${darkMode ? "#374151" : "#e2e8f0"}`,
          borderRadius: "12px",
          margin: "1.5rem 0",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
          }}
        >
          {message.icon}
        </div>

        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: darkMode ? "#ffffff" : "#1f2937",
            marginBottom: "0.75rem",
            margin: 0,
          }}
        >
          {message.title}
        </h3>

        <p
          style={{
            fontSize: "0.875rem",
            color: darkMode ? "#9ca3af" : "#6b7280",
            lineHeight: "1.6",
            maxWidth: "400px",
            margin: "0.75rem 0 1.5rem 0",
          }}
        >
          {message.description}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: darkMode ? "#6b7280" : "#9ca3af",
            fontStyle: "italic",
          }}
        >
          <span>💡</span>
          <span>
            The more conversations you import, the better the insights
          </span>
        </div>
      </div>
    );
  };

  // Updated JSX section for insights and recommendations
  const renderInsightsAndRecommendations = () => {
    const conversationCount = analysis.conversationCount || 0;
    const hasValidData = hasValidAnalysisData(analysis, conversationCount);

    // If no valid analysis data, show empty state
    if (!hasValidData) {
      return (
        <InsightsEmptyState
          darkMode={darkMode}
          relationshipType={relationshipType}
          contactName={analysis.contactName || "this contact"}
        />
      );
    }

    // Otherwise, show actual insights and recommendations
    return (
      <InsightsGrid>
        {/* Insights */}
        {analysis.insights && analysis.insights.length > 0 && (
          <InsightsCard darkMode={darkMode}>
            <SectionTitle darkMode={darkMode}>
              <IconBadge bgColor="rgba(16, 185, 129, 0.2)" color="#34d399">
                ✓
              </IconBadge>
              Key Insights
            </SectionTitle>
            <ListContainer darkMode={darkMode}>
              {analysis.insights?.map((insight, index) => (
                <ListItem key={index}>{insight}</ListItem>
              ))}
            </ListContainer>
          </InsightsCard>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <RecommendationsCard
            darkMode={darkMode}
            ref={recommendationsSectionRef}
            className={isMobile ? "mobile-expanded" : ""}
          >
            <SectionTitle darkMode={darkMode}>
              <IconBadge bgColor="rgba(245, 158, 11, 0.2)" color="#fbbf24">
                !
              </IconBadge>
              Recommendations
            </SectionTitle>
            <ListContainer
              darkMode={darkMode}
              ref={recommendationsListRef}
              className={isMobile ? "mobile-expanded" : ""}
            >
              {analysis.recommendations?.map((recommendation, index) => (
                <ListItem key={index}>{recommendation}</ListItem>
              ))}
            </ListContainer>
          </RecommendationsCard>
        )}
      </InsightsGrid>
    );
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force expansion on mobile using useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    if (isMobile && analysis.recommendations?.length > 0) {
      setForceExpansion(true);

      // Apply mobile expansion classes and styles
      const applyMobileExpansion = () => {
        if (recommendationsSectionRef.current) {
          const section = recommendationsSectionRef.current;
          section.classList.add("mobile-expanded");

          // Apply aggressive inline styles
          Object.assign(section.style, {
            height: "auto",
            minHeight: "auto",
            maxHeight: "none",
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
            transition: "none",
          });
        }

        if (recommendationsListRef.current) {
          const list = recommendationsListRef.current;
          list.classList.add("mobile-expanded");

          Object.assign(list.style, {
            height: "auto",
            minHeight: "fit-content",
            maxHeight: "none",
            overflow: "visible",
            display: "block",
            width: "100%",
            flex: "none",
          });
        }
      };

      // Apply immediately and after a small delay to handle race conditions
      applyMobileExpansion();
      setTimeout(applyMobileExpansion, 50);
      setTimeout(applyMobileExpansion, 200);
    }
  }, [isMobile, analysis.recommendations, forceExpansion]);

  // Additional effect to handle component updates
  useEffect(() => {
    if (isMobile && analysis.recommendations?.length > 0) {
      const interval = setInterval(() => {
        if (
          recommendationsSectionRef.current &&
          recommendationsListRef.current
        ) {
          const section = recommendationsSectionRef.current;
          const list = recommendationsListRef.current;

          // Check if elements are properly expanded
          const sectionHeight = section.offsetHeight;
          const listHeight = list.scrollHeight;

          if (sectionHeight < listHeight || list.style.maxHeight !== "none") {
            // Force re-expansion
            Object.assign(section.style, {
              height: "auto",
              minHeight: "auto",
              maxHeight: "none",
              overflow: "visible",
            });

            Object.assign(list.style, {
              height: "auto",
              maxHeight: "none",
              overflow: "visible",
            });
          }
        }
      }, 1000);

      // Clear interval after 10 seconds
      setTimeout(() => clearInterval(interval), 10000);

      return () => clearInterval(interval);
    }
  }, [isMobile, analysis.recommendations]);

  // Function to determine which metrics to display based on relationship type
  const renderTypeSpecificMetrics = () => {
    console.log("analysis", analysis);
    console.log("relationshipType", relationshipType);

    const type = relationshipType?.toLowerCase() || "";

    if (type.includes("romantic") || type.includes("partner")) {
      return renderRomanticMetrics();
    } else if (type.includes("friend") || type.includes("friendship")) {
      return renderFriendshipMetrics();
    } else if (
      type.includes("professional") ||
      type.includes("colleague") ||
      type.includes("work")
    ) {
      return renderProfessionalMetrics();
    } else if (type.includes("family")) {
      return renderFamilyMetrics();
    } else if (type.includes("mentor") || type.includes("mentee")) {
      return renderMentorMetrics();
    }

    return renderDefaultMetrics();
  };

  // Render metrics for Romantic relationships
  // Update your renderRomanticMetrics function
  const renderRomanticMetrics = () => {
    const conversationCount = analysis.conversationCount || 0;

    return (
      <MetricsGrid>
        {renderEnhancedMetric(
          "emotionalHealthScore",
          analysis.metrics?.emotionalHealthScore,
          "Emotional Health",
          "#fb7185",
          "romantic",
          conversationCount
        )}

        {renderEnhancedMetric(
          "conflictFrequency",
          analysis.metrics?.conflictFrequency,
          "Conflict Frequency",
          "#f472b6",
          "romantic",
          conversationCount
        )}

        {renderEnhancedMetric(
          "attachmentStyle",
          analysis.metrics?.attachmentStyle,
          "Attachment Style",
          "#e879f9",
          "romantic",
          conversationCount
        )}

        {renderEnhancedMetric(
          "affectionLogisticsRatio",
          analysis.metrics?.affectionLogisticsRatio,
          "Affection/Logistics",
          "#c084fc",
          "romantic",
          conversationCount
        )}

        {renderEnhancedMetric(
          "intimacyLevel",
          analysis.metrics?.intimacyLevel,
          "Intimacy Level",
          "#a78bfa",
          "romantic",
          conversationCount
        )}

        {renderEnhancedMetric(
          "conflictResolutionPattern",
          analysis.metrics?.conflictResolutionPattern,
          "Conflict Resolution",
          "#818cf8",
          "romantic",
          conversationCount
        )}
      </MetricsGrid>
    );
  };

  // Render metrics for Friendship relationships
  const renderFriendshipMetrics = () => {
    const conversationCount = analysis.conversationCount || 0;

    return (
      <MetricsGrid>
        {renderEnhancedMetric(
          "initiationBalance",
          analysis.metrics?.initiationBalance,
          "Initiation Balance",
          "#3b82f6",
          "friendship",
          conversationCount
        )}

        {renderEnhancedMetric(
          "humorDepthRatio",
          analysis.metrics?.humorDepthRatio,
          "Humor vs Depth",
          "#60a5fa",
          "friendship",
          conversationCount
        )}

        {renderEnhancedMetric(
          "vulnerabilityIndex",
          analysis.metrics?.vulnerabilityIndex,
          "Vulnerability",
          "#93c5fd",
          "friendship",
          conversationCount
        )}

        {renderEnhancedMetric(
          "longestGap",
          analysis.metrics?.longestGap,
          "Longest Gap",
          "#2563eb",
          "friendship",
          conversationCount
        )}

        {renderEnhancedMetric(
          "topicDiversity",
          analysis.metrics?.topicDiversity,
          "Topic Diversity",
          "#1d4ed8",
          "friendship",
          conversationCount
        )}

        {renderEnhancedMetric(
          "engagementConsistency",
          analysis.metrics?.engagementConsistency,
          "Engagement",
          "#1e40af",
          "friendship",
          conversationCount
        )}
      </MetricsGrid>
    );
  };

  // Render metrics for Professional relationships
  const renderProfessionalMetrics = () => {
    const conversationCount = analysis.conversationCount || 0;

    return (
      <MetricsGrid>
        {renderEnhancedMetric(
          "professionalTone",
          analysis.metrics?.professionalTone,
          "Professional Tone",
          "#14b8a6",
          "professional",
          conversationCount
        )}

        {renderEnhancedMetric(
          "powerDynamic",
          analysis.metrics?.powerDynamic,
          "Power Dynamic",
          "#20c997",
          "professional",
          conversationCount
        )}

        {renderEnhancedMetric(
          "responseTime",
          analysis.metrics?.responseTime,
          "Response Time",
          "#10b981",
          "professional",
          conversationCount
        )}

        {renderEnhancedMetric(
          "taskSocialRatio",
          analysis.metrics?.taskSocialRatio,
          "Task vs Social",
          "#059669",
          "professional",
          conversationCount
        )}

        {renderEnhancedMetric(
          "clarityIndex",
          analysis.metrics?.clarityIndex,
          "Clarity Index",
          "#047857",
          "professional",
          conversationCount
        )}

        {renderEnhancedMetric(
          "boundaryMaintenance",
          analysis.metrics?.boundaryMaintenance,
          "Boundaries",
          "#065f46",
          "professional",
          conversationCount
        )}
      </MetricsGrid>
    );
  };

  // Render metrics for Family relationships
  const renderFamilyMetrics = () => {
    const conversationCount = analysis.conversationCount || 0;

    return (
      <MetricsGrid>
        {renderEnhancedMetric(
          "familyPattern",
          analysis.metrics?.familyPattern,
          "Family Pattern",
          "#f97316",
          "family",
          conversationCount
        )}

        {renderEnhancedMetric(
          "emotionalWarmth",
          analysis.metrics?.emotionalWarmth,
          "Emotional Warmth",
          "#fb923c",
          "family",
          conversationCount
        )}

        {renderEnhancedMetric(
          "familyRole",
          analysis.metrics?.familyRole,
          "Family Role",
          "#fd7c3e",
          "family",
          conversationCount
        )}

        {renderEnhancedMetric(
          "interactionFrequency",
          analysis.metrics?.interactionFrequency,
          "Contact Frequency",
          "#ff8c42",
          "family",
          conversationCount
        )}

        {renderEnhancedMetric(
          "generationGap",
          analysis.metrics?.generationGap,
          "Generation Gap",
          "#ff9844",
          "family",
          conversationCount
        )}

        {renderEnhancedMetric(
          "traditionAutonomyBalance",
          analysis.metrics?.traditionAutonomyBalance,
          "Traditional vs. Modern",
          "#ffa647",
          "family",
          conversationCount
        )}
      </MetricsGrid>
    );
  };

  // Render metrics for Mentor/Mentee relationships
  const renderMentorMetrics = () => {
    const conversationCount = analysis.conversationCount || 0;

    return (
      <MetricsGrid>
        {renderEnhancedMetric(
          "guidanceStyle",
          analysis.metrics?.guidanceStyle,
          "Guidance Style",
          "#a855f7",
          "mentor",
          conversationCount
        )}

        {renderEnhancedMetric(
          "feedbackBalance",
          analysis.metrics?.feedbackBalance,
          "Feedback Balance",
          "#9333ea",
          "mentor",
          conversationCount
        )}

        {renderEnhancedMetric(
          "growthFocus",
          analysis.metrics?.growthFocus,
          "Growth Focus",
          "#8b5cf6",
          "mentor",
          conversationCount
        )}

        {renderEnhancedMetric(
          "followThrough",
          analysis.metrics?.followThrough,
          "Follow Through",
          "#7c3aed",
          "mentor",
          conversationCount
        )}

        {renderEnhancedMetric(
          "knowledgeTransfer",
          analysis.metrics?.knowledgeTransfer,
          "Knowledge Transfer",
          "#6d28d9",
          "mentor",
          conversationCount
        )}

        {renderEnhancedMetric(
          "goalSetting",
          analysis.metrics?.goalSetting,
          "Goal Setting",
          "#5b21b6",
          "mentor",
          conversationCount
        )}
      </MetricsGrid>
    );
  };

  // Default metrics for any relationship type
  const renderDefaultMetrics = () => {
    const conversationCount = analysis.conversationCount || 0;

    return (
      <MetricsGrid>
        {renderEnhancedMetric(
          "messageCount",
          analysis.metrics?.messageCount || 0,
          "Total Messages",
          relationshipColor,
          "default",
          conversationCount
        )}

        {renderEnhancedMetric(
          "sentimentLabel",
          analysis.metrics?.sentimentLabel,
          "Sentiment",
          analysis.metrics?.sentimentLabel?.includes("positive")
            ? "#10b981"
            : analysis.metrics?.sentimentLabel?.includes("negative")
            ? "#ef4444"
            : "#f59e0b",
          "default",
          conversationCount
        )}

        {renderEnhancedMetric(
          "averageResponseTime",
          analysis.metrics?.averageResponseTime,
          "Response Time",
          "#60a5fa",
          "default",
          conversationCount
        )}
      </MetricsGrid>
    );
  };

  return (
    <>
      {/* Type-specific metrics section */}
      <MetricsContainer>{renderTypeSpecificMetrics()}</MetricsContainer>

      {/* Topics section */}
      {analysis.metrics?.topTopics && analysis.metrics.topTopics.length > 0 && (
        <TopicsContainer darkMode={darkMode}>
          <SectionTitle darkMode={darkMode}>
            <IconBadge bgColor="rgba(99, 102, 241, 0.2)" color="#818cf8">
              #
            </IconBadge>
            Top Discussion Topics
          </SectionTitle>
          <TopicsGrid>
            {analysis.metrics.topTopics?.map((topic, index) => (
              <TopicTag key={index} darkMode={darkMode}>
                <span>{topic.name}</span>
                <PercentBadge darkMode={darkMode}>
                  {topic.percentage}%
                </PercentBadge>
              </TopicTag>
            ))}
          </TopicsGrid>
        </TopicsContainer>
      )}

      {/* Insights and Recommendations section */}
      {renderInsightsAndRecommendations()}

      {/* Last Updated */}
      {analysis.lastUpdated && (
        <LastUpdated>
          Last updated: {new Date(analysis.lastUpdated).toLocaleDateString()}
        </LastUpdated>
      )}
    </>
  );
};

export default RelationshipMetrics;
