/**
 * Conversation Analyzer Service
 * Processes imported conversations to extract insights and relationship metrics
 */
const Conversation = require("../models/Conversation");
const Relationship = require("../models/Relationship");
const MemoryNode = require("../models/MemoryNode");
const Message = require("../models/Message");
const { analyzeSentiment } = require("./chatParserService");
const OpenAI = require("openai");
const config = require("../config");
require("dotenv").config(); // Ensure dotenv is loaded

// Keywords that indicate different topics
const TOPIC_KEYWORDS = {
  conflict: [
    "argue",
    "sorry",
    "misunderstand",
    "wrong",
    "upset",
    "angry",
    "disagree",
  ],
  support: [
    "help",
    "support",
    "there for you",
    "listen",
    "understand",
    "appreciate",
  ],
  humor: ["lol", "haha", "😂", "funny", "joke", "laugh"],
  planning: ["plan", "schedule", "tomorrow", "weekend", "meet", "time"],
  emotion: ["feel", "love", "miss", "happy", "sad", "worried", "care"],
  routine: ["always", "usually", "often", "every day", "habit"],
};

// Broader topic categories for topic distribution
const TOPIC_CATEGORIES = {
  Work: [
    "work",
    "job",
    "office",
    "meeting",
    "project",
    "boss",
    "client",
    "deadline",
    "email",
    "company",
    "business",
  ],
  Family: [
    "family",
    "kids",
    "parents",
    "mom",
    "dad",
    "sister",
    "brother",
    "child",
    "baby",
    "spouse",
    "wife",
    "husband",
  ],
  Health: [
    "doctor",
    "sick",
    "health",
    "exercise",
    "gym",
    "workout",
    "diet",
    "medication",
    "therapy",
    "sleep",
    "symptoms",
  ],
  Social: [
    "party",
    "dinner",
    "lunch",
    "drinks",
    "hangout",
    "meet up",
    "event",
    "friend",
    "dating",
    "restaurant",
    "bar",
  ],
  Travel: [
    "trip",
    "vacation",
    "travel",
    "flight",
    "hotel",
    "visit",
    "tour",
    "beach",
    "destination",
    "ticket",
    "passport",
  ],
  Plans: [
    "plan",
    "schedule",
    "next week",
    "weekend",
    "tomorrow",
    "tonight",
    "future",
    "calendar",
    "date",
    "event",
  ],
  Emotions: [
    "feel",
    "happy",
    "sad",
    "angry",
    "excited",
    "worried",
    "stress",
    "love",
    "anxiety",
    "hope",
    "depression",
  ],
  Hobbies: [
    "hobby",
    "game",
    "music",
    "movie",
    "book",
    "reading",
    "play",
    "sports",
    "art",
    "cooking",
    "gardening",
  ],
  Financial: [
    "money",
    "bill",
    "payment",
    "budget",
    "purchase",
    "buy",
    "expense",
    "loan",
    "investment",
    "savings",
  ],
  Education: [
    "school",
    "study",
    "class",
    "learning",
    "course",
    "university",
    "college",
    "degree",
    "test",
    "exam",
  ],
};

// Telugu-specific keywords that might appear in mixed language conversations
const TELUGU_KEYWORDS = {
  Greetings: ["namaskaram", "ela unnaru", "bagunava", "emi chesthunnav"],
  Family: ["amma", "nanna", "akka", "anna", "tammudu", "chelli"],
  Endearment: ["bangaram", "praanam", "prema", "kantri"],
  Food: ["annam", "pappu", "kura", "ruchi", "tinu", "bhojnam"],
  Time: ["repu", "ippudu", "ratri", "udayam", "sayantram"],
};

// Sentiment related utilities
const getSentimentLabel = (score) => {
  if (score > 0.5) return "very positive";
  if (score > 0.1) return "positive";
  if (score > -0.1) return "neutral";
  if (score > -0.5) return "negative";
  return "very negative";
};

const calculateSegmentSentiment = (segment) => {
  const sentiments = segment.map((msg) => analyzeSentiment(msg.content));
  const sum = sentiments.reduce((total, val) => total + val, 0);
  const avg = sum / sentiments.length;
  return {
    score: avg,
    label: getSentimentLabel(avg),
    magnitude: Math.abs(avg),
  };
};

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey,
});
if (!process.env.OPENAI_API_KEY && !config.openaiApiKey) {
  console.error("ERROR: OpenAI API key is not configured. Analysis will fail.");
}

/**
 * Analyze conversation to extract relationship insights with special handling for mixed languages
 */
