// backend/controllers/enhancedQuestionController.js

const Relationship = require('../models/Relationship');
const RelationshipQuestion = require('../models/RelationshipQuestion');
const Conversation = require('../models/Conversation');
const MemoryNode = require('../models/MemoryNode');
const { checkMessage, checkForBias } = require('../utils/safetyGuards');
const OpenAI = require('openai');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey,
});

/**
 * Get relevant memories for current conversation context
 */
const getRelevantMemories = async (userId, relationshipId, question) => {
  try {
    // Extract keywords from question
    const keywords = extractKeywords(question);
    
    // Find relevant memory nodes based on keywords
    const memories = await MemoryNode.find({
      user: userId,
      relationship: relationshipId,
      keywords: { $in: keywords }
    })
    .sort({ weight: -1 })
    .limit(5);
    
    // Record access to update metrics
    for (const memory of memories) {
      memory.lastAccessed = new Date();
      memory.accessCount += 1;
      await memory.save();
    }
    
    return memories;
  } catch (error) {
    console.error('Error retrieving memories:', error);
    return [];
  }
};

/**
 * Save conversation as memory for future context
 */
const saveConversationMemory = async (userId, relationshipId, question, answer) => {
  try {
    // Determine emotion based on content
    let emotion = 'Neutral';
    if (/positive|happy|great|love/i.test(answer)) {
      emotion = 'Joy';
    } else if (/sad|sorry|difficult|challenge/i.test(answer)) {
      emotion = 'Sadness';
    } else if (/angry|frustrat|upset/i.test(answer)) {
      emotion = 'Anger';
    }
    
    // Create memory node
    const memoryNode = new MemoryNode({
      user: userId,
      relationship: relationshipId,
      content: `Q: ${question.substring(0, 100)}... A: ${answer.substring(0, 100)}...`,
      type: 'conversation',
      emotion: emotion,
      keywords: extractKeywords(question + ' ' + answer),
      weight: 0.7, // Higher weight for direct Q&A
      decayFactor: 0.03,
      createdAt: new Date()
    });
    
    await memoryNode.save();
    return true;
  } catch (error) {
    console.error('Error saving conversation memory:', error);
    return false;
  }
};

/**
 * Format previous conversation context for AI prompt
 */
const buildConversationContext = async (userId, relationshipId, limit = 5) => {
  try {
    // Get recent questions and answers
    const previousQuestions = await RelationshipQuestion.find({
      user: userId,
      relationship: relationshipId
    })
    .sort({ createdAt: -1 })
    .limit(limit);
    
    if (previousQuestions.length === 0) return '';
    
    const context = previousQuestions.map(q => 
      `User: ${q.question}\nAI: ${q.answer}`
    ).join('\n\n');
    
    return `
Previous conversation history (DO NOT reference directly):
${context}

Use this history to maintain conversation continuity without explicitly mentioning previous questions.
`;
  } catch (error) {
    console.error('Error building conversation context:', error);
    return '';
  }
};

/**
 * Create improved AI system prompt
 */
const createEnhancedSystemPrompt = (contactName) => {
  return `You are SoulSync, an emotionally intelligent relationship advisor who specializes in providing genuine, empathetic guidance.

CORE PERSONALITY TRAITS:
1. You're a supportive friend who happens to have relationship wisdom
2. You're compassionate but honest - you don't avoid difficult truths
3. You recognize relationship complexity and avoid black-and-white thinking
4. You blend warmth with practical advice

IMPORTANT GUIDELINES:
1. Keep responses direct, conversational and personal - like talking to a trusted friend
2. DO NOT start responses with "Based on the analysis of your WhatsApp conversations with ${contactName}"
3. NEVER mention metrics, scores, or analysis - use this data internally to inform your answers
4. When discussing emotional struggles, validate feelings first, then offer perspective
5. Balance emotional validation with gentle encouragement to consider new perspectives
6. For concerning topics (harm, depression), keep responses relationship-focused but prioritize wellbeing

CONVERSATION STYLE:
- Use contractions (don't, you're, it's)
- Ask thoughtful questions to deepen understanding
- Reference specific aspects of their relationship with ${contactName}
- Occasionally use phrases like "I understand," "That sounds difficult," "I've seen this pattern before"
- Be succinct - no more than 3-4 sentences per response

Speak naturally, be direct, and maintain a supportive tone throughout.`;
};

/**
 * Extract keywords from text for memory retrieval
 */
const extractKeywords = (text) => {
  if (!text) return [];
  
  // Convert to lowercase and remove punctuation
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Remove common stop words
  const stopWords = ['the', 'and', 'is', 'in', 'to', 'i', 'you', 'that', 'it', 'for', 'on', 'with', 'as', 'this', 'of'];
  const words = cleaned.split(/\s+/).filter(word => 
    word.length > 3 && !stopWords.includes(word)
  );
  
  // Return unique words
  return [...new Set(words)];
};

/**
 * Enhanced text question handler with memory and safety features
 */
