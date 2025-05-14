// backend/routes/firebaseApiRoutes.js
const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/firebaseAuth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Controllers
const relationshipController = require('../controllers/relationshipController');
const conversationController = require('../controllers/conversationController');
const questionController = require('../controllers/questionController');
const memoryController = require('../controllers/memoryController');
const voiceController = require('../controllers/voiceController');
const importController = require('../controllers/importController');
const detailedProfileController = require('../controllers/detailedProfileController');
const userController = require('../controllers/userController');

// Debug logging middleware for routes (keeping your existing logging pattern)
router.use((req, res, next) => {
  console.log(`Firebase API Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Apply Firebase authentication to all routes
router.use(firebaseAuth);

// User routes
router.get('/users/:id', userController.getUser);

// Relationship routes
router.get('/relationships', relationshipController.getUserRelationships);
router.post('/relationships', relationshipController.createRelationship);
router.get('/relationships/:id', relationshipController.getRelationship);
router.put('/relationships/:id', relationshipController.updateRelationship);
router.get('/relationships/:id/profile', relationshipController.getRelationshipProfile);
router.post('/relationships/:id/photo', relationshipController.uploadPhoto);
router.delete('/relationships/:id/photo', relationshipController.deletePhoto);
router.post('/relationships/:id/topics', relationshipController.updateTopicDistribution);
router.post('/relationships/:id/analyze-topics', relationshipController.analyzeTopics);
router.post('/relationships/:id/recalculate-metrics', relationshipController.recalculateMetrics);
router.get('/relationships/:id/detailed-profile', detailedProfileController.getDetailedProfile);

// Conversation routes
router.post('/conversations', conversationController.startConversation);
router.post('/conversations/new/:relationshipId', conversationController.startConversation);
router.get('/conversations/:id', conversationController.getConversation);
router.post('/conversations/:id/message', conversationController.addMessage);
router.post('/conversations/:id/complete', conversationController.completeConversation);
router.get('/relationships/:relationshipId/conversations', conversationController.getRelationshipConversations);
router.get('/conversations/:conversationId/summary', conversationController.getConversationSummary);

// Question routes
router.post('/relationships/question', questionController.askQuestion);
router.get('/relationships/:relationshipId/questions', questionController.getQuestionHistory);
router.post(
  '/relationships/:relationshipId/voice-question', 
  upload.single('audio'),
  questionController.askQuestionVoice
);

// Memory routes
router.get('/relationships/:relationshipId/memories', memoryController.getRelationshipMemories);
router.post('/relationships/:relationshipId/memories', memoryController.createMemory);

// Voice routes
router.post('/conversations/:conversationId/record/start', voiceController.startRecording);
router.post(
  '/conversations/:conversationId/record/stop', 
  upload.single('audio'), 
  voiceController.stopRecording
);
router.get('/recordings/:recordingId/transcript', voiceController.getTranscript);
router.post('/recordings/:recordingId/question', voiceController.processRelationshipQuestion);

// Import routes
router.post('/relationships/:relationshipId/import', importController.importChat);
router.get('/imports/:conversationId/status', importController.getImportStatus);
router.get('/imports/:conversationId/analysis', importController.getImportAnalysis);

// Relationship Analysis route (keeping your custom route)
router.post('/relationships/:id/analyze', async (req, res) => {
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