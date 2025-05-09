const  Conversation  = require('../models/Conversation');
const  Relationship  = require('../models/Relationship');
const  MemoryNode  = require('../models/MemoryNode');
const aiEngine = require('../services/aiEngine');
const memoryEngine = require('../services/memoryEngine');
const sentimentAnalysis = require('../services/sentimentAnalysis');
const conversationFlow = require('../services/conversationFlow');
const Message = require('../models/Message');
const OpenAI = require('openai');

exports.startConversation = async (req, res) => {
  try {
   
    const relationshipId = req.body.relationshipId || req.params.relationshipId;
    console.log("start conversation", relationshipId);
    
    
    // Check if relationship exists
    const relationship = await Relationship.findById(relationshipId);
    
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });
    
    // Create new conversation
    const conversation = new Conversation({
      relationship: relationshipId,
      user: relationship.user, // Add this line to include the user ID
      contactName: relationship.contactName,
      phase: 'onboarding',
    });
    
    await conversation.save();
   
    
    // Add conversation to relationship's sessions
    relationship.sessions.push(conversation._id);
    
    await relationship.save();
    
    
//     // Get initial message from AI

      const initialMessage = await conversationFlow.getInitialMessage(relationship.contactName);


    
    // Add initial AI message to conversation
    conversation.messages.push({
      role: 'ai',
      content: initialMessage,
      sentiment: 0,
      depth: 1
    });
    console.log("conversation and messages",conversation);
    
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
    console.log("req.params.id",req.params.id);

    const conversation = await Conversation.findById(req.params.id);


    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { content, phase } = req.body;
    const conversationId = req.params.id;
    console.log("content, phase",phase);
    
    // Get conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    // Get relationship
    const relationship = await Relationship.findById(conversation.relationship);
    console.log("relationship with conversation",relationship);
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

     // Update phase if provided
     if (phase && phase !== conversation.phase) {
      conversation.phase = phase;
    }
    
    await conversation.save();
    console.log("conversation before ai response",conversation);
    // Determine if phase should change based on message count
    const messageCount = conversation.messages.length;
    const currentPhase = conversation.phase;
    console.log("currentPhase",currentPhase);
    const nextPhase = conversationFlow.determineNextPhase(
      currentPhase, 
      messageCount, 
      { 
        contactName: relationship.contactName,
        messages: conversation.messages // Pass the complete messages array
      }
    );
    
    // Process message with AI and get response
    const aiResponse = await aiEngine.generateResponse({
      relationship,
      conversation,
      userMessage: content,
      currentPhase: nextPhase // Use the potentially updated phase
    });
    
    // Add AI message to conversation
    conversation.messages.push({
      role: 'ai',
      content: aiResponse.message,
      sentiment: 0,
      depth: aiResponse.depth || 1
    });
    
    if (nextPhase !== currentPhase) {
      console.log(`Updating phase from ${currentPhase} to ${nextPhase}`);
      conversation.phase = nextPhase;
      await conversation.save();
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
      phase: conversation.phase
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

async function generateSummary(conversation, messages) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Format conversation history for the prompt
    const formattedMessages = messages.map(msg => 
      `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.content}`
    ).join('\n\n');
    
    // Create prompt for GPT that explicitly asks for structured sections
    const prompt = `
      The following is a conversation between a user and an AI about their relationship with ${conversation.contactName}.
      
      Conversation:
      ${formattedMessages}
      
      Please analyze this conversation and provide a structured summary with exactly these three sections:
      
      1. KEY INSIGHTS:
      Provide key insights about their relationship with ${conversation.contactName}
      
      2. EMOTIONAL DYNAMICS:
      Analyze the main emotional themes, patterns, and dynamics identified in the relationship
      
      3. AREAS FOR GROWTH:
      Suggest specific areas for growth, reflection, or improvement in this relationship
      
      Format your response with these exact section headers, and make the summary compassionate, insightful, and helpful for the user's self-reflection.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000
    });
    
    const summaryText = response.choices[0].message.content;
    
    // Parse the sections from the response
    const keyInsightMatch = summaryText.match(/1\.\s*KEY INSIGHTS:?([\s\S]*?)(?=2\.\s*EMOTIONAL DYNAMICS|$)/i);
    const emotionalDynamicsMatch = summaryText.match(/2\.\s*EMOTIONAL DYNAMICS:?([\s\S]*?)(?=3\.\s*AREAS FOR GROWTH|$)/i);
    const areasForGrowthMatch = summaryText.match(/3\.\s*AREAS FOR GROWTH:?([\s\S]*?)$/i);
    
    const summary = {
      keyInsights: keyInsightMatch ? keyInsightMatch[1].trim() : "No key insights provided.",
      emotionalDynamics: emotionalDynamicsMatch ? emotionalDynamicsMatch[1].trim() : "No emotional dynamics analysis provided.",
      areasForGrowth: areasForGrowthMatch ? areasForGrowthMatch[1].trim() : "No growth suggestions provided."
    };
    
    // If parsing fails for some reason, fall back to dividing the text into three parts
    if (!keyInsightMatch && !emotionalDynamicsMatch && !areasForGrowthMatch) {
      const paragraphs = summaryText.split('\n\n').filter(p => p.trim().length > 0);
      
      if (paragraphs.length >= 3) {
        summary.keyInsights = paragraphs[0];
        summary.emotionalDynamics = paragraphs[1];
        summary.areasForGrowth = paragraphs[2];
      } else if (paragraphs.length === 2) {
        summary.keyInsights = paragraphs[0];
        summary.emotionalDynamics = paragraphs[1];
      } else if (paragraphs.length === 1) {
        // Split into three roughly equal parts if just one long paragraph
        const text = paragraphs[0];
        const third = Math.floor(text.length / 3);
        summary.keyInsights = text.substring(0, third);
        summary.emotionalDynamics = text.substring(third, 2 * third);
        summary.areasForGrowth = text.substring(2 * third);
      }
    }
    
    conversation.summary = summary;
    await conversation.save();
    
    return summary;
  } catch (err) {
    console.error('Error generating summary:', err);
    return {
      keyInsights: `I've enjoyed learning about your relationship with ${conversation.contactName}. Unfortunately, I couldn't generate detailed insights at this time.`,
      emotionalDynamics: "The emotional dynamics couldn't be fully analyzed due to a technical issue.",
      areasForGrowth: "Please try again later for personalized growth suggestions."
    };
  }
}



// Add this to your conversationController.js
exports.getConversationSummary = async (req, res) => {
  try {

    console.log("entered into summary");
    const { conversationId } = req.params;
    
    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    console.log("found conversation",conversation);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user has permission to access this conversation
    if (conversation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }
    
    // Check if summary exists
    
      // Get all messages for this conversation
      const allMessages = await Message.find({ conversation: conversationId }).sort('timestamp');
      console.log("all messages",allMessages)

     
      
      
      // Generate a summary if it doesn't exist
      const summary = await generateSummary(conversation, allMessages);
      console.log("summary",summary);
      
      // Return the newly generated summary
      return res.json(summary);
    
    
    // Return existing summary
    res.json(conversation.summary);
  } catch (err) {
    console.error('Error retrieving conversation summary:', err);
    res.status(500).json({ message: err.message });
  }
};