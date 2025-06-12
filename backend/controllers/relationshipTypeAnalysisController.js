// backend/controllers/relationshipTypeAnalysisController.js - COMPLETE VERSION
const Relationship = require("../models/Relationship");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const MemoryNode = require("../models/MemoryNode");
const OpenAI = require("openai");
const config = require("../config");

// Initialize OpenAI with GPT-4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.OPENAI_API_KEY,
});

/**
 * Get relationship type-specific analysis with exact metrics
 */
exports.getTypeAnalysis = async (req, res) => {
  try {
    const { relationshipId } = req.params;

    // Add no-cache headers
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Verify relationship belongs to the authenticated user
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: req.user.id,
    }).lean();

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found",
      });
    }

    console.log("Found relationship:", {
      id: relationship._id,
      type: relationship.relationshipType,
      contactName: relationship.contactName,
    });

    // Get all conversations for this relationship
    const conversations = await Conversation.find({
      relationship: relationshipId,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!conversations || conversations.length === 0) {
      console.log(`No conversations found for relationship ${relationshipId}`);
      return res.status(200).json({
        success: true,
        message: "No conversations available for analysis",
        metrics: {},
        insights: [],
        recommendations: [],
        redFlags: [],
        timestamp: Date.now(),
      });
    }

    // Get messages from all conversations
    let allMessages = [];
    for (const conversation of conversations) {
      if (conversation.messages && conversation.messages.length > 0) {
        allMessages = allMessages.concat(conversation.messages);
      } else {
        const messages = await Message.find({
          conversation: conversation._id,
        })
          .sort({ timestamp: 1 })
          .lean();

        if (messages && messages.length > 0) {
          allMessages = allMessages.concat(messages);
        }
      }
    }

    console.log(`Found ${allMessages.length} messages for analysis`);

    // If we have fewer than 10 messages, return basic analysis
    if (allMessages.length < 10) {
      return res.status(200).json({
        success: true,
        message: "Not enough messages for detailed analysis",
        messageCount: allMessages.length,
        conversationCount: conversations.length,
        metrics: getBasicMetrics(relationship.relationshipType),
        insights: getBasicInsights(
          relationship.relationshipType,
          relationship.contactName
        ),
        recommendations: getBasicRecommendations(relationship.relationshipType),
        redFlags: [],
      });
    }

    // Get enhanced relationship type-specific metrics
    const metrics = await getEnhancedRelationshipTypeMetrics(
      relationship.relationshipType,
      allMessages,
      relationship.contactName
    );

    console.log("Generated enhanced metrics:", Object.keys(metrics));

    // Get memories/insights related to this relationship
    const memories = await MemoryNode.find({
      relationship: relationshipId,
    })
      .sort({ created: -1 })
      .limit(20);

    // Generate AI insights using GPT-4
    let insights = [];
    let recommendations = [];
    let redFlags = [];

    if (allMessages.length >= 20) {
      const aiAnalysis = await generateEnhancedAIInsights(
        relationship.relationshipType,
        relationship.contactName,
        allMessages,
        memories,
        metrics
      );

      insights = aiAnalysis.insights || [];
      recommendations = aiAnalysis.recommendations || [];
      redFlags = aiAnalysis.redFlags || [];
    } else {
      insights = getBasicInsights(
        relationship.relationshipType,
        relationship.contactName
      );
      recommendations = getBasicRecommendations(relationship.relationshipType);
      redFlags = detectBasicRedFlags(relationship.relationshipType, metrics);
    }

    // Create the full analysis response
    const analysis = {
      success: true,
      type: relationship.relationshipType,
      contactName: relationship.contactName,
      messageCount: allMessages.length,
      conversationCount: conversations.length,
      metrics,
      insights,
      recommendations,
      redFlags,
      lastUpdated: new Date(),
    };

    // Store analysis in relationship
    const relationshipDoc = await Relationship.findById(relationshipId);
    if (relationshipDoc) {
      relationshipDoc.typeAnalysis = analysis;
      await relationshipDoc.save();
    }

    return res.status(200).json(analysis);
  } catch (error) {
    console.error("Error generating relationship type analysis:", error);
    return res.status(500).json({
      success: false,
      message: "Server error generating relationship analysis",
      error: error.message,
    });
  }
};

/**
 * Enhanced metrics generation with exact calculations
 */
const getEnhancedRelationshipTypeMetrics = async (
  relationshipType,
  messages,
  contactName
) => {
  const normalizedType = normalizeRelationshipType(relationshipType);
  console.log("Processing enhanced metrics for type:", normalizedType);

  // Core analysis components
  const messageCounts = countMessagesByRole(messages);
  const sentimentAnalysis = enhancedSentimentAnalysis(messages);
  const topicAnalysis = enhancedTopicAnalysis(messages);
  const responsePatterns = enhancedResponsePatterns(messages);
  const temporalAnalysis = analyzeTemporalPatterns(messages);

  // Base metrics with enhanced calculations
  const baseMetrics = {
    messageCount: messages.length,
    sentimentScore: Math.round(sentimentAnalysis.overallScore * 100),
    sentimentLabel: sentimentAnalysis.label,
    sentimentDistribution: sentimentAnalysis.distribution,
    userMessageCount: messageCounts.user,
    contactMessageCount: messageCounts.contact,
    messageRatio:
      messageCounts.contact > 0
        ? Math.round((messageCounts.user / messageCounts.contact) * 100) / 100
        : "N/A",
    averageResponseTime: responsePatterns.averageResponseTime,
    topTopics: topicAnalysis.topTopics,
    communicationStyle: responsePatterns.communicationStyle,
    messageDistribution: [
      { name: "You", value: messageCounts.user, color: "#6366f1" },
      {
        name: contactName || "Contact",
        value: messageCounts.contact,
        color: "#8b5cf6",
      },
    ],
    temporalPatterns: temporalAnalysis,
  };

  // Relationship type-specific enhanced metrics
  switch (normalizedType) {
    case "romantic":
      return {
        ...baseMetrics,
        ...calculateRomanticMetrics(
          messages,
          sentimentAnalysis,
          responsePatterns,
          temporalAnalysis
        ),
      };

    case "friendship":
      return {
        ...baseMetrics,
        ...calculateFriendshipMetrics(
          messages,
          messageCounts,
          contactName,
          topicAnalysis,
          temporalAnalysis
        ),
      };

    case "professional":
      return {
        ...baseMetrics,
        ...calculateProfessionalMetrics(messages, responsePatterns),
      };

    case "family":
      return {
        ...baseMetrics,
        ...calculateFamilyMetrics(
          messages,
          sentimentAnalysis,
          temporalAnalysis
        ),
      };

    case "mentor":
      return {
        ...baseMetrics,
        ...calculateMentorMetrics(messages, responsePatterns),
      };

    default:
      return baseMetrics;
  }
};

/**
 * ROMANTIC RELATIONSHIP METRICS
 */
const calculateRomanticMetrics = (
  messages,
  sentimentAnalysis,
  responsePatterns,
  temporalAnalysis
) => {
  // Emotional Health Score (0-100%)
  const emotionalHealthScore = Math.max(
    10,
    Math.min(100, Math.round((sentimentAnalysis.overallScore + 1) * 40 + 20))
  );

  // Conflict Frequency Analysis
  const conflictAnalysis = analyzeConflictPatterns(messages);

  // Attachment Style Detection
  const attachmentAnalysis = detectAttachmentStyle(messages, responsePatterns);

  // Affection vs Logistics Ratio
  const affectionLogisticsRatio = calculateAffectionLogisticsRatio(messages);

  // Intimacy Level Detection
  const intimacyAnalysis = analyzeIntimacyLevel(messages);

  // Conflict Repair Analysis
  const conflictRepairAnalysis = analyzeConflictRepair(messages);

  return {
    emotionalHealthScore,
    emotionalHealthLabel: getEmotionalHealthLabel(emotionalHealthScore),
    conflictFrequency: conflictAnalysis.frequency,
    conflictFrequencyData: conflictAnalysis.data,
    conflictDaysAverage: conflictAnalysis.averageDaysBetween,
    attachmentStyle: attachmentAnalysis.primaryStyle,
    attachmentStyleData: attachmentAnalysis.data,
    affectionLogisticsRatio: `${affectionLogisticsRatio.affection}% / ${affectionLogisticsRatio.logistics}%`,
    affectionLogisticsData: [
      {
        name: "Affection",
        value: affectionLogisticsRatio.affection,
        color: "#f43f5e",
      },
      {
        name: "Logistics",
        value: affectionLogisticsRatio.logistics,
        color: "#8b5cf6",
      },
    ],
    intimacyLevel: intimacyAnalysis.level,
    intimacyScore: intimacyAnalysis.score,
    lastIntimateConversation: intimacyAnalysis.lastIntimateConversation,
    conflictResolutionPattern: conflictRepairAnalysis.pattern,
    conflictResolutionRate: conflictRepairAnalysis.resolutionRate,
    apologyFrequency: conflictRepairAnalysis.apologyData,
  };
};

/**
 * FRIENDSHIP RELATIONSHIP METRICS
 */
const calculateFriendshipMetrics = (
  messages,
  messageCounts,
  contactName,
  topicAnalysis,
  temporalAnalysis
) => {
  // Initiation Balance Analysis
  const initiationAnalysis = analyzeInitiationBalance(
    messages,
    messageCounts,
    contactName
  );

  // Humor vs Depth Analysis
  const humorDepthAnalysis = analyzeHumorDepthBalance(messages);

  // Vulnerability Analysis
  const vulnerabilityAnalysis = analyzeVulnerabilityIndex(messages);

  // Communication Gaps Analysis
  const gapAnalysis = analyzeCommunicationGaps(messages);

  // Topic Diversity Analysis
  const diversityAnalysis = analyzeTopicDiversity(topicAnalysis);

  return {
    initiationBalance: initiationAnalysis.description,
    initiationData: [
      { name: "You", value: initiationAnalysis.userPercent, color: "#6366f1" },
      {
        name: contactName || "Contact",
        value: initiationAnalysis.contactPercent,
        color: "#8b5cf6",
      },
    ],
    initiationImbalanceLevel: initiationAnalysis.imbalanceLevel,
    humorDepthRatio: `${humorDepthAnalysis.humor}% / ${humorDepthAnalysis.depth}%`,
    humorDepthData: [
      { name: "Humor", value: humorDepthAnalysis.humor, color: "#f59e0b" },
      {
        name: "Emotional Depth",
        value: humorDepthAnalysis.depth,
        color: "#8b5cf6",
      },
    ],
    vulnerabilityIndex: vulnerabilityAnalysis.level,
    vulnerabilityScore: vulnerabilityAnalysis.score,
    longestGap: gapAnalysis.longestGap,
    longestGapDays: gapAnalysis.longestGapDays,
    averageGap: gapAnalysis.averageGap,
    topicDiversity: diversityAnalysis.score,
    topicDiversityLevel: diversityAnalysis.level,
    engagementConsistency: temporalAnalysis.consistency,
  };
};