const analyzeImportedConversation = async (conversationId) => {
  try {
    console.log(`Starting analysis for conversation: ${conversationId}`);

    const conversation = await Conversation.findById(conversationId)
      .populate("relationship")
      .exec();

    if (!conversation) {
      console.error(`Conversation ${conversationId} not found`);
      return null;
    }

    const messages = conversation.messages;
    if (!messages || messages.length === 0) {
      throw new Error("No messages found in conversation");
    }

    const relationship = conversation.relationship;
    if (!relationship) {
      console.error(
        `Relationship not found for conversation ${conversationId}`
      );
      return null;
    }

    const contactName = relationship.contactName || "Contact";
    console.log(
      `Analyzing ${messages.length} messages for relationship with ${contactName}`
    );

    // Prepare message text for OpenAI analysis
    const messageText = messages
      .map((msg) => {
        const sender = msg.role === "user" ? contactName : "You";
        return `${sender}: ${msg.content || ""}`;
      })
      .join("\n");

    // ENHANCED GAMIFIED PROMPT with better scoring algorithms
    const analysisPrompt = `
      You are an expert relationship analyst with deep understanding of Indian culture and mixed language conversations. 
    Analyze this imported conversation between the user and ${contactName}.

    This conversation may contain Telugu words/phrases mixed with English (code-switching), which is common in Indian conversations. 
    Pay special attention to:
    - Cultural context and relationship dynamics specific to Indian relationships
    - Emotional expressions that might be culturally specific
    - The way Telugu phrases are used to express sentiment that might not be captured in English
    - Honorifics, terms of endearment, and relationship indicators in both languages
    - Contextual meaning behind the mixing of languages (when Telugu is used vs. when English is used)

    CONVERSATION:
    ${messageText}

    Based on the conversation above, provide a detailed analysis in JSON format with the following GAMIFIED elements:

    CONNECTION SCORE CALCULATION (1-100):
    Calculate based on these factors:
    - Base score: 50 points
    - Positive sentiment (+0.3 to +1.0): +15 to +25 points
    - Message frequency and consistency: +5 to +15 points
    - Emotional support shown (keywords: help, support, care, understand): +5 to +15 points
    - Deep conversation indicators (keywords: feel, think, believe, important, personal): +5 to +10 points
    - Shared interests/activities mentioned: +5 to +10 points
    - Cultural connection/code-switching usage: +2 to +8 points
    - Humor and emoji usage: +2 to +5 points
    - Question asking frequency (shows interest): +2 to +5 points
    - Conflict resolution (handling disagreements well): +3 to +8 points
    - Planning future activities together: +3 to +7 points
    - Subtract points for: Negative sentiment (-5 to -15), One-sided conversations (-5 to -10), Conflict without resolution (-8 to -15)
    - Final score must be between 10-100

    RELATIONSHIP LEVEL CALCULATION (1-10):
    Base calculation on connection score and conversation depth:
    - Level 1-2: Basic acquaintance (score 10-35, few messages, formal tone, surface topics)
    - Level 3-4: Growing friendship (score 36-55, regular chat, some personal topics, occasional emoji)
    - Level 5-6: Close friendship (score 56-75, frequent communication, emotional support, shared experiences)
    - Level 7-8: Very close relationship (score 76-90, deep conversations, cultural comfort, future planning)
    - Level 9-10: Intimate relationship (score 91-100, constant communication, high emotional investment, life integration)

    CHALLENGE BADGES (award based on actual conversation patterns detected):
    Award badges only if evidence exists in conversation:
    - "Communication Catalyst": Frequently initiates conversations (check message timestamps and starters)
    - "Emotional Support Champion": Shows consistent empathy and support (check supportive language)
    - "Cultural Bridge Builder": Uses both languages effectively and naturally
    - "Deep Conversation Master": Engages in meaningful discussions about feelings, beliefs, future
    - "Consistent Connector": Regular communication pattern over time
    - "Conflict Resolution Expert": Handles disagreements constructively
    - "Humor Ambassador": Uses humor, jokes, memes to strengthen bonds
    - "Memory Keeper": References past conversations, events, shared experiences
    - "Future Planner": Makes plans, follows through, discusses future together
    - "Active Listener": Asks follow-up questions, shows genuine interest in responses
    - "Trust Builder": Shares personal information, vulnerable moments
    - "Celebration Partner": Acknowledges achievements, milestones, special occasions
    - "Problem Solver": Offers practical help and solutions
    - "Routine Builder": Establishes communication habits and patterns

    NEXT MILESTONE GENERATION:
    Create specific, achievable milestones based on current relationship level:
    - Levels 1-3: Focus on consistency and engagement
    - Levels 4-6: Focus on depth and trust building  
    - Levels 7-8: Focus on life integration and future planning
    - Levels 9-10: Focus on maintaining intimacy and growth

    Examples:
    "Trust Builder: Share 3 personal experiences to deepen connection"
    "Consistency Champion: Maintain daily meaningful exchanges for two weeks"
    "Cultural Explorer: Discuss family traditions and values together"
    "Future Visionary: Make concrete plans for shared experiences"
    "Emotional Anchor: Be there for each other during 2 challenging moments"

    1. keyInsights: List 3-5 most important insights about this relationship based on the conversation.
    2. emotionalDynamics: Analyze the emotional patterns and connection between these two people.
    3. areasForGrowth: Identify 2-3 areas where the relationship could grow or improve.
    4. topTopics: Identify the 3-5 main topics discussed (as array of objects with 'name' and 'percentage' properties).
    5. overallTone: The general emotional tone (positive, negative, neutral, or mixed).
    6. communicationStyle: Communication style details for both user and contact
    7. loveLanguage: Detected love language preferences based on conversation patterns
    8. values: Values important to the contact inferred from conversation
    9. interests: The contact's interests based on topics discussed
    10. communicationPreferences: How the contact prefers to communicate
    11. importantDates: Any mentioned important dates, events, or milestones
    12. connectionScore: A numeric score from 1-100 calculated using the formula above
    13. trustLevel: A numeric score from 1-10 based on personal sharing and vulnerability
    14. theirValues: Contact's values inferred from conversation
    15. theirInterests: Contact's interests inferred from conversation
    16. howWeMet: Information about how they met if mentioned
    17. events: Array of key events mentioned in the conversation
    18. messageCount: Total number of messages analyzed
    19. culturalContext: Brief notes on any culturally specific elements observed in the conversation
    20. communicationStyle: An object with "user" and "contact" properties describing communication patterns
    21. relationshipLevel: A gamified level from 1-10 calculated using the formula above
    22. challengesBadges: Array of "challenge badges" earned based on actual conversation evidence
    23. nextMilestone: Specific, achievable next milestone based on current relationship level

    IMPORTANT SCORING GUIDELINES:
    - Be realistic with scores - not every relationship should get 85+
    - Base scores on actual conversation evidence, not assumptions
    - Consider message count, depth, sentiment, and patterns
    - Award badges only when clear evidence exists
    - Make milestones specific and actionable
    - Account for cultural context in scoring

    Respond ONLY with valid JSON. Format exactly like this:
    {
      "keyInsights": ["insight 1", "insight 2", "insight 3"],
      "emotionalDynamics": "analysis of emotions and dynamics",
      "areasForGrowth": ["area 1", "area 2", "area 3"],
      "topTopics": [
        {"name": "Topic 1", "percentage": 40},
        {"name": "Topic 2", "percentage": 30},
        {"name": "Topic 3", "percentage": 30}
      ],
      "overallTone": "positive",
      "communicationStyle": {
        "user": "supportive",
        "contact": "expressive"
      },
      "loveLanguage": "Words of Affirmation",
      "values": ["family", "education", "tradition"],
      "interests": ["technology", "cooking", "travel"],
      "communicationPreferences": "Prefers direct communication with quick responses",
      "importantDates": ["Birthday: June 15", "Anniversary: August 22"],
      "connectionScore": 78,
      "trustLevel": 7,
      "theirValues": ["loyalty", "honesty", "family"],
      "theirInterests": ["movies", "music", "outdoors"],
      "howWeMet": "Met through mutual friends at a college event",
      "events": ["First met in 2019", "Started working together in 2020"],
      "messageCount": 523,
      "culturalContext": "Mixed Telugu-English usage shows comfortable cultural identity sharing",
      "relationshipLevel": 6,
      "challengesBadges": ["Deep Conversation Master", "Cultural Bridge Builder", "Consistent Connector"],
      "nextMilestone": "Trust Builder: Share personal challenges and offer mutual support during difficult times"
    }
          `;

    console.log("Sending conversation for OpenAI analysis...");

    try {
      // Call OpenAI API for analysis
      const response = await openai.chat.completions.create({
        model: config.AI_MODEL || "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert relationship analyst specializing in gamified relationship metrics. Provide accurate, data-driven scores based on conversation analysis. Be culturally sensitive and consider mixed-language patterns common in Indian conversations.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent scoring
        max_tokens: 4000,
      });

      console.log("Received analysis from OpenAI");

      // Parse the OpenAI response
      let analysisResult = parseOpenAIResponse(response);
      analysisResult = validateAndFixAnalysisResult(
        analysisResult,
        messages.length
      );

      // Calculate additional metrics based on conversation data
      const conversationMetrics = calculateConversationMetrics(
        messages,
        contactName
      );

      // Enhance analysis with calculated metrics
      analysisResult = enhanceAnalysisWithMetrics(
        analysisResult,
        conversationMetrics
      );

      // Store analysis results
      await storeAnalysisResults(
        conversation,
        relationship,
        analysisResult,
        conversationMetrics
      );

      console.log(
        `Analysis for conversation ${conversationId} completed and saved`
      );
      console.log("Final analysis scores:", {
        connectionScore: analysisResult.connectionScore,
        relationshipLevel: analysisResult.relationshipLevel,
        challengesBadges: analysisResult.challengesBadges?.length || 0,
      });

      return analysisResult;
    } catch (openaiError) {
      console.error("Error calling OpenAI API:", openaiError);

      // Create enhanced fallback analysis with proper scoring
      const fallbackAnalysis = createEnhancedFallbackAnalysis(
        messages,
        contactName
      );

      await storeAnalysisResults(
        conversation,
        relationship,
        fallbackAnalysis,
        null
      );

      return fallbackAnalysis;
    }
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    return null;
  }
};

