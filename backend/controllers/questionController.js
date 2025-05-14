// backend/controllers/questionController.js
const Relationship = require('../models/Relationship');
const RelationshipQuestion = require('../models/RelationshipQuestion');
const Conversation = require('../models/Conversation');
const OpenAI = require('openai');
const config = require('../config');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey,
});

exports.askQuestion = async (req, res) => {
  try {
    const { relationshipId, question } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!question || question.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Question is required' 
      });
    }

    // Check if relationship exists and belongs to user
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId
    });

    if (!relationship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Relationship not found' 
      });
    }

    // Check if this relationship has imported conversations
        const hasConversations = await Conversation.countDocuments({
          relationship: relationshipId,
          status: 'analyzed'
        }) > 0;
        
        if (!hasConversations) {
          return res.status(200).json({
            success: true,
            answer: `I don't have enough data about your relationship with ${relationship.contactName} yet. Please import your WhatsApp chat history to get insightful answers to your questions.`
          });
        }

    // Get recent conversations for context
    const conversations = await Conversation.find({
      relationship: relationshipId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('messages');

    // Prepare context for AI
    const contextData = {
      relationship: {
        name: relationship.contactName,
        type: relationship.relationshipType,
        frequency: relationship.interactionFrequency || 'Not specified',
        howWeMet: relationship.howWeMet || '',
        timeKnown: relationship.timeKnown || 'Not specified'
      },
      metrics: relationship.metrics || {},
      topicDistribution: relationship.topicDistribution || [],
      insights: relationship.insights || {},
      topicDistribution: relationship.topicDistribution || [],
      communicationStyle: relationship.communicationStyle || {},
      sentimentScore: relationship.insights?.sentimentScore || 0,
      communicationBalance: relationship.insights?.communicationBalance || 'unknown'
    };

    // Extract conversation summaries if available
    if (conversations && conversations.length > 0) {
      contextData.conversationSummaries = conversations.map(conv => ({
        date: conv.createdAt,
        summary: conv.summary || '',
        topics: conv.topics || [],
        sentiment: conv.sentiment || 'neutral'
      }));
    }

    // Create prompt for the AI
    const systemPrompt = `You are an emotionally intelligent AI assistant that analyzes relationship data from WhatsApp chats. 
    You have analyzed chats between the user and ${relationship.contactName}. 
    
    Based ONLY on the actual data provided in the relationship context, give accurate, data-driven insights.
    
    Your responses should:
    1. Directly address the question using ONLY the data provided
    2. Be specific about what patterns you've observed in their messages
    3. Cite specific metrics when relevant (sentiment score, communication balance, etc.)
    4. Be honest about limitations when the data doesn't clearly answer a question
    
    Don't say you can't access the person's feelings - you have analyzed their messages and can make data-driven observations.
    
    When asked about emotional states, refer to:
    - Sentiment analysis scores (positive/negative)
    - Communication patterns
    - Topic distributions
    - Frequency and timing of messages
    
    Always start your response with "Based on the analysis of your WhatsApp conversations with ${relationship.contactName}..."`;

    const userMessage = `Question about my relationship with ${relationship.contactName}: "${question}"

    Relationship Context (from WhatsApp message analysis): ${JSON.stringify(contextData, null, 2)}`;

    // Call OpenAI for a response
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or another appropriate model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    // Save the question and answer
    const relationshipQuestion = new RelationshipQuestion({
      user: userId,
      relationship: relationshipId,
      question,
      answer: aiResponse,
      createdAt: new Date()
    });

    await relationshipQuestion.save();

    // Return success response
    res.json({
      success: true,
      question,
      answer: aiResponse,
      _id: relationshipQuestion._id
    });
  } catch (error) {
    console.error('Error asking relationship question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing relationship question',
      error: error.message
    });
  }
};

// Get question history for a relationship
exports.getQuestionHistory = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;

    // Verify the relationship belongs to the user
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Relationship not found'
      });
    }

    // Get question history
    const questions = await RelationshipQuestion.find({
      relationship: relationshipId,
      user: userId
    })
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      questions
    });

  } catch (error) {
    console.error('Error fetching question history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question history',
      error: error.message
    });
  }
};

