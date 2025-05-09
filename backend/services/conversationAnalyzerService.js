/**
 * Conversation Analyzer Service
 * Processes imported conversations to extract insights and relationship metrics
 */
const Conversation = require('../models/Conversation');
const Relationship = require('../models/Relationship');
const MemoryNode = require('../models/MemoryNode');
const Message = require('../models/Message');
const { analyzeSentiment } = require('./chatParserService');
const OpenAI = require('openai');
const config = require('../config');
require('dotenv').config(); // Ensure dotenv is loaded

// Keywords that indicate different topics
const TOPIC_KEYWORDS = {
  conflict: ['argue', 'sorry', 'misunderstand', 'wrong', 'upset', 'angry', 'disagree'],
  support: ['help', 'support', 'there for you', 'listen', 'understand', 'appreciate'],
  humor: ['lol', 'haha', '😂', 'funny', 'joke', 'laugh'],
  planning: ['plan', 'schedule', 'tomorrow', 'weekend', 'meet', 'time'],
  emotion: ['feel', 'love', 'miss', 'happy', 'sad', 'worried', 'care'],
  routine: ['always', 'usually', 'often', 'every day', 'habit']
};

// Broader topic categories for topic distribution
const TOPIC_CATEGORIES = {
  'Work': ['work', 'job', 'office', 'meeting', 'project', 'boss', 'client', 'deadline', 'email', 'company', 'business'],
  'Family': ['family', 'kids', 'parents', 'mom', 'dad', 'sister', 'brother', 'child', 'baby', 'spouse', 'wife', 'husband'],
  'Health': ['doctor', 'sick', 'health', 'exercise', 'gym', 'workout', 'diet', 'medication', 'therapy', 'sleep', 'symptoms'],
  'Social': ['party', 'dinner', 'lunch', 'drinks', 'hangout', 'meet up', 'event', 'friend', 'dating', 'restaurant', 'bar'],
  'Travel': ['trip', 'vacation', 'travel', 'flight', 'hotel', 'visit', 'tour', 'beach', 'destination', 'ticket', 'passport'],
  'Plans': ['plan', 'schedule', 'next week', 'weekend', 'tomorrow', 'tonight', 'future', 'calendar', 'date', 'event'],
  'Emotions': ['feel', 'happy', 'sad', 'angry', 'excited', 'worried', 'stress', 'love', 'anxiety', 'hope', 'depression'],
  'Hobbies': ['hobby', 'game', 'music', 'movie', 'book', 'reading', 'play', 'sports', 'art', 'cooking', 'gardening'],
  'Financial': ['money', 'bill', 'payment', 'budget', 'purchase', 'buy', 'expense', 'loan', 'investment', 'savings'],
  'Education': ['school', 'study', 'class', 'learning', 'course', 'university', 'college', 'degree', 'test', 'exam']
};

// Telugu-specific keywords that might appear in mixed language conversations
const TELUGU_KEYWORDS = {
  'Greetings': ['namaskaram', 'ela unnaru', 'bagunava', 'emi chesthunnav'],
  'Family': ['amma', 'nanna', 'akka', 'anna', 'tammudu', 'chelli'],
  'Endearment': ['bangaram', 'praanam', 'prema', 'kantri'],
  'Food': ['annam', 'pappu', 'kura', 'ruchi', 'tinu', 'bhojnam'],
  'Time': ['repu', 'ippudu', 'ratri', 'udayam', 'sayantram']
};

// Sentiment related utilities
const getSentimentLabel = (score) => {
  if (score > 0.5) return 'very positive';
  if (score > 0.1) return 'positive';
  if (score > -0.1) return 'neutral';
  if (score > -0.5) return 'negative';
  return 'very negative';
};

const calculateSegmentSentiment = (segment) => {
  const sentiments = segment.map(msg => analyzeSentiment(msg.content));
  const sum = sentiments.reduce((total, val) => total + val, 0);
  const avg = sum / sentiments.length;
  return {
    score: avg,
    label: getSentimentLabel(avg),
    magnitude: Math.abs(avg)
  };
};

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey,
});
if (!process.env.OPENAI_API_KEY && !config.openaiApiKey) {
  console.error('ERROR: OpenAI API key is not configured. Analysis will fail.');
}