/**
 * Calculate conversation metrics for enhanced scoring
 */
const calculateConversationMetrics = (messages, contactName) => {
  let sentimentTotal = 0;
  let messageCount = 0;
  let userMessageCount = 0;
  let contactMessageCount = 0;
  let questionCount = 0;
  let emojiCount = 0;
  let responseTimeTotal = 0;
  let responseTimeCount = 0;
  let lastTimestamp = null;
  let lastSender = null;

  // Conversation quality indicators
  let deepConversationIndicators = 0;
  let supportiveMessages = 0;
  let conflictMessages = 0;
  let humorMessages = 0;
  let planningMessages = 0;

  const qualityKeywords = {
    deep: [
      "feel",
      "think",
      "believe",
      "important",
      "matter",
      "serious",
      "personal",
    ],
    supportive: [
      "help",
      "support",
      "there for you",
      "understand",
      "care",
      "sorry",
    ],
    conflict: ["disagree", "upset", "angry", "argue", "wrong", "fight"],
    humor: ["lol", "haha", "😂", "funny", "joke", "laugh"],
    planning: [
      "plan",
      "let's",
      "we should",
      "tomorrow",
      "next",
      "meet",
      "together",
    ],
  };

  for (const message of messages) {
    const isUserMessage = message.role === "ai"; // In import context
    const content = message.content || "";
    const timestamp = message.timestamp
      ? new Date(message.timestamp)
      : new Date();

    // Basic counts
    if (isUserMessage) {
      userMessageCount++;
    } else {
      contactMessageCount++;
    }

    // Sentiment analysis
    const sentiment = analyzeSentiment(content);
    sentimentTotal += sentiment;
    messageCount++;

    // Quality indicators
    const lowerContent = content.toLowerCase();

    if (
      qualityKeywords.deep.some((keyword) => lowerContent.includes(keyword))
    ) {
      deepConversationIndicators++;
    }
    if (
      qualityKeywords.supportive.some((keyword) =>
        lowerContent.includes(keyword)
      )
    ) {
      supportiveMessages++;
    }
    if (
      qualityKeywords.conflict.some((keyword) => lowerContent.includes(keyword))
    ) {
      conflictMessages++;
    }
    if (
      qualityKeywords.humor.some((keyword) => lowerContent.includes(keyword))
    ) {
      humorMessages++;
    }
    if (
      qualityKeywords.planning.some((keyword) => lowerContent.includes(keyword))
    ) {
      planningMessages++;
    }

    // Question count
    if (content.includes("?")) {
      questionCount++;
    }

    // Emoji count
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojis = content.match(emojiRegex);
    if (emojis) {
      emojiCount += emojis.length;
    }

    // Response time calculation
    if (lastTimestamp && lastSender !== (isUserMessage ? "user" : "contact")) {
      const responseTime = timestamp - lastTimestamp;
      if (responseTime > 0 && responseTime < 86400000) {
        // Less than 24 hours
        responseTimeTotal += responseTime;
        responseTimeCount++;
      }
    }

    lastTimestamp = timestamp;
    lastSender = isUserMessage ? "user" : "contact";
  }

  return {
    messageCount,
    averageSentiment: sentimentTotal / (messageCount || 1),
    communicationBalance: userMessageCount / (contactMessageCount || 1),
    questionFrequency: questionCount / (messageCount || 1),
    emojiUsage: emojiCount / (messageCount || 1),
    averageResponseTime:
      responseTimeCount > 0 ? responseTimeTotal / responseTimeCount : 0,
    qualityScores: {
      deepConversations: deepConversationIndicators / (messageCount || 1),
      supportiveness: supportiveMessages / (messageCount || 1),
      conflictLevel: conflictMessages / (messageCount || 1),
      humorLevel: humorMessages / (messageCount || 1),
      planningLevel: planningMessages / (messageCount || 1),
    },
  };
};

