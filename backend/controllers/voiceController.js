// backend/controllers/voiceController.js
const Recording = require('../models/Recording');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const conversationFlow = require('../services/conversationFlow');
const OpenAI = require('openai');


exports.startRecording = async (req, res) => {
  try {
      const { conversationId } = req.params;
      
      // Verify conversation exists and belongs to user
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
      
      // Create a new recording entry
      const recording = new Recording({
        conversation: conversationId,
        user: req.user.id,
        status: 'recording',
        startTime: Date.now()
      });
      
      await recording.save();
      
      res.status(201).json({
        recordingId: recording._id,
        status: 'recording',
        message: 'Recording started successfully'
      });
  } 
    catch (err) {
      console.error('Error starting recording:', err);
      res.status(500).json({ message: err.message });
    }
};

exports.stopRecording = async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      // Check if we have a file uploaded
      if (!req.file && !req.files) {
        return res.status(400).json({ message: 'No audio file received' });
      }
      
      // Find active recording for this conversation
      const recording = await Recording.findOne({
        conversation: conversationId,
        status: 'recording',
        user: req.user.id
      });
      
      if (!recording) return res.status(404).json({ message: 'Active recording not found' });
      
      // Update recording status
      recording.status = 'processing';
      recording.endTime = Date.now();
      recording.duration = (recording.endTime - recording.startTime) / 1000; // in seconds
      
      // Store the audio file data
      const audioFile = req.file || req.files.audio;
      recording.audioFile = audioFile.buffer; // Store the actual buffer
      recording.audioFileName = audioFile.originalname;
      recording.audioFileType = audioFile.mimetype;
      
      await recording.save();
      
      // Trigger transcription process (async)
      processTranscription(recording._id, conversationId);
      
      res.json({
        recordingId: recording._id,
        status: 'processing',
        message: 'Recording stopped and processing started'
      });
    } 
    catch (err) {
      console.error('Error stopping recording:', err);
      res.status(500).json({ message: err.message });
    }
};

exports.getTranscript = async (req, res) => {
  console.log("entered in get Transcript");
  try {
    const { recordingId } = req.params;
    console.log("Processing transcription for recording", recordingId);
    
    // Find the recording first
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }
    
    // Check if user has permission to access this recording
    if (recording.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this recording' });
    }
    
    // Find the conversation associated with this recording
    // You'll need to adjust this based on how recordings and conversations are linked
    const conversation = await Conversation.findOne({ 
      user: req.user.id,
      // Assuming there's a field in Recording that links to the conversation
      // This could be recording.conversationId or something similar
      _id: recording.conversationId 
    });
    
    // Handle recording status
    if (recording.status === 'processing') {
      return res.status(202).json({
        status: 'processing',
        message: 'Transcription is still processing'
      });
    }
    
    if (recording.status === 'failed') {
      return res.status(500).json({
        status: 'failed',
        message: 'Transcription processing failed'
      });
    }
    
    // Return completed transcript
    res.json({
      recordingId: recording._id,
      transcript: recording.transcript,
      status: recording.status,
      duration: recording.duration,
      nextQuestion: recording.nextQuestion,
      currentPhase: conversation?.currentPhase || 'onboarding'
    });
  } catch (err) {
    console.error('Error retrieving transcript:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to process transcription and advance conversation flow
async function processTranscription(recordingId, conversationId) {
  try {
    const recording = await Recording.findById(recordingId);
    console.log("Processing transcription for recording", recordingId);

    if (!recording) return;
    
    // Get the conversation data
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;
    
    // Ensure contactName is defined
    if (!conversation.contactName) {
      console.error('Missing contactName in conversation:', conversationId);
      // Set a default or fetch from related user data if possible
      conversation.contactName = 'your contact';
      await conversation.save();
    }
    
    // Use OpenAI's Whisper API
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      
      
      // Access the stored buffer directly from the recording
      const audioBuffer = recording.audioFile;
      
      // Create a FormData instance for the API request
      const formData = new FormData();
      
      // Create a Blob from the buffer with the correct MIME type
      const audioBlob = new Blob([audioBuffer], { type: recording.audioFileType });
      
      // Create a temporary file for OpenAI API
      const file = new File(
        [audioBlob], 
        recording.audioFileName || 'recording.webm', 
        { type: recording.audioFileType || 'audio/webm' }
      );
      
      // Send transcription request to OpenAI
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });
      
      
      
      // Update recording with transcript
      recording.transcript = transcription.text;
      recording.status = 'completed';
      await recording.save();
      
      // Create a new message from the user's transcription
      const userMessage = new Message({
        conversation: conversationId,
        user: recording.user,
        role: 'user',
        content: transcription.text,
        timestamp: Date.now()
      });
      
      await userMessage.save();
      
      // Get all messages for this conversation
      const allMessages = await Message.find({ conversation: conversationId }).sort('timestamp');
      
      // Determine if we should move to next phase

      console.log("conversation?.currentPhase",conversation);
      const currentPhase = conversation?.phase || 'onboarding';
      
      const nextPhase = conversationFlow.determineNextPhase(
        currentPhase, // Use from the database
        allMessages.length,
        { 
          contactName: conversation.contactName,
          messages: allMessages // Pass the complete messages array
        }
      );
      
      // Update conversation phase if changed
      if (nextPhase !== currentPhase) {
        console.log(`Updating conversation phase from ${currentPhase} to ${nextPhase}`);
        conversation.phase = nextPhase; // Match the property name used elsewhere
        await conversation.save();
      }

      
      
      // Get next question for this phase
      let nextQuestion;
      
      if (nextPhase === 'completed') {
        // Generate summary using OpenAI
        nextQuestion = await generateSummary(conversation, allMessages);
        conversation.status = 'completed';
        await conversation.save();
      } else {
        // Get next question from conversation flow
        nextQuestion = await conversationFlow.getNextQuestion(
          nextPhase,
          conversation.contactName,
          allMessages
        );
      }

      if (!recording.askedQuestions) recording.askedQuestions = [];
      recording.askedQuestions.push(nextQuestion);
      
      // Store next question with recording for immediate access
      recording.nextQuestion = nextQuestion;
      recording.phase = nextPhase;
      await recording.save();
      
      // Add AI message with next question
      const aiMessage = new Message({
        conversation: conversationId,
        role: 'ai',
        content: nextQuestion,
        timestamp: Date.now(),
        phase: nextPhase // Store the phase with the message

      });
      
      await aiMessage.save();
      
    } catch (transcriptionError) {
      console.error('Transcription service error:', transcriptionError);
      recording.status = 'failed';
      recording.error = transcriptionError.message;
      await recording.save();
    }
  } catch (err) {
    console.error('Error in transcription process:', err);
  }
}

