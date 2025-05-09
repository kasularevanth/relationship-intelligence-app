// controllers/detailedProfileController.js
const Relationship = require('../models/Relationship');
const MemoryNode = require('../models/MemoryNode');

/**
 * Get detailed relationship profile with all enhanced fields
 */
const getDetailedProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify relationship belongs to user
    const relationship = await Relationship.findOne({
      _id: id,
      user: req.user.id
    });
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Relationship not found'
      });
    }
    
    // Get memory nodes for relationship
    const memories = await MemoryNode.find({
      relationship: id
    }).sort({ created: -1 }).limit(20);
    
    // Format the relationship data with all fields needed by the frontend
    const responseData = {
      ...relationship.toObject(),
      memories: memories.map(memory => ({
        id: memory._id,
        content: memory.content,
        emotion: memory.emotion,
        sentiment: memory.sentiment,
        created: memory.created,
        keywords: memory.keywords
      }))
    };
    
    // Ensure we have default values for missing fields
    if (!responseData.metrics) {
      responseData.metrics = {
        emotionalVolatility: 0,
        depthScore: 5,
        reciprocityRatio: 0.5,
        trust: 0.7
      };
    }
    
    if (!responseData.communicationStyle) {
      responseData.communicationStyle = {
        user: "balanced",
        contact: "responsive"
      };
    }
    
    if (!responseData.loveLanguage) {
      responseData.loveLanguage = "Not enough data to determine";
    }
    
    if (!responseData.theirValues || !Array.isArray(responseData.theirValues) || responseData.theirValues.length === 0) {
      responseData.theirValues = ["No values identified yet"];
    }
    
    if (!responseData.theirInterests || !Array.isArray(responseData.theirInterests) || responseData.theirInterests.length === 0) {
      responseData.theirInterests = ["No interests identified yet"];
    }
    
    if (!responseData.theirCommunicationPreferences) {
      responseData.theirCommunicationPreferences = "Not determined yet";
    }
    
    if (!responseData.importantDates || !Array.isArray(responseData.importantDates) || responseData.importantDates.length === 0) {
      responseData.importantDates = [];
    }
    
    // Ensure topicDistribution exists
    if (!responseData.topicDistribution || !Array.isArray(responseData.topicDistribution) || responseData.topicDistribution.length === 0) {
      responseData.topicDistribution = [
        { name: "General Discussion", percentage: 100 }
      ];
    }
    
    // Ensure gamification elements exist
    if (!responseData.gamification) {
      responseData.gamification = {
        connectionScore: 75,
        relationshipLevel: 1,
        challengesBadges: ["New Relationship"],
        nextMilestone: "Have your first conversation",
        communicationStyle: responseData.communicationStyle
      };
    }
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error retrieving detailed profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving detailed profile'
    });
  }
};

module.exports = {
  getDetailedProfile
};