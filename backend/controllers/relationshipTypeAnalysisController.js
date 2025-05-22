// backend/controllers/relationshipTypeAnalysisController.js
const Relationship = require('../models/Relationship');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const MemoryNode = require('../models/MemoryNode');
const OpenAI = require('openai');
const config = require('../config');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.OPENAI_API_KEY
});

/**
 * Get relationship type-specific analysis
 * This endpoint analyzes conversation history based on relationship type
 */
exports.getTypeAnalysis = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    
    // Add no-cache headers to ensure fresh data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Verify relationship belongs to the authenticated user
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: req.user.id
    }).lean();  // Use lean() for better performance
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Relationship not found'
      });
    }
        
    console.log('Found relationship:', {
      id: relationship._id,
      type: relationship.relationshipType, // This should be relationshipType, not type
      contactName: relationship.contactName
    });
    
    // Get all conversations for this relationship
    // Use a timestamp parameter to force fresh lookup after import
    const timestamp = req.query.timestamp || Date.now();
    console.log(`Getting fresh conversations at timestamp: ${timestamp}`);
    
    const conversations = await Conversation.find({
      relationship: relationshipId
    })
    .sort({ createdAt: -1 })
    .lean(); // Use lean() for better performance
    
    // If no conversations exist, return empty analysis
    if (!conversations || conversations.length === 0) {
      console.log(`No conversations found for relationship ${relationshipId}`);
      return res.status(200).json({
        success: true,
        message: 'No conversations available for analysis',
        metrics: {},
        insights: [],
        recommendations: [],
        timestamp: Date.now() // Include timestamp for client-side cache busting
      });
    }
    
    console.log(`Found ${conversations.length} conversations for analysis`);
    
    // Get messages from all conversations
    let allMessages = [];
    
    for (const conversation of conversations) {
      // Handle both embedded messages and separate message documents
      if (conversation.messages && conversation.messages.length > 0) {
        allMessages = allMessages.concat(conversation.messages);
      } else {
        const messages = await Message.find({
          conversation: conversation._id
        })
        .sort({ timestamp: 1 })
        .lean(); // Use lean() for better performance
        
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
        message: 'Not enough messages for detailed analysis',
        messageCount: allMessages.length,
        metrics: getBasicMetrics(relationship.relationshipType), // Fix: use relationshipType
        insights: getBasicInsights(relationship.relationshipType, relationship.contactName), // Fix: use relationshipType
        recommendations: getBasicRecommendations(relationship.relationshipType) // Fix: use relationshipType
      });
    }
    
    // Get relationship type-specific metrics
    const metrics = await getRelationshipTypeMetrics(
       relationship.relationshipType,
      allMessages,
      relationship.contactName
    );

    console.log('Generated metrics:', metrics);
    
    // Get memories/insights related to this relationship
    const memories = await MemoryNode.find({
      relationship: relationshipId
    }).sort({ created: -1 }).limit(20);
    
    // Generate insights using AI if we have enough data
    let insights = [];
    let recommendations = [];
    
    if (allMessages.length >= 50) {
      // Generate insights using AI based on message history
      const aiAnalysis = await generateAIInsights(
        relationship.relationshipType,
        relationship.contactName,
        allMessages,
        memories
      );
      
      insights = aiAnalysis.insights || [];
      recommendations = aiAnalysis.recommendations || [];
    } else {
      // Use basic insights if not enough messages
      insights = getBasicInsights(relationship.relationshipType, relationship.contactName);
      recommendations = getBasicRecommendations(relationship.relationshipType);
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
      lastUpdated: new Date()
    };
        
    console.log('Sending analysis response:', {
      type: analysis.type,
      messageCount: analysis.messageCount,
      metricsKeys: Object.keys(analysis.metrics)
    });
    
    // Store analysis in relationship for future reference
    // Since we used lean() earlier, we need to get a proper document to save
    const relationshipDoc = await Relationship.findById(relationshipId);
    if (relationshipDoc) {
      relationshipDoc.typeAnalysis = analysis;
      await relationshipDoc.save();
      console.log(`Updated relationship ${relationshipId} with new analysis data`);
    }
    
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error generating relationship type analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating relationship analysis',
      error: error.message
    });
  }
};

/**
 * Generate metrics based on relationship type and message history
 */
const getRelationshipTypeMetrics = async (relationshipType, messages, contactName) => {
  // Normalize type for consistent processing
  const normalizedType = normalizeRelationshipType(relationshipType);
  console.log('Processing metrics for type:', relationshipType, 'normalized to:', normalizedType);
  
  // Basic metrics calculated from message patterns
  const messageCounts = countMessagesByRole(messages);
  const sentimentAnalysis = analyzeSentiment(messages);
  const topicAnalysis = analyzeTopics(messages);
  const responsePatterns = analyzeResponsePatterns(messages);
  
  // Base metrics object with common fields
  const baseMetrics = {
    messageCount: messages.length,
    sentimentScore: sentimentAnalysis.overallScore,
    sentimentLabel: sentimentAnalysis.label,
    userMessageCount: messageCounts.user,
    contactMessageCount: messageCounts.contact,
    messageRatio: messageCounts.contact > 0 ? 
      (messageCounts.user / messageCounts.contact).toFixed(2) : 
      'N/A',
    averageResponseTime: responsePatterns.averageResponseTime,
    topTopics: topicAnalysis.topTopics,
    communicationStyle: responsePatterns.communicationStyle
  };
  console.log('Base metrics calculated:', baseMetrics);
  
  // Add relationship type-specific metrics
  switch (normalizedType) {
    case 'romantic':
      console.log('Calculating romantic metrics...');
      return {
        ...baseMetrics,
        emotionalHealthScore: `${Math.round(sentimentAnalysis.overallScore * 100)}%`,
        conflictFrequency: getConflictFrequency(messages),
        attachmentStyle: getAttachmentStyle(messages, responsePatterns),
        affectionLogisticsRatio: getAffectionLogisticsRatio(messages),
        intimacyLevel: getIntimacyLevel(messages),
        conflictResolutionPattern: getConflictResolutionPattern(messages),
        emotionalExpressiveness: getEmotionalExpressiveness(messages)
      };
      
    case 'friendship':
      console.log('Calculating friendship metrics...');
      return {
        ...baseMetrics,
        initiationBalance: getInitiationBalance(messageCounts, contactName),
        humorDepthRatio: getHumorDepthRatio(messages),
        vulnerabilityIndex: getVulnerabilityIndex(messages),
        longestGap: getLongestCommunicationGap(messages),
        supportPatterns: getSupportPatterns(messages),
        topicDiversity: topicAnalysis.diversityScore,
        engagementConsistency: getEngagementConsistency(messages)
      };
      
    case 'professional':
      console.log('Calculating professional metrics...');
      return {
        ...baseMetrics,
        professionalTone: getProfessionalTone(messages),
        powerDynamic: getPowerDynamic(messages),
        responseTime: getFormattedResponseTime(responsePatterns),
        taskSocialRatio: getTaskSocialRatio(messages),
        clarityIndex: getClarityIndex(messages),
        boundaryMaintenance: getBoundaryMaintenance(messages),
        collaborationStyle: getCollaborationStyle(messages)
      };
      
    case 'family':
      console.log('Calculating family metrics...');
      return {
        ...baseMetrics,
        familyPattern: getFamilyPattern(messages),
        emotionalWarmth: getEmotionalWarmth(messages),
        familyRole: getFamilyRole(messages),
        interactionFrequency: getInteractionFrequency(messages),
        generationGap: getGenerationGap(messages),
        traditionAutonomyBalance: getTraditionAutonomyBalance(messages),
        supportNetwork: getSupportNetwork(messages)
      };
      
    case 'mentor':
      console.log('Calculating mentor metrics...');
      return {
        ...baseMetrics,
        guidanceStyle: getGuidanceStyle(messages),
        feedbackBalance: getFeedbackBalance(messages),
        growthFocus: getGrowthFocus(messages),
        followThrough: getFollowThrough(messages),
        knowledgeTransfer: getKnowledgeTransfer(messages),
        goalSetting: getGoalSetting(messages),
        respectIndex: getRespectIndex(messages)
      };
      
    default:
      console.log('Using default metrics...');
      return baseMetrics;
  }
};

