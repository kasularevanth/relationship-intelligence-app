// services/relationshipAnalyzer.js
const OpenAI = require('openai');
const Relationship = require('../models/Relationship');
const Conversation = require('../models/Conversation');
const MemoryNode = require('../models/MemoryNode');
require('dotenv').config();

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enriches relationship data with insights from analyzed conversations
 * @param {string} relationshipId - The ID of the relationship to analyze
 * @param {string} conversationId - The ID of the recently imported conversation
 */
const enrichRelationshipData = async (relationshipId, conversationId) => {
  try {
    console.log(`Enriching relationship data for ${relationshipId} based on conversation ${conversationId}`);
    
    // Find the relationship
    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      throw new Error(`Relationship with ID ${relationshipId} not found`);
    }
    
    // Find the conversation with populated messages
    const conversation = await Conversation.findById(conversationId)
      .populate('messages');
    
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    // Format conversation for analysis
    const formattedMessages = formatConversationForAnalysis(conversation, relationship.contactName);
    
    // Get deep relationship insights using AI
    const analysisResults = await getRelationshipInsights(formattedMessages, relationship.contactName);
    
    // Update relationship fields with generated insights
    await updateRelationshipWithInsights(relationship, analysisResults);
    
    // Generate memory nodes for significant moments
    await generateMemoryNodes(relationship, conversation, analysisResults);
    
    console.log(`Successfully enriched relationship data for ${relationshipId}`);
    
    return {
      success: true,
      relationship: relationship._id
    };
  } catch (error) {
    console.error('Error enriching relationship data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Format conversation messages for analysis
 */
const formatConversationForAnalysis = (conversation, contactName) => {
  // Ensure messages are sorted by timestamp
  const sortedMessages = [...conversation.messages].sort((a, b) => 
    new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );
  
  // Format messages as a text conversation
  return sortedMessages.map(msg => {
    const sender = msg.role === 'user' ? contactName : 'You';
    return `${sender}: ${msg.content || ''}`;
  }).join('\n');
};

/**
 * Use OpenAI API to analyze relationship based on conversation
 */
const getRelationshipInsights = async (conversationText, contactName) => {
  try {
    const analysisPrompt = `
    You are an expert relationship analyst with deep understanding of human interactions. 
    Analyze this imported conversation between the user and ${contactName}.

    CONVERSATION:
    ${conversationText}

    Based on the conversation above, provide a detailed analysis in JSON format with the following elements:
    1. keyInsights: List 3-5 most important insights about this relationship based on the conversation.
    2. emotionalDynamics: Analyze the emotional patterns and connection between these two people.
    3. areasForGrowth: Identify 2-3 areas where the relationship could grow or improve.
    4. topTopics: Identify the 3-5 main topics discussed (as array of objects with 'name' and 'percentage' properties).
    5. overallTone: The general emotional tone (positive, negative, neutral, or mixed).
    6. communicationStyle: Communication style details for both participants as an object with keys 'user' and 'contact'.
    7. loveLanguage: Detected love language preferences as a simple string.
    8. values: Values that seem important to the contact as an array of strings.
    9. interests: The contact's apparent interests as an array of strings.
    10. communicationPreferences: How the contact prefers to communicate as a string.
    11. importantDates: Any mentioned important dates as an array of strings.
    12. connectionScore: A numeric score from 1-100 for relationship strength.
    13. trustLevel: A numeric score from 1-10 for trust level.
    14. positiveMemories: Array of positive moments mentioned or implied.
    15. challengeAreas: Array of challenges or tensions.
    16. growthAreas: Areas where the relationship could improve.
    17. theirValues: Contact's values inferred from conversation as an array of strings.
    18. theirInterests: Contact's interests inferred from conversation as an array of strings.
    19. theirCommunicationPreferences: Contact's communication preferences as a string.
    20. howWeMet: Information about how they met if mentioned.
    21. events: Array of key events mentioned in the conversation.
    22. messageCount: Total number of messages.
    23. culturalContext: Cultural elements observed in the conversation.
    24. relationshipLevel: A gamified level from 1-10 representing relationship progress.
    25. challengesBadges: Array of "challenge badges" they've earned through their communication.
    26. nextMilestone: The next milestone they could achieve in their relationship journey.
    27. emotionalVolatility: Score from -1 to 1 indicating emotional stability.
    28. depthScore: Score from 1-10 indicating depth of connection.
    29. reciprocityRatio: Number from 0-1 indicating balance of giving/receiving.

    Be VERY specific about the exact format of each field, making sure they match the expected data types.
    Respond ONLY with valid JSON, no other text.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert relationship analyst that provides detailed analysis of conversations. Your responses are in valid JSON format only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1800
    });

    // Parse and validate the JSON response
    try {
      const content = response.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return createFallbackAnalysis(contactName);
    }
  } catch (error) {
    console.error('Error getting relationship insights from OpenAI:', error);
    return createFallbackAnalysis(contactName);
  }
};

/**
 * Update relationship model with insights from analysis
 */
const updateRelationshipWithInsights = async (relationship, insights) => {
  // Create metrics object if it doesn't exist
  if (!relationship.metrics) {
    relationship.metrics = {};
  }

  // Update emotional metrics
  relationship.metrics.emotionalVolatility = insights.emotionalVolatility || 0;
  relationship.metrics.depthScore = insights.depthScore || 5;
  relationship.metrics.reciprocityRatio = insights.reciprocityRatio || 0.5;
  relationship.metrics.trust = insights.trustLevel / 10 || 0.7;
  
  // Update communication style
  relationship.communicationStyle = insights.communicationStyle || {
    user: "balanced",
    contact: "responsive"
  };
  
  // Update love language
  relationship.loveLanguage = insights.loveLanguage || "Not enough data to determine";
  
  // Update their values and interests
  relationship.theirValues = insights.theirValues || insights.values || [];
  relationship.theirInterests = insights.theirInterests || insights.interests || [];
  relationship.theirCommunicationPreferences = insights.theirCommunicationPreferences || 
                                              insights.communicationPreferences || "Not specified";
  
  // Update relationship background if available
  if (insights.howWeMet && !relationship.howWeMet) {
    relationship.howWeMet = insights.howWeMet;
  }
  
  // Update important dates if available
  if (insights.importantDates && Array.isArray(insights.importantDates) && insights.importantDates.length > 0) {
    relationship.importantDates = insights.importantDates;
  }
  
  // Update events if available
  if (insights.events && Array.isArray(insights.events) && insights.events.length > 0) {
    relationship.events = insights.events;
  }
  
  // Update topic distribution
  if (insights.topTopics && Array.isArray(insights.topTopics) && insights.topTopics.length > 0) {
    relationship.topicDistribution = insights.topTopics;
  }
  
  // Update gamification elements
  if (!relationship.gamification) {
    relationship.gamification = {};
  }
  
  relationship.gamification.connectionScore = insights.connectionScore || 75;
  relationship.gamification.relationshipLevel = insights.relationshipLevel || 5;
  relationship.gamification.challengesBadges = insights.challengesBadges || ["Regular Communicator"];
  relationship.gamification.nextMilestone = insights.nextMilestone || "Have a deeper conversation";
  relationship.gamification.communicationStyle = insights.communicationStyle || {
    user: "balanced",
    contact: "responsive"
  };
  
  // Save the updated relationship
  await relationship.save();
  
  return relationship;
};

/**
 * Generate memory nodes for significant moments
 */
const generateMemoryNodes = async (relationship, conversation, insights) => {
  try {
    // Get user ID from relationship
    const userId = relationship.user;
    
    if (!userId) {
      console.error('User ID is missing from relationship');
      return;
    }
    
    // Create positive memory nodes
    if (insights.positiveMemories && Array.isArray(insights.positiveMemories)) {
      for (const memory of insights.positiveMemories.slice(0, 3)) {
        const memoryNode = new MemoryNode({
          user: userId,
          relationship: relationship._id,
          type: 'memory',
          emotion: 'positive',
          content: memory,
          sentiment: 0.8,
          sourceReference: {
            type: 'conversation',
            id: conversation._id,
            timestamp: new Date()
          },
          keywords: ['positive', 'memory'],
          created: new Date()
        });
        
        await memoryNode.save();
      }
    }
    
    // Create challenge memory nodes
    if (insights.challengeAreas && Array.isArray(insights.challengeAreas)) {
      for (const challenge of insights.challengeAreas.slice(0, 3)) {
        const memoryNode = new MemoryNode({
          user: userId,
          relationship: relationship._id,
          type: 'memory',
          emotion: 'negative',
          content: challenge,
          sentiment: -0.3,
          sourceReference: {
            type: 'conversation',
            id: conversation._id,
            timestamp: new Date()
          },
          keywords: ['challenge', 'growth'],
          created: new Date()
        });
        
        await memoryNode.save();
      }
    }
    
    // Create growth area memory nodes
    if (insights.growthAreas && Array.isArray(insights.growthAreas)) {
      for (const growth of insights.growthAreas.slice(0, 3)) {
        const memoryNode = new MemoryNode({
          user: userId,
          relationship: relationship._id,
          type: 'memory',
          emotion: 'growth',
          content: growth,
          sentiment: 0.5,
          sourceReference: {
            type: 'conversation',
            id: conversation._id,
            timestamp: new Date()
          },
          keywords: ['growth', 'opportunity'],
          created: new Date()
        });
        
        await memoryNode.save();
      }
    }
    
    console.log(`Generated memory nodes for relationship ${relationship._id}`);
  } catch (error) {
    console.error('Error generating memory nodes:', error);
  }
};

/**
 * Create fallback analysis when OpenAI fails
 */
const createFallbackAnalysis = (contactName) => {
  return {
    keyInsights: [
      "Regular communication patterns detected",
      "Shared interests appear to be important in this relationship",
      "Both parties contribute to the conversation"
    ],
    emotionalDynamics: "The conversation shows a generally positive tone with balanced engagement from both parties.",
    areasForGrowth: [
      "More frequent check-ins could strengthen the relationship",
      "Deeper conversations on shared interests could enhance connection"
    ],
    topTopics: [
      { name: "General Discussion", percentage: 55 },
      { name: "Plans", percentage: 25 },
      { name: "Personal Updates", percentage: 20 }
    ],
    overallTone: "positive",
    communicationStyle: {
      user: "balanced",
      contact: "responsive"
    },
    loveLanguage: "Quality Time",
    values: ["Reliability", "Honesty"],
    interests: ["General socializing", "Shared activities"],
    communicationPreferences: "Regular text exchanges",
    importantDates: [],
    connectionScore: 75,
    trustLevel: 7,
    positiveMemories: ["Helpful exchanges", "Support during conversations"],
    challengeAreas: ["Scheduling time to connect"],
    growthAreas: ["More consistent communication", "Deeper topic exploration"],
    theirValues: ["Reliability", "Friendship"],
    theirInterests: ["Social activities", "Regular communication"],
    theirCommunicationPreferences: "Text messaging",
    howWeMet: "Not specified in conversation",
    events: [],
    messageCount: 100,
    culturalContext: "Standard conversation patterns",
    relationshipLevel: 5,
    challengesBadges: ["Regular Communicator", "Conversation Starter"],
    nextMilestone: "Meaningful Conversation Master: Have 5 deep conversations about important topics",
    emotionalVolatility: 0.4,
    depthScore: 5.5,
    reciprocityRatio: 0.5
  };
};

module.exports = {
  enrichRelationshipData
};