/**
 * PROFESSIONAL RELATIONSHIP METRICS
 */
const calculateProfessionalMetrics = (messages, responsePatterns) => {
  // Professional Tone Analysis
  const toneAnalysis = analyzeProfessionalTone(messages);

  // Power Dynamics Analysis
  const powerAnalysis = analyzePowerDynamics(messages);

  // Apology/Praise/Blame Detection
  const feedbackAnalysis = analyzeApologyPraiseBlame(messages);

  // Task vs Emotional Labor Analysis
  const laborAnalysis = analyzeTaskEmotionalLabor(messages);

  return {
    professionalTone: toneAnalysis.description,
    professionalToneData: toneAnalysis.data,
    professionalToneScore: toneAnalysis.score,
    powerDynamic: powerAnalysis.description,
    powerDynamicData: powerAnalysis.data,
    responseTime: `You: ${responsePatterns.userAvgResponseTime} | Them: ${responsePatterns.contactAvgResponseTime}`,
    responseTimeData: {
      user: responsePatterns.userAvgResponseTime,
      contact: responsePatterns.contactAvgResponseTime,
      userMinutes: responsePatterns.userAvgMinutes,
      contactMinutes: responsePatterns.contactAvgMinutes,
    },
    apologyPraiseRatio: feedbackAnalysis.description,
    apologyPraiseData: feedbackAnalysis.data,
    taskEmotionalRatio: `${laborAnalysis.task}% / ${laborAnalysis.emotional}%`,
    taskEmotionalData: [
      { name: "Task-focused", value: laborAnalysis.task, color: "#ef4444" },
      {
        name: "Relationship-building",
        value: laborAnalysis.emotional,
        color: "#10b981",
      },
    ],
    clarityIndex: analyzeClarityIndex(messages),
    boundaryMaintenance: analyzeBoundaryMaintenance(messages),
  };
};

/**
 * FAMILY RELATIONSHIP METRICS - Updated to match exact UI
 */
const calculateFamilyMetrics = (
  messages,
  sentimentAnalysis,
  temporalAnalysis
) => {
  // Generational Tension Analysis
  const generationalAnalysis = analyzeGenerationalTensions(messages);

  // Role Analysis - matches "You express concern/support in 64% of messages"
  const roleAnalysis = analyzeFamilyRole(messages);

  // Tradition vs Autonomy Analysis
  const autonomyAnalysis = analyzeTraditionAutonomy(messages);

  // Emotional Warmth Analysis
  const warmthAnalysis = analyzeEmotionalWarmth(messages);

  // Communication Spikes Analysis
  const spikesAnalysis = analyzeCommunicationSpikes(messages, temporalAnalysis);

  return {
    generationalTension: generationalAnalysis.level,
    generationalTensionData: generationalAnalysis.data,
    roleReflection: roleAnalysis.description,
    roleSupport: roleAnalysis.supportPercentage,
    traditionAutonomyTension: autonomyAnalysis.description,
    traditionAutonomyData: [
      {
        name: "Traditional Values",
        value: autonomyAnalysis.tradition,
        color: "#dc2626",
      },
      {
        name: "Autonomy/Independence",
        value: autonomyAnalysis.autonomy,
        color: "#2563eb",
      },
    ],
    emotionalWarmth: warmthAnalysis.level,
    emotionalWarmthScore: warmthAnalysis.score,
    communicationSpikes: spikesAnalysis.description,
    communicationSpikePatterns: spikesAnalysis.patterns,
  };
};

/**
 * MENTOR RELATIONSHIP METRICS
 */
const calculateMentorMetrics = (messages, responsePatterns) => {
  // Reflective Listening Analysis - matches "You restate their advice in 40% of responses"
  const reflectiveAnalysis = analyzeReflectiveListening(messages);

  // Encouragement vs Accountability Analysis
  const encouragementAnalysis = analyzeEncouragementAccountability(messages);

  // Personal Growth Framing Analysis
  const growthAnalysis = analyzePersonalGrowthFraming(messages);

  // Goal Setting and Follow-up Analysis - matches "follow-up drops after 3 days"
  const goalAnalysis = analyzeGoalSettingFollowup(messages);

  // Affirmation vs Correction Analysis - matches "3:1" ratio
  const affirmationAnalysis = analyzeAffirmationCorrection(messages);

  return {
    reflectiveListening: reflectiveAnalysis.description,
    reflectiveListeningRate: reflectiveAnalysis.rate,
    encouragementAccountability: encouragementAnalysis.description,
    encouragementAccountabilityData: [
      {
        name: "Motivational",
        value: encouragementAnalysis.motivational,
        color: "#8b5cf6",
      },
      {
        name: "Corrective",
        value: encouragementAnalysis.corrective,
        color: "#ec4899",
      },
    ],
    personalGrowthFraming: growthAnalysis.description,
    goalLanguageFrequency: growthAnalysis.frequency,
    goalSettingFollowup: goalAnalysis.description,
    followupDropoff: goalAnalysis.dropoffRate,
    affirmationCorrectionRatio: affirmationAnalysis.ratio,
    affirmationCorrectionData: affirmationAnalysis.data,
  };
};

/**
 * ===========================================
 * DETAILED ANALYSIS FUNCTIONS
 * ===========================================
 */

// Enhanced Sentiment Analysis
const enhancedSentimentAnalysis = (messages) => {
  const positiveWords = [
    "love",
    "happy",
    "great",
    "amazing",
    "wonderful",
    "fantastic",
    "excellent",
    "awesome",
    "perfect",
    "brilliant",
    "beautiful",
    "incredible",
    "outstanding",
    "thrilled",
    "excited",
    "grateful",
    "appreciate",
    "thankful",
    "blessed",
  ];

  const negativeWords = [
    "hate",
    "angry",
    "terrible",
    "awful",
    "horrible",
    "disgusting",
    "furious",
    "devastated",
    "heartbroken",
    "disappointed",
    "frustrated",
    "annoyed",
    "upset",
    "sad",
    "depressed",
    "worried",
    "anxious",
    "stressed",
    "overwhelmed",
  ];

  let sentiments = [];
  let overallPositive = 0;
  let overallNegative = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const words = msg.content.toLowerCase().split(/\s+/);
    let msgPositive = 0;
    let msgNegative = 0;

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      if (positiveWords.includes(cleanWord)) msgPositive++;
      if (negativeWords.includes(cleanWord)) msgNegative++;
    });

    const msgSentiment = msgPositive - msgNegative;
    sentiments.push(msgSentiment);
    overallPositive += msgPositive;
    overallNegative += msgNegative;
  });

  const overallScore =
    (overallPositive - overallNegative) /
    Math.max(1, overallPositive + overallNegative);
  const normalizedScore = Math.max(-1, Math.min(1, overallScore));

  // Calculate distribution
  const positive = sentiments.filter((s) => s > 0).length;
  const negative = sentiments.filter((s) => s < 0).length;
  const neutral = sentiments.filter((s) => s === 0).length;
  const total = sentiments.length || 1;

  return {
    overallScore: normalizedScore,
    label: getSentimentLabel(normalizedScore),
    distribution: [
      {
        name: "Positive",
        value: Math.round((positive / total) * 100),
        color: "#10b981",
      },
      {
        name: "Neutral",
        value: Math.round((neutral / total) * 100),
        color: "#6b7280",
      },
      {
        name: "Negative",
        value: Math.round((negative / total) * 100),
        color: "#ef4444",
      },
    ],
    positiveCount: overallPositive,
    negativeCount: overallNegative,
    intensity: (overallPositive + overallNegative) / messages.length,
  };
};

// Enhanced Topic Analysis
const enhancedTopicAnalysis = (messages) => {
  const topicKeywords = {
    "Work & Career": [
      "work",
      "job",
      "career",
      "office",
      "meeting",
      "project",
      "boss",
      "colleague",
      "deadline",
      "promotion",
    ],
    "Family & Relationships": [
      "family",
      "kids",
      "parents",
      "mom",
      "dad",
      "sister",
      "brother",
      "relationship",
      "dating",
      "marriage",
    ],
    "Emotions & Feelings": [
      "feel",
      "emotion",
      "happy",
      "sad",
      "angry",
      "love",
      "hate",
      "excited",
      "worried",
      "stressed",
    ],
    "Plans & Future": [
      "plan",
      "future",
      "tomorrow",
      "weekend",
      "vacation",
      "goals",
      "dreams",
      "hoping",
      "expecting",
    ],
    "Daily Activities": [
      "eat",
      "sleep",
      "exercise",
      "gym",
      "shopping",
      "cooking",
      "cleaning",
      "driving",
      "walking",
    ],
    Entertainment: [
      "movie",
      "music",
      "game",
      "book",
      "tv",
      "netflix",
      "youtube",
      "party",
      "concert",
      "sports",
    ],
    "Health & Wellness": [
      "health",
      "doctor",
      "medicine",
      "sick",
      "tired",
      "energy",
      "diet",
      "fitness",
      "mental",
    ],
    "Humor & Fun": [
      "lol",
      "haha",
      "funny",
      "joke",
      "laugh",
      "hilarious",
      "😂",
      "🤣",
      "amusing",
      "comedy",
    ],
    "Support & Care": [
      "help",
      "support",
      "care",
      "worry",
      "concern",
      "there for you",
      "understand",
      "listen",
    ],
    "Money & Finance": [
      "money",
      "pay",
      "buy",
      "expensive",
      "cheap",
      "budget",
      "save",
      "spend",
      "cost",
      "price",
    ],
    memes: ["meme", "lol", "haha", "funny", "hilarious", "joke", "😂", "🤣"],
    Gossip: [
      "did you hear",
      "guess what",
      "rumor",
      "gossip",
      "drama",
      "scandal",
      "secret",
      "whisper",
    ],
    "Personal Life": [
      "personal",
      "private",
      "life",
      "feelings",
      "thoughts",
      "dreams",
      "goals",
      "struggles",
    ],
  };

  const topicColors = {
    "Work & Career": "#ef4444",
    "Family & Relationships": "#f97316",
    "Emotions & Feelings": "#ec4899",
    "Plans & Future": "#8b5cf6",
    "Daily Activities": "#06b6d4",
    Entertainment: "#10b981",
    "Health & Wellness": "#84cc16",
    "Humor & Fun": "#f59e0b",
    "Support & Care": "#6366f1",
    "Money & Finance": "#14b8a6",
    memes: "#ef4444",
    Gossip: "#f59e0b",
    "Personal Life": "#8b5cf6",
  };

  const topicCounts = {};
  Object.keys(topicKeywords).forEach((topic) => {
    topicCounts[topic] = 0;
  });

  // Analyze each message for topics
  messages.forEach((msg) => {
    if (!msg.content) return;
    const content = msg.content.toLowerCase();

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      let topicMentioned = false;
      keywords.forEach((keyword) => {
        if (content.includes(keyword) && !topicMentioned) {
          topicCounts[topic]++;
          topicMentioned = true;
        }
      });
    });
  });

  // Create sorted topics with percentages
  const totalMentions = Object.values(topicCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const sortedTopics = Object.entries(topicCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({
      name: topic,
      count,
      percentage: Math.round((count / messages.length) * 100),
      color: topicColors[topic] || "#6b7280",
    }));

  return {
    topTopics: sortedTopics.slice(0, 6),
    allTopics: sortedTopics,
    totalMentions,
    diversityScore: calculateTopicDiversity(topicCounts),
  };
};