/**
 * Enhance analysis with calculated metrics
 */

const enhanceAnalysisWithMetrics = (analysisResult, metrics) => {
  if (!metrics) return analysisResult;

  // Enhance connection score based on metrics
  let connectionScore = analysisResult.connectionScore || 50;

  // Adjust based on sentiment
  if (metrics.averageSentiment > 0.3) connectionScore += 10;
  else if (metrics.averageSentiment < -0.3) connectionScore -= 15;

  // Adjust based on message volume
  if (metrics.messageCount > 100) connectionScore += 10;
  else if (metrics.messageCount > 50) connectionScore += 5;

  // Adjust based on quality indicators
  if (metrics.qualityScores.deepConversations > 0.1) connectionScore += 8;
  if (metrics.qualityScores.supportiveness > 0.05) connectionScore += 7;
  if (metrics.qualityScores.humorLevel > 0.05) connectionScore += 5;
  if (metrics.qualityScores.conflictLevel > 0.1) connectionScore -= 10;

  // Ensure score stays within bounds
  connectionScore = Math.max(10, Math.min(100, Math.round(connectionScore)));

  // Enhance relationship level based on metrics and connection score
  let relationshipLevel = analysisResult.relationshipLevel || 1;

  if (connectionScore >= 90) relationshipLevel = Math.max(relationshipLevel, 9);
  else if (connectionScore >= 80)
    relationshipLevel = Math.max(relationshipLevel, 7);
  else if (connectionScore >= 70)
    relationshipLevel = Math.max(relationshipLevel, 6);
  else if (connectionScore >= 60)
    relationshipLevel = Math.max(relationshipLevel, 4);
  else if (connectionScore >= 50)
    relationshipLevel = Math.max(relationshipLevel, 3);

  // Enhance badges based on metrics
  let badges = [...(analysisResult.challengesBadges || [])];

  if (
    metrics.qualityScores.deepConversations > 0.15 &&
    !badges.includes("Deep Conversation Master")
  ) {
    badges.push("Deep Conversation Master");
  }
  if (
    metrics.qualityScores.supportiveness > 0.1 &&
    !badges.includes("Emotional Support Champion")
  ) {
    badges.push("Emotional Support Champion");
  }
  if (metrics.messageCount > 100 && !badges.includes("Consistent Connector")) {
    badges.push("Consistent Connector");
  }
  if (
    metrics.qualityScores.humorLevel > 0.08 &&
    !badges.includes("Humor Ambassador")
  ) {
    badges.push("Humor Ambassador");
  }
  if (metrics.questionFrequency > 0.2 && !badges.includes("Active Listener")) {
    badges.push("Active Listener");
  }

  return {
    ...analysisResult,
    connectionScore,
    relationshipLevel,
    challengesBadges: badges,
  };
};

/**
 * Store analysis results in database
 */
