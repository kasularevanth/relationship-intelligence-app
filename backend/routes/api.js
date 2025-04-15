// backend/routes/api.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const conversationController = require('../controllers/conversationController');
const relationshipController = require('../controllers/relationshipController');
const userController = require('../controllers/userController');

// User routes
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUser);

// Relationship routes - Add auth middleware
router.post('/relationships', auth, relationshipController.createRelationship);
router.get('/relationships/:id', auth, relationshipController.getRelationship);
router.get('/relationships', auth, relationshipController.getUserRelationships); // New route for getting all user relationships
router.get('/users/:userId/relationships', relationshipController.getUserRelationships); // Keep for backward compatibility
router.put('/relationships/:id', auth, relationshipController.updateRelationship);

// Conversation routes - Add auth middleware
router.post('/conversations', auth, conversationController.startConversation);
router.get('/conversations/:id', auth, conversationController.getConversation);
router.post('/conversations/:id/messages', auth, conversationController.addMessage);
router.post('/conversations/:id/complete', auth, conversationController.completeConversation);
router.get('/relationships/:relationshipId/conversations', auth, conversationController.getRelationshipConversations);

module.exports = router;