// Enhanced Response Patterns
const enhancedResponsePatterns = (messages) => {
  if (messages.length < 2) {
    return {
      averageResponseTime: "Not enough data",
      userAvgResponseTime: "Not enough data",
      contactAvgResponseTime: "Not enough data",
      userAvgMinutes: 0,
      contactAvgMinutes: 0,
      communicationStyle: "Not enough data",
    };
  }

  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0);
    const timeB = new Date(b.timestamp || b.createdAt || 0);
    return timeA - timeB;
  });

  let userResponseTimes = [];
  let contactResponseTimes = [];

  for (let i = 1; i < sortedMessages.length; i++) {
    const prevMsg = sortedMessages[i - 1];
    const currMsg = sortedMessages[i];

    if (prevMsg.role === currMsg.role) continue;

    const prevTime = new Date(prevMsg.timestamp || prevMsg.createdAt || 0);
    const currTime = new Date(currMsg.timestamp || currMsg.createdAt || 0);

    if (prevTime.getTime() === 0 || currTime.getTime() === 0) continue;

    const timeDiff = (currTime - prevTime) / (1000 * 60); // minutes

    if (timeDiff < 0 || timeDiff > 24 * 60 * 7) continue; // Skip invalid times

    if (currMsg.role === "user") {
      userResponseTimes.push(timeDiff);
    } else {
      contactResponseTimes.push(timeDiff);
    }
  }

  const userAvgMinutes =
    userResponseTimes.length > 0
      ? userResponseTimes.reduce((sum, time) => sum + time, 0) /
        userResponseTimes.length
      : 0;

  const contactAvgMinutes =
    contactResponseTimes.length > 0
      ? contactResponseTimes.reduce((sum, time) => sum + time, 0) /
        contactResponseTimes.length
      : 0;

  return {
    averageResponseTime: formatResponseTime(
      (userAvgMinutes + contactAvgMinutes) / 2
    ),
    userAvgResponseTime: formatResponseTime(userAvgMinutes),
    contactAvgResponseTime: formatResponseTime(contactAvgMinutes),
    userAvgMinutes,
    contactAvgMinutes,
    communicationStyle: determineCommunicationStyle(
      userResponseTimes.length,
      contactResponseTimes.length,
      userAvgMinutes,
      contactAvgMinutes
    ),
  };
};

// Message Role Counter
const countMessagesByRole = (messages) => {
  return messages.reduce(
    (counts, msg) => {
      const role = msg.role === "user" ? "contact" : "user";
      counts[role] += 1;
      return counts;
    },
    { user: 0, contact: 0 }
  );
};

// Temporal Analysis
const analyzeTemporalPatterns = (messages) => {
  if (messages.length < 5) {
    return {
      consistency: "Not enough data",
      peakHours: [],
      communicationFrequency: "Unknown",
    };
  }

  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0);
    const timeB = new Date(b.timestamp || b.createdAt || 0);
    return timeA - timeB;
  });

  const gaps = [];
  const hourCounts = new Array(24).fill(0);

  // Analyze gaps and peak hours
  for (let i = 1; i < sortedMessages.length; i++) {
    const prevTime = new Date(
      sortedMessages[i - 1].timestamp || sortedMessages[i - 1].createdAt
    );
    const currTime = new Date(
      sortedMessages[i].timestamp || sortedMessages[i].createdAt
    );

    // Calculate gap in hours
    const gapHours = (currTime - prevTime) / (1000 * 60 * 60);
    if (gapHours < 24 * 7) {
      // Ignore gaps > 1 week
      gaps.push(gapHours);
    }

    // Count messages by hour
    hourCounts[currTime.getHours()]++;
  }

  // Calculate consistency
  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance =
    gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const cv = Math.sqrt(variance) / avgGap;

  let consistency;
  if (cv < 0.5) consistency = "Very consistent";
  else if (cv < 1) consistency = "Consistent";
  else if (cv < 1.5) consistency = "Somewhat consistent";
  else consistency = "Inconsistent";

  // Find peak hours
  const maxCount = Math.max(...hourCounts);
  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter((item) => item.count > maxCount * 0.8)
    .map((item) => item.hour);

  return {
    consistency,
    peakHours,
    communicationFrequency: calculateFrequency(sortedMessages),
    averageGapHours: avgGap,
  };
};

/**
 * CONFLICT PATTERN ANALYSIS
 */
const analyzeConflictPatterns = (messages) => {
  const conflictWords = [
    "sorry",
    "apologize",
    "disagree",
    "wrong",
    "upset",
    "angry",
    "frustrated",
    "annoyed",
    "disappointed",
    "hurt",
    "argue",
    "fight",
    "conflict",
    "issue",
    "problem",
  ];

  const conflictMessages = [];

  messages.forEach((msg, index) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let conflictScore = 0;

    conflictWords.forEach((word) => {
      if (content.includes(word)) conflictScore++;
    });

    if (conflictScore > 0) {
      conflictMessages.push({
        index,
        timestamp: msg.timestamp || msg.createdAt,
        score: conflictScore,
        content: msg.content,
      });
    }
  });

  // Calculate frequency
  const totalDays = calculateTotalDays(messages);
  const conflictsPerWeek = (conflictMessages.length / totalDays) * 7;

  let frequency;
  if (conflictsPerWeek < 0.25) frequency = "Rare";
  else if (conflictsPerWeek < 1) frequency = "Occasional";
  else if (conflictsPerWeek < 2) frequency = "Moderate";
  else frequency = "Frequent";

  // Calculate average days between conflicts
  let averageDaysBetween = "N/A";
  if (conflictMessages.length > 1) {
    const gaps = [];
    for (let i = 1; i < conflictMessages.length; i++) {
      const prevTime = new Date(conflictMessages[i - 1].timestamp);
      const currTime = new Date(conflictMessages[i].timestamp);
      const daysDiff = (currTime - prevTime) / (1000 * 60 * 60 * 24);
      gaps.push(daysDiff);
    }
    averageDaysBetween = Math.round(
      gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
    );
  }

  return {
    frequency,
    count: conflictMessages.length,
    averageDaysBetween,
    conflictRate: Math.round((conflictMessages.length / messages.length) * 100),
    data: [
      {
        name: "Conflict Messages",
        value: conflictMessages.length,
        color: "#ef4444",
      },
      {
        name: "Peaceful Messages",
        value: messages.length - conflictMessages.length,
        color: "#10b981",
      },
    ],
    recentConflicts: conflictMessages.slice(-3),
  };
};

/**
 * ATTACHMENT STYLE DETECTION
 */
const detectAttachmentStyle = (messages, responsePatterns) => {
  const anxiousIndicators = [
    "miss you",
    "where are you",
    "worried",
    "need you",
    "love you so much",
    "thinking about you",
    "can't wait",
    "when will",
    "are you okay",
  ];

  const avoidantIndicators = [
    "busy",
    "later",
    "can't talk",
    "need space",
    "overwhelmed",
    "fine",
    "whatever",
    "not a big deal",
    "don't worry about it",
  ];

  const secureIndicators = [
    "understand",
    "appreciate",
    "respect",
    "support",
    "here for you",
    "take your time",
    "no pressure",
    "healthy",
    "communicate",
  ];

  let anxiousScore = 0;
  let avoidantScore = 0;
  let secureScore = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;
    const content = msg.content.toLowerCase();

    anxiousIndicators.forEach((indicator) => {
      if (content.includes(indicator)) anxiousScore++;
    });

    avoidantIndicators.forEach((indicator) => {
      if (content.includes(indicator)) avoidantScore++;
    });

    secureIndicators.forEach((indicator) => {
      if (content.includes(indicator)) secureScore++;
    });
  });

  // Factor in response patterns
  if (responsePatterns.userAvgMinutes < 5) anxiousScore += 3;
  if (responsePatterns.contactAvgMinutes > 120) avoidantScore += 3;

  const total = anxiousScore + avoidantScore + secureScore || 1;
  const anxiousPercent = Math.round((anxiousScore / total) * 100);
  const avoidantPercent = Math.round((avoidantScore / total) * 100);
  const securePercent = Math.round((secureScore / total) * 100);

  let primaryStyle;
  if (securePercent >= 40) primaryStyle = "Secure";
  else if (anxiousPercent > avoidantPercent) primaryStyle = "Anxious";
  else if (avoidantPercent > anxiousPercent) primaryStyle = "Avoidant";
  else primaryStyle = "Mixed";

  return {
    primaryStyle,
    data: [
      { name: "Secure", value: securePercent, color: "#10b981" },
      { name: "Anxious", value: anxiousPercent, color: "#f59e0b" },
      { name: "Avoidant", value: avoidantPercent, color: "#ef4444" },
    ],
    scores: {
      anxious: anxiousScore,
      avoidant: avoidantScore,
      secure: secureScore,
    },
  };
};