const storeAnalysisResults = async (
  conversation,
  relationship,
  analysisResult,
  metrics
) => {
  try {
    // Update conversation with analysis
    conversation.summary = analysisResult;
    conversation.status = "analyzed";
    await conversation.save();

    // FIXED: Validate and sanitize all metrics before saving
    const sanitizedMetrics = {
      sentimentScore: Math.max(
        -1,
        Math.min(
          1,
          analysisResult.sentimentScore || metrics?.averageSentiment || 0
        )
      ),
      // FIXED: Ensure depthScore is within 1-5 range
      depthScore: Math.max(
        1,
        Math.min(5, Math.floor((analysisResult.trustLevel || 5) / 2) + 1)
      ),
      reciprocityRatio: Math.max(
        0,
        Math.min(1, metrics?.communicationBalance || 0.5)
      ),
      // FIXED: Convert numeric volatility to enum string
      emotionalVolatility: convertVolatilityToEnum(
        metrics?.qualityScores?.conflictLevel || 0.1
      ),
    };

    // Update relationship insights with sanitized data
    if (!relationship.insights) {
      relationship.insights = {};
    }

    Object.assign(relationship.insights, {
      sentimentScore: sanitizedMetrics.sentimentScore,
      sentimentLabel:
        analysisResult.overallTone ||
        getSentimentLabel(sanitizedMetrics.sentimentScore),
      messageCount: metrics?.messageCount || conversation.messages.length,
      communicationBalance: determineBalanceLabel(
        metrics?.communicationBalance || 1
      ),
      primaryTopics: analysisResult.topTopics?.map((t) => t.name) || [],
      ...metrics,
    });

    // FIXED: Store gamification data with validation
    if (!relationship.gamification) {
      relationship.gamification = {};
    }

    // Ensure connection score is within bounds
    const connectionScore = Math.max(
      10,
      Math.min(100, analysisResult.connectionScore || 75)
    );
    const relationshipLevel = Math.max(
      1,
      Math.min(10, analysisResult.relationshipLevel || 3)
    );

    relationship.gamification = {
      connectionScore,
      relationshipLevel,
      challengesBadges: Array.isArray(analysisResult.challengesBadges)
        ? analysisResult.challengesBadges
        : [],
      nextMilestone:
        analysisResult.nextMilestone ||
        "Continue building connection through regular communication",
      communicationStyle: analysisResult.communicationStyle || {
        user: "balanced",
        contact: "responsive",
      },
      lastUpdated: new Date(),
    };

    // Store additional relationship data with validation
    if (
      analysisResult.loveLanguage &&
      typeof analysisResult.loveLanguage === "string"
    ) {
      relationship.loveLanguage = analysisResult.loveLanguage;
    }

    if (Array.isArray(analysisResult.theirValues)) {
      relationship.theirValues = analysisResult.theirValues;
    }

    if (Array.isArray(analysisResult.theirInterests)) {
      relationship.theirInterests = analysisResult.theirInterests;
    }

    if (analysisResult.communicationPreferences) {
      relationship.theirCommunicationPreferences =
        analysisResult.communicationPreferences;
    }

    if (Array.isArray(analysisResult.importantDates)) {
      relationship.importantDates = analysisResult.importantDates;
    }

    // Update topic distribution with validation
    if (
      analysisResult.topTopics &&
      Array.isArray(analysisResult.topTopics) &&
      analysisResult.topTopics.length > 0
    ) {
      // Ensure percentages are valid numbers
      const validTopics = analysisResult.topTopics
        .filter(
          (topic) =>
            topic.name &&
            typeof topic.percentage === "number" &&
            topic.percentage > 0
        )
        .map((topic) => ({
          name: topic.name,
          percentage: Math.max(0, Math.min(100, topic.percentage)),
        }));

      if (validTopics.length > 0) {
        relationship.topicDistribution = validTopics;
      }
    }

    // FIXED: Update metrics using the model's updateMetrics method for proper validation
    await relationship.updateMetrics(sanitizedMetrics);

    console.log("Analysis results stored successfully with validation");
  } catch (error) {
    console.error("Error storing analysis results:", error);
    // Don't throw - allow the process to continue even if storage partially fails
  }
};

const convertVolatilityToEnum = (conflictLevel) => {
  if (
    typeof conflictLevel === "string" &&
    ["Stable", "Swingy", "Erratic"].includes(conflictLevel)
  ) {
    return conflictLevel;
  }

  const numericLevel = typeof conflictLevel === "number" ? conflictLevel : 0.1;

  if (numericLevel <= 0.2) {
    return "Stable";
  } else if (numericLevel <= 0.5) {
    return "Swingy";
  } else {
    return "Erratic";
  }
};

/**
 * Create enhanced fallback analysis with proper scoring
 */
const createEnhancedFallbackAnalysis = (messages, contactName) => {
  const metrics = calculateConversationMetrics(messages, contactName);

  // Calculate fallback connection score
  let connectionScore = 50; // Base score
  if (metrics.averageSentiment > 0.2) connectionScore += 20;
  if (metrics.messageCount > 50) connectionScore += 15;
  if (metrics.qualityScores.supportiveness > 0.05) connectionScore += 10;
  connectionScore = Math.max(20, Math.min(95, connectionScore));

  // Calculate fallback relationship level
  let relationshipLevel = Math.min(
    8,
    Math.max(2, Math.floor(connectionScore / 12))
  );

  // Generate fallback badges
  const badges = ["Regular Communicator"];
  if (metrics.qualityScores.deepConversations > 0.1)
    badges.push("Deep Conversation Master");
  if (metrics.qualityScores.supportiveness > 0.08)
    badges.push("Emotional Support Champion");
  if (metrics.messageCount > 100) badges.push("Consistent Connector");

  return {
    keyInsights: [
      "This conversation shows meaningful exchanges between you and " +
        contactName,
      "Regular communication patterns indicate a developing relationship",
      metrics.averageSentiment > 0.1
        ? "Generally positive tone throughout conversations"
        : "Balanced emotional exchanges",
      "There's evidence of mutual engagement and interest",
    ],
    emotionalDynamics: `The emotional patterns suggest a ${
      metrics.averageSentiment > 0.2
        ? "positive and supportive"
        : metrics.averageSentiment < -0.2
          ? "challenging but communicative"
          : "balanced and stable"
    } relationship dynamic.`,
    areasForGrowth: [
      "Consider more frequent emotional check-ins to deepen connection",
      "Explore shared interests and activities to strengthen bonds",
      metrics.qualityScores.conflictLevel > 0.1
        ? "Work on conflict resolution skills for better understanding"
        : "Continue building on the positive communication patterns",
    ],
    topTopics: [
      { name: "General Discussion", percentage: 45 },
      { name: "Personal Updates", percentage: 30 },
      { name: "Plans & Activities", percentage: 25 },
    ],
    overallTone:
      metrics.averageSentiment > 0.1
        ? "positive"
        : metrics.averageSentiment < -0.1
          ? "mixed"
          : "neutral",
    communicationStyle: {
      user:
        metrics.communicationBalance > 1.5
          ? "expressive"
          : metrics.communicationBalance < 0.7
            ? "reserved"
            : "balanced",
      contact:
        metrics.communicationBalance < 0.7
          ? "expressive"
          : metrics.communicationBalance > 1.5
            ? "reserved"
            : "responsive",
    },
    connectionScore: connectionScore,
    relationshipLevel: relationshipLevel,
    challengesBadges: badges,
    nextMilestone:
      connectionScore < 60
        ? "Connection Builder: Have 5 meaningful conversations this week"
        : connectionScore < 80
          ? "Trust Deepener: Share 3 personal experiences to strengthen bond"
          : "Relationship Sustainer: Maintain consistent quality communication",
    loveLanguage:
      metrics.qualityScores.supportiveness > 0.1
        ? "Words of Affirmation"
        : "Quality Time",
    trustLevel: Math.min(10, Math.max(5, Math.floor(connectionScore / 10))),
    theirValues: ["communication", "understanding", "connection"],
    theirInterests: ["conversation", "relationship building"],
    communicationPreferences: `Prefers ${
      metrics.averageResponseTime < 3600000
        ? "quick responses"
        : "thoughtful communication"
    } with ${
      metrics.emojiUsage > 0.1 ? "emotional expressiveness" : "direct messaging"
    }`,
    importantDates: [],
    culturalContext:
      "Standard conversation patterns with good mutual engagement",
  };
};