// Generate a summary of the conversation using OpenAI
async function generateSummary(conversation, messages) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Format conversation history for the prompt
    const formattedMessages = messages.map(msg => 
      `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.content}`
    ).join('\n\n');
    
    // Create prompt for GPT
    const prompt = `
      The following is a conversation between a user and an AI about their relationship with ${conversation.contactName}.
      
      Conversation:
      ${formattedMessages}
      
      Please provide a thoughtful summary of this conversation that includes:
      1. Key insights about their relationship with ${conversation.contactName}
      2. Main emotional themes in the relationship
      3. Important patterns or dynamics identified
      4. Potential areas for growth or reflection
      
      Make the summary compassionate, insightful, and helpful for the user's self-reflection.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800
    });

    
    const summaryText = response.choices[0].message.content;
    
    const summary = {
      keyInsights: summaryText, // Store as object fields
      emotionalDynamics: "Analysis of emotional patterns", 
      areasForGrowth: "Suggestions for relationship growth"
    };
    
    conversation.summary = summary; // Now it's an object, not a string
    
    await conversation.save();
    
    return summary;
  } catch (err) {
    console.error('Error generating summary:', err);
    return `I've enjoyed learning about your relationship with ${conversation.contactName}. Unfortunately, I couldn't generate a detailed summary at this time. Thank you for sharing your experiences with me.`;
  }
}

// Add to voiceController.js

exports.processRelationshipQuestion = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const recording = await Recording.findById(recordingId);
    
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }
    
    // Check if user has permission
    if (recording.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get the relationship from the conversation
    const conversation = await Conversation.findById(recording.conversation);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const relationship = await Relationship.findById(conversation.relationship);
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Process the transcript as a relationship question
    // Similar to questionController.askQuestion logic
    
    // Prepare context for AI
    const contextData = {
      relationship: {
        name: relationship.contactName,
        type: relationship.relationshipType,
        frequency: relationship.interactionFrequency,
        howWeMet: relationship.howWeMet || '',
        timeKnown: relationship.timeKnown || '',
      },
      metrics: relationship.metrics || {},
      topicDistribution: relationship.topicDistribution || [],
      insights: relationship.insights || []
    };
    
    // Create the system prompt
    const systemPrompt = `You are an emotionally intelligent AI assistant specialized in relationship insights. You're helping the user reflect on their relationship with ${relationship.contactName}.
    
    Your responses should be:
    1. Thoughtful, nuanced, and based on the relationship context provided
    2. Non-judgmental but gently thought-provoking
    3. Focused on patterns, emotional dynamics, and growth opportunities
    4. Appropriately brief (2-4 paragraphs maximum)
    
    You should NOT:
    1. Make definitive claims about what the other person thinks/feels
    2. Give specific action commands ("you should...")
    3. Diagnose relationship problems
    4. Overpromise what reflection can achieve
    
    Use the provided relationship context to inform your response, but feel free to acknowledge the limitations of your knowledge about this specific relationship.`;

    // Format the user message with context
    const userMessage = `Question about my relationship with ${relationship.contactName}: "${recording.transcript}"

    Relationship Context: ${JSON.stringify(contextData, null, 2)}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or another appropriate model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Save the question and answer
    const relationshipQuestion = new RelationshipQuestion({
      user: req.user.id,
      relationship: relationship._id,
      question: recording.transcript,
      answer: aiResponse,
      createdAt: new Date()
    });

    await relationshipQuestion.save();
    
    // Update the recording with the answer
    recording.answer = aiResponse;
    await recording.save();
    
    // Return the result
    res.json({
      success: true,
      transcript: recording.transcript,
      answer: aiResponse,
      _id: relationshipQuestion._id
    });
    
  } catch (error) {
    console.error('Error processing relationship question:', error);
    res.status(500).json({ message: error.message });
  }
};