// backend/controllers/memoryController.js
const MemoryNode = require('../models/MemoryNode');

// Get all memories for a specific relationship
const getRelationshipMemories = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    
    // Verify the relationship belongs to the current user
    // This prevents unauthorized access to other users' memories
    const memories = await MemoryNode.find({ 
      relationship: relationshipId,
      user: req.user.id // This assumes your auth middleware adds user to req
    });
    if (memories.length === 0) {
        return res.json([
          {
            _id: "mockMemory1",
            content: "They surprised me with tickets to my favorite band",
            emotion: "Joy",
            type: "event",
            weight: 0.9,
            createdAt: new Date(Date.now() - 30*24*60*60*1000) // 30 days ago
          },
          {
            _id: "mockMemory2",
            content: "They were there for me when I lost my job",
            emotion: "Love",
            type: "support",
            weight: 0.8,
            createdAt: new Date(Date.now() - 60*24*60*60*1000) // 60 days ago
          },
          {
            _id: "mockMemory3", 
            content: "We argued about finances last month",
            emotion: "Sadness",
            type: "conflict",
            weight: 0.7,
            createdAt: new Date(Date.now() - 45*24*60*60*1000) // 45 days ago
          }
        ]);
      }
    // For the MVP focus on emotional memories
    // Sort by most recent and most emotionally relevant first
    memories.sort((a, b) => {
      // First prioritize emotional memories (non-neutral)
      const aEmotional = a.emotion !== 'Neutral';
      const bEmotional = b.emotion !== 'Neutral';
      
      if (aEmotional && !bEmotional) return -1;
      if (!aEmotional && bEmotional) return 1;
      
      // Then sort by weight/relevance
      return b.weight - a.weight;
    });
    
    res.json(memories);
  } catch (error) {
    console.error('Error fetching relationship memories:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve memories',
      error: error.message 
    });
  }
};

// Create a new memory for a relationship
const createMemory = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { content, type, emotion, sentiment, keywords } = req.body;
    
    const newMemory = new MemoryNode({
      user: req.user.id,
      relationship: relationshipId,
      content,
      type,
      emotion,
      sentiment,
      keywords: keywords || [],
      // Set a higher weight for explicitly created memories
      weight: 0.8
    });
    
    const savedMemory = await newMemory.save();
    res.status(201).json(savedMemory);
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({
      message: 'Failed to create memory',
      error: error.message
    });
  }
};

module.exports = {
  getRelationshipMemories,
  createMemory
};