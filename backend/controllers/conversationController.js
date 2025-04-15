const  Conversation  = require('../models/Conversation');
const  Relationship  = require('../models/Relationship');
const  MemoryNode  = require('../models/MemoryNode');
const aiEngine = require('../services/aiEngine');
const memoryEngine = require('../services/memoryEngine');
const sentimentAnalysis = require('../services/sentimentAnalysis');
const conversationFlow = require('../services/conversationFlow');

exports.startConversation = async (req, res) => {
  try {
    const { relationshipId } = req.body;
    
    // Check if relationship exists
    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    
    // Create new conversation
    const conversation = new Conversation({
      relationship: relationshipId,
      phase: 'onboarding',
    });
    
    await conversation.save();
    
    // Add conversation to relationship's sessions
    relationship.sessions.push(conversation._id);
    await relationship.save();
    
    // Get initial message from AI
    const initialMessage = await conversationFlow.getInitialMessage(relationship.contactName);
    
    // Add initial AI message to conversation
    conversation.messages.push({
      role: 'ai',
      content: initialMessage,
      sentiment: 0,
      depth: 1
    });
    
    await conversation.save();
    
    res.status(201).json({
      conversation,
      initialMessage
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const conversationId = req.params.id;
    
    // Get conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    // Get relationship
    const relationship = await Relationship.findById(conversation.relationship);
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    
    // Analyze sentiment and depth
    const sentiment = await sentimentAnalysis.analyzeSentiment(content);
    const depth = await sentimentAnalysis.analyzeDepth(content);
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content,
      sentiment,
      depth
    });
    
    await conversation.save();
    
    // Process message with AI and get response
    const aiResponse = await aiEngine.generateResponse({
      relationship,
      conversation,
      userMessage: content,
      currentPhase: conversation.phase
    });
    
    // Add AI message to conversation
    conversation.messages.push({
      role: 'ai',
      content: aiResponse.message,
      sentiment: 0,
      depth: aiResponse.depth || 1
    });
    
    // Update conversation phase if needed
    if (aiResponse.nextPhase && aiResponse.nextPhase !== conversation.phase) {
      conversation.phase = aiResponse.nextPhase;
    }
    
    await conversation.save();
    
    // Extract and store memory nodes if any
    if (aiResponse.memoryNodes && aiResponse.memoryNodes.length > 0) {
      for (const node of aiResponse.memoryNodes) {
        const memoryNode = new MemoryNode({
          relationship: relationship._id,
          type: node.type,
          content: node.content,
          source: {
            conversation: conversation._id,
            messageIndex: conversation.messages.length - 2 // Index of user message
          },
          emotionalIntensity: node.emotionalIntensity || 5,
          sentiment: node.sentiment || sentiment,
          weight: node.weight || 1,
          tags: node.tags || []
        });
        
        await memoryNode.save();
        
        // Add memory node to relationship
        relationship.memoryNodes.push(memoryNode._id);
      }
      
      await relationship.save();
    }
    
    // Update relationship metrics based on conversation
    await memoryEngine.updateRelationshipMetrics(relationship._id);
    
    res.json({
      message: aiResponse.message,
      nextPhase: conversation.phase
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Get conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    // Mark conversation as completed
    conversation.phase = 'completed';
    conversation.endTime = Date.now();
    
    // Calculate duration
    const startTime = new Date(conversation.startTime);
    const endTime = new Date(conversation.endTime);
    conversation.duration = Math.round((endTime - startTime) / 60000); // in minutes
    
    // Generate summary
    const summary = await aiEngine.generateSummary(conversation);
    conversation.summary = summary;
    
    await conversation.save();
    
    res.json({
      message: "Conversation completed successfully",
      summary
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRelationshipConversations = async (req, res) => {
  try {
    const relationshipId = req.params.relationshipId;
    
    // Check if relationship exists
    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    
    // Get conversations for relationship
    const conversations = await Conversation.find({ relationship: relationshipId })
      .sort({ startTime: -1 });
    
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};