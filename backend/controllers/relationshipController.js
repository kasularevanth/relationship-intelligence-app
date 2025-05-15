// backend/controllers/relationshipController.js
const Relationship = require('../models/Relationship');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/relationships');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Format: relationshipId-timestamp.extension
    const extension = path.extname(file.originalname);
    const fileName = `${req.params.id}-${Date.now()}${extension}`;
    cb(null, fileName);
  }
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload photo controller
exports.uploadPhoto = async (req, res) => {
  try {
    // Multer middleware handles the file upload
    upload.single('photo')(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const relationshipId = req.params.id;
      
      // Find the relationship
      const relationship = await Relationship.findById(relationshipId);
      
      if (!relationship) {
        // Remove uploaded file if relationship not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ success: false, message: 'Relationship not found' });
      }
      
      // Check if user has permission (relationship belongs to user)
      if (relationship.user.toString() !== req.user.id) {
        // Remove uploaded file if unauthorized
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      
      // Delete old photo if exists
      if (relationship.photo) {
        try {
          const oldPhotoPath = path.join(__dirname, '..', relationship.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (err) {
          console.error('Error deleting old photo:', err);
          // Continue even if old photo deletion fails
        }
      }
      
      // Create photo URL path that will be stored in the database
      // The path should be relative to the server root
      const photoPath = `/uploads/relationships/${path.basename(req.file.path)}`;
      
      // Update relationship with new photo path
      relationship.photo = photoPath;
      await relationship.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Photo uploaded successfully',
        photo: photoPath
      });
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete photo controller
exports.deletePhoto = async (req, res) => {
  try {
    const relationshipId = req.params.id;
    
    // Find the relationship
    const relationship = await Relationship.findById(relationshipId);
    
    if (!relationship) {
      return res.status(404).json({ success: false, message: 'Relationship not found' });
    }
    
    // Check if user has permission
    if (relationship.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Check if relationship has a photo
    if (!relationship.photo) {
      return res.status(400).json({ success: false, message: 'No photo to delete' });
    }
    
    // Delete photo file from server
    try {
      const photoPath = path.join(__dirname, '..', relationship.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    } catch (err) {
      console.error('Error deleting photo file:', err);
      // Continue even if file deletion fails
    }
    
    // Update relationship to remove photo reference
    relationship.photo = null;
    await relationship.save();
    
    return res.status(200).json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Create a new relationship
exports.createRelationship = async (req, res) => {
  try {
    // Get user ID from the auth middleware
    // Make sure req.user exists before trying to access its properties
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated or invalid user data' });
    }
    
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
      notes,
      topicDistribution: [] // Initialize with empty array
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

// Get relationships for a user
exports.getUserRelationships = async (req, res) => {
  try {
    // If userId is provided in URL params, use it
    // Otherwise use the authenticated user's ID from the auth middleware
    let userId;
    
    if (req.params.userId) {
      userId = req.params.userId;
    } else if (req.user && req.user.id) {
      userId = req.user.id;
    } else {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
   
    const relationships = await Relationship.find({ user: userId });
    console.log("relationships..............",relationships);
    
    res.json(relationships);
  } catch (err) {
    console.error('Error fetching relationships:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.getRelationshipProfile = async (req, res) => {
  try {
    const relationshipId = req.params.id;
    
    // Get full relationship with populated references
    // Add proper population for virtual fields with specific field selection
    const relationship = await Relationship.findById(relationshipId)
      .populate({
        path: 'sessions',
        select: '_id title startTime endTime status phase tone'
      })
      .populate({
        path: 'conversations',
        select: '_id title status createdAt updatedAt tone'
      })
      .populate({
        path: 'memoryNodes',
        select: '_id type emotion content sentiment created'
      });
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Count messages if not already done
    if (!relationship.messageCount) {
      const messageCount = await Message.countDocuments({ 
        conversation: { $in: relationship.sessions } 
      });
      relationship.messageCount = messageCount;
      await relationship.save();
    }
    
    // Create structured memory data from memoryNodes (if available)
    let positiveMemories = [];
    let challengeMemories = [];
    let growthOpportunities = [];
    
    if (relationship.memoryNodes && relationship.memoryNodes.length > 0) {
      // Extract memories by emotion type
      positiveMemories = relationship.memoryNodes
        .filter(m => m.emotion === 'positive')
        .map(m => m.content);
        
      challengeMemories = relationship.memoryNodes
        .filter(m => m.emotion === 'negative')
        .map(m => m.content);
        
      growthOpportunities = relationship.memoryNodes
        .filter(m => m.emotion === 'growth')
        .map(m => m.content);
    }
    
    // Prepare topics data
    const topicDistribution = relationship.topicDistribution || [];
    
    // Ensure communication style is in the right format for frontend
    let communicationStyle = relationship.communicationStyle;
    if (!communicationStyle || Object.keys(communicationStyle).length === 0) {
      communicationStyle = {
        user: "balanced",
        contact: "responsive"
      };
    }
    
    // Create a response with ALL the fields the frontend expects
    const response = {
      ...relationship.toObject(),
      
      // Ensure these specific fields are present with defaults if needed
      loveLanguage: relationship.loveLanguage || "Not enough data to determine",
      communicationStyle: communicationStyle,
      theirValues: relationship.theirValues || [],
      theirInterests: relationship.theirInterests || [], 
      theirCommunicationPreferences: relationship.theirCommunicationPreferences || "Not specified",
      importantDates: relationship.importantDates || [],
      positiveMemories: positiveMemories.length > 0 ? positiveMemories : relationship.positiveMemories || [],
      challengeAreas: challengeMemories.length > 0 ? challengeMemories : relationship.challengeAreas || [],
      growthAreas: growthOpportunities.length > 0 ? growthOpportunities : relationship.growthAreas || [],
      trustLevel: relationship.trustLevel || 5,
      topicDistribution: topicDistribution,
      connectionScore: relationship.connectionScore || 75,
      relationshipLevel: relationship.relationshipLevel || 3,
      challengesBadges: relationship.challengesBadges || ["Regular Communicator"],
      nextMilestone: relationship.nextMilestone || "Have a deeper conversation",
      
      // Add metrics with defaults
      metrics: {
        sentimentScore: 0.6, // Default positive if not available
        depthScore: relationship.metrics?.depthScore || 5,
        reciprocityRatio: relationship.metrics?.reciprocityRatio || 0.5,
        emotionalVolatility: relationship.metrics?.emotionalVolatility || 0,
        trust: relationship.trustLevel ? relationship.trustLevel / 10 : 0.7
      }
    };
    
    // Create a summary object if not present
    if (!response.summary) {
      response.summary = {
        keyInsights: response.insights?.length > 0 
          ? response.insights.map(i => i.text).slice(0, 3) 
          : ["Regular communication patterns detected", "Relationship appears to be in good standing"],
        
        emotionalDynamics: {
          overall: "generally positive",
          user: "interested and engaged",
          contact: "responsive and participatory",
          trends: "consistent tone throughout conversations"
        },
        
        areasForGrowth: response.growthAreas?.length > 0 
          ? response.growthAreas 
          : ["More frequent check-ins could strengthen the relationship", 
             "Consider initiating deeper conversations on topics of mutual interest"],
        
        overallTone: "positive"
      };
    }
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching relationship profile:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get a single relationship by ID
exports.getRelationship = async (req, res) => {
  try {
    console.log("req.params.id",req.params.id);
    const relationship = await Relationship.findById(req.params.id)
      .populate('sessions')
      .populate('conversations')
      .populate('memoryNodes');
    console.log("relationship data..",relationship);
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    res.json(relationship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRelationship = async (req, res) => {
  try {
    const { 
      name, 
      relationshipType, 
      contactInfo,
      frequency,
      howWeMet,
      notes,
      metrics 
    } = req.body;
    
    const relationship = await Relationship.findById(req.params.id);
    
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    
    // Update fields if they are provided
    if (name) relationship.contactName = name;
    if (relationshipType) relationship.relationshipType = relationshipType;
    if (contactInfo) relationship.contactInfo = contactInfo;
    if (frequency) relationship.interactionFrequency = frequency;
    if (howWeMet) relationship.howWeMet = howWeMet;
    if (notes) relationship.notes = notes;
    
    // Update metrics if provided
    if (metrics) {
      relationship.metrics = { ...relationship.metrics, ...metrics };
    }
    
    await relationship.save();
    res.json(relationship);
  } catch (err) {
    console.error('Error updating relationship:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update topic distribution for a relationship
exports.updateTopicDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { topics } = req.body;
    
    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({ message: 'Topics must be provided as an array' });
    }
    
    const relationship = await Relationship.findById(id);
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Update topics using the method from the Relationship model
    await relationship.updateTopicDistribution(topics);
    
    res.json({ success: true, topicDistribution: relationship.topicDistribution });
  } catch (err) {
    console.error('Error updating topic distribution:', err);
    res.status(500).json({ message: err.message });
  }
};

// Analyze conversations and generate topic distribution
exports.analyzeTopics = async (req, res) => {
  try {

    console.log("entered in analyze topics............");

    
    const { id } = req.params;
    console.log("analyze topic",id);
    const relationship = await Relationship.findById(id);
    console.log("analyze topic - relation",relationship);
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Get all conversations related to this relationship
    const conversations = await Conversation.find({ relationship: id });
    console.log("analyze topic - conversations",conversations);
    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ 
        message: 'No conversations found for this relationship',
        success: false
      });
    }
    
    // Extract message texts from all conversations
    let allMessages = [];
    for (const conv of conversations) {
      if (conv.messages && conv.messages.length > 0) {
        allMessages = allMessages.concat(conv.messages.map(msg => msg.content || ''));
      }
    }
    
    // Define topic categories and their associated keywords
    const topicKeywords = {
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
    
    // Count topic occurrences
    const topicCounts = {};
    Object.keys(topicKeywords).forEach(topic => {
      topicCounts[topic] = 0;
      topicKeywords[topic].forEach(keyword => {
        allMessages.forEach(text => {
          if (text && typeof text === 'string' && text.toLowerCase().includes(keyword.toLowerCase())) {
            topicCounts[topic]++;
          }
        });
      });
    });
    
    // Convert to percentage-based topics
    const totalTopicMentions = Object.values(topicCounts).reduce((sum, count) => sum + count, 0) || 1;
    
    const topics = Object.entries(topicCounts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalTopicMentions) * 100)
      }))
      .filter(topic => topic.percentage > 0) // Only include topics that were detected
      .sort((a, b) => b.percentage - a.percentage);
    
    // Ensure we have at least some topics if none were found
    if (topics.length === 0) {
      topics.push(
        { name: 'General Discussion', percentage: 70 },
        { name: 'Plans', percentage: 15 },
        { name: 'Personal Updates', percentage: 15 }
      );
    }
    
    // Update the relationship with the new topic distribution
    await relationship.updateTopicDistribution(topics);
    
    res.json({
      success: true,
      message: 'Topics analyzed successfully',
      topicDistribution: relationship.topicDistribution
    });
    
  } catch (err) {
    console.error('Error analyzing topics:', err);
    res.status(500).json({ 
      message: err.message,
      success: false
    });
  }
};

// exports.recalculateMetrics = async (req, res) => {
//   try {

//     console.log("calculating the metrics in backend at chat import",req);
//     const relationshipId = req.params.id;
    
//     // Verify relationship belongs to user
//     const relationship = await Relationship.findOne({
//       _id: relationshipId,
//       user: req.user.id
//     });
    
//     if (!relationship) {
//       return res.status(404).json({ message: 'Relationship not found' });
//     }
    
//     // Recalculate metrics based on all conversations
//     // This would include logic to:
//     // 1. Count total messages
//     // 2. Calculate response times
//     // 3. Update topic distributions
//     // 4. Any other metrics you track
    
//     // Example code - adjust based on your actual data model
//     const conversations = await Conversation.find({ relationshipId });
//     console.log("Conversation with relationshipID",conversations);
//     let totalMessages = 0;
//     let responseTimeSum = 0;
//     let responseTimeCount = 0;
    
//     // Process all conversations to recalculate metrics
//     conversations.forEach(conversation => {
//       totalMessages += conversation.messages.length;
      
//       // Calculate response times (example)
//       for (let i = 1; i < conversation.messages.length; i++) {
//         if (conversation.messages[i].sender !== conversation.messages[i-1].sender) {
//           const responseTime = conversation.messages[i].timestamp - conversation.messages[i-1].timestamp;
//           responseTimeSum += responseTime;
//           responseTimeCount++;
//         }
//       }
//     });
    
//     // Update relationship metrics
//     relationship.metrics = {
//       ...relationship.metrics,
//       totalMessages,
//       averageResponseTime: responseTimeCount > 0 ? responseTimeSum / responseTimeCount : 0,
//       lastUpdated: new Date()
//     };
    
//     await relationship.save();
    
//     res.json({ success: true, message: 'Metrics recalculated successfully' });
//   } catch (error) {
//     console.error('Error recalculating metrics:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// Fix for relationshipController.js - recalculateMetrics function
exports.recalculateMetrics = async (req, res) => {
  try {
    console.log("Recalculating metrics for relationship", req.params.id);
    const relationshipId = req.params.id;
    
    // Verify relationship belongs to user
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: req.user.id
    });
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Get all conversations for this relationship
    const conversations = await Conversation.find({ relationship: relationshipId });
    console.log(`Found ${conversations.length} conversations for relationship ${relationshipId}`);
    
    let totalMessages = 0;
    let responseTimeSum = 0;
    let responseTimeCount = 0;
    let userMessages = 0;
    let contactMessages = 0;
    let lastActivity = null;
    
    // Process all conversations to recalculate metrics
    for (const conversation of conversations) {
      if (!conversation.messages || !Array.isArray(conversation.messages)) {
        console.log(`Skipping conversation ${conversation._id} - no valid messages array`);
        continue;
      }
      
      // Get messages from the database if they're not embedded
      let messages = conversation.messages;
      if (messages.length === 0 && conversation.messages && conversation.messages.length > 0) {
        messages = await Message.find({ 
          _id: { $in: conversation.messages } 
        }).sort({ timestamp: 1 });
      }
      
      // Skip if still no messages
      if (!messages || messages.length === 0) {
        console.log(`No messages found for conversation ${conversation._id}`);
        continue;
      }
      
      totalMessages += messages.length;
      
      // Count messages by sender
      for (const message of messages) {
        // Update last activity timestamp
        const messageTime = message.timestamp || message.createdAt;
        if (messageTime && (!lastActivity || messageTime > lastActivity)) {
          lastActivity = messageTime;
        }
        
        // Count by sender
        if (message.isFromUser) {
          userMessages++;
        } else {
          contactMessages++;
        }
      }
      
      // Calculate response times
      for (let i = 1; i < messages.length; i++) {
        if (messages[i].isFromUser !== messages[i-1].isFromUser) {
          const currentTime = messages[i].timestamp || messages[i].createdAt;
          const prevTime = messages[i-1].timestamp || messages[i-1].createdAt;
          
          if (currentTime && prevTime) {
            const responseTime = new Date(currentTime) - new Date(prevTime);
            if (responseTime > 0 && responseTime < 1000 * 60 * 60 * 24) { // Filter out unreasonable times (>24h)
              responseTimeSum += responseTime;
              responseTimeCount++;
            }
          }
        }
      }
    }
    
    // Calculate reciprocity (message balance)
    const totalExchanges = userMessages + contactMessages;
    const reciprocity = totalExchanges > 0 
      ? Math.round((userMessages / totalExchanges) * 100) 
      : 50; // Default to balanced if no messages
    
    // Update relationship metrics
    relationship.metrics = {
      ...relationship.metrics,
      totalMessages,
      userMessages,
      contactMessages,
      averageResponseTime: responseTimeCount > 0 ? Math.round(responseTimeSum / responseTimeCount) : 0,
      reciprocity,
      lastActivity: lastActivity || new Date(),
      lastUpdated: new Date()
    };
    
    // Update connection depth score based on message count and topic diversity
    // Simple algorithm: 1 point for every 20 messages up to max 10 points
    const depthScore = Math.min(10, Math.floor(totalMessages / 20));
    relationship.metrics.connectionDepth = depthScore;
    
    // If we have topic distribution, use that for emotional tone estimation
    if (relationship.topicDistribution && relationship.topicDistribution.length > 0) {
      // Map topics to emotional tone indicators
      const emotionalTopics = {
        'Emotions': true, 
        'Personal': true,
        'Support': true,
        'Challenges': true,
        'Family': true
      };
      
      // Calculate percentage of emotional topics
      const emotionalPercentage = relationship.topicDistribution
        .filter(topic => emotionalTopics[topic.name])
        .reduce((sum, topic) => sum + topic.percentage, 0);
      
      // Set emotional tone based on percentage of emotional topics
      if (emotionalPercentage > 40) {
        relationship.metrics.emotionalTone = 'Deep';
      } else if (emotionalPercentage > 20) {
        relationship.metrics.emotionalTone = 'Moderate';
      } else {
        relationship.metrics.emotionalTone = 'Surface';
      }
    }
    
    await relationship.save();
    
    // Return the updated metrics
    res.json({ 
      success: true, 
      message: 'Metrics recalculated successfully',
      metrics: relationship.metrics
    });
  } catch (error) {
    console.error('Error recalculating metrics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};





module.exports = exports;