// Affection vs Logistics Ratio
const calculateAffectionLogisticsRatio = (messages) => {
  const affectionWords = [
    "love",
    "miss",
    "care",
    "feel",
    "heart",
    "hug",
    "kiss",
    "adore",
    "cherish",
    "appreciate",
    "grateful",
    "beautiful",
    "❤️",
    "😘",
    "🥰",
  ];

  const logisticsWords = [
    "when",
    "where",
    "time",
    "plan",
    "schedule",
    "meet",
    "pick up",
    "bring",
    "get",
    "buy",
    "need",
    "have to",
    "should",
    "remember",
  ];

  let affectionCount = 0;
  let logisticsCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;
    const content = msg.content.toLowerCase();

    let hasAffection = false;
    let hasLogistics = false;

    affectionWords.forEach((word) => {
      if (content.includes(word) && !hasAffection) {
        affectionCount++;
        hasAffection = true;
      }
    });

    logisticsWords.forEach((word) => {
      if (content.includes(word) && !hasLogistics) {
        logisticsCount++;
        hasLogistics = true;
      }
    });
  });

  const total = affectionCount + logisticsCount || 1;
  const affectionPercent = Math.round((affectionCount / total) * 100);
  const logisticsPercent = Math.round((logisticsCount / total) * 100);

  return {
    affection: affectionPercent,
    logistics: logisticsPercent,
    totalAffectionMessages: affectionCount,
    totalLogisticsMessages: logisticsCount,
  };
};

// Intimacy Level Analysis
const analyzeIntimacyLevel = (messages) => {
  const intimacyWords = [
    "love",
    "feel",
    "heart",
    "emotion",
    "deep",
    "close",
    "intimate",
    "vulnerable",
    "share",
    "open",
    "trust",
    "connection",
    "bond",
    "soul",
    "forever",
    "always",
    "future together",
    "dreams",
    "goals",
    "fear",
    "hope",
    "personal",
    "private",
  ];

  const physicalIntimacyWords = [
    "kiss",
    "hug",
    "touch",
    "hold",
    "cuddle",
    "embrace",
    "caress",
    "romantic",
    "passion",
    "desire",
    "attraction",
    "beautiful",
    "gorgeous",
    "handsome",
  ];

  let emotionalIntimacy = 0;
  let physicalIntimacy = 0;
  let lastIntimateIndex = -1;

  messages.forEach((msg, index) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let hasEmotionalIntimacy = false;
    let hasPhysicalIntimacy = false;

    intimacyWords.forEach((word) => {
      if (content.includes(word)) {
        hasEmotionalIntimacy = true;
      }
    });

    physicalIntimacyWords.forEach((word) => {
      if (content.includes(word)) {
        hasPhysicalIntimacy = true;
      }
    });

    if (hasEmotionalIntimacy || hasPhysicalIntimacy) {
      lastIntimateIndex = index;
    }

    if (hasEmotionalIntimacy) emotionalIntimacy++;
    if (hasPhysicalIntimacy) physicalIntimacy++;
  });

  const intimacyScore = Math.round(
    ((emotionalIntimacy + physicalIntimacy) / messages.length) * 100
  );

  let level;
  if (intimacyScore < 5) level = "Surface Level";
  else if (intimacyScore < 15) level = "Developing";
  else if (intimacyScore < 30) level = "Moderate";
  else if (intimacyScore < 50) level = "High";
  else level = "Very High";

  // Calculate days since last intimate conversation
  let lastIntimateConversation = "Never detected";
  if (lastIntimateIndex >= 0) {
    const lastMsg = messages[lastIntimateIndex];
    const lastDate = new Date(lastMsg.timestamp || lastMsg.createdAt);
    const daysSince = Math.round(
      (new Date() - lastDate) / (1000 * 60 * 60 * 24)
    );
    lastIntimateConversation =
      daysSince === 0 ? "Today" : `${daysSince} days ago`;
  }

  return {
    level,
    score: intimacyScore,
    emotionalIntimacyCount: emotionalIntimacy,
    physicalIntimacyCount: physicalIntimacy,
    lastIntimateConversation,
  };
};

// Conflict Repair Analysis
const analyzeConflictRepair = (messages) => {
  const conflictWords = [
    "sorry",
    "disagree",
    "upset",
    "angry",
    "frustrated",
    "fight",
    "argue",
    "wrong",
    "hurt",
    "disappointed",
    "annoyed",
    "mad",
    "conflict",
  ];

  const repairWords = [
    "apologize",
    "sorry",
    "forgive",
    "understand",
    "make up",
    "resolve",
    "work it out",
    "talk about it",
    "my fault",
    "i was wrong",
    "let's fix this",
    "compromise",
    "meet halfway",
    "love you anyway",
    "move forward",
  ];

  let conflicts = [];
  let repairs = [];

  messages.forEach((msg, index) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    // Detect conflicts
    let conflictScore = 0;
    conflictWords.forEach((word) => {
      if (content.includes(word)) conflictScore++;
    });

    if (conflictScore > 0) {
      conflicts.push({
        index,
        score: conflictScore,
        timestamp: msg.timestamp || msg.createdAt,
        resolved: false,
      });
    }

    // Detect repair attempts
    let repairScore = 0;
    repairWords.forEach((word) => {
      if (content.includes(word)) repairScore++;
    });

    if (repairScore > 0) {
      repairs.push({
        index,
        score: repairScore,
        timestamp: msg.timestamp || msg.createdAt,
      });
    }
  });

  // Match repairs to conflicts (within 10 messages)
  conflicts.forEach((conflict) => {
    const nearbyRepairs = repairs.filter(
      (repair) =>
        repair.index > conflict.index && repair.index <= conflict.index + 10
    );

    if (nearbyRepairs.length > 0) {
      conflict.resolved = true;
    }
  });

  const totalConflicts = conflicts.length;
  const resolvedConflicts = conflicts.filter((c) => c.resolved).length;
  const resolutionRate =
    totalConflicts > 0
      ? Math.round((resolvedConflicts / totalConflicts) * 100)
      : 0;

  let pattern;
  if (resolutionRate >= 80) pattern = "Excellent conflict resolution";
  else if (resolutionRate >= 60) pattern = "Good conflict resolution";
  else if (resolutionRate >= 40) pattern = "Moderate conflict resolution";
  else if (resolutionRate >= 20) pattern = "Poor conflict resolution";
  else pattern = "Very poor conflict resolution";

  // Analyze apology patterns
  const apologyWords = ["sorry", "apologize", "my fault", "i was wrong"];
  let userApologies = 0;
  let contactApologies = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let hasApology = false;

    apologyWords.forEach((word) => {
      if (content.includes(word)) hasApology = true;
    });

    if (hasApology) {
      if (msg.role === "user") contactApologies++;
      else userApologies++;
    }
  });

  return {
    pattern,
    resolutionRate,
    totalConflicts,
    resolvedConflicts,
    repairAttempts: repairs.length,
    apologyData: {
      user: userApologies,
      contact: contactApologies,
      ratio:
        contactApologies > 0
          ? (userApologies / contactApologies).toFixed(1)
          : "N/A",
    },
  };
};

// Initiation Balance Analysis - Updated to match "You initiate 9 out of 10 conversations"
const analyzeInitiationBalance = (messages, messageCounts, contactName) => {
  const { user, contact } = messageCounts;
  const total = user + contact || 1;

  const userPercent = Math.round((user / total) * 100);
  const contactPercent = Math.round((contact / total) * 100);

  const imbalance = Math.abs(userPercent - contactPercent);
  let imbalanceLevel;
  let description;

  // Calculate more specific initiation patterns
  const userInitiatedCount = Math.round((user / total) * 10);
  const contactInitiatedCount = 10 - userInitiatedCount;

  if (imbalance <= 10) {
    imbalanceLevel = "balanced";
    description = `Mutual effort detected with balanced turn-taking`;
  } else if (userPercent >= 80) {
    imbalanceLevel = "severe";
    description = `You initiate ${userInitiatedCount} out of 10 conversations`;
  } else if (contactPercent >= 80) {
    imbalanceLevel = "severe";
    description = `${contactName} initiates ${contactInitiatedCount} out of 10 conversations`;
  } else if (userPercent > contactPercent) {
    imbalanceLevel = "moderate";
    description = `You initiate ${userInitiatedCount} out of 10 conversations`;
  } else {
    imbalanceLevel = "moderate";
    description = `${contactName} initiates ${contactInitiatedCount} out of 10 conversations`;
  }

  return {
    userPercent,
    contactPercent,
    imbalanceLevel,
    description,
    imbalanceScore: imbalance,
    userInitiatedCount,
    contactInitiatedCount,
  };
};

// Humor vs Depth Balance
const analyzeHumorDepthBalance = (messages) => {
  const humorIndicators = [
    "lol",
    "haha",
    "hehe",
    "lmao",
    "rofl",
    "funny",
    "joke",
    "hilarious",
    "😂",
    "🤣",
    "😄",
    "😆",
    "comedy",
    "amusing",
    "witty",
    "sarcasm",
  ];

  const depthIndicators = [
    "feel",
    "feelings",
    "emotion",
    "think deeply",
    "believe",
    "important",
    "value",
    "meaningful",
    "serious",
    "honestly",
    "vulnerable",
    "share",
    "personal",
    "life",
    "goals",
    "dreams",
    "fears",
    "struggle",
    "growth",
    "reflection",
  ];

  let humorCount = 0;
  let depthCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let hasHumor = false;
    let hasDepth = false;

    humorIndicators.forEach((indicator) => {
      if (content.includes(indicator) && !hasHumor) {
        humorCount++;
        hasHumor = true;
      }
    });

    depthIndicators.forEach((indicator) => {
      if (content.includes(indicator) && !hasDepth) {
        depthCount++;
        hasDepth = true;
      }
    });
  });

  const total = humorCount + depthCount || 1;
  const humorPercent = Math.round((humorCount / total) * 100);
  const depthPercent = Math.round((depthCount / total) * 100);

  return {
    humor: humorPercent,
    depth: depthPercent,
    humorCount,
    depthCount,
    balance:
      humorPercent > depthPercent * 3
        ? "humor-heavy"
        : depthPercent > humorPercent * 3
          ? "depth-heavy"
          : "balanced",
  };
};

// Vulnerability Index Analysis
const analyzeVulnerabilityIndex = (messages) => {
  const vulnerabilityWords = [
    "afraid",
    "scared",
    "worried",
    "nervous",
    "anxious",
    "stressed",
    "struggling",
    "hard time",
    "difficult",
    "challenge",
    "hurt",
    "pain",
    "sad",
    "depressed",
    "lonely",
    "insecure",
    "doubt",
    "failure",
    "mistake",
    "embarrassed",
    "ashamed",
    "vulnerable",
    "open up",
    "personal",
    "private",
    "secret",
    "confide",
  ];

  let vulnerabilityCount = 0;
  let totalEmotionalWords = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let msgVulnerability = 0;

    vulnerabilityWords.forEach((word) => {
      if (content.includes(word)) {
        msgVulnerability++;
        totalEmotionalWords++;
      }
    });

    if (msgVulnerability > 0) vulnerabilityCount++;
  });

  const vulnerabilityRatio = (vulnerabilityCount / messages.length) * 100;
  let level;

  if (vulnerabilityRatio < 5) level = "Very Low";
  else if (vulnerabilityRatio < 15) level = "Low";
  else if (vulnerabilityRatio < 30) level = "Moderate";
  else if (vulnerabilityRatio < 50) level = "High";
  else level = "Very High";

  return {
    level,
    score: Math.round(vulnerabilityRatio),
    vulnerableMessages: vulnerabilityCount,
    totalMessages: messages.length,
    emotionalWords: totalEmotionalWords,
  };
};