/**
 * Helper function to determine communication balance label
 */
const determineBalanceLabel = (ratio) => {
  if (ratio > 1.3) return "User leads conversations";
  if (ratio < 0.7) return "Contact leads conversations";
  return "Balanced communication";
};

/**
 * Parse the OpenAI response with improved error handling
 */
const parseOpenAIResponse = (response) => {
  try {
    const content = response.choices[0].message.content.trim();

    // Try to extract JSON if it's wrapped in markdown code blocks
    let jsonContent = content;

    // Handle case where API returns markdown-formatted JSON
    if (content.includes("```json")) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1].trim();
      }
    } else if (content.includes("```")) {
      // Try to extract from generic code block
      const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch && codeMatch[1]) {
        jsonContent = codeMatch[1].trim();
      }
    }

    // Attempt to parse the JSON
    return JSON.parse(jsonContent);
  } catch (parseError) {
    console.error("Error parsing OpenAI response:", parseError);
    return createFallbackAnalysis();
  }
};

/**
 * Validate and fix the analysis result, ensuring all required fields exist
 */
const validateAndFixAnalysisResult = (analysisResult, messageCount) => {
  if (!analysisResult || typeof analysisResult !== "object") {
    return createEnhancedFallbackAnalysis([], "Contact");
  }

  // FIXED: Ensure connection score is realistic and within bounds
  if (
    !analysisResult.connectionScore ||
    typeof analysisResult.connectionScore !== "number"
  ) {
    analysisResult.connectionScore = Math.min(
      85,
      Math.max(40, 50 + Math.floor(messageCount / 20))
    );
  } else {
    analysisResult.connectionScore = Math.max(
      10,
      Math.min(100, analysisResult.connectionScore)
    );
  }

  // FIXED: Ensure relationship level correlates with connection score and is within bounds
  if (
    !analysisResult.relationshipLevel ||
    typeof analysisResult.relationshipLevel !== "number"
  ) {
    analysisResult.relationshipLevel = Math.min(
      10,
      Math.max(1, Math.floor(analysisResult.connectionScore / 12))
    );
  } else {
    analysisResult.relationshipLevel = Math.max(
      1,
      Math.min(10, analysisResult.relationshipLevel)
    );
  }

  // FIXED: Ensure trust level is within bounds
  if (
    !analysisResult.trustLevel ||
    typeof analysisResult.trustLevel !== "number"
  ) {
    analysisResult.trustLevel = Math.min(
      10,
      Math.max(5, Math.floor(analysisResult.connectionScore / 11))
    );
  } else {
    analysisResult.trustLevel = Math.max(
      1,
      Math.min(10, analysisResult.trustLevel)
    );
  }

  // Ensure badges exist and are relevant
  if (!Array.isArray(analysisResult.challengesBadges)) {
    analysisResult.challengesBadges = ["Communication Starter"];
  }

  // Ensure milestone exists
  if (
    !analysisResult.nextMilestone ||
    typeof analysisResult.nextMilestone !== "string"
  ) {
    if (analysisResult.connectionScore < 60) {
      analysisResult.nextMilestone =
        "Connection Builder: Have 5 meaningful conversations";
    } else if (analysisResult.connectionScore < 80) {
      analysisResult.nextMilestone =
        "Trust Deepener: Share personal experiences to strengthen bond";
    } else {
      analysisResult.nextMilestone =
        "Relationship Master: Maintain consistent deep communication";
    }
  }

  // Ensure communication style exists
  if (
    !analysisResult.communicationStyle ||
    typeof analysisResult.communicationStyle !== "object"
  ) {
    analysisResult.communicationStyle = {
      user: "balanced",
      contact: "responsive",
    };
  }

  // Ensure required arrays exist
  const requiredArrays = ["keyInsights", "areasForGrowth", "topTopics"];
  requiredArrays.forEach((field) => {
    if (!Array.isArray(analysisResult[field])) {
      if (field === "topTopics") {
        analysisResult[field] = [
          { name: "General Discussion", percentage: 100 },
        ];
      } else {
        analysisResult[field] = [
          `Analysis provided meaningful insights about ${field}`,
        ];
      }
    }
  });

  return analysisResult;
};

/**
 * Create a fallback analysis with default values
 */
const createFallbackAnalysis = (messages = [], contactName = "Contact") => {
  // Determine a basic sentiment if messages are provided
  let tone = "mixed";
  let connectionScore = 65;

  if (messages.length > 0) {
    let sentimentTotal = 0;
    messages.forEach((msg) => {
      sentimentTotal += analyzeSentiment(msg.content || "");
    });
    const avgSentiment = sentimentTotal / messages.length;

    if (avgSentiment > 0.2) {
      tone = "positive";
      connectionScore = 75;
    } else if (avgSentiment < -0.2) {
      tone = "negative";
      connectionScore = 45;
    }
  }

  return {
    keyInsights: [
      "This conversation appears to contain meaningful exchanges",
      "Regular communication patterns are evident",
      "There's a foundation of mutual respect",
    ],
    emotionalDynamics:
      "The emotional patterns suggest a comfortable, established communication style.",
    areasForGrowth: [
      "More consistent communication might strengthen the connection",
      "Deeper discussions on shared interests could enhance engagement",
      "Setting regular check-in times could improve relationship maintenance",
    ],
    topTopics: [
      { name: "General Discussion", percentage: 50 },
      { name: "Personal Updates", percentage: 30 },
      { name: "Plans", percentage: 20 },
    ],
    overallTone: tone,
    culturalContext:
      "The conversation shows typical communication patterns for close contacts",
    connectionScore: connectionScore,
    communicationStyle: {
      user: "direct",
      contact: "responsive",
    },
    relationshipLevel: 4,
    challengesBadges: ["Conversation Starter", "Regular Communicator"],
    nextMilestone:
      "Consistent Engagement: Maintain regular meaningful exchanges for two weeks",
  };
};

