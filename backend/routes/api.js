// backend/routes/api.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const conversationController = require('../controllers/conversationController');
const relationshipController = require('../controllers/relationshipController');
const userController = require('../controllers/userController');
const memoryController = require('../controllers/memoryController');
const voiceController = require('../controllers/voiceController');
const importController = require('../controllers/importController'); // Add this
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const questionController = require('../controllers/questionController');
const  Conversation  = require('../models/Conversation');
const  Relationship  = require('../models/Relationship');
const { getDetailedProfile } = require('../controllers/detailedProfileController');
const relationshipTypeAnalysisController = require('../controllers/relationshipTypeAnalysisController');
const MemoryNode = require('../models/MemoryNode');



// Debug logging middleware for routes
router.use((req, res, next) => {
  console.log(`API Route: ${req.method} ${req.originalUrl}`);
  next();
});

// User routes
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUser);

// Relationship routes - Add auth middleware
router.post('/relationships', auth, relationshipController.createRelationship);

router.get('/relationships/:id', auth, relationshipController.getRelationship);
router.get('/relationships', auth, relationshipController.getUserRelationships);
router.get('/users/:userId/relationships', relationshipController.getUserRelationships);
router.put('/relationships/:id', auth, relationshipController.updateRelationship);
router.get('/relationships/:id/profile', auth, relationshipController.getRelationshipProfile);

// New route for analyzing topics
router.post('/relationships/:id/analyze-topics', auth, relationshipController.analyzeTopics);

// Direct route for updating topic distribution
router.post('/relationships/:id/topics', auth, relationshipController.updateTopicDistribution);

router.post('/relationships/:id/recalculate-metrics', auth, relationshipController.recalculateMetrics);
// Add type-specific analysis route
router.get('/relationships/:relationshipId/type-analysis', auth, relationshipTypeAnalysisController.getTypeAnalysis);

// Memory routes
router.get('/relationships/:relationshipId/memories', auth, memoryController.getRelationshipMemories);
router.post('/relationships/:relationshipId/memories', auth, memoryController.createMemory);

router.post(
  '/relationships/:id/photo', 
  auth, 
  
  
  relationshipController.uploadPhoto
);
router.delete(
  '/relationships/:id/photo', 
  auth, 
  relationshipController.deletePhoto
);


// Question routes
router.post('/relationships/question', auth, questionController.askQuestion);
router.get('/relationships/:relationshipId/questions', auth, questionController.getQuestionHistory);
// Add this to your backend/routes/api.js
router.post('/relationships/:relationshipId/voice-question', 
  auth, 
  upload.single('audio'),
  questionController.askQuestionVoice
);
// Detailed relationship profile endpoint
router.get('/relationships/:id/detailed-profile', auth, getDetailedProfile);


// Conversation routes - Add auth middleware
router.post('/conversations', auth, conversationController.startConversation);
router.post('/conversations/new/:relationshipId', auth, conversationController.startConversation);
router.get('/conversations/:id', auth, conversationController.getConversation);
router.post('/conversations/:id/message', auth, conversationController.addMessage);

router.post('/conversations/:id/complete', auth, conversationController.completeConversation);
router.get('/relationships/:relationshipId/conversations', auth, conversationController.getRelationshipConversations);
// Add this to your routes/api.js
router.get('/conversations/:conversationId/summary', auth, conversationController.getConversationSummary);


// Voice recording routes - all protected by auth middleware
router.post('/conversations/:conversationId/record/start', auth, voiceController.startRecording);

router.post('/conversations/:conversationId/record/stop', 
  auth,
  upload.single('audio'), 
  voiceController.stopRecording
);

router.get('/recordings/:recordingId/transcript', auth, voiceController.getTranscript);
router.post('/recordings/:recordingId/question', auth, voiceController.processRelationshipQuestion);



// Import routes - new
router.post('/relationships/:relationshipId/import', auth, importController.importChat);
router.get('/imports/:conversationId/status', auth, importController.getImportStatus);
router.get('/imports/:conversationId/analysis', auth, importController.getImportAnalysis);