/**
 * Generate AI-based insights using OpenAI
 */
const generateAIInsights = async (relationshipType, contactName, messages, memories) => {
  try {
    // Normalize type
    const normalizedType = normalizeRelationshipType(relationshipType);
    
    // Sample a subset of messages to stay within token limits
    const messageSample = sampleMessages(messages, 30);
    
    // Format messages for the AI
    const messageText = messageSample.map(msg => {
      const role = msg.role === 'user' ? contactName : 'You';
      return `${role}: ${msg.content}`;
    }).join('\n');
    
    // Format memories for the AI
    const memoriesText = memories.length > 0 ? 
      memories.map(m => m.content).join('\n') : 
      'No stored memories available.';
    
    // Create prompt based on relationship type
    const prompt = `You are a relationship intelligence expert analyzing a ${normalizedType} relationship between the user and ${contactName}.
    
RELATIONSHIP TYPE: ${normalizedType}
NAME: ${contactName}

CONVERSATION SAMPLE:
${messageText}

STORED MEMORIES/INSIGHTS:
${memoriesText}

Based on this data, provide:
1. 5 key insights about this ${normalizedType} relationship
2. 3 personalized recommendations to improve the relationship

Focus specifically on patterns relevant to ${normalizedType} relationships, such as:
${getPromptAddendumForType(normalizedType)}

Format your response as JSON with "insights" and "recommendations" arrays.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a relationship analysis AI that provides helpful insights based on conversation patterns." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    try {
      const content = response.choices[0].message.content;
      const parsedResponse = JSON.parse(content);
      
      return {
        insights: parsedResponse.insights || [],
        recommendations: parsedResponse.recommendations || []
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Return basic insights if parsing fails
      return {
        insights: getBasicInsights(relationshipType, contactName),
        recommendations: getBasicRecommendations(relationshipType)
      };
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
    
    // Return basic insights if API call fails
    return {
      insights: getBasicInsights(relationshipType, contactName),
      recommendations: getBasicRecommendations(relationshipType)
    };
  }
};

/**
 * Get relationship type-specific prompt addendum for AI
 */
const getPromptAddendumForType = (type) => {
  switch (type) {
    case 'romantic':
      return "- Emotional health indicators\n- Conflict patterns and resolution\n- Attachment styles\n- Balance of affection vs. practical communication\n- Intimacy and vulnerability";
      
    case 'friendship':
      return "- Communication initiation balance\n- Humor vs. emotional depth\n- Shared vulnerability\n- Consistency and reliability\n- Support patterns";
      
    case 'professional':
      return "- Professional tone and formality\n- Power dynamics\n- Task focus vs. relationship building\n- Response times and priorities\n- Clarity and effectiveness";
      
    case 'family':
      return "- Family roles and dynamics\n- Emotional expression\n- Support patterns\n- Generational differences\n- Tradition vs. autonomy balance";
      
    case 'mentor':
      return "- Guidance and teaching style\n- Feedback balance (praise vs. criticism)\n- Growth focus areas\n- Goal setting and follow-through\n- Knowledge transfer effectiveness";
      
    default:
      return "- Overall communication patterns\n- Emotional tone\n- Balance of give and take\n- Response patterns\n- Areas for improvement";
  }
};

/**
 * Normalize relationship type for consistent handling
 */
const normalizeRelationshipType = (type) => {
  if (!type) return 'other';
  
  type = type.toLowerCase();
  
  if (type === 'partner' || type.includes('romantic')) return 'romantic';
  if (type === 'friend' || type.includes('friendship')) return 'friendship';
  if (type === 'colleague' || type.includes('professional') || type.includes('work')) return 'professional';
  if (type === 'family' || type.includes('family')) return 'family';
  if (type === 'mentor' || type === 'mentee' || type.includes('mentor')) return 'mentor';
  
  return 'other';
};

/**
 * Count messages by sender role
 */
const countMessagesByRole = (messages) => {
  return messages.reduce((counts, msg) => {
    const role = msg.role === 'user' ? 'contact' : 'user';
    counts[role] += 1;
    return counts;
  }, { user: 0, contact: 0 });
};

/**
 * Simple sentiment analysis on message content
 */
const analyzeSentiment = (messages) => {
  // Positive and negative word lists
  const positiveWords = [
    'good', 'great', 'happy', 'love', 'enjoy', 'wonderful', 'excellent', 
    'amazing', 'fantastic', 'awesome', 'nice', 'thank', 'thanks', 'grateful',
    'appreciate', 'pleased', 'excited', 'glad', 'joy', 'beautiful', 'perfect'
  ];
  
  const negativeWords = [
    'bad', 'sad', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'unfortunate',
    'sorry', 'upset', 'annoyed', 'disappointed', 'frustrating', 'worried', 'upset',
    'unhappy', 'dislike', 'problem', 'issue', 'trouble', 'fail', 'wrong', 'mistake'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let totalWords = 0;
  
  // Count sentiment words in messages
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const words = msg.content.toLowerCase().split(/\s+/);
    totalWords += words.length;
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      if (positiveWords.includes(cleanWord)) positiveCount++;
      if (negativeWords.includes(cleanWord)) negativeCount++;
    });
  });
  
  // Calculate sentiment score (-1 to 1)
  const total = positiveCount + negativeCount;
  const sentimentScore = total > 0 ? 
    (positiveCount - negativeCount) / total : 
    0;
  
  // Determine sentiment label
  let label = 'neutral';
  if (sentimentScore > 0.3) label = 'positive';
  if (sentimentScore > 0.6) label = 'very positive';
  if (sentimentScore < -0.3) label = 'challenging';
  if (sentimentScore < -0.6) label = 'very challenging';
  
  return {
    overallScore: sentimentScore,
    label,
    positiveWords: positiveCount,
    negativeWords: negativeCount,
    intensity: total / (totalWords || 1)
  };
};

/**
 * Basic topic analysis on message content
 */
const analyzeTopics = (messages) => {
  // Topic keywords
  const topicKeywords = {
    'Work': ['work', 'job', 'office', 'meeting', 'project', 'boss', 'client', 'deadline'],
    'Family': ['family', 'kids', 'parents', 'mom', 'dad', 'sister', 'brother', 'child'],
    'Emotions': ['feel', 'happy', 'sad', 'angry', 'love', 'miss', 'emotional', 'stress'],
    'Plans': ['plan', 'tomorrow', 'weekend', 'meet', 'schedule', 'soon', 'later', 'next'],
    'Activities': ['movie', 'dinner', 'lunch', 'coffee', 'go', 'watch', 'eat', 'cook'],
    'Health': ['sick', 'doctor', 'health', 'exercise', 'sleep', 'gym', 'tired', 'rest'],
    'Personal Growth': ['learn', 'goal', 'future', 'change', 'better', 'improve', 'progress'],
    'Logistics': ['time', 'place', 'location', 'when', 'where', 'how', 'get', 'bring'],
    'Humor': ['lol', 'haha', 'funny', 'joke', 'laugh', '😂', '🤣', 'hilarious'],
    'Support': ['help', 'support', 'there for you', 'understand', 'listen', 'care']
  };
  
  const topicCounts = {};
  Object.keys(topicKeywords).forEach(topic => {
    topicCounts[topic] = 0;
  });
  
  // Count topics in messages
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          topicCounts[topic]++;
          return; // Count each topic only once per message
        }
      });
    });
  });
  
  // Sort topics by frequency
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({
      name: topic,
      count,
      percentage: Math.round((count / messages.length) * 100)
    }));
  
  // Calculate topic diversity (0-1)
  const totalMentions = Object.values(topicCounts).reduce((sum, count) => sum + count, 0);
  const topicDistribution = Object.values(topicCounts).map(count => count / totalMentions);
  
  // Shannon entropy calculation for diversity
  const diversityScore = topicDistribution
    .filter(p => p > 0)
    .reduce((entropy, p) => entropy - p * Math.log2(p), 0) / Math.log2(topicDistribution.length);
  
  return {
    topTopics: sortedTopics.slice(0, 5),
    allTopics: sortedTopics,
    diversityScore: Math.min(Math.max(diversityScore, 0), 1).toFixed(2),
    topicMentions: totalMentions
  };
};

/**
 * Analyze response patterns between messages
 */
const analyzeResponsePatterns = (messages) => {
  // Initialize metrics
  let responseTimes = [];
  let userAvgResponseTime = 0;
  let contactAvgResponseTime = 0;
  let userResponseCount = 0;
  let contactResponseCount = 0;
  
  // Calculate response times
  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i-1];
    const currMsg = messages[i];
    
    // Skip if messages are from the same person
    if (prevMsg.role === currMsg.role) continue;
    
    // Get timestamps
    const prevTime = prevMsg.timestamp || prevMsg.createdAt || new Date(0);
    const currTime = currMsg.timestamp || currMsg.createdAt || new Date(0);
    
    // Calculate time difference in minutes
    const timeDiff = (new Date(currTime) - new Date(prevTime)) / (1000 * 60);
    
    // Skip outliers (responses after more than a day)
    if (timeDiff > 24 * 60) continue;
    
    responseTimes.push(timeDiff);
    
    // Track by responder
    if (currMsg.role === 'user') {
      userResponseCount++;
      userAvgResponseTime += timeDiff;
    } else {
      contactResponseCount++;
      contactAvgResponseTime += timeDiff;
    }
  }
  
  // Calculate averages
  if (userResponseCount > 0) {
    userAvgResponseTime /= userResponseCount;
  }
  
  if (contactResponseCount > 0) {
    contactAvgResponseTime /= contactResponseCount;
  }
  
  const overallAvgResponseTime = responseTimes.length > 0 ?
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length :
    0;
  
  // Determine communication style
  let communicationStyle = 'balanced';
  
  if (userAvgResponseTime < contactAvgResponseTime * 0.5) {
    communicationStyle = 'you respond quickly';
  } else if (contactAvgResponseTime < userAvgResponseTime * 0.5) {
    communicationStyle = 'they respond quickly';
  }
  
  if (userResponseCount > contactResponseCount * 1.5) {
    communicationStyle = 'you initiate more';
  } else if (contactResponseCount > userResponseCount * 1.5) {
    communicationStyle = 'they initiate more';
  }
  
  return {
    averageResponseTime: formatMinutes(overallAvgResponseTime),
    userAvgResponseTime: formatMinutes(userAvgResponseTime),
    contactAvgResponseTime: formatMinutes(contactAvgResponseTime),
    userResponseCount,
    contactResponseCount,
    communicationStyle
  };
};

/**
 * Format minutes into a human-readable format
 */
const formatMinutes = (minutes) => {
  if (isNaN(minutes) || minutes === 0) return 'N/A';
  
  if (minutes < 1) {
    return 'less than a minute';
  } else if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} min` : ''}`;
  }
};

/**
 * Get basic metrics when not enough data is available
 */
const getBasicMetrics = (relationshipType) => {
  const normalizedType = normalizeRelationshipType(relationshipType);
  
  switch (normalizedType) {
    case 'romantic':
      return {
        emotionalHealthScore: 'Not enough data',
        conflictFrequency: 'Infrequent',
        attachmentStyle: 'Not determined',
        affectionLogisticsRatio: 'Not enough data'
      };
      
    case 'friendship':
      return {
        initiationBalance: 'Not enough data',
        humorDepthRatio: 'Not enough data',
        vulnerabilityIndex: 'Low',
        longestGap: 'Not enough data'
      };
      
    case 'professional':
      return {
        professionalTone: 'Task-oriented',
        powerDynamic: 'Not enough data',
        responseTime: 'Not enough data',
        taskSocialRatio: 'Not enough data'
      };
      
    case 'family':
      return {
        familyPattern: 'Supportive',
        emotionalWarmth: 'Medium',
        familyRole: 'Not enough data',
        interactionFrequency: 'Not enough data'
      };
      
    case 'mentor':
      return {
        guidanceStyle: 'Not enough data',
        feedbackBalance: 'Not enough data',
        growthFocus: 'Not enough data',
        followThrough: 'Not enough data'
      };
      
    default:
      return {
        communicationStyle: 'Not enough data',
        emotionalTone: 'Not enough data',
        interactionFrequency: 'Not enough data',
        connectionLevel: 'Not enough data'
      };
  }
};

/**
 * Get basic insights when not enough data is available
 */
const getBasicInsights = (relationshipType, contactName) => {
  const normalizedType = normalizeRelationshipType(relationshipType);
  
  switch (normalizedType) {
    case 'romantic':
      return [
        `Your conversations with ${contactName} show potential for a healthy romantic relationship.`,
        'To deepen your connection, share more about your feelings and needs.',
        'Import more chat history to reveal detailed emotional patterns in your relationship.'
      ];
      
    case 'friendship':
      return [
        `Your friendship with ${contactName} appears to be developing positively.`,
        'Friends who communicate consistently tend to maintain stronger bonds over time.',
        'Import more chat history to see friendship dynamics and mutual interests.'
      ];
      
    case 'professional':
      return [
        `Your professional relationship with ${contactName} shows a task-focused pattern.`,
        'Clear communication is essential for effective professional relationships.',
        'Import more work conversations to analyze collaboration styles and workflow patterns.'
      ];
      
    case 'family':
      return [
        `Family connections like yours with ${contactName} benefit from regular communication.`,
        'Family relationships often blend practical coordination with emotional support.',
        'Import more family conversations to better understand your unique dynamic.'
      ];
      
    case 'mentor':
      return [
        `Your mentor/mentee relationship with ${contactName} has potential for growth.`,
        'Effective mentoring relationships balance guidance with autonomy.',
        'Import more conversations to analyze knowledge sharing and growth patterns.'
      ];
      
    default:
      return [
        `Your relationship with ${contactName} shows positive communication patterns.`,
        'Regular, balanced conversations help build stronger connections over time.',
        'Import more chat history to reveal detailed patterns and insights.'
      ];
  }
};

/**
 * Get basic recommendations when not enough data is available
 */
const getBasicRecommendations = (relationshipType) => {
  const normalizedType = normalizeRelationshipType(relationshipType);
  
  switch (normalizedType) {
    case 'romantic':
      return [
        'Schedule regular quality time without distractions to deepen your connection.',
        'Practice active listening by paraphrasing what your partner says before responding.',
        'Express appreciation regularly for specific things you value about your partner.'
      ];
      
    case 'friendship':
      return [
        'Check in periodically even during busy periods to maintain connection.',
        'Share personal challenges when appropriate to build trust through vulnerability.',
        'Plan activities around shared interests to strengthen your friendship bond.'
      ];
      
    case 'professional':
      return [
        'Be clear about deadlines and expectations to avoid miscommunication.',
        'Acknowledge contributions and express appreciation for good work.',
        'Balance task-focused communication with occasional rapport-building conversation.'
      ];
      
    case 'family':
      return [
        'Create regular family check-in times, whether in person or virtual.',
        'Acknowledge differences in communication styles across generations.',
        'Express affection directly, even in families that tend to be more practical.'
      ];
      
    case 'mentor':
      return [
        'Balance giving advice with asking questions that promote self-discovery.',
        'Set clear goals and expectations for the mentoring relationship.',
        'Share relevant personal experiences while keeping focus on the mentees growth.'
      ];
      
    default:
      return [
        'Practice active listening by focusing fully on the other person when they speak.',
        'Express appreciation regularly for specific qualities you value in the relationship.',
        'Be consistent in your communication patterns to build trust and reliability.'
      ];
  }
};

// Helper functions for relationship-specific metrics
// These would normally contain complex logic but are simplified here

const getConflictFrequency = (messages) => {
  // Simple implementation - would be more sophisticated in production
  const conflictWords = ['sorry', 'disagree', 'wrong', 'misunderstanding', 'upset'];
  
  let conflictCount = 0;
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    conflictWords.forEach(word => {
      if (content.includes(word)) conflictCount++;
    });
  });
  
  const frequency = conflictCount / (messages.length / 20); // Per 20 messages
  
  if (frequency < 0.5) return 'Rare';
  if (frequency < 1) return 'Occasional';
  if (frequency < 2) return 'Moderate';
  return 'Frequent';
};

const getAttachmentStyle = (messages, responsePatterns) => {
  // Simplified implementation
  const anxiousWords = ['miss', 'worried', 'alone', 'afraid', 'need'];
  const avoidantWords = ['busy', 'space', 'later', 'work', 'time'];
  const secureWords = ['understand', 'support', 'feel', 'share', 'together'];
  
  let anxiousCount = 0;
  let avoidantCount = 0;
  let secureCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    anxiousWords.forEach(word => {
      if (content.includes(word)) anxiousCount++;
    });
    
    avoidantWords.forEach(word => {
      if (content.includes(word)) avoidantCount++;
    });
    
    secureWords.forEach(word => {
      if (content.includes(word)) secureCount++;
    });
  });
  
  // Factor in response patterns
  const { userAvgResponseTime, contactAvgResponseTime } = responsePatterns;
  
  // Convert response times from string to number if needed
  const userTime = typeof userAvgResponseTime === 'string' ? 
    parseFloat(userAvgResponseTime) || 0 : 
    userAvgResponseTime || 0;
    
  const contactTime = typeof contactAvgResponseTime === 'string' ? 
    parseFloat(contactAvgResponseTime) || 0 : 
    contactAvgResponseTime || 0;
  
  // Response time ratios can indicate attachment styles
  if (userTime < 10 && contactTime > 60) {
    anxiousCount += 3; // Quick user responses but slow partner responses
  }
  
  if (userTime > 60 && contactTime < 10) {
    avoidantCount += 3; // Slow user responses but quick partner responses
  }
  
  if (Math.abs(userTime - contactTime) < 15) {
    secureCount += 3; // Similar response times
  }
  
  // Determine predominant style
  if (anxiousCount > avoidantCount && anxiousCount > secureCount) {
    return 'Anxious tendencies';
  }
  
  if (avoidantCount > anxiousCount && avoidantCount > secureCount) {
    return 'Avoidant tendencies';
  }
  
  if (secureCount > anxiousCount && secureCount > avoidantCount) {
    return 'Secure';
  }
  
  return 'Mixed styles';
};

const getAffectionLogisticsRatio = (messages) => {
  // Categorize messages as affection or logistics
  const affectionWords = ['love', 'miss', 'care', 'feel', 'heart', 'hug', 'kiss', '❤️', '😘'];
  const logisticsWords = ['when', 'where', 'time', 'plan', 'schedule', 'meet', 'bring', 'get'];
  
  let affectionCount = 0;
  let logisticsCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    let isAffection = false;
    let isLogistics = false;
    
    // Check for affection markers
    affectionWords.forEach(word => {
      if (content.includes(word)) isAffection = true;
    });
    
    // Check for logistics markers
    logisticsWords.forEach(word => {
      if (content.includes(word)) isLogistics = true;
    });
    
    if (isAffection) affectionCount++;
    if (isLogistics) logisticsCount++;
  });
  
  const total = affectionCount + logisticsCount || 1; // Avoid division by zero
  const affectionPercent = Math.round((affectionCount / total) * 100);
  const logisticsPercent = Math.round((logisticsCount / total) * 100);
  
  return `${affectionPercent}% / ${logisticsPercent}%`;
};

const getIntimacyLevel = (messages) => {
  // Words that might indicate emotional intimacy
  const intimacyWords = [
    'feel', 'love', 'trust', 'share', 'honest', 'open', 'vulnerable',
    'deep', 'emotion', 'heart', 'intimate', 'close', 'connection'
  ];
  
  let intimacyCount = 0;
  const recentMessages = messages.slice(-50); // Focus on recent messages
  
  recentMessages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    intimacyWords.forEach(word => {
      if (content.includes(word)) intimacyCount++;
    });
  });
  
  const intimacyRatio = intimacyCount / recentMessages.length;
  
  if (intimacyRatio < 0.05) return 'Surface level';
  if (intimacyRatio < 0.1) return 'Casual';
  if (intimacyRatio < 0.2) return 'Developing';
  if (intimacyRatio < 0.3) return 'Connected';
  return 'Deeply connected';
};

const getConflictResolutionPattern = (messages) => {
  // Simple implementation - analyzing messaging after conflict words
  const conflictWords = ['sorry', 'disagree', 'upset', 'angry', 'frustrated', 'misunderstanding'];
  const resolutionWords = ['understand', 'apologize', 'resolve', 'talk', 'listen', 'compromise'];
  
  let conflictResolved = 0;
  let conflictUnresolved = 0;
  
  // Look for conflict followed by resolution within next 5 messages
  for (let i = 0; i < messages.length - 5; i++) {
    if (!messages[i].content || typeof messages[i].content !== 'string') continue;
    
    const content = messages[i].content.toLowerCase();
    let hasConflict = false;
    
    // Check if message contains conflict words
    conflictWords.forEach(word => {
      if (content.includes(word)) hasConflict = true;
    });
    
    if (hasConflict) {
      // Check next 5 messages for resolution
      let resolved = false;
      for (let j = i + 1; j < i + 6 && j < messages.length; j++) {
        if (!messages[j].content || typeof messages[j].content !== 'string') continue;
        
        const nextContent = messages[j].content.toLowerCase();
        resolutionWords.forEach(word => {
          if (nextContent.includes(word)) resolved = true;
        });
      }
      
      if (resolved) {
        conflictResolved++;
      } else {
        conflictUnresolved++;
      }
    }
  }
  
  const total = conflictResolved + conflictUnresolved;
  
  if (total === 0) return 'No conflicts detected';
  
  const resolutionRate = (conflictResolved / total) * 100;
  
  if (resolutionRate > 80) return 'Excellent conflict resolution';
  if (resolutionRate > 60) return 'Good conflict resolution';
  if (resolutionRate > 40) return 'Mixed conflict resolution';
  if (resolutionRate > 20) return 'Struggles with resolution';
  return 'Poor conflict resolution';
};

const getEmotionalExpressiveness = (messages) => {
  // Analyze emotional language and emoji usage
  const emotionWords = [
    'happy', 'sad', 'angry', 'love', 'hate', 'excited', 'nervous',
    'worried', 'anxious', 'proud', 'disappointed', 'hurt', 'grateful'
  ];
  
  const emojiPattern = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  
  let emotionWordCount = 0;
  let emojiCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content;
    
    // Count emotion words
    emotionWords.forEach(word => {
      if (content.toLowerCase().includes(word)) emotionWordCount++;
    });
    
    // Count emojis
    const emojiMatches = content.match(emojiPattern);
    if (emojiMatches) emojiCount += emojiMatches.length;
  });
  
  const expressiveness = (emotionWordCount + emojiCount) / messages.length;
  
  if (expressiveness < 0.1) return 'Reserved';
  if (expressiveness < 0.2) return 'Moderate';
  if (expressiveness < 0.4) return 'Expressive';
  return 'Highly expressive';
};

// Friendship-specific metrics
const getInitiationBalance = (messageCounts, contactName) => {
  // Using message counts as a proxy for initiation
  const { user, contact } = messageCounts;
  const total = user + contact || 1; // Avoid division by zero
  
  const userPercent = Math.round((user / total) * 100);
  const contactPercent = Math.round((contact / total) * 100);
  
  if (Math.abs(userPercent - contactPercent) <= 10) {
    return `Balanced (${userPercent}% / ${contactPercent}%)`;
  } else if (userPercent > contactPercent) {
    return `You initiate more (${userPercent}% / ${contactPercent}%)`;
  } else {
    return `${contactName} initiates more (${contactPercent}% / ${userPercent}%)`;
  }
};

const getHumorDepthRatio = (messages) => {
  // Detect humor vs. deeper conversation
  const humorIndicators = ['lol', 'haha', 'hehe', 'lmao', 'rofl', 'funny', 'joke', '😂', '🤣'];
  const depthIndicators = [
    'feel', 'think', 'believe', 'important', 'value', 'change',
    'future', 'goals', 'life', 'relationship', 'serious', 'honestly'
  ];
  
  let humorCount = 0;
  let depthCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    let hasHumor = false;
    let hasDepth = false;
    
    // Check for humor
    humorIndicators.forEach(indicator => {
      if (content.includes(indicator)) hasHumor = true;
    });
    
    // Check for depth
    depthIndicators.forEach(indicator => {
      if (content.includes(indicator)) hasDepth = true;
    });
    
    if (hasHumor) humorCount++;
    if (hasDepth) depthCount++;
  });
  
  const total = humorCount + depthCount || 1; // Avoid division by zero
  const humorPercent = Math.round((humorCount / total) * 100);
  const depthPercent = Math.round((depthCount / total) * 100);
  
  return `${humorPercent}% / ${depthPercent}%`;
};

const getVulnerabilityIndex = (messages) => {
  // Words that might indicate vulnerability
  const vulnerabilityWords = [
    'afraid', 'worried', 'scared', 'nervous', 'anxious', 'stressed',
    'struggling', 'hard time', 'difficult', 'challenge', 'hurt', 'pain',
    'sad', 'depressed', 'lonely', 'insecure', 'failure', 'mistake'
  ];
  
  let vulnerabilityCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    vulnerabilityWords.forEach(word => {
      if (content.includes(word)) vulnerabilityCount++;
    });
  });
  
  const vulnerabilityRatio = vulnerabilityCount / messages.length;
  
  if (vulnerabilityRatio < 0.05) return 'Very low';
  if (vulnerabilityRatio < 0.1) return 'Low';
  if (vulnerabilityRatio < 0.15) return 'Medium';
  if (vulnerabilityRatio < 0.2) return 'High';
  return 'Very high';
};

const getLongestCommunicationGap = (messages) => {
  if (messages.length < 2) return 'Not enough data';
  
  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = a.timestamp || a.createdAt || new Date(0);
    const timeB = b.timestamp || b.createdAt || new Date(0);
    return new Date(timeA) - new Date(timeB);
  });
  
  let longestGap = 0;
  
  for (let i = 1; i < sortedMessages.length; i++) {
    const prevTime = sortedMessages[i-1].timestamp || sortedMessages[i-1].createdAt || new Date(0);
    const currTime = sortedMessages[i].timestamp || sortedMessages[i].createdAt || new Date(0);
    
    const gap = (new Date(currTime) - new Date(prevTime)) / (1000 * 60 * 60 * 24); // in days
    
    if (gap > longestGap) longestGap = gap;
  }
  
  if (longestGap < 1) return 'Less than a day';
  if (longestGap < 7) return `${Math.round(longestGap)} days`;
  if (longestGap < 30) return `${Math.round(longestGap / 7)} weeks`;
  if (longestGap < 365) return `${Math.round(longestGap / 30)} months`;
  return `${Math.round(longestGap / 365)} years`;
};

const getSupportPatterns = (messages) => {
  // Words that might indicate support
  const supportWords = [
    'here for you', 'support', 'help', 'understand', 'listen',
    'there for you', 'got you', 'got your back', 'care'
  ];
  
  let supportCount = 0;
  let userSupportGiven = 0;
  let contactSupportGiven = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    let hasSupport = false;
    
    supportWords.forEach(word => {
      if (content.includes(word)) hasSupport = true;
    });
    
    if (hasSupport) {
      supportCount++;
      if (msg.role === 'user') {
        userSupportGiven++;
      } else {
        contactSupportGiven++;
      }
    }
  });
  
  if (supportCount === 0) return 'No support patterns detected';
  
  if (userSupportGiven > contactSupportGiven * 2) {
    return 'You provide more support';
  } else if (contactSupportGiven > userSupportGiven * 2) {
    return 'They provide more support';
  } else {
    return 'Mutual support';
  }
};

const getEngagementConsistency = (messages) => {
  if (messages.length < 10) return 'Not enough data';
  
  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = a.timestamp || a.createdAt || new Date(0);
    const timeB = b.timestamp || b.createdAt || new Date(0);
    return new Date(timeA) - new Date(timeB);
  });
  
  const gaps = [];
  
  for (let i = 1; i < sortedMessages.length; i++) {
    const prevTime = sortedMessages[i-1].timestamp || sortedMessages[i-1].createdAt || new Date(0);
    const currTime = sortedMessages[i].timestamp || sortedMessages[i].createdAt || new Date(0);
    
    const gap = (new Date(currTime) - new Date(prevTime)) / (1000 * 60 * 60); // in hours
    
    // Skip outliers (gaps > 1 week)
    if (gap < 24 * 7) {
      gaps.push(gap);
    }
  }
  
  if (gaps.length === 0) return 'Inconsistent';
  
  // Calculate standard deviation
  const avg = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avg, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  
  // Coefficient of variation (normalized standard deviation)
  const cv = stdDev / avg;
  
  if (cv < 0.5) return 'Very consistent';
  if (cv < 1) return 'Consistent';
  if (cv < 1.5) return 'Somewhat consistent';
  return 'Inconsistent';
};

// Professional relationship metrics
const getProfessionalTone = (messages) => {
  // Words that indicate formal/professional tone
  const formalWords = [
    'meeting', 'deadline', 'project', 'report', 'client', 'document',
    'please', 'thank you', 'regards', 'sincerely', 'forward', 'discuss'
  ];
  
  // Words that indicate casual tone
  const casualWords = [
    'hey', 'btw', 'lol', 'cool', 'awesome', 'yeah', 'haha',
    'gonna', 'wanna', 'cuz', 'u', 'r', 'tbh', 'idk'
  ];
  
  let formalCount = 0;
  let casualCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    formalWords.forEach(word => {
      if (content.includes(word)) formalCount++;
    });
    
    casualWords.forEach(word => {
      if (content.includes(word)) casualCount++;
    });
  });
  
  const total = formalCount + casualCount || 1; // Avoid division by zero
  const formalPercent = Math.round((formalCount / total) * 100);
  const casualPercent = Math.round((casualCount / total) * 100);
  
  if (formalPercent > 80) return 'Highly formal';
  if (formalPercent > 60) return 'Formal';
  if (formalPercent > 40) return 'Mixed formal/casual';
  if (formalPercent > 20) return 'Casual';
  return 'Very casual';
};

const getPowerDynamic = (messages) => {
  // Words that might indicate hierarchy
  const directiveWords = ['need', 'should', 'must', 'require', 'assign', 'due', 'deadline'];
  const questionWords = ['could you', 'would you', 'can you', 'please', 'if possible', 'when you get a chance'];
  
  let userDirectives = 0;
  let contactDirectives = 0;
  let userQuestions = 0;
  let contactQuestions = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    let hasDirective = false;
    let hasQuestion = false;
    
    directiveWords.forEach(word => {
      if (content.includes(word)) hasDirective = true;
    });
    
    questionWords.forEach(word => {
      if (content.includes(word)) hasQuestion = true;
    });
    
    if (msg.role === 'user') {
      if (hasDirective) userDirectives++;
      if (hasQuestion) userQuestions++;
    } else {
      if (hasDirective) contactDirectives++;
      if (hasQuestion) contactQuestions++;
    }
  });
  
  // Calculate directive-question ratio
  const userRatio = userQuestions > 0 ? userDirectives / userQuestions : userDirectives;
  const contactRatio = contactQuestions > 0 ? contactDirectives / contactQuestions : contactDirectives;
  
  if (userRatio > contactRatio * 2) {
    return 'You appear more directive';
  } else if (contactRatio > userRatio * 2) {
    return 'They appear more directive';
  } else {
    return 'Equal collaboration';
  }
};

const getFormattedResponseTime = (responsePatterns) => {
  const { userAvgResponseTime, contactAvgResponseTime } = responsePatterns;
  return `You: ${userAvgResponseTime} | Them: ${contactAvgResponseTime}`;
};

const getTaskSocialRatio = (messages) => {
  // Task-related words
  const taskWords = [
    'work', 'project', 'deadline', 'meeting', 'task', 'document',
    'report', 'client', 'update', 'status', 'progress', 'complete'
  ];
  
  // Social-related words
  const socialWords = [
    'weekend', 'dinner', 'lunch', 'family', 'vacation', 'holiday',
    'break', 'fun', 'enjoy', 'plan', 'personal', 'home', 'life'
  ];
  
  let taskCount = 0;
  let socialCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    let hasTask = false;
    let hasSocial = false;
    
    taskWords.forEach(word => {
      if (content.includes(word)) hasTask = true;
    });
    
    socialWords.forEach(word => {
      if (content.includes(word)) hasSocial = true;
    });
    
    if (hasTask) taskCount++;
    if (hasSocial) socialCount++;
  });
  
  const total = taskCount + socialCount || 1; // Avoid division by zero
  const taskPercent = Math.round((taskCount / total) * 100);
  const socialPercent = Math.round((socialCount / total) * 100);
  
  return `${taskPercent}% / ${socialPercent}%`;
};

const getClarityIndex = (messages) => {
  // Clarity indicators
  const clarityWords = [
    'clear', 'understand', 'specific', 'details', 'exactly',
    'precisely', 'timeline', 'expectations', 'requirements'
  ];
  
  // Confusion indicators
  const confusionWords = [
    'confused', 'unclear', 'not sure', 'clarify', 'what do you mean',
    'don\'t understand', 'vague', 'ambiguous', 'explain again'
  ];
  
  let clarityCount = 0;
  let confusionCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    clarityWords.forEach(word => {
      if (content.includes(word)) clarityCount++;
    });
    
    confusionWords.forEach(word => {
      if (content.includes(word)) confusionCount++;
    });
  });
  
  // More clarity words and fewer confusion words = higher clarity
  const clarityScore = (clarityCount - confusionCount) / messages.length;
  
  if (clarityScore < -0.05) return 'Low clarity';
  if (clarityScore < 0.05) return 'Average clarity';
  if (clarityScore < 0.1) return 'Good clarity';
  return 'Excellent clarity';
};

const getBoundaryMaintenance = (messages) => {
  // Professional boundary words
  const boundaryWords = [
    'business hours', 'work hours', 'schedule', 'availability',
    'next week', 'during work', 'professional', 'working relationship'
  ];
  
  // Personal crossover words
  const personalWords = [
    'family', 'personal', 'vacation', 'weekend plans', 'home life',
    'dating', 'relationship', 'private', 'outside work'
  ];
  
  let boundaryCount = 0;
  let personalCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    boundaryWords.forEach(word => {
      if (content.includes(word)) boundaryCount++;
    });
    
    personalWords.forEach(word => {
      if (content.includes(word)) personalCount++;
    });
  });
  
  const ratio = personalCount / (boundaryCount || 1);
  
  if (ratio < 0.5) return 'Strong boundaries';
  if (ratio < 1) return 'Clear boundaries';
  if (ratio < 2) return 'Flexible boundaries';
  return 'Blended personal/professional';
};

const getCollaborationStyle = (messages) => {
  // Collaboration indicators
  const collaborativeWords = [
    'we', 'us', 'our', 'team', 'together', 'collaborate', 'feedback',
    'ideas', 'suggest', 'thoughts', 'input', 'help', 'assist'
  ];
  
  // Independent work indicators
  const independentWords = [
    'I', 'my', 'me', 'mine', 'handle', 'take care of', 'complete',
    'finish', 'assign', 'responsible', 'ownership', 'lead'
  ];
  
  let collaborativeCount = 0;
  let independentCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    collaborativeWords.forEach(word => {
      if (content.match(new RegExp(`\\b${word}\\b`, 'i'))) collaborativeCount++;
    });
    
    independentWords.forEach(word => {
      if (content.match(new RegExp(`\\b${word}\\b`, 'i'))) independentCount++;
    });
  });
  
  const total = collaborativeCount + independentCount || 1;
  const collaborativePercent = Math.round((collaborativeCount / total) * 100);
  
  if (collaborativePercent > 80) return 'Highly collaborative';
  if (collaborativePercent > 60) return 'Collaborative';
  if (collaborativePercent > 40) return 'Balanced';
  if (collaborativePercent > 20) return 'Independent-focused';
  return 'Highly independent';
};

// Family relationship metrics
const getFamilyPattern = (messages) => {
  // Support-oriented words
  const supportWords = [
    'help', 'support', 'there for you', 'family', 'care', 'love',
    'proud', 'appreciate', 'grateful', 'thanks'
  ];
  
  // Practical coordination words
  const practicalWords = [
    'time', 'when', 'visit', 'holiday', 'birthday', 'dinner',
    'gather', 'event', 'plans', 'schedule', 'coming'
  ];
  
  // Advice or guidance words
  const adviceWords = [
    'should', 'need to', 'better', 'advice', 'suggest', 'recommend',
    'consider', 'try', 'important', 'listen'
  ];
  
  let supportCount = 0;
  let practicalCount = 0;
  let adviceCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    supportWords.forEach(word => {
      if (content.includes(word)) supportCount++;
    });
    
    practicalWords.forEach(word => {
      if (content.includes(word)) practicalCount++;
    });
    
    adviceWords.forEach(word => {
      if (content.includes(word)) adviceCount++;
    });
  });
  
  const total = supportCount + practicalCount + adviceCount || 1;
  
  if (supportCount > practicalCount && supportCount > adviceCount) {
    return 'Support-oriented';
  } else if (practicalCount > supportCount && practicalCount > adviceCount) {
    return 'Coordination-focused';
  } else if (adviceCount > supportCount && adviceCount > practicalCount) {
    return 'Guidance-centered';
  } else {
    return 'Balanced family dynamic';
  }
};

const getEmotionalWarmth = (messages) => {
  // Warmth indicators
  const warmthWords = [
    'love', 'miss', 'care', 'proud', 'hug', 'kiss', 'heart', 
    'family', 'together', 'appreciate', 'happy', 'joy'
  ];
  
  // Affection indicators
  const affectionSymbols = ['❤️', '😘', '🥰', '💕', '♥️', '💖', '💓', '💗', '💞'];
  
  let warmthCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content;
    
    warmthWords.forEach(word => {
      if (content.toLowerCase().includes(word)) warmthCount++;
    });
    
    affectionSymbols.forEach(symbol => {
      if (content.includes(symbol)) warmthCount += 2; // Emojis count more
    });
  });
  
  const warmthRatio = warmthCount / messages.length;
  
  if (warmthRatio < 0.1) return 'Formal/reserved';
  if (warmthRatio < 0.2) return 'Moderately warm';
  if (warmthRatio < 0.4) return 'Warm';
  return 'Very affectionate';
};

const getFamilyRole = (messages) => {
  // Words that indicate caretaking
  const caretakingWords = [
    'take care', 'help', 'need anything', 'check on', 'make sure',
    'remind', 'appointment', 'doctor', 'medicine', 'health'
  ];
  
  // Words that indicate emotional support
  const emotionalSupportWords = [
    'listen', 'understand', 'feel', 'support', 'there for you',
    'sorry to hear', 'must be hard', 'thinking of you'
  ];
  
  // Words that indicate advice-giving
  const adviceWords = [
    'should', 'need to', 'have to', 'would be better', 'consider',
    'try', 'recommend', 'suggestion', 'advice', 'opinion'
  ];
  
  let caretakingCount = 0;
  let emotionalSupportCount = 0;
  let adviceCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string' || msg.role !== 'user') return;
    
    const content = msg.content.toLowerCase();
    
    caretakingWords.forEach(word => {
      if (content.includes(word)) caretakingCount++;
    });
    
    emotionalSupportWords.forEach(word => {
      if (content.includes(word)) emotionalSupportCount++;
    });
    
    adviceWords.forEach(word => {
      if (content.includes(word)) adviceCount++;
    });
  });
  
  // Determine predominant role
  if (caretakingCount > emotionalSupportCount && caretakingCount > adviceCount) {
    return 'Caretaker';
  } else if (emotionalSupportCount > caretakingCount && emotionalSupportCount > adviceCount) {
    return 'Emotional supporter';
  } else if (adviceCount > caretakingCount && adviceCount > emotionalSupportCount) {
    return 'Advisor';
  } else {
    return 'Balanced supporter';
  }
};

const getInteractionFrequency = (messages) => {
  if (messages.length < 5) return 'Not enough data';
  
  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = a.timestamp || a.createdAt || new Date(0);
    const timeB = b.timestamp || b.createdAt || new Date(0);
    return new Date(timeA) - new Date(timeB);
  });
  
  // Calculate the date range
  const firstDate = new Date(sortedMessages[0].timestamp || sortedMessages[0].createdAt || new Date(0));
  const lastDate = new Date(sortedMessages[sortedMessages.length - 1].timestamp || sortedMessages[sortedMessages.length - 1].createdAt || new Date(0));
  
  // Calculate days between first and last message
  const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
  
  // Calculate average messages per day
  const messagesPerDay = messages.length / daysDiff;
  
  if (messagesPerDay >= 5) return 'Daily';
  if (messagesPerDay >= 1) return 'Several times a week';
  if (messagesPerDay >= 0.25) return 'Weekly';
  if (messagesPerDay >= 0.1) return 'Every few weeks';
  return 'Monthly or less';
};

const getGenerationGap = (messages) => {
  // Words that might indicate generational differences
  const olderGenerationWords = [
    'tradition', 'always been', 'in my day', 'proper', 'respect',
    'when I was young', 'responsibility', 'duty', 'family values'
  ];
  
  const youngerGenerationWords = [
    'nowadays', 'different now', 'times change', 'my generation',
    'my friends', 'online', 'social media', 'independence'
  ];
  
  let olderGenCount = 0;
  let youngerGenCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    olderGenerationWords.forEach(word => {
      if (content.includes(word)) olderGenCount++;
    });
    
    youngerGenerationWords.forEach(word => {
      if (content.includes(word)) youngerGenCount++;
    });
  });
  
  const total = olderGenCount + youngerGenCount;
  
  if (total < 3) return 'No significant generation gap detected';
  
  if (olderGenCount > youngerGenCount * 2) {
    return 'Traditional values emphasized';
  } else if (youngerGenCount > olderGenCount * 2) {
    return 'Modern perspectives emphasized';
  } else {
    return 'Balanced generational perspectives';
  }
};

const getTraditionAutonomyBalance = (messages) => {
  // Tradition-oriented words
  const traditionWords = [
    'should', 'always', 'family', 'tradition', 'expected', 'proper',
    'respect', 'responsibility', 'duty', 'values', 'important'
  ];
  
  // Autonomy-oriented words
  const autonomyWords = [
    'want', 'choose', 'decide', 'my life', 'my decision', 'my choice',
    'independent', 'own way', 'feel comfortable', 'personal'
  ];
  
  let traditionCount = 0;
  let autonomyCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    traditionWords.forEach(word => {
      if (content.includes(word)) traditionCount++;
    });
    
    autonomyWords.forEach(word => {
      if (content.includes(word)) autonomyCount++;
    });
  });
  
  const total = traditionCount + autonomyCount || 1;
  const traditionPercent = Math.round((traditionCount / total) * 100);
  const autonomyPercent = Math.round((autonomyCount / total) * 100);
  
  if (Math.abs(traditionPercent - autonomyPercent) <= 10) {
    return 'Balanced tradition/autonomy';
  } else if (traditionPercent > autonomyPercent) {
    return 'Tradition-oriented';
  } else {
    return 'Autonomy-oriented';
  }
};

const getSupportNetwork = (messages) => {
  // Look for mentions of other family members
  const familyMemberWords = [
    'mom', 'dad', 'mother', 'father', 'sister', 'brother', 'aunt',
    'uncle', 'grandma', 'grandpa', 'cousin', 'family'
  ];
  
  const supportPhrases = [
    'help', 'support', 'there for', 'talk to', 'reach out', 'contact'
  ];
  
  let familyMentions = new Set();
  let supportMentions = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    familyMemberWords.forEach(member => {
      if (content.includes(member)) {
        familyMentions.add(member);
        
        // Check if the family member is mentioned in context of support
        supportPhrases.forEach(phrase => {
          if (content.includes(phrase)) {
            supportMentions++;
          }
        });
      }
    });
  });
  
  if (familyMentions.size === 0) {
    return 'No extended family mentioned';
  } else if (familyMentions.size === 1) {
    return 'Limited family support network';
  } else if (familyMentions.size >= 2 && familyMentions.size < 4) {
    return 'Moderate family support network';
  } else {
    return 'Strong family support network';
  }
};

// Mentor/mentee relationship metrics
const getGuidanceStyle = (messages) => {
  // Directive guidance words
  const directiveWords = [
    'should', 'need to', 'must', 'have to', 'important', 'crucial',
    'essential', 'correct way', 'right approach', 'do this'
  ];
  
  // Socratic guidance words
  const socraticWords = [
    'what do you think', 'have you considered', 'why', 'how would you',
    'reflect on', 'your perspective', 'your approach', 'what if'
  ];
  
  let directiveCount = 0;
  let socraticCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string' || msg.role === 'user') return;
    
    const content = msg.content.toLowerCase();
    
    directiveWords.forEach(word => {
      if (content.includes(word)) directiveCount++;
    });
    
    socraticWords.forEach(word => {
      if (content.includes(word)) socraticCount++;
    });
  });
  
  if (directiveCount === 0 && socraticCount === 0) {
    return 'Not enough guidance data';
  }
  
  const total = directiveCount + socraticCount;
  const socraticPercent = Math.round((socraticCount / total) * 100);
  
  if (socraticPercent > 80) return 'Highly collaborative';
  if (socraticPercent > 60) return 'Mostly collaborative';
  if (socraticPercent > 40) return 'Balanced';
  if (socraticPercent > 20) return 'Mostly directive';
  return 'Highly directive';
};

const getFeedbackBalance = (messages) => {
  // Positive feedback words
  const positiveWords = [
    'good', 'great', 'excellent', 'well done', 'impressive', 'proud',
    'perfect', 'right', 'correct', 'impressive', 'like', 'appreciate'
  ];
  
  // Constructive feedback words
  const constructiveWords = [
    'improve', 'could', 'should', 'better', 'next time', 'instead',
    'try', 'consider', 'change', 'different', 'work on', 'not quite'
  ];
  
  let positiveCount = 0;
  let constructiveCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string' || msg.role === 'user') return;
    
    const content = msg.content.toLowerCase();
    
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++;
    });
    
    constructiveWords.forEach(word => {
      if (content.includes(word)) constructiveCount++;
    });
  });
  
  if (positiveCount === 0 && constructiveCount === 0) {
    return 'Not enough feedback data';
  }
  
  const ratio = positiveCount / (constructiveCount || 1);
  
  if (ratio > 3) return 'Highly encouraging';
  if (ratio > 2) return 'Encouraging';
  if (ratio > 0.5) return 'Balanced feedback';
  if (ratio > 0.25) return 'Improvement-focused';
  return 'Mostly constructive';
};

const getGrowthFocus = (messages) => {
  // Different growth focus areas
  const skillWords = [
    'skill', 'learn', 'practice', 'technique', 'ability', 'method',
    'training', 'expertise', 'proficiency', 'competence'
  ];
  
  const knowledgeWords = [
    'know', 'understand', 'concept', 'information', 'theory',
    'principle', 'fact', 'data', 'research', 'study'
  ];
  
  const personalWords = [
    'confidence', 'mindset', 'attitude', 'approach', 'perspective',
    'belief', 'habit', 'character', 'personal growth', 'development'
  ];
  
  let skillCount = 0;
  let knowledgeCount = 0;
  let personalCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    skillWords.forEach(word => {
      if (content.includes(word)) skillCount++;
    });
    
    knowledgeWords.forEach(word => {
      if (content.includes(word)) knowledgeCount++;
    });
    
    personalWords.forEach(word => {
      if (content.includes(word)) personalCount++;
    });
  });
  
  if (skillCount === 0 && knowledgeCount === 0 && personalCount === 0) {
    return 'Focus not identified';
  }
  
  // Determine predominant focus
  if (skillCount > knowledgeCount && skillCount > personalCount) {
    return 'Skill development';
  } else if (knowledgeCount > skillCount && knowledgeCount > personalCount) {
    return 'Knowledge acquisition';
  } else if (personalCount > skillCount && personalCount > knowledgeCount) {
    return 'Personal growth';
  } else {
    return 'Balanced growth focus';
  }
};

const getFollowThrough = (messages) => {
  // Words that indicate commitments
  const commitmentWords = [
    'will do', 'I\'ll', 'promise', 'commit', 'by tomorrow',
    'next week', 'deadline', 'complete', 'finish', 'submit'
  ];
  
  // Words that indicate follow-up
  const followUpWords = [
    'completed', 'finished', 'done', 'submitted', 'as promised',
    'as discussed', 'delivered', 'here it is', 'attached', 'sent'
  ];
  
  let commitmentCount = 0;
  let followUpCount = 0;
  
  // Track each message with a commitment
  let commitmentMessages = [];
  
  messages.forEach((msg, index) => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    let hasCommitment = false;
    
    commitmentWords.forEach(word => {
      if (content.includes(word)) {
        hasCommitment = true;
      }
    });
    
    if (hasCommitment) {
      commitmentCount++;
      commitmentMessages.push({ index, content });
    }
  });
  
  // Check for follow-up messages after commitments
  commitmentMessages.forEach(commitment => {
    const startIndex = commitment.index + 1;
    
    // Look at the next 10 messages or to the end
    const endIndex = Math.min(startIndex + 10, messages.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (!messages[i].content || typeof messages[i].content !== 'string') continue;
      
      const content = messages[i].content.toLowerCase();
      
      followUpWords.forEach(word => {
        if (content.includes(word)) {
          followUpCount++;
          return; // Count only one follow-up per commitment
        }
      });
    }
  });
  
  if (commitmentCount === 0) {
    return 'No commitments detected';
  }
  
  const followThroughRate = followUpCount / commitmentCount;
  
  if (followThroughRate > 0.8) return 'Excellent follow-through';
  if (followThroughRate > 0.5) return 'Good follow-through';
  if (followThroughRate > 0.3) return 'Moderate follow-through';
  return 'Inconsistent follow-through';
};

const getKnowledgeTransfer = (messages) => {
  // Words that indicate teaching
  const teachingWords = [
    'explain', 'understand', 'learn', 'know', 'concept', 'idea',
    'remember', 'important', 'key point', 'essential', 'means that'
  ];
  
  // Words that indicate comprehension
  const comprehensionWords = [
    'got it', 'understand', 'makes sense', 'I see', 'clear',
    'thanks for explaining', 'helpful', 'learned', 'appreciate the explanation'
  ];
  
  let teachingCount = 0;
  let comprehensionCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    if (msg.role !== 'user') {
      // Count teaching indicators in mentor messages
      teachingWords.forEach(word => {
        if (content.includes(word)) teachingCount++;
      });
    } else {
      // Count comprehension indicators in mentee messages
      comprehensionWords.forEach(word => {
        if (content.includes(word)) comprehensionCount++;
      });
    }
  });
  
  if (teachingCount === 0) {
    return 'Limited knowledge sharing';
  }
  
  const ratio = comprehensionCount / teachingCount;
  
  if (ratio > 0.8) return 'Highly effective transfer';
  if (ratio > 0.5) return 'Effective transfer';
  if (ratio > 0.3) return 'Moderate effectiveness';
  return 'Knowledge shared but unclear reception';
};

const getGoalSetting = (messages) => {
  // Goal-setting words
  const goalWords = [
    'goal', 'objective', 'aim', 'target', 'plan', 'achieve',
    'milestone', 'accomplish', 'complete', 'finish', 'success'
  ];
  
  // Target timeframe words
  const timeframeWords = [
    'by next', 'deadline', 'this week', 'this month', 'quarter',
    'year', 'date', 'timeline', 'schedule', 'timeframe'
  ];
  
  // Progress check words
  const progressWords = [
    'progress', 'status', 'update', 'how\'s it going', 'check in',
    'completed', 'achieved', 'finished', 'done', 'accomplished'
  ];
  
  let goalCount = 0;
  let timeframeCount = 0;
  let progressCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string') return;
    
    const content = msg.content.toLowerCase();
    
    goalWords.forEach(word => {
      if (content.includes(word)) goalCount++;
    });
    
    timeframeWords.forEach(word => {
      if (content.includes(word)) timeframeCount++;
    });
    
    progressWords.forEach(word => {
      if (content.includes(word)) progressCount++;
    });
  });
  
  if (goalCount === 0) {
    return 'No goal-setting detected';
  }
  
  // Calculate goal-setting quality
  const totalScore = goalCount + timeframeCount + progressCount;
  
  if (totalScore >= 10) return 'Comprehensive goal-setting';
  if (totalScore >= 6) return 'Structured goal-setting';
  if (totalScore >= 3) return 'Basic goal-setting';
  return 'Minimal goal-setting';
};

const getRespectIndex = (messages) => {
  // Respect indicators
  const respectWords = [
    'respect', 'appreciate', 'value', 'admire', 'thank you',
    'grateful', 'honored', 'wisdom', 'experience', 'insight'
  ];
  
  // Formal address indicators
  const formalWords = [
    'mr', 'ms', 'mrs', 'dr', 'professor', 'sir', 'madam',
    'please', 'kindly', 'if you would', 'may I'
  ];
  
  let respectCount = 0;
  
  messages.forEach(msg => {
    if (!msg.content || typeof msg.content !== 'string' || msg.role !== 'user') return;
    
    const content = msg.content.toLowerCase();
    
    respectWords.forEach(word => {
      if (content.includes(word)) respectCount++;
    });
    
    formalWords.forEach(word => {
      if (content.includes(word)) respectCount++;
    });
  });
  
  const respectRatio = respectCount / messages.filter(msg => msg.role === 'user').length;
  
  if (respectRatio < 0.05) return 'Casual';
  if (respectRatio < 0.1) return 'Friendly';
  if (respectRatio < 0.2) return 'Respectful';
  return 'Highly respectful';
};

/**
 * Sample a subset of messages for processing
 * Used to stay within token limits for AI
 */
const sampleMessages = (messages, targetCount) => {
  if (messages.length <= targetCount) {
    return messages;
  }
  
  // Keep first few and last few messages
  const keepCount = Math.floor(targetCount * 0.3);
  const first = messages.slice(0, keepCount);
  const last = messages.slice(-keepCount);
  
  // Sample from the middle
  const middle = messages.slice(keepCount, -keepCount);
  const middleCount = targetCount - (2 * keepCount);
  
  // Get evenly spaced indices
  const step = Math.floor(middle.length / middleCount);
  const sampled = [];
  
  for (let i = 0; i < middleCount; i++) {
    sampled.push(middle[i * step]);
  }
  
  // Combine and sort by timestamp
  return [...first, ...sampled, ...last].sort((a, b) => {
    const timeA = a.timestamp || a.createdAt || 0;
    const timeB = b.timestamp || b.createdAt || 0;
    return new Date(timeA) - new Date(timeB);
  });
};

module.exports = exports;