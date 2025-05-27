import React, { useState, useEffect } from "react";
import {
  Upload,
  PieChart,
  BarChart2,
  Heart,
  Users,
  Zap,
  Activity,
  Briefcase,
  Home,
  GraduationCap,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const RelationshipAnalyticsEmptyState = ({
  relationshipType,
  contactName,
  onImportClick,
}) => {
  const { darkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);

  // Define colors based on relationship type
  const getTypeColors = () => {
    switch (relationshipType?.toLowerCase()) {
      case "romantic":
      case "partner":
        return {
          primary: "from-rose-500 to-red-500",
          icon: "text-rose-500",
          accent: "bg-rose-100 dark:bg-rose-900/20",
          bg: darkMode ? "rgba(136, 19, 55, 0.1)" : "#ffe4e6",
          cardBg: darkMode ? "rgba(136, 19, 55, 0.2)" : "#ffe4e6",
        };
      case "friendship":
      case "friend":
        return {
          primary: "from-blue-500 to-indigo-500",
          icon: "text-blue-500",
          accent: "bg-blue-100 dark:bg-blue-900/20",
          bg: darkMode ? "rgba(30, 58, 138, 0.1)" : "#dbeafe",
          cardBg: darkMode ? "rgba(30, 58, 138, 0.2)" : "#dbeafe",
        };
      case "professional":
      case "colleague":
        return {
          primary: "from-teal-500 to-emerald-500",
          icon: "text-teal-500",
          accent: "bg-teal-100 dark:bg-teal-900/20",
          bg: darkMode ? "rgba(19, 78, 74, 0.1)" : "#ccfbf1",
          cardBg: darkMode ? "rgba(19, 78, 74, 0.2)" : "#ccfbf1",
        };
      case "family":
        return {
          primary: "from-amber-500 to-yellow-500",
          icon: "text-amber-500",
          accent: "bg-amber-100 dark:bg-amber-900/20",
          bg: darkMode ? "rgba(120, 53, 15, 0.1)" : "#fef3c7",
          cardBg: darkMode ? "rgba(120, 53, 15, 0.2)" : "#fef3c7",
        };
      case "mentor":
      case "mentee":
        return {
          primary: "from-purple-500 to-violet-500",
          icon: "text-purple-500",
          accent: "bg-purple-100 dark:bg-purple-900/20",
          bg: darkMode ? "rgba(88, 28, 135, 0.1)" : "#f3e8ff",
          cardBg: darkMode ? "rgba(88, 28, 135, 0.2)" : "#f3e8ff",
        };
      default:
        return {
          primary: "from-indigo-500 to-purple-500",
          icon: "text-indigo-500",
          accent: "bg-indigo-100 dark:bg-indigo-900/20",
          bg: darkMode ? "rgba(49, 46, 129, 0.1)" : "#e0e7ff",
          cardBg: darkMode ? "rgba(49, 46, 129, 0.2)" : "#e0e7ff",
        };
    }
  };

  const colors = getTypeColors();

  const getTypeIcon = () => {
    switch (relationshipType?.toLowerCase()) {
      case "romantic":
      case "partner":
        return <Heart size={24} className={colors.icon} />;
      case "friendship":
      case "friend":
        return <Users size={24} className={colors.icon} />;
      case "professional":
      case "colleague":
        return <Briefcase size={24} className={colors.icon} />;
      case "family":
        return <Home size={24} className={colors.icon} />;
      case "mentor":
      case "mentee":
        return <GraduationCap size={24} className={colors.icon} />;
      default:
        return <PieChart size={24} className={colors.icon} />;
    }
  };

  // Get comprehensive analytics preview for each relationship type
  const getAnalyticsPreview = () => {
    switch (relationshipType?.toLowerCase()) {
      case "romantic":
      case "partner":
        return {
          title: "Romantic Relationship Analytics",
          metrics: [
            {
              label: "Emotional Health",
              question: "How strong is your emotional connection?",
              description: "Overall relationship satisfaction indicator",
            },
            {
              label: "Conflict Frequency",
              question: "How often do you disagree?",
              description: "Frequency and patterns of disagreements",
            },
            {
              label: "Attachment Style",
              question: "What's your attachment pattern?",
              description: "Communication and bonding style analysis",
            },
            {
              label: "Affection/Logistics Ratio",
              question: "Romance vs daily logistics?",
              description: "Balance between emotional and practical talks",
            },
            {
              label: "Intimacy Level",
              question: "How intimate are your conversations?",
              description: "Depth of emotional and physical connection",
            },
            {
              label: "Conflict Resolution",
              question: "How do you resolve disagreements?",
              description: "Methods and patterns of conflict resolution",
            },
          ],
          insights: [
            "Emotional connection patterns and relationship health indicators",
            "Communication style compatibility and attachment dynamics",
            "Conflict resolution effectiveness and relationship growth areas",
          ],
        };

      case "friendship":
      case "friend":
        return {
          title: "Friendship Analytics",
          metrics: [
            {
              label: "Initiation Balance",
              question: "Who initiates your conversations?",
              description: "Balance of conversation starters",
            },
            {
              label: "Humor vs Depth",
              question: "Fun conversations or deep talks?",
              description: "Balance between light and serious topics",
            },
            {
              label: "Vulnerability Index",
              question: "How open are your conversations?",
              description: "Level of personal sharing and trust",
            },
            {
              label: "Longest Gap",
              question: "What's your longest silence?",
              description: "Communication consistency patterns",
            },
            {
              label: "Topic Diversity",
              question: "What do you talk about most?",
              description: "Variety in conversation subjects",
            },
            {
              label: "Engagement Consistency",
              question: "How consistent is your friendship?",
              description: "Reliability and stability of connection",
            },
          ],
          insights: [
            "Friendship depth and mutual engagement patterns",
            "Communication balance and conversation preferences",
            "Trust levels and emotional support dynamics",
          ],
        };

      case "professional":
      case "colleague":
        return {
          title: "Professional Relationship Analytics",
          metrics: [
            {
              label: "Professional Tone",
              question: "How formal is your communication?",
              description: "Level of formality in conversations",
            },
            {
              label: "Power Dynamic",
              question: "Who leads your conversations?",
              description: "Leadership patterns and hierarchy",
            },
            {
              label: "Response Time",
              question: "How quickly do you both respond?",
              description: "Communication speed and urgency patterns",
            },
            {
              label: "Task vs Social",
              question: "Business or relationship building?",
              description: "Work-focused vs relationship conversations",
            },
            {
              label: "Clarity Index",
              question: "How clear is your communication?",
              description: "Message comprehension and clarity",
            },
            {
              label: "Boundaries",
              question: "Professional or personal conversations?",
              description: "Professional vs personal boundary patterns",
            },
          ],
          insights: [
            "Communication effectiveness and professional rapport",
            "Collaboration style and workflow optimization opportunities",
            "Professional development and mentoring patterns",
          ],
        };

      case "family":
        return {
          title: "Family Relationship Analytics",
          metrics: [
            {
              label: "Family Pattern",
              question: "What's your family communication style?",
              description: "Primary interaction and communication patterns",
            },
            {
              label: "Emotional Warmth",
              question: "How affectionate is your family?",
              description: "Level of emotional expression and care",
            },
            {
              label: "Family Role",
              question: "What role do you play in the family?",
              description: "Your position and function in family dynamics",
            },
            {
              label: "Contact Frequency",
              question: "How often do you stay in touch?",
              description: "Communication frequency and consistency",
            },
            {
              label: "Generation Gap",
              question: "Any generational communication gaps?",
              description: "Age-related communication differences",
            },
            {
              label: "Traditional vs Modern",
              question: "Traditional or modern family values?",
              description: "Balance of traditional and contemporary values",
            },
          ],
          insights: [
            "Family dynamics and communication patterns",
            "Emotional support and relationship quality",
            "Generational differences and value alignment",
          ],
        };

      case "mentor":
      case "mentee":
        return {
          title: "Mentorship Analytics",
          metrics: [
            {
              label: "Guidance Style",
              question: "Directive or collaborative mentoring?",
              description: "Approach to providing guidance and direction",
            },
            {
              label: "Feedback Balance",
              question: "Encouragement vs constructive criticism?",
              description: "Balance of positive and developmental feedback",
            },
            {
              label: "Growth Focus",
              question: "What growth areas are discussed?",
              description: "Primary areas of development and learning",
            },
            {
              label: "Follow Through",
              question: "How well are commitments kept?",
              description: "Reliability in following through on agreements",
            },
            {
              label: "Knowledge Transfer",
              question: "How effective is knowledge sharing?",
              description: "Teaching and learning effectiveness",
            },
            {
              label: "Goal Setting",
              question: "How are objectives set and tracked?",
              description: "Structure and clarity of goal-setting process",
            },
          ],
          insights: [
            "Mentoring effectiveness and learning outcomes",
            "Communication style and feedback quality",
            "Professional development and goal achievement patterns",
          ],
        };

      default:
        return {
          title: `${contactName} Relationship Analytics`,
          metrics: [
            {
              label: "Communication Patterns",
              question: "How do you typically communicate?",
              description: "General communication style and preferences",
            },
            {
              label: "Interaction Frequency",
              question: "How often do you connect?",
              description: "Frequency and timing of interactions",
            },
            {
              label: "Topic Preferences",
              question: "What do you discuss most?",
              description: "Primary conversation topics and themes",
            },
          ],
          insights: [
            "Overall relationship dynamics and communication patterns",
            "Connection strength and interaction quality",
          ],
        };
    }
  };

  const analytics = getAnalyticsPreview();

  // Animation effect for floating icons when hovered
  useEffect(() => {
    if (isHovered) {
      const icons = [
        {
          icon: <Heart size={16} />,
          style: { top: "20%", left: "10%", animationDelay: "0s" },
        },
        {
          icon: <BarChart2 size={16} />,
          style: { top: "70%", left: "80%", animationDelay: "0.5s" },
        },
        {
          icon: <PieChart size={16} />,
          style: { top: "80%", left: "30%", animationDelay: "1s" },
        },
        {
          icon: <Users size={16} />,
          style: { top: "30%", left: "85%", animationDelay: "1.5s" },
        },
        {
          icon: <Activity size={16} />,
          style: { top: "10%", left: "60%", animationDelay: "2s" },
        },
        {
          icon: <Zap size={16} />,
          style: { top: "50%", left: "15%", animationDelay: "2.5s" },
        },
      ];
      setFloatingIcons(icons);
    } else {
      setFloatingIcons([]);
    }
  }, [isHovered]);

  return (
    <div style={{ width: "100%", position: "relative", overflow: "hidden" }}>
      {/* Main Empty State Card */}
      <div
        style={{
          padding: "2rem",
          borderRadius: "0.75rem",
          background: darkMode
            ? "rgba(17, 24, 39, 0.8)"
            : "rgba(249, 250, 251, 0.8)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${
            darkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.8)"
          }`,
          boxShadow: darkMode
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
          marginBottom: "1.5rem",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating icons animation */}
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              width: "2rem",
              height: "2rem",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: colors.cardBg,
              opacity: 0,
              animation: "float 3s ease-in-out infinite",
              ...item.style,
              animationDelay: item.style.animationDelay,
            }}
          >
            {item.icon}
          </div>
        ))}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "9999px",
              background: colors.cardBg,
            }}
          >
            {getTypeIcon()}
          </div>

          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: darkMode ? "white" : "#1f2937",
              marginBottom: "0.5rem",
            }}
          >
            {analytics.title}
          </h3>

          <p
            style={{
              color: darkMode ? "#d1d5db" : "#4b5563",
              marginBottom: "1.5rem",
              maxWidth: "28rem",
              fontSize: "0.875rem",
            }}
          >
            Import your chat history with {contactName} to unlock personalized
            analytics and insights.
          </p>

          <button
            onClick={onImportClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(to right, #4f46e5, #8b5cf6)",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.3s ease",
              boxShadow: darkMode
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.4)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 6px 8px -1px rgba(0, 0, 0, 0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            }}
          >
            <Upload size={18} style={{ marginRight: "0.5rem" }} />
            <span>Import Chat History</span>
          </button>
        </div>
      </div>

      {/* Analytics Preview Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {analytics.metrics.slice(0, 6).map((metric, index) => (
          <div
            key={index}
            style={{
              padding: "1.25rem",
              background: darkMode ? "#1f2937" : "#ffffff",
              borderRadius: "0.75rem",
              border: `1px solid ${
                darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"
              }`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                background: analytics.title.includes("Romantic")
                  ? "#fb7185"
                  : analytics.title.includes("Friend")
                  ? "#3b82f6"
                  : analytics.title.includes("Professional")
                  ? "#14b8a6"
                  : analytics.title.includes("Family")
                  ? "#f59e0b"
                  : analytics.title.includes("Mentor")
                  ? "#a855f7"
                  : "#6366f1",
              }}
            />

            <div
              style={{
                fontSize: "0.875rem",
                color: darkMode ? "#9ca3af" : "#6b7280",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              {metric.label}
            </div>

            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: darkMode ? "#e5e7eb" : "#374151",
                marginBottom: "0.5rem",
                lineHeight: "1.4",
              }}
            >
              {metric.question}
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: darkMode ? "#9ca3af" : "#6b7280",
                lineHeight: "1.4",
              }}
            >
              {metric.description}
            </div>

            {/* Progress indicator */}
            <div
              style={{
                marginTop: "0.75rem",
                height: "4px",
                background: darkMode ? "#374151" : "#e5e7eb",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "10%",
                  background: analytics.title.includes("Romantic")
                    ? "#fb7185"
                    : analytics.title.includes("Friend")
                    ? "#3b82f6"
                    : analytics.title.includes("Professional")
                    ? "#14b8a6"
                    : analytics.title.includes("Family")
                    ? "#f59e0b"
                    : analytics.title.includes("Mentor")
                    ? "#a855f7"
                    : "#6366f1",
                  borderRadius: "2px",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: darkMode ? "#6b7280" : "#9ca3af",
                marginTop: "0.5rem",
                textAlign: "center",
              }}
            >
              Import chat history to unlock
            </div>
          </div>
        ))}
      </div>

      {/* Insights Preview */}
      <div
        style={{
          padding: "1.5rem",
          background: darkMode ? "#1f2937" : "#ffffff",
          borderRadius: "0.75rem",
          border: `1px solid ${
            darkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)"
          }`,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h4
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: darkMode ? "#ffffff" : "#1f2937",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              background: colors.cardBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={14} className={colors.icon} />
          </div>
          Coming Soon: Personalized Insights
        </h4>

        <div
          style={{
            color: darkMode ? "#d1d5db" : "#4b5563",
            fontSize: "0.875rem",
          }}
        >
          {analytics.insights.map((insight, index) => (
            <div
              key={index}
              style={{
                marginBottom: "0.5rem",
                paddingLeft: "1rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  top: "0.5rem",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: darkMode ? "#6b7280" : "#9ca3af",
                }}
              />
              {insight}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default RelationshipAnalyticsEmptyState;