/**
 * Analyze conversation to extract relationship insights with special handling for mixed languages
 */
const analyzeImportedConversation = async (conversationId) => {
  try {
    console.log(`Starting analysis for conversation: ${conversationId}`);
    
    // Get the full conversation with all messages
    const conversation = await Conversation.findById(conversationId)
      .populate('relationship')
      .exec();
    
    if (!conversation) {
      console.error(`Conversation ${conversationId} not found`);
      return null;
    }

    // Extract messages for analysis
    const messages = conversation.messages;
    if (!messages || messages.length === 0) {
      throw new Error('No messages found in conversation');
    }
    
    const relationship = conversation.relationship;   
    if (!relationship) {
      console.error(`Relationship not found for conversation ${conversationId}`);
      return null;
    }   

    const contactName = relationship.contactName || 'Contact';    
    console.log(`Analyzing ${messages.length} messages for relationship with ${contactName}`);
    
    // Prepare message text for analysis
    // Format: "You: message" or "Contact: message"
    const messageText = messages.map(msg => {
      const sender = msg.role === 'user' ? contactName : 'You';
      return `${sender}: ${msg.content || ''}`;
    }).join('\n');

    // ENHANCED GAMIFIED PROMPT:
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
      1. keyInsights: List 3-5 most important insights about this relationship based on the conversation.
      2. emotionalDynamics: Analyze the emotional patterns and connection between these two people.
      3. areasForGrowth: Identify 2-3 areas where the relationship could grow or improve.
      4. topTopics: Identify the 3-5 main topics discussed (as array of objects with 'name' and 'percentage' properties).
      5. overallTone: The general emotional tone (positive, negative, neutral, or mixed).
      6. communicationStyle: Communication style details for both user and contact
      7. loveLanguage: Detected love language preferences
      8. values: Values important to the contact
      9. interests: The contact's interests
      10. communicationPreferences: How the contact prefers to communicate
      11. importantDates: Any mentioned important dates
      12. connectionScore: A numeric score from 1-100 for relationship strength
      13. trustLevel: A numeric score from 1-10 for trust level
      14. theirValues: Contact's values inferred from conversation
      15. theirInterests: Contact's interests inferred from conversation
      16. howWeMet: Information about how they met if mentioned
      17. events: Array of key events mentioned in the conversation
      18. messageCount: Total number of messages
      19. culturalContext: Brief notes on any culturally specific elements observed in the conversation.
      20. communicationStyle: An object with "user" and "contact" properties, each with values like "direct", "passive", "expressive", etc.
      21. relationshipLevel: A gamified level from 1-10 representing relationship progress.
      22. challengesBadges: Array of "challenge badges" they've earned through their communication (e.g., "Conflict Resolution Master", "Emotional Support Champion").
      23. nextMilestone: The next milestone they could achieve in their relationship journey.

      Respond ONLY with valid JSON. Format exactly like this:
      {
        "keyInsights": ["insight 1", "insight 2", "insight 3"],
        "emotionalDynamics": "analysis of emotions and dynamics",
        "areasForGrowth": ["area 1", "area 2", "area 3"],
        "topTopics": [
          {"name": "Topic 1", "percentage": 40},
          {"name": "Topic 2", "percentage": 30},
          {"name": "Topic 3", "percentage": 20}
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
        "connectionScore": 85,
        "trustLevel": 8,
        "theirValues": ["loyalty", "honesty", "family"],
        "theirInterests": ["movies", "music", "outdoors"],
        "howWeMet": "Met through mutual friends at a college event",
        "events": ["First met in 2019", "Started working together in 2020"],
        "messageCount": 523,
        "culturalContext": "notes on cultural elements",
        "relationshipLevel": 7,
        "challengesBadges": ["Deep Conversation Initiator", "Cultural Exchange Pro"],
        "nextMilestone": "Regular Check-in Champion: Maintain consistent meaningful exchanges for two weeks"
      }
      `;

console.log('Sending conversation for OpenAI analysis...');

try {
  // Call OpenAI API for analysis
  const response = await openai.chat.completions.create({
    model: config.AI_MODEL || 'gpt-4-turbo', // Use config model if available
    messages: [
      {
        role: 'system',
        content: 'You are an expert relationship analyst that understands Indian languages, especially Telugu mixed with English. Your analysis should be culturally sensitive, gamified, and consider the nuances of conversation in mixed languages. Pay special attention to cultural context, relationship dynamics, emotional expressions, and meaningful exchanges in both languages.'
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ],
    temperature: 0.5,
    max_tokens: 1500
  });

    console.log('Received analysis from OpenAI');
    
    // Parse the OpenAI response with improved error handling
    let analysisResult = parseOpenAIResponse(response);

    // Validate and fix the analysis result
    analysisResult = validateAndFixAnalysisResult(analysisResult);  
    
    // Analyze sentiment across all messages
    let sentimentTotal = 0;
    let messageCount = 0;
    
    // Track topic distribution
    const topicCounts = {
      conflict: 0,
      support: 0,
      humor: 0,
      planning: 0,
      emotion: 0,
      routine: 0,
      general: 0
    };
        
    // Also track broader topic categories for topic distribution
    const categoryTopicCounts = {};
    Object.keys(TOPIC_CATEGORIES).forEach(category => {
      categoryTopicCounts[category] = 0;
    });
    
      // Track Telugu-specific keywords
      const teluguTopicCounts = {};
      Object.keys(TELUGU_KEYWORDS).forEach(category => {
        teluguTopicCounts[category] = 0;
      });
    
    // Track conversation patterns
    const patterns = {
      responseTime: [], // Average time between messages
      messageLength: [], // Average message length
      questionFrequency: 0, // How often questions are asked
      initiationRatio: 0, // Who starts conversations
      emojiUsage: 0 // Frequency of emoji use
    };
    
    // Process each message
    let lastTimestamp = null;
    let lastSender = null;
    let userMessageCount = 0;
    let contactMessageCount = 0;
    let conversationStarts = { user: 0, contact: 0 };
    let currentDay = null;
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const content = message.content || '';
        const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
      const isUserMessage = message.role === 'ai'; // In import context, 'ai' means user's messages
      
      // Analyze sentiment
      const sentimentScore = analyzeSentiment(content);
      message.sentiment = {
        score: sentimentScore,
        label: getSentimentLabel(sentimentScore),
        magnitude: Math.abs(sentimentScore)
      };
      sentimentTotal += sentimentScore;
      messageCount++;
      
      // Count message by sender
      if (isUserMessage) {
        userMessageCount++;
      } else {
        contactMessageCount++;
      }
      
      // Analyze message length
      patterns.messageLength.push(content.length);
      
      // Check if message contains a question
      if (content.includes('?')) {
        patterns.questionFrequency++;
      }
      
      // Count emoji usage
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      const emojis = content.match(emojiRegex);
      if (emojis) {
        patterns.emojiUsage += emojis.length;
      }
      
      // Analyze response time
      if (lastTimestamp && lastSender !== (isUserMessage ? 'user' : 'contact')) {
        const responseTime = timestamp - new Date(lastTimestamp);
        if (responseTime > 0 && responseTime < 86400000) { // Ignore responses over 24 hours
          patterns.responseTime.push(responseTime);
        }
      }
      
      // Identify conversation starts (new day or after 3+ hours of inactivity)
      const messageDate = timestamp;
      const messageDateStr = messageDate.toDateString();
      
      if (currentDay !== messageDateStr) {
        currentDay = messageDateStr;
        if (isUserMessage) {
          conversationStarts.user++;
        } else {
          conversationStarts.contact++;
        }
      } else if (lastTimestamp) {
        const timeDiff = messageDate - new Date(lastTimestamp);
        if (timeDiff > 10800000) { // 3 hours in milliseconds
          if (isUserMessage) {
            conversationStarts.user++;
          } else {
            conversationStarts.contact++;
          }
        }
      }
      
      // Analyze topics using TOPIC_KEYWORDS
      let foundTopic = false;
      for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        for (const keyword of keywords) {
          if (content.toLowerCase().includes(keyword)) {
            topicCounts[topic]++;
            foundTopic = true;
            break;
          }
        }
        if (foundTopic) break;
      }
      
      if (!foundTopic) {
        topicCounts.general++;
      }
            
      // Analyze broader topic categories
      for (const [category, keywords] of Object.entries(TOPIC_CATEGORIES)) {
        for (const keyword of keywords) {
          if (content.toLowerCase().includes(keyword)) {
            categoryTopicCounts[category]++;
            break;
          }
        }
      }
       
        // Analyze Telugu-specific keywords
        for (const [category, keywords] of Object.entries(TELUGU_KEYWORDS)) {
          for (const keyword of keywords) {
            if (content.toLowerCase().includes(keyword)) {
              teluguTopicCounts[category]++;
              break;
            }
          }
        }
      
      // Update tracking variables
      lastTimestamp = timestamp;
      lastSender = isUserMessage ? 'user' : 'contact';
    }
    
    // Calculate averages and ratios
    const averageSentiment = sentimentTotal / (messageCount || 1);
    const avgResponseTime = patterns.responseTime.length > 0 
      ? patterns.responseTime.reduce((sum, time) => sum + time, 0) / patterns.responseTime.length 
      : 0;
    const avgMessageLength = patterns.messageLength.length > 0 
      ? patterns.messageLength.reduce((sum, len) => sum + len, 0) / patterns.messageLength.length 
      : 0;
    const questionRatio = patterns.questionFrequency / (messageCount || 1);
    patterns.initiationRatio = conversationStarts.user / (conversationStarts.user + conversationStarts.contact || 1);
    
    // Calculate communication balance
    const messageRatio = userMessageCount / (contactMessageCount || 1);
    const communicationBalance = messageRatio > 0.8 && messageRatio < 1.2 ? 'balanced' : 
                              messageRatio >= 1.2 ? 'user-dominant' : 'contact-dominant';
    
    // Determine primary topics
    const topicEntries = Object.entries(topicCounts);
    topicEntries.sort((a, b) => b[1] - a[1]);
    const primaryTopics = topicEntries.slice(0, 3).map(entry => entry[0]);
    
    // Create relationship insights with gamified elements
    const insights = {
      sentimentScore: averageSentiment,
      sentimentLabel: getSentimentLabel(averageSentiment),
      responseTimeAvg: avgResponseTime,
      messageLengthAvg: avgMessageLength,
      communicationBalance,
      primaryTopics,
      questionFrequency: questionRatio,
      initiationRatio: patterns.initiationRatio,
      emojiUsage: patterns.emojiUsage / (messageCount || 1),
      topicDistribution: topicCounts,
      messageCount,
      dateRange: {
        start: messages[0]?.timestamp,
        end: messages[messages.length - 1]?.timestamp
      },
      // Gamification metrics
      connectionScore: analysisResult.connectionScore,
      relationshipLevel: analysisResult.relationshipLevel,
      challengesBadges: analysisResult.challengesBadges,
      nextMilestone: analysisResult.nextMilestone
    };
    
    // Store insights into the relationship
    relationship.insights = relationship.insights || {};
    Object.assign(relationship.insights, insights);
        
    // Process topic distribution for the relationship
    // First, from OpenAI analysis if available
    let topicDistribution = [];
    if (analysisResult && Array.isArray(analysisResult.topTopics) && analysisResult.topTopics.length > 0) {
      topicDistribution = analysisResult.topTopics;
    } else {
      // If OpenAI analysis doesn't provide topics, use our keyword analysis
      const categoryTotal = Object.values(categoryTopicCounts).reduce((sum, count) => sum + count, 0);
      if (categoryTotal > 0) {
        topicDistribution = Object.entries(categoryTopicCounts)
          .filter(([_, count]) => count > 0)
          .map(([name, count]) => ({
            name,
            percentage: Math.round((count / categoryTotal) * 100)
          }))
          .sort((a, b) => b.percentage - a.percentage);
      }
    }
    
    // Ensure we have at least some topics
    if (topicDistribution.length === 0) {
      topicDistribution = [
        { name: 'General Discussion', percentage: 70 },
        { name: 'Plans', percentage: 15 },
        { name: 'Personal Updates', percentage: 15 }
      ];
    }
    
    // Make sure percentages add up to 100%
    const totalPercentage = topicDistribution.reduce((sum, topic) => sum + topic.percentage, 0);
    if (totalPercentage !== 100) {
      const scaleFactor = 100 / totalPercentage;
      topicDistribution.forEach(topic => {
        topic.percentage = Math.round(topic.percentage * scaleFactor);
      });
      
      // Handle any rounding issues by adjusting the largest topic
      const adjustedTotal = topicDistribution.reduce((sum, topic) => sum + topic.percentage, 0);
      if (adjustedTotal !== 100) {
        const diff = 100 - adjustedTotal;
        const largestTopic = topicDistribution.reduce((max, topic) => 
          max.percentage > topic.percentage ? max : topic, { percentage: 0 });
        largestTopic.percentage += diff;
      }
    }
    
    // Update relationship's topic distribution
    console.log("Setting topicDistribution:", topicDistribution);
    relationship.topicDistribution = topicDistribution;
      
      // Add gamification elements to relationship model if they don't exist
      if (!relationship.gamification) {
        relationship.gamification = {
          connectionScore: analysisResult.connectionScore,
          relationshipLevel: analysisResult.relationshipLevel,
          challengesBadges: analysisResult.challengesBadges,
          nextMilestone: analysisResult.nextMilestone,
          communicationStyle: analysisResult.communicationStyle
        };
      } else {
        // Update existing gamification data
        relationship.gamification.connectionScore = analysisResult.connectionScore;
        relationship.gamification.relationshipLevel = analysisResult.relationshipLevel;
        relationship.gamification.challengesBadges = analysisResult.challengesBadges;
        relationship.gamification.nextMilestone = analysisResult.nextMilestone;
        relationship.gamification.communicationStyle = analysisResult.communicationStyle;
      }
  
    await relationship.save();
     
    // Update conversation with analysis results from OpenAI
    conversation.summary = analysisResult;
    conversation.status = 'analyzed';
    await conversation.save();
    
    console.log(`Analysis for conversation ${conversationId} completed and saved`);
    
    // Generate memory nodes based on significant conversation segments
    await generateMemoryNodes(conversation, relationship);
    
    return insights;
  } catch (openaiError) {
    console.error('Error calling OpenAI API:', openaiError);
    
    // Create fallback analysis
    const fallbackAnalysis = createFallbackAnalysis(messages, relationship.contactName);
    
    // Update conversation with fallback analysis
    conversation.summary = fallbackAnalysis;
    conversation.status = 'analyzed_fallback';
    await conversation.save();
    
    // Update relationship with fallback analysis
    relationship.insights = relationship.insights || {};
    relationship.insights.messageCount = messages.length;
    relationship.topicDistribution = fallbackAnalysis.topTopics;
    
    if (!relationship.gamification) {
      relationship.gamification = {
        connectionScore: fallbackAnalysis.connectionScore,
        relationshipLevel: fallbackAnalysis.relationshipLevel,
        challengesBadges: fallbackAnalysis.challengesBadges,
        nextMilestone: fallbackAnalysis.nextMilestone,
        communicationStyle: fallbackAnalysis.communicationStyle
      };
    }
    
    await relationship.save();
    
    // Generate basic memory nodes
    await generateMemoryNodes(conversation, relationship);
    
    return relationship.insights;
  }
} catch (error) {
  console.error('Error analyzing conversation:', error);
  return null;
}
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
  if (content.includes('```json')) {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonContent = jsonMatch[1].trim();
    }
  } else if (content.includes('```')) {
    // Try to extract from generic code block
    const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch && codeMatch[1]) {
      jsonContent = codeMatch[1].trim();
    }
  }
  
  // Attempt to parse the JSON
  return JSON.parse(jsonContent);
} catch (parseError) {
  console.error('Error parsing OpenAI response:', parseError);
  return createFallbackAnalysis();
}
};

