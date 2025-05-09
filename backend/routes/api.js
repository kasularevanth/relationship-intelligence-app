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



module.exports = router;