// Communication Gaps Analysis
const analyzeCommunicationGaps = (messages) => {
  if (messages.length < 3) {
    return {
      longestGap: "Not enough data",
      longestGapDays: 0,
      averageGap: "Not enough data",
      gapCount: 0,
    };
  }

  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0);
    const timeB = new Date(b.timestamp || b.createdAt || 0);
    return timeA - timeB;
  });

  const gaps = [];
  let longestGapDays = 0;

  for (let i = 1; i < sortedMessages.length; i++) {
    const prevTime = new Date(
      sortedMessages[i - 1].timestamp || sortedMessages[i - 1].createdAt
    );
    const currTime = new Date(
      sortedMessages[i].timestamp || sortedMessages[i].createdAt
    );

    const gapDays = (currTime - prevTime) / (1000 * 60 * 60 * 24);

    if (gapDays > 0 && gapDays < 365) {
      // Ignore gaps over a year as likely data issues
      gaps.push(gapDays);
      if (gapDays > longestGapDays) longestGapDays = gapDays;
    }
  }

  const averageGapDays =
    gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : 0;

  return {
    longestGap: formatGapDuration(longestGapDays),
    longestGapDays: Math.round(longestGapDays),
    averageGap: formatGapDuration(averageGapDays),
    averageGapDays: Math.round(averageGapDays),
    gapCount: gaps.length,
    gaps: gaps.map((gap) => Math.round(gap)),
  };
};

// Topic Diversity Analysis
const analyzeTopicDiversity = (topicAnalysis) => {
  const topics = topicAnalysis.allTopics;
  if (topics.length < 2) {
    return { score: 0, level: "Very Low" };
  }

  // Calculate entropy-based diversity score
  const totalMentions = topics.reduce((sum, topic) => sum + topic.count, 0);
  let entropy = 0;

  topics.forEach((topic) => {
    if (topic.count > 0) {
      const probability = topic.count / totalMentions;
      entropy -= probability * Math.log2(probability);
    }
  });

  // Normalize entropy to 0-100 scale
  const maxEntropy = Math.log2(topics.length);
  const diversityScore =
    maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0;

  let level;
  if (diversityScore < 30) level = "Low";
  else if (diversityScore < 60) level = "Moderate";
  else if (diversityScore < 80) level = "High";
  else level = "Very High";

  return {
    score: diversityScore,
    level,
    topicCount: topics.length,
    entropy: entropy.toFixed(2),
  };
};

// Professional Tone Analysis
const analyzeProfessionalTone = (messages) => {
  const formalWords = [
    "please",
    "thank you",
    "regards",
    "sincerely",
    "professional",
    "meeting",
    "deadline",
    "project",
    "report",
    "document",
    "schedule",
    "appointment",
    "follow up",
    "discuss",
    "review",
    "analyze",
    "implement",
    "strategy",
  ];

  const casualWords = [
    "hey",
    "hi",
    "cool",
    "awesome",
    "yeah",
    "yep",
    "nope",
    "btw",
    "lol",
    "gonna",
    "wanna",
    "kinda",
    "sorta",
    "stuff",
    "things",
    "whatever",
  ];

  const taskWords = [
    "task",
    "work",
    "job",
    "complete",
    "finish",
    "done",
    "todo",
    "assign",
    "responsibility",
    "deliverable",
    "milestone",
    "progress",
    "status",
    "update",
  ];

  let formalCount = 0;
  let casualCount = 0;
  let taskCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    formalWords.forEach((word) => {
      if (content.includes(word)) formalCount++;
    });

    casualWords.forEach((word) => {
      if (content.includes(word)) casualCount++;
    });

    taskWords.forEach((word) => {
      if (content.includes(word)) taskCount++;
    });
  });

  const total = formalCount + casualCount + taskCount || 1;
  const formalPercent = Math.round((formalCount / total) * 100);
  const casualPercent = Math.round((casualCount / total) * 100);
  const taskPercent = Math.round((taskCount / total) * 100);

  let description;
  let score = formalPercent;

  if (formalPercent > 60) description = "Highly Professional";
  else if (formalPercent > 40) description = "Professional";
  else if (formalPercent > 20) description = "Semi-Professional";
  else description = "Casual";

  return {
    description,
    score,
    data: [
      { name: "Formal", value: formalPercent, color: "#3b82f6" },
      { name: "Task-focused", value: taskPercent, color: "#ef4444" },
      { name: "Casual", value: casualPercent, color: "#10b981" },
    ],
    counts: { formal: formalCount, casual: casualCount, task: taskCount },
  };
};

// Power Dynamics Analysis - Updated to match "They assign tasks directly; you ask for clarification 3x more often"
const analyzePowerDynamics = (messages) => {
  const directiveWords = [
    "need you to",
    "you should",
    "you must",
    "you have to",
    "please do",
    "make sure",
    "ensure that",
    "i need",
    "required",
    "mandatory",
    "deadline",
    "assign",
    "task for you",
    "your responsibility",
  ];

  const clarificationWords = [
    "can you clarify",
    "what do you mean",
    "i don't understand",
    "could you explain",
    "not sure what",
    "clarification needed",
    "help me understand",
    "can you elaborate",
    "more details please",
    "what exactly",
  ];

  const requestWords = [
    "could you",
    "would you",
    "can you",
    "if possible",
    "when you have time",
    "please consider",
    "would it be possible",
    "if you don't mind",
    "may i ask",
  ];

  let userDirectives = 0;
  let userRequests = 0;
  let userClarifications = 0;
  let contactDirectives = 0;
  let contactRequests = 0;
  let contactClarifications = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    let directives = 0;
    let requests = 0;
    let clarifications = 0;

    directiveWords.forEach((word) => {
      if (content.includes(word)) directives++;
    });

    requestWords.forEach((word) => {
      if (content.includes(word)) requests++;
    });

    clarificationWords.forEach((word) => {
      if (content.includes(word)) clarifications++;
    });

    if (msg.role === "user") {
      userDirectives += directives;
      userRequests += requests;
      userClarifications += clarifications;
    } else {
      contactDirectives += directives;
      contactRequests += requests;
      contactClarifications += clarifications;
    }
  });

  // Calculate clarification ratio
  const clarificationRatio =
    contactClarifications > 0
      ? Math.round(userClarifications / contactClarifications)
      : userClarifications > 0
        ? userClarifications
        : 1;

  let description;
  if (
    contactDirectives > userDirectives &&
    userClarifications > contactClarifications
  ) {
    description = `They assign tasks directly; you ask for clarification ${clarificationRatio}x more often`;
  } else if (contactDirectives > userDirectives * 1.5) {
    description = "They take a more directive approach in communication";
  } else if (userDirectives > contactDirectives * 1.5) {
    description = "You take a more directive approach in communication";
  } else {
    description = "Equal collaboration in task assignment";
  }

  return {
    description,
    data: [
      { name: "Your Directives", value: userDirectives, color: "#ef4444" },
      { name: "Your Requests", value: userRequests, color: "#3b82f6" },
      {
        name: "Your Clarifications",
        value: userClarifications,
        color: "#10b981",
      },
      { name: "Their Directives", value: contactDirectives, color: "#f97316" },
      { name: "Their Requests", value: contactRequests, color: "#8b5cf6" },
      {
        name: "Their Clarifications",
        value: contactClarifications,
        color: "#06b6d4",
      },
    ],
    ratios: {
      userDirective: Math.round(
        (userDirectives /
          (userDirectives + userRequests + userClarifications || 1)) *
          100
      ),
      contactDirective: Math.round(
        (contactDirectives /
          (contactDirectives + contactRequests + contactClarifications || 1)) *
          100
      ),
      clarificationRatio,
    },
  };
};

// Apology/Praise/Blame Analysis - Updated to match "You apologize 2x more than they praise you"
const analyzeApologyPraiseBlame = (messages) => {
  const apologyWords = [
    "sorry",
    "apologize",
    "my fault",
    "my mistake",
    "i was wrong",
  ];
  const praiseWords = [
    "good job",
    "well done",
    "excellent",
    "great work",
    "thank you",
    "appreciate",
    "proud",
  ];
  const blameWords = [
    "your fault",
    "you did",
    "you didn't",
    "you should have",
    "you failed",
    "you messed up",
  ];

  let userApologies = 0;
  let userPraise = 0;
  let userBlame = 0;
  let contactApologies = 0;
  let contactPraise = 0;
  let contactBlame = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    let apologies = 0;
    let praise = 0;
    let blame = 0;

    apologyWords.forEach((word) => {
      if (content.includes(word)) apologies++;
    });

    praiseWords.forEach((word) => {
      if (content.includes(word)) praise++;
    });

    blameWords.forEach((word) => {
      if (content.includes(word)) blame++;
    });

    if (msg.role === "user") {
      userApologies += apologies;
      userPraise += praise;
      userBlame += blame;
    } else {
      contactApologies += apologies;
      contactPraise += praise;
      contactBlame += blame;
    }
  });

  // Calculate the specific ratios for the UI
  const apologyRatio =
    contactApologies > 0
      ? userApologies / contactApologies
      : userApologies > 0
        ? userApologies
        : 1;
  const praiseRatio =
    contactPraise > 0
      ? userApologies / contactPraise
      : userApologies > 0
        ? userApologies
        : 1;

  let description;
  if (userApologies > 0 && contactPraise > 0) {
    const ratio = Math.round(praiseRatio);
    description = `You apologize ${ratio}x more than they praise you`;
  } else if (userApologies > contactApologies * 1.5) {
    const ratio = Math.round(apologyRatio);
    description = `You apologize ${ratio}x more than they do`;
  } else if (contactApologies > userApologies * 1.5) {
    const ratio = Math.round(1 / apologyRatio);
    description = `They apologize ${ratio}x more than you do`;
  } else {
    description = "Balanced apology and praise patterns";
  }

  return {
    description,
    data: [
      { name: "Your Apologies", value: userApologies, color: "#f59e0b" },
      { name: "Your Praise", value: userPraise, color: "#10b981" },
      { name: "Your Blame", value: userBlame, color: "#ef4444" },
      { name: "Their Apologies", value: contactApologies, color: "#f97316" },
      { name: "Their Praise", value: contactPraise, color: "#06b6d4" },
      { name: "Their Blame", value: contactBlame, color: "#dc2626" },
    ],
    ratios: {
      apology: apologyRatio.toFixed(1),
      praise: praiseRatio.toFixed(1),
    },
  };
};