/**
* Validate and fix the analysis result, ensuring all required fields exist
*/
const validateAndFixAnalysisResult = (analysisResult) => {
if (!analysisResult || typeof analysisResult !== 'object') {
  return createFallbackAnalysis();
}

const requiredFields = [
  'keyInsights', 'emotionalDynamics', 'areasForGrowth', 
  'topTopics', 'overallTone', 'culturalContext',
  'connectionScore', 'communicationStyle', 'relationshipLevel',
  'challengesBadges', 'nextMilestone'
];

let isValid = true;

requiredFields.forEach(field => {
  if (!analysisResult[field]) {
    isValid = false;
    // Add missing field with default value
    if (field === 'topTopics') {
      analysisResult[field] = [{name: "General", percentage: 100}];
    } else if (field === 'keyInsights' || field === 'areasForGrowth' || field === 'challengesBadges') {
      analysisResult[field] = [`Analysis didn't provide information about ${field}`];
    } else if (field === 'connectionScore') {
      analysisResult[field] = 75; // Default middle-high score
    } else if (field === 'relationshipLevel') {
      analysisResult[field] = 5; // Default middle level
    } else if (field === 'communicationStyle') {
      analysisResult[field] = {
        user: "balanced",
        contact: "responsive"
      };
    } else {
      analysisResult[field] = `Analysis didn't provide information about ${field}`;
    }
  }
});

// Ensure keyInsights and areasForGrowth are arrays
if (!Array.isArray(analysisResult.keyInsights)) {
  if (typeof analysisResult.keyInsights === 'string') {
    analysisResult.keyInsights = [analysisResult.keyInsights];
  } else {
    analysisResult.keyInsights = ["The conversation shows meaningful exchanges"];
  }
}

if (!Array.isArray(analysisResult.areasForGrowth)) {
  if (typeof analysisResult.areasForGrowth === 'string') {
    analysisResult.areasForGrowth = [analysisResult.areasForGrowth];
  } else {
    analysisResult.areasForGrowth = ["Consider building on existing communication patterns"];
  }
}

// Ensure challengesBadges is an array
if (!Array.isArray(analysisResult.challengesBadges)) {
  if (typeof analysisResult.challengesBadges === 'string') {
    analysisResult.challengesBadges = [analysisResult.challengesBadges];
  } else {
    analysisResult.challengesBadges = ["Communication Initiate"];
  }
}

// Ensure topTopics entries have both name and percentage
if (Array.isArray(analysisResult.topTopics)) {
  analysisResult.topTopics = analysisResult.topTopics.map(topic => {
    if (!topic.name) topic.name = "General Discussion";
    if (!topic.percentage || typeof topic.percentage !== 'number') {
      topic.percentage = 25; // Default percentage
    }
    return topic;
  });
  
  // If array is empty, add defaults
  if (analysisResult.topTopics.length === 0) {
    analysisResult.topTopics = [
      {name: "General Discussion", percentage: 60},
      {name: "Personal Updates", percentage: 40}
    ];
  }
}

return analysisResult;
};

