const  Relationship  = require('../models/Relationship');
const User  = require('../models/User');

exports.createRelationship = async (req, res) => {
  try {
    // Get user ID from the auth middleware
    console.log("user", req.user.id);
    const userId = req.user.id;
    
    // Extract relationship data from request body
    const { 
      name, 
      relationshipType, 
      contactInfo,
      frequency,
      howWeMet,
      notes 
    } = req.body;
    
    // Check if user exists
    console.log("UserID",userId);
    console.log("User",User);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Create relationship
    const relationship = new Relationship({
      user: userId,
      contactName: name,
      relationshipType,
      contactInfo,
      interactionFrequency: frequency,
      howWeMet,
      notes
    });
    
    await relationship.save();
    
    // Add relationship to user's relationships array
    if (!user.relationships) {
      user.relationships = [];
    }
    user.relationships.push(relationship._id);
    await user.save();
    
    res.status(201).json(relationship);
  } catch (err) {
    console.error('Error creating relationship:', err);
    res.status(400).json({ message: err.message });
  }
};

// Add a new method to get all relationships for the authenticated user
exports.getUserRelationships = async (req, res) => {
  try {
    // If userId is provided in URL params, use it (for backward compatibility)
    // Otherwise use the authenticated user's ID from the auth middleware
    const userId = req.params.userId || req.user.id;
    
    const relationships = await Relationship.find({ user: userId });
    res.json(relationships);
  } catch (err) {
    console.error('Error fetching relationships:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRelationship = async (req, res) => {
  try {
    const relationship = await Relationship.findById(req.params.id);
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    res.json(relationship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserRelationships = async (req, res) => {
  try {
    const relationships = await Relationship.find({ user: req.params.userId });
    res.json(relationships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRelationship = async (req, res) => {
  try {
    const { metrics } = req.body;
    const relationship = await Relationship.findById(req.params.id);
    
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    
    if (metrics) {
      relationship.metrics = { ...relationship.metrics, ...metrics };
    }
    
    await relationship.save();
    res.json(relationship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
