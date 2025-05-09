// services/memoryUtils.js
const MemoryNode = require('../models/MemoryNode');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates detailed memory nodes from conversation content
 */
const generateDetailedMemories = async (userId, relationshipId, conversationId, conversationText, contactName) => {
  try {
    console.log(`Generating detailed memories for relationship ${relationshipId}`);
    
    // Prepare prompt for memory extraction
    const memoryPrompt = `
    Analyze this conversation between the user and ${contactName} to identify key memories that should be saved.
    
    CONVERSATION:
    ${conversationText}
    
    Please identify the following types of memories (maximum 3 of each type):
    
    1. Positive Memories: Happy moments, accomplishments, or positive interactions
    2. Challenges: Difficult moments or conflicts that were significant
    3. Growth Areas: Opportunities for relationship improvement
    
    Format your response as JSON with the following structure:
    {
      "positiveMemories": [
        { "content": "Memory description", "sentiment": 0.8, "keywords": ["keyword1", "keyword2"] }
      ],
      "challenges": [
        { "content": "Challenge description", "sentiment": -0.3, "keywords": ["keyword1", "keyword2"] }
      ],
      "growthAreas": [
        { "content": "Growth opportunity description", "sentiment": 0.5, "keywords": ["keyword1", "keyword2"] }
      ]
    }
    
    Respond ONLY with valid JSON, no other text.
    `;
    
    // Get memory nodes from OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert relationship analyst that extracts meaningful memory nodes from conversations.'
        },
        {
          role: 'user',
          content: memoryPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1000
    });
    
    try {
      // Parse the response
      const content = response.choices[0].message.content.trim();
      const memories = JSON.parse(content);
      
      // Create positive memory nodes
      if (memories.positiveMemories && Array.isArray(memories.positiveMemories)) {
        for (const memory of memories.positiveMemories) {
          await MemoryNode.create({
            user: userId,
            relationship: relationshipId,
            type: 'memory',
            emotion: 'positive',
            content: memory.content,
            sentiment: memory.sentiment || 0.8,
            sourceReference: {
              type: 'conversation',
              id: conversationId,
              timestamp: new Date()
            },
            keywords: memory.keywords || ['positive', 'memory'],
            created: new Date()
          });
        }
      }
      
      // Create challenge memory nodes
      if (memories.challenges && Array.isArray(memories.challenges)) {
        for (const challenge of memories.challenges) {
          await MemoryNode.create({
            user: userId,
            relationship: relationshipId,
            type: 'memory',
            emotion: 'negative',
            content: challenge.content,
            sentiment: challenge.sentiment || -0.3,
            sourceReference: {
              type: 'conversation',
              id: conversationId,
              timestamp: new Date()
            },
            keywords: challenge.keywords || ['challenge', 'growth'],
            created: new Date()
          });
        }
      }
      
      // Create growth area memory nodes
      if (memories.growthAreas && Array.isArray(memories.growthAreas)) {
        for (const growth of memories.growthAreas) {
          await MemoryNode.create({
            user: userId,
            relationship: relationshipId,
            type: 'memory',
            emotion: 'growth',
            content: growth.content,
            sentiment: growth.sentiment || 0.5,
            sourceReference: {
              type: 'conversation',
              id: conversationId,
              timestamp: new Date()
            },
            keywords: growth.keywords || ['growth', 'opportunity'],
            created: new Date()
          });
        }
      }
      
      console.log(`Successfully generated detailed memories for relationship ${relationshipId}`);
      return true;
    } catch (parseError) {
      console.error('Error parsing memory generation response:', parseError);
      return false;
    }
  } catch (error) {
    console.error('Error generating detailed memories:', error);
    return false;
  }
};

module.exports = {
  generateDetailedMemories
};