// Ask question via voice
// Add this to your backend/controllers/questionController.js

exports.askQuestionVoice = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;
    
    // Check if we have a file uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No audio file received' 
      });
    }
    
    // Check if relationship exists and belongs to user
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId
    });

    if (!relationship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Relationship not found' 
      });
    }
      
    // Check if this relationship has imported conversations
    const hasConversations = await Conversation.countDocuments({
      relationship: relationshipId,
      status: 'analyzed'
    }) > 0;
    
    if (!hasConversations) {
      return res.status(200).json({
        success: true,
        transcription: "No data available",
        answer: `I don't have enough data about your relationship with ${relationship.contactName} yet. Please import your WhatsApp chat history to get insightful answers to your questions.`
      });
    }
    
    // Use OpenAI's Whisper API for transcription
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
     // Prepare audio file for OpenAI API
     
     
    
    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: req.file.buffer,
      model: "whisper-1",
      language: "en"
    });
    
    const question = transcription.text;
    
    // Get recent conversations for context
    const conversations = await Conversation.find({
      relationship: relationshipId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('messages');
    
    // Prepare context for AI
    const contextData = {
      relationship: {
        name: relationship.contactName,
        type: relationship.relationshipType,
        frequency: relationship.interactionFrequency || 'Not specified',
        howWeMet: relationship.howWeMet || '',
        timeKnown: relationship.timeKnown || 'Not specified'
      },
      metrics: relationship.metrics || {},
      topicDistribution: relationship.topicDistribution || [],
      insights: relationship.insights || {},
      communicationStyle: relationship.communicationStyle || {},
      sentimentScore: relationship.insights?.sentimentScore || 0,
      communicationBalance: relationship.insights?.communicationBalance || 'unknown'
    };

    // Extract conversation summaries if available
    if (conversations && conversations.length > 0) {
      contextData.conversationSummaries = conversations.map(conv => ({
        date: conv.createdAt,
        summary: conv.summary || '',
        topics: conv.topics || [],
        sentiment: conv.sentiment || 'neutral'
      }));
    }
    
    // Create system prompt - same as in askQuestion for consistency
    const systemPrompt = `You are an emotionally intelligent AI assistant that analyzes relationship data from WhatsApp chats. 
    You have analyzed chats between the user and ${relationship.contactName}. 
    
    Based ONLY on the actual data provided in the relationship context, give accurate, data-driven insights.
    
    Your responses should:
    1. Directly address the question using ONLY the data provided
    2. Be specific about what patterns you've observed in their messages
    3. Cite specific metrics when relevant (sentiment score, communication balance, etc.)
    4. Be honest about limitations when the data doesn't clearly answer a question
    
    Don't say you can't access the person's feelings - you have analyzed their messages and can make data-driven observations.
    
    When asked about emotional states, refer to:
    - Sentiment analysis scores (positive/negative)
    - Communication patterns
    - Topic distributions
    - Frequency and timing of messages
    
    Always start your response with "Based on the analysis of your WhatsApp conversations with ${relationship.contactName}..."`;
    
    const userMessage = `Question about my relationship with ${relationship.contactName}: "${question}"

    Relationship Context (from WhatsApp message analysis): ${JSON.stringify(contextData, null, 2)}`;
    
    // Call OpenAI API for the response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Save the question and answer
    const relationshipQuestion = new RelationshipQuestion({
      user: userId,
      relationship: relationshipId,
      question: question,
      answer: aiResponse,
      createdAt: new Date()
    });
    
    await relationshipQuestion.save();
    
    // Return the response
    res.json({
      success: true,
      transcription: question,
      answer: aiResponse,
      _id: relationshipQuestion._id
    });
    
  } catch (error) {
    console.error('Error processing voice question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process voice question',
      error: error.message 
    });
  }
};

module.exports = exports;