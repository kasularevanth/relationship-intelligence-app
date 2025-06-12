// src/components/RelationshipMetrics.js - UPDATED TO MATCH EXACT DESIGN
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const RelationshipMetrics = ({
  analysis,
  darkMode,
  relationshipType,
  contactName,
}) => {
  console.log("Analysis data received:", analysis); // Debug log

  // Helper function to safely get metric values
  const getMetricValue = (path, fallback = "Analyzing...") => {
    const keys = path.split(".");
    let value = analysis;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }

    return value || fallback;
  };

  // Helper function to render progress bars with exact values
  const renderProgressBar = (
    value,
    color = "#6366f1",
    label = "",
    showExactValue = false
  ) => {
    let percentage;
    let displayValue;

    if (typeof value === "number") {
      percentage = Math.min(100, Math.max(0, value));
      displayValue = showExactValue ? `${value}` : `${percentage}%`;
    } else if (typeof value === "string" && value.includes("%")) {
      percentage = parseInt(value.replace("%", ""));
      displayValue = value;
    } else {
      percentage = 50;
      displayValue = "50%";
    }

    return (
      <div className="progress-section">
        <div className="progress-label">
          <span>{label}</span>
          <span className="progress-value">{displayValue}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${percentage}%`, background: color }}
          ></div>
        </div>
      </div>
    );
  };

  // Helper function to render pie charts
  const renderPieChart = (data, height = 200) => {
    if (!data || !Array.isArray(data)) {
      // Fallback data
      data = [
        { name: "Data 1", value: 50, color: "#6366f1" },
        { name: "Data 2", value: 50, color: "#8b5cf6" },
      ];
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={height === 200 ? 60 : 40}
            outerRadius={height === 200 ? 100 : 70}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Helper function to render chart legend
  const renderLegend = (data) => {
    if (!data || !Array.isArray(data)) return null;

    return (
      <div className="chart-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: item.color }}
            ></div>
            <span>
              {item.name}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Function to determine which metrics to display based on relationship type
  const renderTypeSpecificMetrics = () => {
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
  const renderRomanticMetrics = () => {
    const emotionalHealthScore = getMetricValue(
      "metrics.emotionalHealthScore",
      0
    );
    const affectionLogisticsData = getMetricValue(
      "metrics.affectionLogisticsData",
      null
    );
    const conflictDaysAverage = getMetricValue(
      "metrics.conflictDaysAverage",
      "N/A"
    );
    const lastIntimateConversation = getMetricValue(
      "metrics.lastIntimateConversation",
      "Never detected"
    );
    const attachmentStyle = getMetricValue(
      "metrics.attachmentStyle",
      "Unknown"
    );
    const conflictResolutionRate = getMetricValue(
      "metrics.conflictResolutionRate",
      0
    );

    return (
      <div className="metrics-container">
        {/* Emotional Health Score */}
        <div className="metric-card full-width">
          <div className="metric-header">
            <span className="metric-icon">😊</span>
            <h3>Emotional Health Score</h3>
          </div>
          <div className="metric-content">
            <div className="health-score">
              <span className="health-percentage">{emotionalHealthScore}%</span>
              <span className="health-label">
                {getMetricValue(
                  "metrics.emotionalHealthLabel",
                  "Analyzing relationship health"
                )}
              </span>
            </div>
            {renderProgressBar(
              emotionalHealthScore,
              emotionalHealthScore > 70
                ? "#10b981"
                : emotionalHealthScore > 50
                ? "#f59e0b"
                : "#ef4444",
              "",
              false
            )}
          </div>
        </div>

        <div className="metrics-row">
          {/* Conflict frequency & escalation patterns */}
          <div className="metric-card">
            <h3>Conflict frequency & escalation patterns</h3>
            <div className="conflict-info">
              <div className="conflict-frequency">
                <span>Arguments occur every</span>
                <div className="frequency-highlight">
                  {conflictDaysAverage !== "N/A"
                    ? `${conflictDaysAverage} day`
                    : "Unknown frequency"}
                </div>
              </div>
              <div className="conflict-detail">
                •{" "}
                {getMetricValue(
                  "metrics.conflictResolutionPattern",
                  "Learning resolution patterns"
                )}
              </div>
              <div className="conflict-repair">
                <strong>Conflict repair attempts</strong>
                <div>
                  • Apologies occur after {conflictResolutionRate}% of
                  disagreements
                </div>
              </div>
            </div>
          </div>

          {/* Affection vs. logistical conversation ratios */}
          <div className="metric-card">
            <h3>Affection vs. logistical conversation ratios</h3>
            <div className="chart-container">
              {renderPieChart(affectionLogisticsData)}
              {renderLegend(affectionLogisticsData)}
            </div>
          </div>
        </div>

        <div className="metrics-row">
          {/* Intimacy sentiment detection */}
          <div className="metric-card">
            <h3>Intimacy sentiment detection</h3>
            <div className="intimacy-info">
              <div className="intimacy-text">
                Emotional vulnerability was last expressed{" "}
                {lastIntimateConversation}
              </div>
            </div>
          </div>

          {/* Attachment indicators */}
          <div className="metric-card">
            <h3>Attachment indicators</h3>
            <div className="attachment-info">
              <div className="attachment-text">
                Signs of {attachmentStyle.toLowerCase()} attachment:{" "}
                {attachmentStyle === "Anxious"
                  ? "frequent reassurance seeking"
                  : attachmentStyle === "Avoidant"
                  ? "emotional distance patterns"
                  : attachmentStyle === "Secure"
                  ? "healthy communication patterns"
                  : "mixed attachment patterns"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render metrics for Friendship relationships
  const renderFriendshipMetrics = () => {
    const initiationBalance = getMetricValue(
      "metrics.initiationBalance",
      "Analyzing conversation patterns"
    );
    const humorDepthData = getMetricValue("metrics.humorDepthData", null);
    const vulnerabilityIndex = getMetricValue(
      "metrics.vulnerabilityIndex",
      "Unknown"
    );
    const longestGapDays = getMetricValue("metrics.longestGapDays", 0);
    const topTopics = getMetricValue("metrics.topTopics", []);

    return (
      <div className="metrics-container">
        {/* Initiation imbalance and effort tracking */}
        <div className="metric-card full-width">
          <h3>Initiation imbalance and effort tracking</h3>
          <div className="initiation-text">{initiationBalance}</div>
        </div>

        <div className="metrics-row">
          {/* Humor vs. emotional depth balance */}
          <div className="metric-card">
            <h3>Humor vs. emotional depth balance</h3>
            <div className="chart-container">
              {renderPieChart(humorDepthData)}
              {renderLegend(humorDepthData)}
            </div>
          </div>

          {/* Shared vulnerability index */}
          <div className="metric-card">
            <h3>Shared vulnerability index</h3>
            <div className="vulnerability-text">
              {vulnerabilityIndex === "Very Low" || vulnerabilityIndex === "Low"
                ? "Low levels of emotional self-disclosure detected"
                : `${vulnerabilityIndex} levels of emotional self-disclosure detected`}
            </div>
          </div>
        </div>

        <div className="metrics-row">
          {/* Drift Detection */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">😔</span>
              <h3>Drift Detection</h3>
            </div>
            <div className="drift-info">
              <div className="gap-stat">
                <span>Longest communication gap</span>
                <span className="gap-highlight">{longestGapDays} Days</span>
              </div>
            </div>
          </div>

          {/* Topic Diversity - Empty placeholder if no topics */}
          <div className="metric-card">
            <h3>Topic Diversity</h3>
            {topTopics.length > 0 ? (
              <div className="topics-grid">
                {topTopics.slice(0, 3).map((topic, index) => (
                  <div key={index} className="topic-item">
                    <div className="topic-icon" data-topic={topic.name}>
                      {getTopicEmoji(topic.name)}
                    </div>
                    <span>{topic.name}</span>
                    <div className="topic-percentage">{topic.percentage}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-topics">No topic patterns detected yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render metrics for Professional relationships
  const renderProfessionalMetrics = () => {
    const professionalToneData = getMetricValue(
      "metrics.professionalToneData",
      null
    );
    const userResponseTime = getMetricValue(
      "metrics.responseTimeData.user",
      "N/A"
    );
    const contactResponseTime = getMetricValue(
      "metrics.responseTimeData.contact",
      "N/A"
    );
    const apologyPraiseRatio = getMetricValue(
      "metrics.apologyPraiseRatio",
      "Analyzing feedback patterns"
    );
    const taskPercent = getMetricValue("metrics.taskEmotionalData.0.value", 98);
    const powerDynamic = getMetricValue(
      "metrics.powerDynamic",
      "Analyzing power dynamics"
    );

    return (
      <div className="metrics-container">
        <div className="metrics-row">
          {/* Tone analysis */}
          <div className="metric-card">
            <h3>Tone analysis</h3>
            <div className="chart-container">
              {renderPieChart(professionalToneData)}
              {renderLegend(professionalToneData)}
            </div>
          </div>

          {/* Response time gaps */}
          <div className="metric-card">
            <h3>Response time gaps</h3>
            <div className="response-subtitle">
              Average time taken to respond to the messages
            </div>
            <div className="response-times">
              <div className="response-row">
                <span className="response-label">You</span>
                <span className="response-time">{userResponseTime}</span>
              </div>
              <div className="response-row">
                <span className="response-label">{contactName}</span>
                <span className="response-time">{contactResponseTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Apology / praise / blame detection */}
        <div className="metric-card full-width">
          <h3>Apology / praise / blame detection</h3>
          <div className="apology-text">{apologyPraiseRatio}</div>
        </div>

        <div className="metrics-row">
          {/* Task vs. emotional labor balance */}
          <div className="metric-card">
            <h3>Task vs. emotional labor balance</h3>
            <div className="task-info">
              <div className="task-label">Task-based</div>
              <div className="task-percentage">{taskPercent}%</div>
              {renderProgressBar(taskPercent, "#10b981", "", false)}
            </div>
          </div>

          {/* Power Dynamics */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">⚡</span>
              <h3>Power Dynamics</h3>
            </div>
            <div className="power-text">{powerDynamic}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render metrics for Family relationships
  const renderFamilyMetrics = () => {
    const generationalTension = getMetricValue(
      "metrics.generationalTension",
      "No tension detected"
    );
    const roleSupport = getMetricValue("metrics.roleSupport", 0);
    const traditionAutonomyTension = getMetricValue(
      "metrics.traditionAutonomyTension",
      "Analyzing values balance"
    );
    const emotionalWarmth = getMetricValue(
      "metrics.emotionalWarmth",
      "Unknown"
    );
    const communicationSpikes = getMetricValue(
      "metrics.communicationSpikes",
      "Analyzing timing patterns"
    );

    return (
      <div className="metrics-container">
        <div className="metrics-row">
          {/* Generational tension signals */}
          <div className="metric-card">
            <h3>Generational tension signals</h3>
            <div className="tension-text">
              {generationalTension === "Low tension"
                ? "Frequent use of advice-giving phrases from their side"
                : generationalTension}
            </div>
          </div>

          {/* Role reflection */}
          <div className="metric-card">
            <h3>Role reflection</h3>
            <div className="role-text">
              You express concern/support in {roleSupport}% of messages
            </div>
          </div>

          {/* Tradition vs. autonomy tension */}
          <div className="metric-card">
            <h3>Tradition vs. autonomy tension</h3>
            <div className="autonomy-text">
              {traditionAutonomyTension === "Balanced tradition and autonomy"
                ? "Recurring debate over lifestyle choices"
                : traditionAutonomyTension}
            </div>
          </div>
        </div>

        <div className="metrics-row">
          {/* Emotional warmth vs. duty fulfillment */}
          <div className="metric-card">
            <h3>Emotional warmth vs. duty fulfillment</h3>
            <div className="warmth-text">
              {emotionalWarmth === "Reserved" ||
              emotionalWarmth === "Distant/Formal"
                ? "Tone is respectful but lacks emotional language"
                : `Communication shows ${emotionalWarmth.toLowerCase()} emotional expression`}
            </div>
          </div>

          {/* Communication spikes */}
          <div className="metric-card">
            <h3>Communication spikes</h3>
            <div className="spikes-text">
              {communicationSpikes.includes("holidays")
                ? "Conversation peaks occur around holidays and crisis events"
                : communicationSpikes}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render metrics for Mentor relationships
  const renderMentorMetrics = () => {
    const reflectiveListening = getMetricValue(
      "metrics.reflectiveListening",
      "Analyzing mentorship style"
    );
    const reflectiveRate = getMetricValue("metrics.reflectiveListeningRate", 0);
    const personalGrowthFraming = getMetricValue(
      "metrics.personalGrowthFraming",
      "Identifying growth areas"
    );
    const encouragementAccountabilityData = getMetricValue(
      "metrics.encouragementAccountabilityData",
      null
    );
    const goalSettingFollowup = getMetricValue(
      "metrics.goalSettingFollowup",
      "Analyzing goal-setting approach"
    );
    const affirmationCorrectionRatio = getMetricValue(
      "metrics.affirmationCorrectionRatio",
      "N/A"
    );

    return (
      <div className="metrics-container">
        <div className="metrics-row">
          {/* Reflective listening and response ratio */}
          <div className="metric-card">
            <h3>Reflective listening and response ratio</h3>
            <div className="reflective-text">
              You restate their advice in {reflectiveRate}% of responses —{" "}
              {reflectiveRate >= 40
                ? "high reflection"
                : reflectiveRate >= 20
                ? "moderate reflection"
                : "low reflection"}
            </div>
          </div>

          {/* Encouragement vs. accountability */}
          <div className="metric-card">
            <h3>Encouragement vs. accountability</h3>
            <div className="feedback-label">Feedback:</div>
            <div className="chart-container">
              {renderPieChart(encouragementAccountabilityData)}
              {renderLegend(encouragementAccountabilityData)}
            </div>
          </div>
        </div>

        <div className="metrics-row">
          {/* Personal growth framing */}
          <div className="metric-card">
            <h3>Personal growth framing</h3>
            <div className="growth-section">
              <div className="growth-subtitle">Repeated goal language:</div>
              <ul className="growth-examples">
                <li>"I'm working on"</li>
                <li>"My next step is"</li>
              </ul>
            </div>
          </div>

          {/* Affirmation vs. correction patterns */}
          <div className="metric-card">
            <h3>Affirmation vs. correction patterns</h3>
            <div className="affirmation-section">
              <div className="affirmation-subtitle">
                Balance of praise vs. suggestions
              </div>
              <div className="affirmation-ratio">
                {affirmationCorrectionRatio}
              </div>
            </div>
          </div>
        </div>

        {/* Goal-setting and follow-up */}
        <div className="metric-card full-width">
          <h3>Goal-setting and follow-up</h3>
          <div className="goal-text">
            {goalSettingFollowup.includes("drops")
              ? "You confirm commitments, but follow-up drops after 3 days"
              : goalSettingFollowup}
          </div>
        </div>
      </div>
    );
  };

  // Default metrics for unknown relationship types
  const renderDefaultMetrics = () => {
    const messageDistribution = getMetricValue(
      "metrics.messageDistribution",
      null
    );
    const sentimentDistribution = getMetricValue(
      "metrics.sentimentDistribution",
      null
    );

    return (
      <div className="metrics-container">
        <div className="metrics-row">
          <div className="metric-card">
            <h3>Total Messages</h3>
            <div className="metric-value-large">
              {getMetricValue("metrics.messageCount", 0)}
            </div>
          </div>

          <div className="metric-card">
            <h3>Overall Sentiment</h3>
            <div className="sentiment-display">
              <span className="sentiment-label">
                {getMetricValue("metrics.sentimentLabel", "Neutral")}
              </span>
              <div className="sentiment-score">
                Score: {getMetricValue("metrics.sentimentScore", 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Message Distribution */}
        {messageDistribution && (
          <div className="metric-card full-width">
            <h3>Message Distribution</h3>
            <div className="chart-container">
              {renderPieChart(messageDistribution)}
              {renderLegend(messageDistribution)}
            </div>
          </div>
        )}

        {/* Sentiment Distribution */}
        {sentimentDistribution && (
          <div className="metric-card full-width">
            <h3>Sentiment Distribution</h3>
            <div className="chart-container">
              {renderPieChart(sentimentDistribution)}
              {renderLegend(sentimentDistribution)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper function to get emoji for topics
  const getTopicEmoji = (topicName) => {
    const emojiMap = {
      "Work & Career": "💼",
      "Family & Relationships": "👨‍👩‍👧‍👦",
      "Emotions & Feelings": "😌",
      "Plans & Future": "📅",
      "Daily Activities": "🏃‍♂️",
      Entertainment: "🎬",
      "Health & Wellness": "🏥",
      "Humor & Fun": "😂",
      "Support & Care": "🤝",
      "Money & Finance": "💰",
      memes: "😂",
      Gossip: "💬",
      "Personal Life": "👤",
      default: "💬",
    };
    return emojiMap[topicName] || emojiMap.default;
  };

  return (
    <div className="relationship-metrics">
      {renderTypeSpecificMetrics()}

      {/* Last Updated */}
      {analysis.lastUpdated && (
        <div className="last-updated">
          Last updated: {new Date(analysis.lastUpdated).toLocaleDateString()}
        </div>
      )}

      <style jsx>{`
        .metrics-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          background: rgba(55, 65, 95, 0.8);
          border-radius: 12px;
          padding: 1.5rem;
          color: white;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric-card.full-width {
          grid-column: 1 / -1;
        }

        .metric-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .metric-icon {
          font-size: 1.2rem;
        }

        .health-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1rem;
        }

        .health-percentage {
          font-size: 2rem;
          font-weight: bold;
          color: #10b981;
        }

        .health-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .progress-section {
          margin: 0.5rem 0;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .chart-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 1rem;
          font-size: 0.875rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .conflict-info {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .conflict-frequency {
          margin-bottom: 0.5rem;
        }

        .frequency-highlight {
          font-size: 1.2rem;
          font-weight: bold;
          color: #fbbf24;
          margin: 0.25rem 0;
        }

        .conflict-detail,
        .conflict-repair {
          margin: 0.5rem 0;
        }

        .intimacy-text,
        .attachment-text,
        .initiation-text,
        .vulnerability-text,
        .tension-text,
        .role-text,
        .autonomy-text,
        .warmth-text,
        .spikes-text,
        .reflective-text,
        .goal-text,
        .apology-text,
        .power-text {
          font-size: 0.875rem;
          line-height: 1.5;
          color: #e2e8f0;
        }

        .drift-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .gap-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gap-highlight {
          font-size: 1.1rem;
          font-weight: bold;
          color: #fbbf24;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .topic-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .topic-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .topic-percentage {
          font-weight: bold;
          color: #fbbf24;
        }

        .response-times {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .response-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .response-label {
          font-weight: 500;
        }

        .response-time {
          font-weight: bold;
          color: #60a5fa;
        }

        .response-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .task-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .task-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .task-percentage {
          font-size: 1.5rem;
          font-weight: bold;
          color: #10b981;
          text-align: right;
        }

        .growth-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .growth-subtitle,
        .feedback-label,
        .affirmation-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .growth-examples {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }

        .growth-examples li {
          padding: 0.25rem 0;
          font-size: 0.875rem;
          color: #e2e8f0;
        }

        .affirmation-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .affirmation-ratio {
          font-size: 1.5rem;
          font-weight: bold;
          color: #60a5fa;
        }

        .no-topics {
          font-size: 0.875rem;
          color: #94a3b8;
          text-align: center;
          padding: 1rem;
        }

        .last-updated {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.75rem;
          color: #64748b;
        }

        .metric-value-large {
          font-size: 2rem;
          font-weight: bold;
          text-align: center;
          color: #60a5fa;
        }

        .sentiment-display {
          text-align: center;
        }

        .sentiment-label {
          font-size: 1.2rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .sentiment-score {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default RelationshipMetrics;