// Task vs Emotional Labor Analysis
const analyzeTaskEmotionalLabor = (messages) => {
  const taskWords = [
    "work",
    "task",
    "project",
    "deadline",
    "meeting",
    "report",
    "document",
    "complete",
    "finish",
    "progress",
    "status",
    "update",
    "deliver",
    "assign",
  ];

  const emotionalWords = [
    "how are you",
    "feeling",
    "hope",
    "care",
    "support",
    "help",
    "concern",
    "understand",
    "empathy",
    "comfort",
    "personal",
    "family",
    "health",
    "stress",
  ];

  let taskCount = 0;
  let emotionalCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let hasTask = false;
    let hasEmotional = false;

    taskWords.forEach((word) => {
      if (content.includes(word) && !hasTask) {
        taskCount++;
        hasTask = true;
      }
    });

    emotionalWords.forEach((word) => {
      if (content.includes(word) && !hasEmotional) {
        emotionalCount++;
        hasEmotional = true;
      }
    });
  });

  const total = taskCount + emotionalCount || 1;
  const taskPercent = Math.round((taskCount / total) * 100);
  const emotionalPercent = Math.round((emotionalCount / total) * 100);

  return {
    task: taskPercent,
    emotional: emotionalPercent,
    taskCount,
    emotionalCount,
    balance:
      taskPercent > 80
        ? "heavily task-focused"
        : emotionalPercent > 80
          ? "heavily relationship-focused"
          : "balanced",
  };
};

/**
 * FAMILY RELATIONSHIP ANALYSIS FUNCTIONS
 */

const analyzeGenerationalTensions = (messages) => {
  const traditionalWords = [
    "tradition",
    "always been",
    "in my day",
    "proper",
    "respect",
    "should",
    "responsibility",
    "duty",
    "family values",
    "the way things are",
    "always done",
  ];

  const modernWords = [
    "nowadays",
    "times change",
    "different now",
    "my generation",
    "new way",
    "modern",
    "update",
    "change",
    "adapt",
    "evolve",
    "progressive",
  ];

  const adviceGivingPhrases = [
    "you should",
    "you need to",
    "my advice",
    "listen to me",
    "take my word",
    "trust me",
    "i know best",
    "you'll understand when",
    "let me tell you",
    "in my experience",
    "if i were you",
    "you'd better",
  ];

  let traditionalCount = 0;
  let modernCount = 0;
  let tensionWords = 0;
  let userAdviceGiving = 0;
  let contactAdviceGiving = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    traditionalWords.forEach((word) => {
      if (content.includes(word)) traditionalCount++;
    });

    modernWords.forEach((word) => {
      if (content.includes(word)) modernCount++;
    });

    // Check for advice-giving patterns
    adviceGivingPhrases.forEach((phrase) => {
      if (content.includes(phrase)) {
        if (msg.role === "user") {
          userAdviceGiving++;
        } else {
          contactAdviceGiving++;
        }
      }
    });

    // Check for tension indicators
    if (
      content.includes("but") ||
      content.includes("however") ||
      content.includes("disagree")
    ) {
      tensionWords++;
    }
  });

  const total = traditionalCount + modernCount || 1;
  const traditionalPercent = Math.round((traditionalCount / total) * 100);
  const modernPercent = Math.round((modernCount / total) * 100);
  const tensionScore = Math.round((tensionWords / messages.length) * 100);

  let level;
  if (contactAdviceGiving > userAdviceGiving * 2) {
    level = "Frequent use of advice-giving phrases from their side";
  } else if (userAdviceGiving > contactAdviceGiving * 2) {
    level = "You frequently give advice and guidance";
  } else if (tensionScore < 10) {
    level = "Low tension";
  } else if (tensionScore < 25) {
    level = "Moderate tension";
  } else {
    level = "High tension";
  }

  return {
    level,
    tensionScore,
    data: [
      {
        name: "Traditional Values",
        value: traditionalPercent,
        color: "#dc2626",
      },
      { name: "Modern Values", value: modernPercent, color: "#2563eb" },
    ],
    traditionalCount,
    modernCount,
    tensionIndicators: tensionWords,
    adviceGiving: {
      user: userAdviceGiving,
      contact: contactAdviceGiving,
    },
  };
};

const analyzeFamilyRole = (messages) => {
  const supportWords = [
    "help",
    "support",
    "care",
    "worry",
    "concern",
    "there for you",
    "love you",
    "proud",
    "check on",
    "take care",
    "make sure",
  ];

  const adviceWords = [
    "should",
    "need to",
    "advice",
    "suggest",
    "recommend",
    "think you should",
    "better if",
    "why don't you",
    "have you considered",
    "my opinion",
  ];

  const coordinationWords = [
    "plan",
    "schedule",
    "when",
    "where",
    "time",
    "visit",
    "gather",
    "holiday",
    "birthday",
    "event",
    "family dinner",
    "get together",
  ];

  let supportCount = 0;
  let adviceCount = 0;
  let coordinationCount = 0;
  let totalUserMessages = messages.filter((msg) => msg.role === "user").length;

  messages.forEach((msg) => {
    if (!msg.content || msg.role !== "user") return;

    const content = msg.content.toLowerCase();

    supportWords.forEach((word) => {
      if (content.includes(word)) supportCount++;
    });

    adviceWords.forEach((word) => {
      if (content.includes(word)) adviceCount++;
    });

    coordinationWords.forEach((word) => {
      if (content.includes(word)) coordinationCount++;
    });
  });

  const supportPercentage =
    totalUserMessages > 0
      ? Math.round((supportCount / totalUserMessages) * 100)
      : 0;

  let description;
  if (supportCount > adviceCount && supportCount > coordinationCount) {
    description = "Primary supporter and caregiver";
  } else if (adviceCount > supportCount && adviceCount > coordinationCount) {
    description = "Advice-giver and guide";
  } else if (
    coordinationCount > supportCount &&
    coordinationCount > adviceCount
  ) {
    description = "Family coordinator and organizer";
  } else {
    description = "Balanced family contributor";
  }

  return {
    description,
    supportPercentage,
    counts: {
      support: supportCount,
      advice: adviceCount,
      coordination: coordinationCount,
    },
  };
};

const analyzeTraditionAutonomy = (messages) => {
  const traditionWords = [
    "should",
    "expected",
    "family tradition",
    "always",
    "proper",
    "respect",
    "responsibility",
    "duty",
    "obligation",
    "way things are",
    "family values",
  ];

  const autonomyWords = [
    "my choice",
    "my decision",
    "my life",
    "independent",
    "freedom",
    "own way",
    "personal",
    "individual",
    "different",
    "change",
    "new",
    "modern",
  ];

  let traditionCount = 0;
  let autonomyCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    traditionWords.forEach((word) => {
      if (content.includes(word)) traditionCount++;
    });

    autonomyWords.forEach((word) => {
      if (content.includes(word)) autonomyCount++;
    });
  });

  const total = traditionCount + autonomyCount || 1;
  const traditionPercent = Math.round((traditionCount / total) * 100);
  const autonomyPercent = Math.round((autonomyCount / total) * 100);

  let description;
  if (Math.abs(traditionPercent - autonomyPercent) <= 15) {
    description = "Balanced tradition and autonomy";
  } else if (traditionPercent > autonomyPercent) {
    description = "Tradition-oriented communication";
  } else {
    description = "Autonomy-oriented communication";
  }

  return {
    description,
    tradition: traditionPercent,
    autonomy: autonomyPercent,
    traditionCount,
    autonomyCount,
  };
};

const analyzeEmotionalWarmth = (messages) => {
  const warmthWords = [
    "love",
    "miss",
    "care",
    "proud",
    "hug",
    "kiss",
    "heart",
    "appreciate",
    "grateful",
    "thankful",
    "blessing",
    "special",
    "important",
    "dear",
  ];

  const coldWords = [
    "fine",
    "whatever",
    "busy",
    "later",
    "can't talk",
    "not now",
    "don't bother",
    "leave me alone",
    "formal",
    "distant",
  ];

  let warmthCount = 0;
  let coldCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    warmthWords.forEach((word) => {
      if (content.includes(word)) warmthCount++;
    });

    coldWords.forEach((word) => {
      if (content.includes(word)) coldCount++;
    });
  });

  const warmthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(((warmthCount - coldCount) / messages.length) * 100 + 50)
    )
  );

  let level;
  if (warmthScore < 30) level = "Distant/Formal";
  else if (warmthScore < 50) level = "Reserved";
  else if (warmthScore < 70) level = "Moderately Warm";
  else if (warmthScore < 85) level = "Warm";
  else level = "Very Affectionate";

  return {
    level,
    score: warmthScore,
    warmthCount,
    coldCount,
    warmthRatio:
      messages.length > 0 ? (warmthCount / messages.length).toFixed(3) : 0,
  };
};