// In routes/api.js

// Replace this route:
router.post('/:id/recalculate-metrics', auth, async (req, res) => {
  // ...existing code
});






router.post('/relationships/:id/analyze', auth, async (req, res) => {
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
    
    // Get the most recent conversation for this relationship
    const conversation = await Conversation.findOne({
      relationship: id
    }).sort({ createdAt: -1 });
    
    if (!conversation) {
      return res.status(400).json({
        success: false,
        message: 'No conversations found for this relationship'
      });
    }
    
    // Trigger the relationship analyzer
    const { enrichRelationshipData } = require('../services/relationshipAnalyzer');
    const result = await enrichRelationshipData(id, conversation._id);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Relationship analysis completed successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Analysis failed: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Error analyzing relationship:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error analyzing relationship'
    });
  }
});



// Add this to a routes file or your app.js
router.get('/admin/update-memory-emotions',auth, async (req, res) => {
  try {

    console.log("updated memories.........");
    // Include the emotion determination function here
    /**
 * Determine specific emotion type based on content and sentiment score
 */
const determineEmotion = (content, sentimentScore) => {
  // Force lowercase for better text matching
  const lowerContent = content.toLowerCase();
  
  // POSITIVE EMOTIONS
  if (sentimentScore > 0.1) {
    // Joy keywords
    if (lowerContent.includes('happy') || lowerContent.includes('fun') || 
        lowerContent.includes('enjoy') || lowerContent.includes('laugh') ||
        lowerContent.includes('excited') || lowerContent.includes('party') ||
        lowerContent.includes('celebration') || lowerContent.includes('hobbies')) {
      return 'Joy';
    }
    
    // Love keywords
    if (lowerContent.includes('love') || lowerContent.includes('care') || 
        lowerContent.includes('miss you') || lowerContent.includes('affection') ||
        lowerContent.includes('together') || lowerContent.includes('relationship')) {
      return 'Love';
    }
    
    return 'Positive'; // Default positive emotion
  }
  
  // NEGATIVE EMOTIONS
  if (sentimentScore < -0.1) {
    // Sadness keywords
    if (lowerContent.includes('sad') || lowerContent.includes('miss') || 
        lowerContent.includes('sorry') || lowerContent.includes('hurt') ||
        lowerContent.includes('lonely') || lowerContent.includes('disappointed')) {
      return 'Sadness';
    }
    
    // Anger keywords
    if (lowerContent.includes('angry') || lowerContent.includes('upset') || 
        lowerContent.includes('argument') || lowerContent.includes('conflict') ||
        lowerContent.includes('frustrated') || lowerContent.includes('annoyed')) {
      return 'Anger';
    }
    
    return 'Negative'; // Default negative emotion
  }
  
  // TOPIC-BASED CATEGORIZATION
  // Growth-related topics
  if (lowerContent.includes('learning') || lowerContent.includes('education') || 
      lowerContent.includes('health') || lowerContent.includes('exercise') ||
      lowerContent.includes('development') || lowerContent.includes('progress') ||
      lowerContent.includes('future') || lowerContent.includes('goals')) {
    return 'Growth';
  }
  
  // Positive topics even with neutral sentiment
  if (lowerContent.includes('hobbies') || lowerContent.includes('travel') || 
      lowerContent.includes('vacation') || lowerContent.includes('celebrate') ||
      lowerContent.includes('recreation') || lowerContent.includes('together')) {
    return 'Positive';
  }
  
  // Default to Neutral for everything else
  return 'Neutral';
};
    
    // Get all memory nodes
    const memories = await MemoryNode.find({});
    let count = 0;
    
    for (const memory of memories) {
      const emotion = determineEmotion(memory.content, memory.sentiment);
      
      if (!memory.emotion || memory.emotion === 'Neutral') {
        memory.emotion = emotion;
        await memory.save();
        count++;
      }
    }
    
    res.json({ success: true, message: `Updated emotions for ${count} memory nodes` });
  } catch (error) {
    console.error('Error updating memory emotions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = router;