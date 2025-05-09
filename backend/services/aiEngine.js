// backend/services/aiEngine.js
const OpenAI = require('openai');
const { Configuration, OpenAIApi } = require('openai');
const config = require('../config');
const promptTemplates = require('../utils/promptTemplates');
const safetyGuards = require('../utils/safetyGuards');
const memoryEngine = require('./memoryEngine');
const sentimentAnalysis = require('./sentimentAnalysis');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Main AI Engine for handling conversation flow and generating responses
 */
class AIEngine {
  constructor() {
    this.model = config.AI_MODEL || 'gpt-4-turbo';
    this.maxTokens = config.MAX_TOKENS || 1000;
  }
  
  /**
   * Generate a system prompt based on relationship context and conversation phase
   * @param {Object} relationshipData - Data about the relationship
   * @param {String} phase - Current conversation phase
   * @param {Array} previousMessages - Previous messages in the conversation
   * @returns {String} - Complete system prompt
   */
  _buildSystemPrompt(relationshipData, phase, previousMessages = []) {
    const { contactName, relationshipType, memoryNodes = [] } = relationshipData;
    
    // Get base prompt template
    let basePrompt = promptTemplates.getBaseSystemPrompt(contactName);
    
    // Add phase-specific instructions
    const phasePrompt = promptTemplates.getPhasePrompt(phase);
    
    // Add relevant memories if we have them
    let memoryPrompt = '';
    if (memoryNodes.length > 0) {
      // Filter and sort memories by relevance/weight
      const relevantMemories = memoryEngine.getRelevantMemories(memoryNodes, previousMessages);
      if (relevantMemories.length > 0) {
        memoryPrompt = promptTemplates.getMemoryPrompt(relevantMemories);
      }
    }
    
    // Combine all prompt sections
    return `${basePrompt}\n\n${phasePrompt}\n\n${memoryPrompt}`;
  }
  
  /**
   * Process user input and generate AI response
   * @param {String} userInput - Raw user input (transcript)
   * @param {Object} conversation - Conversation object with metadata
   * @param {Object} relationship - Relationship object
   * @returns {Object} - AI response with text and metadata
   */
  async processUserInput(userInput, conversation, relationship) {
    try {
      // Safety check on user input
      safetyGuards.checkUserInput(userInput);
      
      // Determine conversation phase
      const phase = this._determinePhase(conversation);
      
      // Build message history
      const messages = this._buildMessageHistory(conversation, relationship, phase);
      
      // Add user's new message
      messages.push({
        role: 'user',
        content: userInput
      });
      
      // Generate response
      const response = await this._generateAIResponse(messages);
      
      // Extract insights and memories
      const insights = this._extractInsights(userInput, response);
      const memories = this._extractMemories(userInput, response, relationship.contactName);
      
      // Analyze sentiment
      const sentiment = await sentimentAnalysis.analyzeSentiment(userInput);
      
      return {
        text: response,
        insights,
        memories,
        sentiment,
        phase
      };
    } catch (error) {
      console.error('AI Engine error:', error);
      return {
        text: "I'm sorry, I encountered an issue processing your response. Could we try again?",
        error: error.message
      };
    }
  }
  