const groupIntoSegments = (messages, threshold = 10800000) => {
  // 3 hours in milliseconds
  const segments = [];
  let currentSegment = [];
  let lastTimestamp = null;
  for (const message of messages) {
    const currentTime = message.timestamp
      ? new Date(message.timestamp)
      : new Date();

    // Start a new segment if this is first message or there's a significant time gap
    if (!lastTimestamp || currentTime - lastTimestamp > threshold) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
      }
      currentSegment = [message];
    } else {
      currentSegment.push(message);
    }

    lastTimestamp = currentTime;
  }

  // Add the last segment if it exists
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
};

/**
 * Determine specific emotion type based on content and sentiment score
 */
const determineEmotion = (content, sentimentScore) => {
  // Force lowercase for better text matching
  const lowerContent = content.toLowerCase();

  // POSITIVE EMOTIONS
  if (sentimentScore > 0.1) {
    // Joy keywords
    if (
      lowerContent.includes("happy") ||
      lowerContent.includes("fun") ||
      lowerContent.includes("enjoy") ||
      lowerContent.includes("laugh") ||
      lowerContent.includes("excited") ||
      lowerContent.includes("party") ||
      lowerContent.includes("celebration") ||
      lowerContent.includes("hobbies")
    ) {
      return "Joy";
    }

    // Love keywords
    if (
      lowerContent.includes("love") ||
      lowerContent.includes("care") ||
      lowerContent.includes("miss you") ||
      lowerContent.includes("affection") ||
      lowerContent.includes("together") ||
      lowerContent.includes("relationship")
    ) {
      return "Love";
    }

    return "Positive"; // Default positive emotion
  }

  // NEGATIVE EMOTIONS
  if (sentimentScore < -0.1) {
    // Sadness keywords
    if (
      lowerContent.includes("sad") ||
      lowerContent.includes("miss") ||
      lowerContent.includes("sorry") ||
      lowerContent.includes("hurt") ||
      lowerContent.includes("lonely") ||
      lowerContent.includes("disappointed")
    ) {
      return "Sadness";
    }

    // Anger keywords
    if (
      lowerContent.includes("angry") ||
      lowerContent.includes("upset") ||
      lowerContent.includes("argument") ||
      lowerContent.includes("conflict") ||
      lowerContent.includes("frustrated") ||
      lowerContent.includes("annoyed")
    ) {
      return "Anger";
    }

    return "Negative"; // Default negative emotion
  }

  // TOPIC-BASED CATEGORIZATION
  // Growth-related topics
  if (
    lowerContent.includes("learning") ||
    lowerContent.includes("education") ||
    lowerContent.includes("health") ||
    lowerContent.includes("exercise") ||
    lowerContent.includes("development") ||
    lowerContent.includes("progress") ||
    lowerContent.includes("future") ||
    lowerContent.includes("goals")
  ) {
    return "Growth";
  }

  // Positive topics even with neutral sentiment
  if (
    lowerContent.includes("hobbies") ||
    lowerContent.includes("travel") ||
    lowerContent.includes("vacation") ||
    lowerContent.includes("celebrate") ||
    lowerContent.includes("recreation") ||
    lowerContent.includes("together")
  ) {
    return "Positive";
  }

  // Default to Neutral for everything else
  return "Neutral";
};

/**
 * Generate basic memory nodes when OpenAI analysis fails
 */
const generateMemoryNodes = async (conversation, relationship) => {
  try {
    const messages = conversation.messages || [];
    if (messages.length === 0) return;

    // Get the user ID from the relationship
    const userId = relationship.user;

    if (!userId) {
      console.error("User ID is missing from relationship");
      return;
    }

    // Find segments with significant emotional content or important topics
    const segments = groupIntoSegments(messages);
    let memoryCount = 0;

    for (const segment of segments) {
      // Only process segments with multiple messages
      if (segment.length < 2) continue;

      // Calculate segment sentiment
      const sentimentData = calculateSegmentSentiment(segment);
      const hasStrongSentiment = Math.abs(sentimentData.score) > 0.4;

      // Create a basic content summary
      const date = new Date(
        segment[0].timestamp || Date.now()
      ).toLocaleDateString();
      let content = `Conversation on ${date}`;

      // Add sentiment information if significant
      if (hasStrongSentiment) {
        content += ` with a ${sentimentData.label} tone`;
      }

      // Extract possible topics
      const possibleTopics = [];
      const segmentText = segment
        .map((m) => m.content || "")
        .join(" ")
        .toLowerCase();

      // Check for topic keywords
      for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
        for (const keyword of keywords) {
          if (segmentText.includes(keyword.toLowerCase())) {
            possibleTopics.push(topic);
            break;
          }
        }
      }

      // Add topic information if found
      if (possibleTopics.length > 0) {
        content += ` about ${possibleTopics.slice(0, 2).join(" and ")}`;
      }

      // Only create memory nodes for significant segments to avoid clutter
      if (hasStrongSentiment || possibleTopics.length > 0) {
        // Create a memory node
        const memoryNode = new MemoryNode({
          user: userId,
          relationship: relationship._id,
          type: "conversation",
          content,
          sentiment: sentimentData.score,
          emotion: determineEmotion(content, sentimentData.score),
          sourceReference: {
            type: "conversation",
            id: conversation._id,
            timestamp: segment[segment.length - 1].timestamp || Date.now(),
          },
          keywords: [...possibleTopics, sentimentData.label],
          created: new Date(),
        });

        await memoryNode.save();
        memoryCount++;

        // Limit to max 5 memory nodes per conversation for fallback
        if (memoryCount >= 5) break;
      }
    }

    console.log(
      `Generated ${memoryCount} basic memory nodes for conversation ${conversation._id}`
    );
  } catch (error) {
    console.error("Error generating basic memory nodes:", error);
  }
};

