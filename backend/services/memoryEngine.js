// backend/services/memoryEngine.js

const { MemoryNode } = require('../models/MemoryNode');
const { Relationship } = require('../models/Relationship');

exports.storeMemoryNode = async (memoryNode) => {
  try {
    const newNode = new MemoryNode(memoryNode);
    await newNode.save();
    return newNode;
  } catch (err) {
    console.error('Error storing memory node:', err);
    throw err;
  }
};

exports.getRelevantMemories = async (relationshipId, context, limit = 5) => {
  try {
    // This would be implemented with semantic search in a production system
    // For MVP, we'll just get the most recent memory nodes
    const memories = await MemoryNode.find({ relationship: relationshipId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return memories;
  } catch (err) {
    console.error('Error retrieving memories:', err);
    return [];
  }
};

exports.updateRelationshipMetrics = async (relationshipId) => {
  try {
    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) throw new Error('Relationship not found');
    
    // Get all memory nodes for this relationship
    const memoryNodes = await MemoryNode.find({ relationship: relationshipId });
    
    // Calculate sentiment score (average of all memory nodes)
    const sentimentValues = memoryNodes.map(node => node.sentiment);
    const sentimentScore = sentimentValues.length > 0 
      ? sentimentValues.reduce((sum, val) => sum + val, 0) / sentimentValues.length
      : 0;
    
    // Calculate depth score (average of emotional intensity)
    const intensityValues = memoryNodes.map(node => node.emotionalIntensity);
    const depthScore = intensityValues.length > 0
      ? Math.min(5, Math.max(1, intensityValues.reduce((sum, val) => sum + val, 0) / intensityValues.length))
      : 1;
    
    // Count nodes by type for topic distribution
    const topicCounts = {
      conflict: memoryNodes.filter(node => node.type === 'conflict').length,
      support: memoryNodes.filter(node => node.type === 'support').length,
      humor: memoryNodes.filter(node => node.type === 'joy').length, // Map 'joy' to 'humor'
      values: memoryNodes.filter(node => node.tags && node.tags.includes('values')).length,
      other: memoryNodes.filter(node => !['conflict', 'support', 'joy'].includes(node.type) && 
                                     !(node.tags && node.tags.includes('values'))).length
    };
    
    // Calculate total for percentage conversion
    const totalTopics = Object.values(topicCounts).reduce((sum, val) => sum + val, 0);
    
    // Update relationship metrics
    relationship.metrics = {
      sentimentScore,
      depthScore,
      // Reciprocity ratio would need more complex analysis - keeping default for MVP
      emotionalVolatility: calculateEmotionalVolatility(memoryNodes),
      topicDistribution: {
        conflict: totalTopics > 0 ? topicCounts.conflict / totalTopics : 0,
        support: totalTopics > 0 ? topicCounts.support / totalTopics : 0,
        humor: totalTopics > 0 ? topicCounts.humor / totalTopics : 0,
        values: totalTopics > 0 ? topicCounts.values / totalTopics : 0,
        other: totalTopics > 0 ? topicCounts.other / totalTopics : 0
      }
    };
    
    await relationship.save();
    return relationship.metrics;
  } catch (err) {
    console.error('Error updating relationship metrics:', err);
    throw err;
  }
};

// Helper function to calculate emotional volatility
function calculateEmotionalVolatility(memoryNodes) {
  if (memoryNodes.length < 3) return 'Stable'; // Not enough data
  
  // Sort nodes by creation date
  const sortedNodes = [...memoryNodes].sort((a, b) => a.createdAt - b.createdAt);
  
  // Calculate variance in sentiment
  const sentiments = sortedNodes.map(node => node.sentiment);
  const avg = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
  const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / sentiments.length;
  
  // Classify based on variance
  if (variance < 0.1) return 'Stable';
  if (variance < 0.3) return 'Swingy';
  return 'Erratic';
}

exports.compressRedundantMemories = async (relationshipId) => {
  try {
    // In a real system, this would use NLP to identify and combine similar memories
    // For MVP, we'll just implement a basic compression algorithm based on time
    
    // Get all memory nodes for this relationship
    const memoryNodes = await MemoryNode.find({ relationship: relationshipId })
      .sort({ createdAt: 1 });
    
    // Group by type
    const groupedByType = {};
    memoryNodes.forEach(node => {
      if (!groupedByType[node.type]) {
        groupedByType[node.type] = [];
      }
      groupedByType[node.type].push(node);
    });
    
    // For each type, compress if there are more than 3 nodes of the same type
    for (const type in groupedByType) {
      const nodes = groupedByType[type];
      if (nodes.length > 3) {
        // Keep the most recent and the most emotionally intense
        nodes.sort((a, b) => b.emotionalIntensity - a.emotionalIntensity);
        const mostIntense = nodes[0];
        
        nodes.sort((a, b) => b.createdAt - a.createdAt);
        const mostRecent = nodes[0];
        
        // Delete others if they're older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        for (const node of nodes) {
          if (node._id.toString() !== mostIntense._id.toString() && 
              node._id.toString() !== mostRecent._id.toString() &&
              new Date(node.createdAt) < sevenDaysAgo) {
            await MemoryNode.findByIdAndDelete(node._id);
          }
        }
      }
    }
    
    return { message: 'Memory compression complete' };
  } catch (err) {
    console.error('Error compressing memories:', err);
    throw err;
  }
};