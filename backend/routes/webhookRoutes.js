// backend/routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebaseAdmin');
const { 
  syncUserFromFirebase, 
  syncRelationshipFromFirebase,
  syncConversationFromFirebase,
  syncMemoryNodeFromFirebase,
} = require('../services/syncService');

// Debug logging middleware for routes (matching your pattern)
router.use((req, res, next) => {
  console.log(`Webhook Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ message: 'Firebase token is required' });
    }
    
    await auth.verifyIdToken(token);
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
};

// Webhook route for user changes
router.post('/user/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    await syncUserFromFirebase(userId);
    res.status(200).json({ message: 'User synchronized successfully' });
  } catch (error) {
    console.error('User webhook error:', error);
    res.status(500).json({ message: 'Failed to sync user from Firebase' });
  }
});

// Webhook route for relationship changes
router.post('/relationship/:relationshipId', verifyFirebaseToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    await syncRelationshipFromFirebase(relationshipId);
    res.status(200).json({ message: 'Relationship synchronized successfully' });
  } catch (error) {
    console.error('Relationship webhook error:', error);
    res.status(500).json({ message: 'Failed to sync relationship from Firebase' });
  }
});

// Webhook route for conversation changes
router.post('/conversation/:conversationId', verifyFirebaseToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    await syncConversationFromFirebase(conversationId);
    res.status(200).json({ message: 'Conversation synchronized successfully' });
  } catch (error) {
    console.error('Conversation webhook error:', error);
    res.status(500).json({ message: 'Failed to sync conversation from Firebase' });
  }
});

// Webhook route for memory changes
router.post('/memory/:memoryId', verifyFirebaseToken, async (req, res) => {
  try {
    const { memoryId } = req.params;
    await syncMemoryNodeFromFirebase(memoryId);
    res.status(200).json({ message: 'Memory synchronized successfully' });
  } catch (error) {
    console.error('Memory webhook error:', error);
    res.status(500).json({ message: 'Failed to sync memory from Firebase' });
  }
});

// Webhook route for question changes
router.post('/question/:questionId', verifyFirebaseToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    await syncQuestionFromFirebase(questionId);
    res.status(200).json({ message: 'Question synchronized successfully' });
  } catch (error) {
    console.error('Question webhook error:', error);
    res.status(500).json({ message: 'Failed to sync question from Firebase' });
  }
});

module.exports = router;