/**
 * Extract conversation insights with additional cultural awareness
 */
const extractConversationInsights = (messages, contactName) => {
  // Track various metrics
  let sentimentTotal = 0;
  let messageCount = 0;
  let userMessageCount = 0;
  let contactMessageCount = 0;
  let responseTimeTotal = 0;
  let responseTimeCount = 0;
  let lastTimestamp = null;
  let lastSender = null;
  let emojiCount = 0;
  let questionCount = 0;
  let teluguWordCount = 0;
  let englishWordCount = 0;

  // Topic tracking
  const topicCounts = {};
  Object.keys(TOPIC_CATEGORIES).forEach((topic) => {
    topicCounts[topic] = 0;
  });

  // Process each message
  for (const message of messages) {
    const isUserMessage = message.role === "ai"; // 'ai' is user in imported conversations
    const content = message.content || "";
    const timestamp = message.timestamp
      ? new Date(message.timestamp)
      : new Date();

    // Count by sender
    if (isUserMessage) {
      userMessageCount++;
    } else {
      contactMessageCount++;
    }

    // Sentiment analysis
    const sentiment = analyzeSentiment(content);
    sentimentTotal += sentiment;
    messageCount++;

    // Response time calculation
    if (lastTimestamp && lastSender !== (isUserMessage ? "user" : "contact")) {
      const responseTime = timestamp - lastTimestamp;
      if (responseTime > 0 && responseTime < 86400000) {
        // Less than 24 hours
        responseTimeTotal += responseTime;
        responseTimeCount++;
      }
    }

    // Emoji count
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojis = content.match(emojiRegex);
    if (emojis) {
      emojiCount += emojis.length;
    }

    // Question count
    if (content.includes("?")) {
      questionCount++;
    }

    // Language detection (simple approach for demo)
    // Telugu words often have unique character combinations not found in English
    const teluguPattern = /[\u0C00-\u0C7F]/g; // Telugu Unicode range
    const teluguMatches = content.match(teluguPattern);
    if (teluguMatches) {
      teluguWordCount += teluguMatches.length;
    }

    // Approximate English word count
    const words = content.split(/\s+/);
    englishWordCount += words.length;

    // Topic analysis
    for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
      for (const keyword of keywords) {
        if (content.toLowerCase().includes(keyword)) {
          topicCounts[topic]++;
          break;
        }
      }
    }

    // Update tracking variables
    lastTimestamp = timestamp;
    lastSender = isUserMessage ? "user" : "contact";
  }

  // Calculate averages and percentages
  const avgSentiment = sentimentTotal / (messageCount || 1);
  const avgResponseTime =
    responseTimeCount > 0 ? responseTimeTotal / responseTimeCount : 0;
  const languageRatio = {
    telugu: (teluguWordCount / (teluguWordCount + englishWordCount || 1)) * 100,
    english:
      (englishWordCount / (teluguWordCount + englishWordCount || 1)) * 100,
  };

  // Determine message balance
  const messageRatio = userMessageCount / (contactMessageCount || 1);
  const messageBalance =
    messageRatio > 0.8 && messageRatio < 1.2
      ? "balanced"
      : messageRatio >= 1.2
        ? "user-dominant"
        : "contact-dominant";

  // Determine primary topics
  const sortedTopics = Object.entries(topicCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Format topic distribution for API response
  const topicDistribution = sortedTopics.map(([name, count]) => {
    const totalTopicMentions = sortedTopics.reduce((sum, [_, c]) => sum + c, 0);
    return {
      name,
      percentage: Math.round((count / totalTopicMentions) * 100),
    };
  });

  // Ensure percentages add up to 100%
  const totalPercentage = topicDistribution.reduce(
    (sum, t) => sum + t.percentage,
    0
  );
  if (totalPercentage !== 100 && topicDistribution.length > 0) {
    // Adjust the highest topic to make total 100%
    const diff = 100 - totalPercentage;
    topicDistribution[0].percentage += diff;
  }

  // If no topics were detected, add a default
  if (topicDistribution.length === 0) {
    topicDistribution.push({ name: "General", percentage: 100 });
  }

  return {
    messageCount,
    sentimentScore: avgSentiment,
    sentimentLabel: getSentimentLabel(avgSentiment),
    responseTimeAvg: avgResponseTime,
    messageBalance,
    emojiUsage: emojiCount / (messageCount || 1),
    questionFrequency: questionCount / (messageCount || 1),
    languageRatio,
    topicDistribution,
    // Gamification elements
    connectionScore: Math.round(65 + avgSentiment * 20),
    relationshipLevel: Math.min(10, Math.max(1, Math.floor(messageCount / 20))),
    communicationStyle: {
      user:
        messageRatio > 1.5
          ? "expressive"
          : messageRatio < 0.5
            ? "reserved"
            : "balanced",
      contact:
        messageRatio < 0.7
          ? "expressive"
          : messageRatio > 2
            ? "reserved"
            : "balanced",
    },
  };
};

/**
 * Export the module functions
 */
module.exports = {
  analyzeImportedConversation,
  generateMemoryNodes,
  groupIntoSegments,
  getSentimentLabel,
  extractConversationInsights,
  calculateConversationMetrics,
  enhanceAnalysisWithMetrics,
  storeAnalysisResults,
  validateAndFixAnalysisResult,
  convertVolatilityToEnum,
};