  /**
   * Generate AI response using OpenAI API
   * @param {Array} messages - Message history
   * @returns {String} - AI response text
   */
  async _generateAIResponse(messages) {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: 0.7
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
  
  /**
   * Determine which phase of the conversation we're in
   * @param {Object} conversation - Conversation object with message history
   * @returns {String} - Conversation phase
   */
  _determinePhase(conversation) {
    const { messages = [] } = conversation;
    
    // Count AI messages to determine progression
    const aiMessageCount = messages.filter(m => m.role === 'ai').length;
    
    // Logic to determine phase based on message count and content
    if (aiMessageCount < 3) {
      return 'onboarding';
    } else if (aiMessageCount < 6) {
      return 'emotional_mapping';
    } else if (aiMessageCount < 9) {
      return 'dynamics_tensions';
    } else {
      return 'dual_lens_reflection';
    }
  }
  
  /**
   * Build message history for the AI request
   * @param {Object} conversation - Conversation object
   * @param {Object} relationship - Relationship object
   * @param {String} phase - Current conversation phase
   * @returns {Array} - Message history for AI
   */
  _buildMessageHistory(conversation, relationship, phase) {
    // Start with system prompt
    const systemPrompt = this._buildSystemPrompt(
      relationship,
      phase,
      conversation.messages || []
    );
    
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
    
    // Add conversation history (limit to last N messages for token efficiency)
    const recentMessages = (conversation.messages || []).slice(-10);
    recentMessages.forEach(msg => {
      messages.push({
        role: msg.role, // 'user' or 'ai'
        content: msg.content
      });
    });
    
    return messages;
  }
  
  /**
   * Extract potential insights from the conversation
   * @param {String} userInput - User's message
   * @param {String} aiResponse - AI's response
   * @returns {Array} - Array of insight objects
   */
  _extractInsights(userInput, aiResponse) {
    const insights = [];
    const combinedText = `${userInput} ${aiResponse}`;
    
    // Simple keyword-based insight extraction (can be expanded with NLP)
    const patterns = [
      {
        regex: /(?:always|never|every time|constantly)/i,
        type: 'Pattern Recognition',
        category: 'pattern'
      },
      {
        regex: /(?:feel|feeling|felt) (?:hurt|sad|angry|happy|joyful|grateful)/i,
        type: 'Emotional Insight',
        category: 'emotion'
      },
      {
        regex: /(?:wish|hope|want|need) (?:you would|they would|to be)/i,
        type: 'Growth Opportunity',
        category: 'growth'
      },
      {
        regex: /(?:struggle|difficult|hard|challenge) with/i,
        type: 'Challenge Area',
        category: 'challenge'
      }
    ];
    
    // Check for matches and create insights
    patterns.forEach(pattern => {
      if (pattern.regex.test(combinedText)) {
        // Extract the sentence containing the match
        const sentences = combinedText.split(/[.!?]+/);
        const matchingSentence = sentences.find(s => pattern.regex.test(s));
        
        if (matchingSentence) {
          insights.push({
            type: pattern.type,
            category: pattern.category,
            text: matchingSentence.trim(),
            confidence: 0.7 // Placeholder confidence score
          });
        }
      }
    });
    
    return insights;
  }
  
  /**
   * Extract potential memories from the conversation
   * @param {String} userInput - User's message
   * @param {String} aiResponse - AI's response
   * @param {String} contactName - Name of the contact
   * @returns {Array} - Array of memory objects
   */
  _extractMemories(userInput, aiResponse, contactName) {
    const memories = [];
    
    // Look for memory indicators in user input
    const memoryPatterns = [
      {
        regex: new RegExp(`(?:remember when|that time when|we once|${contactName} and I)`, 'i'),
        type: 'event'
      },
      {
        regex: /(?:told me|said to me|we talked about)/i,
        type: 'conversation'
      },
      {
        regex: /(?:gave me|surprised me with|bought me)/i,
        type: 'gift'
      },
      {
        regex: /(?:helped me|was there for me|supported me)/i,
        type: 'support'
      }
    ];
    
    // Extract sentences that match memory patterns
    const sentences = userInput.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      for (const pattern of memoryPatterns) {
        if (pattern.regex.test(sentence)) {
          // Simple emotion detection
          let emotion = 'neutral';
          if (/(?:love|happy|joy|grateful|amazing)/i.test(sentence)) {
            emotion = 'positive';
          } else if (/(?:sad|angry|hurt|disappointed|frustrated)/i.test(sentence)) {
            emotion = 'negative';
          }
          
          memories.push({
            content: sentence.trim(),
            type: pattern.type,
            emotion: emotion,
            weight: 0.5 // Default weight, will be adjusted by memory engine
          });
          
          break; // Only create one memory per sentence
        }
      }
    });
    
    return memories;
  }
  
  /**
   * Generate summary of a completed conversation
   * @param {Object} conversation - Complete conversation object
   * @param {Object} relationship - Relationship object
   * @returns {Object} - Summary with insights, sentiment analysis
   */
  async generateConversationSummary(conversation, relationship) {
    try {
      const { messages = [] } = conversation;
      
      // Combine all messages for context
      const conversationText = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n\n');
      
      // Create prompt for summary generation
      const summaryPrompt = promptTemplates.getSummaryPrompt(
        relationship.contactName,
        conversationText
      );
      
      // Get summary from OpenAI
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: summaryPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      const summaryText = completion.choices[0].message.content;
      
      // Analyze overall sentiment
      const overallSentiment = await sentimentAnalysis.analyzeConversationSentiment(
        messages.filter(msg => msg.role === 'user').map(msg => msg.content)
      );
      
      // Extract top insights and memories
      const allInsights = messages
        .filter(msg => msg.insights && msg.insights.length > 0)
        .flatMap(msg => msg.insights);
      
      const allMemories = messages
        .filter(msg => msg.memories && msg.memories.length > 0)
        .flatMap(msg => msg.memories);
      
      // Select top insights and memories based on importance/relevance
      const topInsights = this._selectTopItems(allInsights, 3);
      const topMemories = this._selectTopItems(allMemories, 3);
      
      return {
        summary: summaryText,
        emotionalTone: overallSentiment.label,
        sentimentScore: overallSentiment.score,
        insights: topInsights,
        memories: topMemories,
        topics: this._extractTopics(conversationText)
      };
    } catch (error) {
      console.error('Summary generation error:', error);
      return {
        summary: "A conversation about your relationship.",
        error: error.message
      };
    }
  }
  
  /**
   * Select top items based on confidence or weight
   * @param {Array} items - Array of items with confidence or weight
   * @param {Number} count - Number of items to select
   * @returns {Array} - Top items
   */
  _selectTopItems(items, count) {
    return [...items]
      .sort((a, b) => (b.confidence || b.weight || 0) - (a.confidence || a.weight || 0))
      .slice(0, count);
  }
  
  /**
   * Extract main topics from conversation text
   * @param {String} text - Full conversation text
   * @returns {Array} - Array of topic objects
   */
  _extractTopics(text) {
    // Simple topic extraction (would be improved with NLP)
    const topicKeywords = {
      'communication': ['talk', 'communicate', 'conversation', 'discuss'],
      'support': ['help', 'support', 'there for me', 'care'],
      'conflict': ['argue', 'fight', 'disagree', 'conflict', 'tension'],
      'trust': ['trust', 'honest', 'reliable', 'depend'],
      'growth': ['change', 'grow', 'improve', 'better', 'future']
    };
    
    const topics = [];
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(keyword => 
        new RegExp(`\\b${keyword}\\w*\\b`, 'i').test(text)
      );
      
      if (matches.length > 0) {
        topics.push({
          name: topic,
          strength: matches.length / keywords.length
        });
      }
    }
    
    return topics.sort((a, b) => b.strength - a.strength);
  }
}

module.exports = new AIEngine();