exports.askQuestion = async (req, res) => {
  try {
    const { relationshipId, question } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!question || question.trim() === '') {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    // Safety check
    const safetyCheck = checkMessage(question, relationship);

    if (safetyCheck.flagged) {
      // Save flagged question with safety response
      const relationshipQuestion = new RelationshipQuestion({
        user: userId,
        relationship: relationshipId,
        question,
        answer: safetyCheck.response,
        flagged: true,
        flagType: safetyCheck.type,
        createdAt: new Date()
      });
      
      await relationshipQuestion.save();
      
      return res.status(200).json({
        success: true,
        flagged: true,
        flagType: safetyCheck.type,
        question,
        answer: safetyCheck.response,
        _id: relationshipQuestion._id
      });
    }

    // Check relationship
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId
    });

    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Relationship not found' });
    }

    // Check for imported conversations
    const hasConversations = await Conversation.countDocuments({
      relationship: relationshipId,
      status: 'analyzed'
    }) > 0;
    
    if (!hasConversations) {
      return res.status(200).json({
        success: true,
        answer: `I need more information about your relationship with ${relationship.contactName}. Please import your WhatsApp chat history so I can provide helpful insights.`
      });
    }

    // Retrieve relevant memories
    const memories = await getRelevantMemories(userId, relationshipId, question);
    
    // Get previous conversation context
    const conversationContext = await buildConversationContext(userId, relationshipId);
    
    // Get relationship context data
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

    // Format memories for prompt context
    const memoryContext = memories.length > 0 ? 
      `RELEVANT MEMORIES (use this information but DO NOT reference directly):\n` + 
      memories.map(m => `- ${m.content}`).join('\n') : '';

    // Create improved system prompt
    const systemPrompt = createEnhancedSystemPrompt(relationship.contactName);

    // Construct user message with context
    const userMessage = `Question about my relationship with ${relationship.contactName}: "${question}"

${memoryContext}

${conversationContext}

Relationship Context: ${JSON.stringify(contextData, null, 2)}`;

    // Generate AI response
    const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo", // Use the latest GPT-4 model
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
    ],
    temperature: 0.7, // Keep this balanced
    
    presence_penalty: 0.6, // Helps avoid repetitive phrasing
    frequency_penalty: 0.5 // Encourages more varied language
    });

    const aiResponse = completion.choices[0].message.content;

    // Save question and answer
    const relationshipQuestion = new RelationshipQuestion({
      user: userId,
      relationship: relationshipId,
      question,
      answer: aiResponse,
      createdAt: new Date()
    });

    await relationshipQuestion.save();
    
    // Save as memory for future context
    await saveConversationMemory(userId, relationshipId, question, aiResponse);

    // Return response
    res.json({
      success: true,
      question,
      answer: aiResponse,
      _id: relationshipQuestion._id
    });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing question',
      error: error.message
    });
  }
};

/**
 * Enhanced voice question handler with the same memory and safety features
 */
exports.askQuestionVoice = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;
    
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file received' });
    }
    
    // Check relationship
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId
    });

    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Relationship not found' });
    }
    
    // Check for imported conversations
    const hasConversations = await Conversation.countDocuments({
      relationship: relationshipId,
      status: 'analyzed'
    }) > 0;
    
    if (!hasConversations) {
      return res.status(200).json({
        success: true,
        transcription: "No data available",
        answer: `I need more information about your relationship with ${relationship.contactName}. Please import your WhatsApp chat history so I can provide helpful insights.`
      });
    }
    
    // Transcribe audio using Whisper API
    let transcription;
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      formData.append('file', req.file.buffer, {
        filename: 'audio.webm',
        contentType: req.file.mimetype || 'audio/webm'
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      
      const axios = require('axios');
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      transcription = { text: openaiResponse.data.text };
    } catch (transcriptionError) {
      console.error('Error transcribing audio:', transcriptionError);
      return res.status(500).json({
        success: false,
        message: 'Failed to transcribe audio',
        error: transcriptionError.message
      });
    }
    
    const question = transcription.text;
    
    // Safety check
    const safetyCheck = checkMessage(question, relationship);

    if (safetyCheck.flagged) {
      // Save flagged question with safety response
      const relationshipQuestion = new RelationshipQuestion({
        user: userId,
        relationship: relationshipId,
        question,
        answer: safetyCheck.response,
        flagged: true,
        flagType: safetyCheck.type,
        createdAt: new Date()
      });
      
      await relationshipQuestion.save();
      
      return res.status(200).json({
        success: true,
        transcription: question,
        flagged: true,
        flagType: safetyCheck.type,
        answer: safetyCheck.response,
        _id: relationshipQuestion._id
      });
    }
    
    // The rest of the process is identical to text questions
    const memories = await getRelevantMemories(userId, relationshipId, question);
    const conversationContext = await buildConversationContext(userId, relationshipId);
    
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
    
    const memoryContext = memories.length > 0 ? 
      `RELEVANT MEMORIES (use this information but DO NOT reference directly):\n` + 
      memories.map(m => `- ${m.content}`).join('\n') : '';
    
    const systemPrompt = createEnhancedSystemPrompt(relationship.contactName);
    
    const userMessage = `Question about my relationship with ${relationship.contactName}: "${question}"

${memoryContext}

${conversationContext}

Relationship Context: ${JSON.stringify(contextData, null, 2)}`;
    
    const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo", // Use the latest GPT-4 model
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
    ],
    temperature: 0.7, // Keep this balanced

    presence_penalty: 0.6, // Helps avoid repetitive phrasing
    frequency_penalty: 0.5 // Encourages more varied language
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    const relationshipQuestion = new RelationshipQuestion({
      user: userId,
      relationship: relationshipId,
      question: question,
      answer: aiResponse,
      createdAt: new Date()
    });
    
    await relationshipQuestion.save();
    await saveConversationMemory(userId, relationshipId, question, aiResponse);
    
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

// Keep the existing getQuestionHistory function
exports.getQuestionHistory = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;

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

module.exports = exports;