/**
* Create a fallback analysis with default values
*/
const createFallbackAnalysis = (messages = [], contactName = 'Contact') => {
// Determine a basic sentiment if messages are provided
let tone = "mixed";
let connectionScore = 65;

if (messages.length > 0) {
  let sentimentTotal = 0;
  messages.forEach(msg => {
    sentimentTotal += analyzeSentiment(msg.content || '');
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
    "There's a foundation of mutual respect"
  ],
  emotionalDynamics: "The emotional patterns suggest a comfortable, established communication style.",
  areasForGrowth: [
    "More consistent communication might strengthen the connection",
    "Deeper discussions on shared interests could enhance engagement",
    "Setting regular check-in times could improve relationship maintenance"
  ],
  topTopics: [
    {name: "General Discussion", percentage: 50},
    {name: "Personal Updates", percentage: 30},
    {name: "Plans", percentage: 20}
  ],
  overallTone: tone,
  culturalContext: "The conversation shows typical communication patterns for close contacts",
  connectionScore: connectionScore,
  communicationStyle: {
    user: "direct",
    contact: "responsive"
  },
  relationshipLevel: 4,
  challengesBadges: ["Conversation Starter", "Regular Communicator"],
  nextMilestone: "Consistent Engagement: Maintain regular meaningful exchanges for two weeks"
};
};

const groupIntoSegments = (messages, threshold = 10800000) => { // 3 hours in milliseconds
  const segments = [];
  let currentSegment = [];
  let lastTimestamp = null;
  for (const message of messages) {
    const currentTime = message.timestamp ? new Date(message.timestamp) : new Date();
    
    // Start a new segment if this is first message or there's a significant time gap
    if (!lastTimestamp || (currentTime - lastTimestamp > threshold)) {
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
 * Generate basic memory nodes when OpenAI analysis fails
 */
const generateMemoryNodes = async (conversation, relationship) => {
  try {
    const messages = conversation.messages || [];
    if (messages.length === 0) return;
    
    // Get the user ID from the relationship
    const userId = relationship.user;
    
    if (!userId) {
      console.error('User ID is missing from relationship');
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
      const date = new Date(segment[0].timestamp || Date.now()).toLocaleDateString();
      let content = `Conversation on ${date}`;
      
      // Add sentiment information if significant
      if (hasStrongSentiment) {
        content += ` with a ${sentimentData.label} tone`;
      }
      
      // Extract possible topics
      const possibleTopics = [];
      const segmentText = segment.map(m => m.content || '').join(' ').toLowerCase();
      
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
        content += ` about ${possibleTopics.slice(0, 2).join(' and ')}`;
      }
      
      // Only create memory nodes for significant segments to avoid clutter
      if (hasStrongSentiment || possibleTopics.length > 0) {
        // Create a memory node
        const memoryNode = new MemoryNode({
          user: userId,
          relationship: relationship._id,
          type: 'conversation',
          content,
          sentiment: sentimentData.score,
          sourceReference: {
            type: 'conversation',
            id: conversation._id,
            timestamp: segment[segment.length - 1].timestamp || Date.now()
          },
          keywords: [...possibleTopics, sentimentData.label],
          created: new Date()
        });
        
        await memoryNode.save();
        memoryCount++;
        
        // Limit to max 5 memory nodes per conversation for fallback
        if (memoryCount >= 5) break;
      }
    }
    
    console.log(`Generated ${memoryCount} basic memory nodes for conversation ${conversation._id}`);
  } catch (error) {
    console.error('Error generating basic memory nodes:', error);
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
  Object.keys(TOPIC_CATEGORIES).forEach(topic => {
    topicCounts[topic] = 0;
  });
  
  // Process each message
  for (const message of messages) {
    const isUserMessage = message.role === 'ai'; // 'ai' is user in imported conversations
    const content = message.content || '';
    const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
    
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
    if (lastTimestamp && lastSender !== (isUserMessage ? 'user' : 'contact')) {
      const responseTime = timestamp - lastTimestamp;
      if (responseTime > 0 && responseTime < 86400000) { // Less than 24 hours
        responseTimeTotal += responseTime;
        responseTimeCount++;
      }
    }
    
    // Emoji count
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojis = content.match(emojiRegex);
    if (emojis) {
      emojiCount += emojis.length;
    }
    
    // Question count
    if (content.includes('?')) {
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
    lastSender = isUserMessage ? 'user' : 'contact';
  }
  
  // Calculate averages and percentages
  const avgSentiment = sentimentTotal / (messageCount || 1);
  const avgResponseTime = responseTimeCount > 0 ? responseTimeTotal / responseTimeCount : 0;
  const languageRatio = {
    telugu: teluguWordCount / (teluguWordCount + englishWordCount || 1) * 100,
    english: englishWordCount / (teluguWordCount + englishWordCount || 1) * 100
  };
  
  // Determine message balance
  const messageRatio = userMessageCount / (contactMessageCount || 1);
  const messageBalance = messageRatio > 0.8 && messageRatio < 1.2 ? 'balanced' : 
                        messageRatio >= 1.2 ? 'user-dominant' : 'contact-dominant';
  
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
      percentage: Math.round((count / totalTopicMentions) * 100)
    };
  });
  
  // Ensure percentages add up to 100%
  const totalPercentage = topicDistribution.reduce((sum, t) => sum + t.percentage, 0);
  if (totalPercentage !== 100 && topicDistribution.length > 0) {
    // Adjust the highest topic to make total 100%
    const diff = 100 - totalPercentage;
    topicDistribution[0].percentage += diff;
  }
  
  // If no topics were detected, add a default
  if (topicDistribution.length === 0) {
    topicDistribution.push({ name: 'General', percentage: 100 });
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
    connectionScore: Math.round(65 + (avgSentiment * 20)),
    relationshipLevel: Math.min(10, Math.max(1, Math.floor(messageCount / 20))),
    communicationStyle: {
      user: messageRatio > 1.5 ? 'expressive' : messageRatio < 0.5 ? 'reserved' : 'balanced',
      contact: messageRatio < 0.7 ? 'expressive' : messageRatio > 2 ? 'reserved' : 'balanced' 
    }
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
  extractConversationInsights
};