// MISSING FUNCTION: Communication Spikes Analysis
const analyzeCommunicationSpikes = (messages, temporalAnalysis) => {
  if (messages.length < 10) {
    return {
      description: "Not enough data to detect spikes",
      patterns: [],
      spikeDays: [],
    };
  }

  // Group messages by date
  const messagesByDate = {};
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0);
    const timeB = new Date(b.timestamp || b.createdAt || 0);
    return timeA - timeB;
  });

  sortedMessages.forEach((msg) => {
    const date = new Date(msg.timestamp || msg.createdAt);
    const dateStr = date.toDateString();

    if (!messagesByDate[dateStr]) {
      messagesByDate[dateStr] = [];
    }
    messagesByDate[dateStr].push(msg);
  });

  // Calculate daily message counts
  const dailyCounts = Object.values(messagesByDate).map((msgs) => msgs.length);
  const avgDaily =
    dailyCounts.reduce((sum, count) => sum + count, 0) / dailyCounts.length;

  // Find spikes (days with 3x or more than average)
  const spikeDays = [];
  Object.entries(messagesByDate).forEach(([date, msgs]) => {
    if (msgs.length >= avgDaily * 3) {
      spikeDays.push({
        date,
        count: msgs.length,
        multiplier: (msgs.length / avgDaily).toFixed(1),
      });
    }
  });

  // Analyze spike patterns
  const patterns = [];
  if (spikeDays.length > 0) {
    // Check for holiday patterns
    const holidayKeywords = [
      "christmas",
      "thanksgiving",
      "birthday",
      "holiday",
      "new year",
      "easter",
      "valentine",
    ];
    const crisisKeywords = [
      "emergency",
      "crisis",
      "urgent",
      "help",
      "problem",
      "issue",
      "trouble",
    ];

    spikeDays.forEach((spike) => {
      const spikeMessages = messagesByDate[spike.date];
      const spikeContent = spikeMessages
        .map((msg) => msg.content || "")
        .join(" ")
        .toLowerCase();

      let isHoliday = holidayKeywords.some((keyword) =>
        spikeContent.includes(keyword)
      );
      let isCrisis = crisisKeywords.some((keyword) =>
        spikeContent.includes(keyword)
      );

      if (isHoliday) {
        patterns.push({
          type: "Holiday/Special Event",
          date: spike.date,
          description: `${spike.multiplier}x normal volume on ${spike.date}`,
        });
      } else if (isCrisis) {
        patterns.push({
          type: "Crisis/Emergency",
          date: spike.date,
          description: `Crisis-related spike: ${spike.multiplier}x normal volume`,
        });
      } else {
        patterns.push({
          type: "Unknown",
          date: spike.date,
          description: `Unexplained spike: ${spike.multiplier}x normal volume`,
        });
      }
    });
  }

  let description;
  if (spikeDays.length === 0) {
    description = "Consistent communication patterns, no major spikes detected";
  } else if (spikeDays.length <= 2) {
    description = `Occasional communication spikes (${spikeDays.length} detected)`;
  } else {
    description = `Frequent communication spikes (${spikeDays.length} detected) - possible crisis-driven or event-driven communication`;
  }

  return {
    description,
    patterns: patterns.slice(0, 5), // Limit to 5 most recent patterns
    spikeDays: spikeDays.slice(0, 10), // Limit to 10 most recent spikes
    averageDailyMessages: Math.round(avgDaily),
    totalSpikes: spikeDays.length,
  };
};

/**
 * MENTOR RELATIONSHIP ANALYSIS FUNCTIONS
 */

const analyzeReflectiveListening = (messages) => {
  const reflectiveIndicators = [
    "what i hear you saying",
    "it sounds like",
    "so you're feeling",
    "i understand that",
    "let me reflect",
    "what i'm hearing",
    "you mentioned",
    "you said",
    "from what you've shared",
    "i sense that",
    "help me understand",
    "can you tell me more",
  ];

  let reflectiveCount = 0;
  let totalMentorMessages = messages.filter(
    (msg) => msg.role !== "user"
  ).length;

  messages.forEach((msg) => {
    if (!msg.content || msg.role === "user") return;

    const content = msg.content.toLowerCase();

    reflectiveIndicators.forEach((indicator) => {
      if (content.includes(indicator)) reflectiveCount++;
    });
  });

  const reflectiveRate =
    totalMentorMessages > 0
      ? Math.round((reflectiveCount / totalMentorMessages) * 100)
      : 0;

  let description;
  if (reflectiveRate >= 60) {
    description =
      "High reflective listening - frequently restates and validates";
  } else if (reflectiveRate >= 30) {
    description = "Moderate reflective listening - occasionally reflects back";
  } else if (reflectiveRate >= 10) {
    description = "Some reflective listening - minimal validation responses";
  } else {
    description =
      "Low reflective listening - more directive communication style";
  }

  return {
    description,
    rate: reflectiveRate,
    count: reflectiveCount,
    totalMessages: totalMentorMessages,
  };
};

const analyzeEncouragementAccountability = (messages) => {
  const encouragementWords = [
    "great job",
    "well done",
    "proud of you",
    "you can do it",
    "believe in you",
    "keep going",
    "you're doing well",
    "that's progress",
    "excellent",
    "amazing",
    "inspiring",
    "motivated",
  ];

  const accountabilityWords = [
    "you said you would",
    "let's check in",
    "follow up",
    "commitment",
    "deadline",
    "what's the next step",
    "accountability",
    "track progress",
    "measure",
    "goals",
    "milestones",
    "review",
  ];

  let motivationalCount = 0;
  let correctiveCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    encouragementWords.forEach((word) => {
      if (content.includes(word)) motivationalCount++;
    });

    accountabilityWords.forEach((word) => {
      if (content.includes(word)) correctiveCount++;
    });
  });

  const total = motivationalCount + correctiveCount || 1;
  const motivationalPercent = Math.round((motivationalCount / total) * 100);
  const correctivePercent = Math.round((correctiveCount / total) * 100);

  let description;
  if (motivationalPercent > correctivePercent * 2) {
    description = "Highly encouraging, supportive mentoring style";
  } else if (correctivePercent > motivationalPercent * 2) {
    description = "Accountability-focused, results-oriented mentoring";
  } else {
    description = "Balanced encouragement and accountability";
  }

  return {
    description,
    motivational: motivationalPercent,
    corrective: correctivePercent,
    motivationalCount,
    correctiveCount,
  };
};

const analyzePersonalGrowthFraming = (messages) => {
  const growthWords = [
    "learning",
    "growth",
    "develop",
    "improve",
    "progress",
    "evolve",
    "skills",
    "abilities",
    "potential",
    "opportunity",
    "challenge",
    "experience",
    "journey",
    "path",
    "next level",
    "better version",
    "strengths",
    "areas to work on",
  ];

  let growthMentions = 0;
  let growthMessages = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let hasGrowthLanguage = false;

    growthWords.forEach((word) => {
      if (content.includes(word)) {
        if (!hasGrowthLanguage) {
          growthMessages++;
          hasGrowthLanguage = true;
        }
        growthMentions++;
      }
    });
  });

  const growthRatio = (growthMessages / messages.length) * 100;

  let description;
  if (growthRatio >= 40) {
    description =
      "Strong growth mindset - consistently frames experiences as learning opportunities";
  } else if (growthRatio >= 20) {
    description =
      "Moderate growth focus - regularly discusses development and improvement";
  } else if (growthRatio >= 10) {
    description =
      "Some growth orientation - occasionally mentions learning and development";
  } else {
    description =
      "Limited growth language - focuses more on immediate issues than long-term development";
  }

  return {
    description,
    frequency: growthMentions,
    growthMessageCount: growthMessages,
    growthRatio: Math.round(growthRatio),
  };
};

const analyzeGoalSettingFollowup = (messages) => {
  const goalWords = [
    "goal",
    "objective",
    "target",
    "aim",
    "plan to",
    "want to achieve",
    "working towards",
    "next step",
    "action item",
    "commitment",
    "by when",
    "deadline",
    "timeline",
    "will do",
    "promise to",
    "commit to",
  ];

  const followupWords = [
    "how did it go",
    "follow up",
    "check in",
    "progress update",
    "did you",
    "were you able to",
    "what happened with",
    "update on",
    "status",
    "review",
  ];

  let goalCommitments = [];
  let followupInstances = [];

  // First pass - identify goal commitments
  messages.forEach((msg, index) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let hasGoalLanguage = false;

    goalWords.forEach((word) => {
      if (content.includes(word)) {
        hasGoalLanguage = true;
      }
    });

    if (hasGoalLanguage) {
      goalCommitments.push({
        index,
        timestamp: new Date(msg.timestamp || msg.createdAt),
        content: msg.content,
        followedUp: false,
        daysToFollowup: null,
      });
    }
  });

  // Second pass - identify follow-ups
  messages.forEach((msg, index) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();
    let hasFollowupLanguage = false;

    followupWords.forEach((word) => {
      if (content.includes(word)) {
        hasFollowupLanguage = true;
      }
    });

    if (hasFollowupLanguage) {
      followupInstances.push({
        index,
        timestamp: new Date(msg.timestamp || msg.createdAt),
        content: msg.content,
      });
    }
  });

  // Match follow-ups to commitments
  goalCommitments.forEach((commitment) => {
    const laterFollowups = followupInstances.filter(
      (followup) => followup.timestamp > commitment.timestamp
    );

    if (laterFollowups.length > 0) {
      const nearestFollowup = laterFollowups.reduce((nearest, current) => {
        const nearestDiff = Math.abs(nearest.timestamp - commitment.timestamp);
        const currentDiff = Math.abs(current.timestamp - commitment.timestamp);
        return currentDiff < nearestDiff ? current : nearest;
      });

      const daysDiff = Math.ceil(
        (nearestFollowup.timestamp - commitment.timestamp) /
          (1000 * 60 * 60 * 24)
      );

      commitment.followedUp = true;
      commitment.daysToFollowup = daysDiff;
    }
  });

  const followedUpCommitments = goalCommitments.filter((c) => c.followedUp);
  const followupRate =
    goalCommitments.length > 0
      ? Math.round(
          (followedUpCommitments.length / goalCommitments.length) * 100
        )
      : 0;

  // Calculate average days to follow-up
  const followupDays = followedUpCommitments
    .filter((c) => c.daysToFollowup !== null)
    .map((c) => c.daysToFollowup);

  const avgFollowupDays =
    followupDays.length > 0
      ? Math.round(
          followupDays.reduce((sum, days) => sum + days, 0) /
            followupDays.length
        )
      : 0;

  const dropoffRate = Math.max(0, 100 - followupRate);

  let description;
  if (followupRate >= 80 && avgFollowupDays <= 2) {
    description = "Excellent goal follow-through with timely check-ins";
  } else if (followupRate >= 60 && avgFollowupDays <= 5) {
    description = `You confirm commitments, but follow-up drops after ${avgFollowupDays} days`;
  } else if (followupRate >= 40) {
    description = `Moderate follow-through - checks progress after ${avgFollowupDays} days on average`;
  } else if (followupRate >= 20) {
    description = "Limited goal follow-through - infrequent progress checks";
  } else {
    description = "Poor goal follow-through - rarely checks on commitments";
  }

  return {
    description,
    goalSettingCount: goalCommitments.length,
    followupCount: followupInstances.length,
    followupRate,
    dropoffRate,
    averageFollowupDays: avgFollowupDays,
  };
};

const analyzeAffirmationCorrection = (messages) => {
  const affirmationWords = [
    "you're right",
    "that's correct",
    "exactly",
    "good point",
    "I agree",
    "absolutely",
    "spot on",
    "well said",
    "that makes sense",
    "yes",
    "true",
    "right on",
  ];

  const correctionWords = [
    "actually",
    "however",
    "but",
    "not quite",
    "let me clarify",
    "correction",
    "different perspective",
    "consider this",
    "another way",
    "alternative",
    "reconsider",
    "think about",
  ];

  let affirmationCount = 0;
  let correctionCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    affirmationWords.forEach((word) => {
      if (content.includes(word)) affirmationCount++;
    });

    correctionWords.forEach((word) => {
      if (content.includes(word)) correctionCount++;
    });
  });

  const total = affirmationCount + correctionCount || 1;
  const affirmationPercent = Math.round((affirmationCount / total) * 100);
  const correctionPercent = Math.round((correctionCount / total) * 100);

  const ratio =
    correctionCount > 0
      ? (affirmationCount / correctionCount).toFixed(1)
      : "N/A";

  return {
    ratio: `${ratio}:1`,
    data: [
      {
        name: "Affirmations",
        value: affirmationPercent,
        color: "#10b981",
      },
      {
        name: "Corrections",
        value: correctionPercent,
        color: "#f59e0b",
      },
    ],
    affirmationCount,
    correctionCount,
  };
};

/**
 * MISSING UTILITY FUNCTIONS
 */

const analyzeClarityIndex = (messages) => {
  const clarityIndicators = [
    "to clarify",
    "let me be clear",
    "specifically",
    "in other words",
    "what I mean is",
    "for example",
    "to be precise",
    "clearly stated",
  ];

  const confusionIndicators = [
    "not sure what you mean",
    "confused",
    "unclear",
    "don't understand",
    "can you explain",
    "what do you mean",
    "huh",
    "I'm lost",
  ];

  let clarityCount = 0;
  let confusionCount = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    clarityIndicators.forEach((indicator) => {
      if (content.includes(indicator)) clarityCount++;
    });

    confusionIndicators.forEach((indicator) => {
      if (content.includes(indicator)) confusionCount++;
    });
  });

  const clarityScore =
    clarityCount > confusionCount
      ? "High clarity"
      : confusionCount > clarityCount
        ? "Needs clarification"
        : "Moderate clarity";

  return clarityScore;
};

const analyzeBoundaryMaintenance = (messages) => {
  const boundaryWords = [
    "work hours",
    "after hours",
    "weekend",
    "personal time",
    "boundary",
    "not available",
    "office hours",
    "business hours",
    "urgent only",
    "emergency only",
  ];

  const boundaryViolations = [
    "sorry to bother you",
    "I know it's late",
    "quick question",
    "one more thing",
    "just checking",
    "sorry for the weekend message",
  ];

  let boundaryMentions = 0;
  let violationMentions = 0;

  messages.forEach((msg) => {
    if (!msg.content) return;

    const content = msg.content.toLowerCase();

    boundaryWords.forEach((word) => {
      if (content.includes(word)) boundaryMentions++;
    });

    boundaryViolations.forEach((violation) => {
      if (content.includes(violation)) violationMentions++;
    });
  });

  const boundaryScore =
    boundaryMentions > violationMentions
      ? "Good boundary maintenance"
      : violationMentions > boundaryMentions * 2
        ? "Poor boundary maintenance"
        : "Moderate boundary maintenance";

  return boundaryScore;
};

/**
 * UTILITY FUNCTIONS
 */
const normalizeRelationshipType = (type) => {
  if (!type) return "other";
  type = type.toLowerCase();

  if (type.includes("romantic") || type.includes("partner")) return "romantic";
  if (type.includes("friend")) return "friendship";
  if (
    type.includes("professional") ||
    type.includes("work") ||
    type.includes("colleague")
  )
    return "professional";
  if (type.includes("family")) return "family";
  if (type.includes("mentor")) return "mentor";

  return "other";
};

const formatResponseTime = (minutes) => {
  if (isNaN(minutes) || minutes === 0) return "N/A";

  if (minutes < 1) return "< 1 minute";
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  return hours === 0 ? `${days}d` : `${days}d ${hours}h`;
};

const getSentimentLabel = (score) => {
  if (score > 0.6) return "very positive";
  if (score > 0.3) return "positive";
  if (score > 0.1) return "slightly positive";
  if (score > -0.1) return "neutral";
  if (score > -0.3) return "slightly negative";
  if (score > -0.6) return "negative";
  return "very negative";
};

const getEmotionalHealthLabel = (score) => {
  if (score > 80) return "Excellent";
  if (score > 60) return "Good";
  if (score > 40) return "Fair";
  if (score > 20) return "Needs Work";
  return "Concerning";
};

const calculateTotalDays = (messages) => {
  if (messages.length < 2) return 1;

  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0);
    const timeB = new Date(b.timestamp || b.createdAt || 0);
    return timeA - timeB;
  });

  const firstDate = new Date(
    sortedMessages[0].timestamp || sortedMessages[0].createdAt
  );
  const lastDate = new Date(
    sortedMessages[sortedMessages.length - 1].timestamp ||
      sortedMessages[sortedMessages.length - 1].createdAt
  );

  return Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
};

const calculateFrequency = (sortedMessages) => {
  const totalDays = calculateTotalDays(sortedMessages);
  const messagesPerDay = sortedMessages.length / totalDays;

  if (messagesPerDay >= 5) return "Daily";
  if (messagesPerDay >= 1) return "Several times a week";
  if (messagesPerDay >= 0.25) return "Weekly";
  if (messagesPerDay >= 0.1) return "Every few weeks";
  return "Monthly or less";
};

const formatGapDuration = (days) => {
  if (days < 1) return "Less than a day";
  if (days < 7) return `${Math.round(days)} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};

const determineCommunicationStyle = (
  userCount,
  contactCount,
  userAvgMinutes,
  contactAvgMinutes
) => {
  const responseRatio = userCount / (contactCount || 1);
  const timeRatio = userAvgMinutes / (contactAvgMinutes || 1);

  if (responseRatio > 2) return "You initiate more conversations";
  if (responseRatio < 0.5) return "They initiate more conversations";
  if (timeRatio < 0.5) return "You respond much faster";
  if (timeRatio > 2) return "They respond much faster";
  return "Balanced communication pattern";
};

const calculateTopicDiversity = (topicCounts) => {
  const values = Object.values(topicCounts);
  const total = values.reduce((sum, count) => sum + count, 0);

  if (total === 0) return 0;

  let entropy = 0;
  values.forEach((count) => {
    if (count > 0) {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    }
  });

  const maxEntropy = Math.log2(values.length);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
};

// Basic functions for fallback when not enough data
const getBasicMetrics = (relationshipType) => {
  return {
    messageCount: 0,
    sentimentScore: 50,
    sentimentLabel: "neutral",
  };
};

const getBasicInsights = (relationshipType, contactName) => {
  return [
    `Your relationship with ${contactName} is ready for analysis.`,
    "Import more chat history to unlock detailed insights.",
    "The more conversations you add, the better the analysis becomes.",
  ];
};

const getBasicRecommendations = (relationshipType) => {
  return [
    "Import your chat history to get personalized recommendations.",
    "Regular communication helps build stronger relationships.",
    "Be authentic and consistent in your interactions.",
  ];
};

const detectBasicRedFlags = (relationshipType, metrics) => {
  return []; // Return empty array for basic case
};

// Enhanced AI Insights Generation
const generateEnhancedAIInsights = async (
  relationshipType,
  contactName,
  messages,
  memories,
  metrics
) => {
  try {
    const normalizedType = normalizeRelationshipType(relationshipType);
    const messageSample = sampleMessages(messages, 50);

    const messageText = messageSample
      .map((msg) => {
        const role = msg.role === "user" ? contactName : "You";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    const metricsText = JSON.stringify(metrics, null, 2);

    const prompt = `You are an expert relationship analyst with access to advanced communication metrics. Analyze this ${normalizedType} relationship between the user and ${contactName}.

RELATIONSHIP TYPE: ${normalizedType}
CONTACT: ${contactName}

CONVERSATION SAMPLE:
${messageText}

CALCULATED METRICS:
${metricsText}

Based on this comprehensive data, provide:
1. 5 key insights about this relationship (focus on specific patterns and behaviors)
2. 3 personalized recommendations for improvement
3. 2 potential red flags or concerns (if any exist)

Focus on:
${getEnhancedPromptForType(normalizedType)}

Your response must be in valid JSON format:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "redFlags": ["red flag 1", "red flag 2"] or []
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for better analysis
      messages: [
        {
          role: "system",
          content:
            "You are a professional relationship analyst who provides evidence-based insights. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsedResponse = JSON.parse(content);

    return {
      insights: parsedResponse.insights || [],
      recommendations: parsedResponse.recommendations || [],
      redFlags: parsedResponse.redFlags || [],
    };
  } catch (error) {
    console.error("Error generating enhanced AI insights:", error);
    return {
      insights: getBasicInsights(relationshipType, contactName),
      recommendations: getBasicRecommendations(relationshipType),
      redFlags: [],
    };
  }
};

const getEnhancedPromptForType = (type) => {
  const prompts = {
    romantic:
      "- Emotional intimacy and vulnerability patterns\n- Conflict resolution effectiveness\n- Attachment security indicators\n- Balance of affection vs practical communication\n- Signs of relationship health or concerning patterns",
    friendship:
      "- Communication effort balance and reciprocity\n- Emotional depth vs surface-level interactions\n- Consistency and reliability patterns\n- Support exchange dynamics\n- Signs of friendship drift or strengthening",
    professional:
      "- Power dynamics and hierarchical communication\n- Professional boundary maintenance\n- Task efficiency vs relationship building\n- Feedback and recognition patterns\n- Collaboration effectiveness",
    family:
      "- Generational communication differences\n- Emotional expression and family roles\n- Tradition vs independence tensions\n- Support and care patterns\n- Family dynamic health indicators",
    mentor:
      "- Guidance delivery and reception effectiveness\n- Growth orientation and goal achievement\n- Knowledge transfer success\n- Feedback balance and motivation\n- Mentorship relationship development",
  };

  return (
    prompts[type] ||
    "- Overall communication effectiveness\n- Relationship satisfaction indicators\n- Areas for improvement\n- Potential concerns or red flags"
  );
};

// Sample Messages for AI Analysis
const sampleMessages = (messages, targetCount) => {
  if (messages.length <= targetCount) {
    return messages;
  }

  const keepCount = Math.floor(targetCount * 0.3);
  const first = messages.slice(0, keepCount);
  const last = messages.slice(-keepCount);
  const middle = messages.slice(keepCount, -keepCount);
  const middleCount = targetCount - 2 * keepCount;
  const step = Math.floor(middle.length / middleCount);
  const sampled = [];

  for (let i = 0; i < middleCount; i++) {
    sampled.push(middle[i * step]);
  }

  return [...first, ...sampled, ...last].sort((a, b) => {
    const timeA = a.timestamp || a.createdAt || 0;
    const timeB = b.timestamp || b.createdAt || 0;
    return new Date(timeA) - new Date(timeB);
  });
};

module.exports = exports;
