// backend/controllers/enhancedQuestionController.js

const Relationship = require("../models/Relationship");
const RelationshipQuestion = require("../models/RelationshipQuestion");
const Conversation = require("../models/Conversation");
const MemoryNode = require("../models/MemoryNode");
const { checkMessage, checkForBias } = require("../utils/safetyGuards");
const OpenAI = require("openai");
const config = require("../config");
const fs = require("fs");
const path = require("path");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey,
});

// 7 Structured Questions for relationship profiling
const STRUCTURED_QUESTIONS = [
  "How do you know {contactName}, and how long have you known them?",
  "How would you describe your relationship with them right now?",
  "How often do you talk or see each other, and how do you usually communicate?",
  "What do you appreciate most about them?",
  "What's something they do that bothers or frustrates you?",
  "If they had to describe you, what do you think they'd say?",
  "What's one thing you wish they understood about you?",
];

/**
 * Sleep function for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If it's a rate limit error (429), wait longer
      if (error.response?.status === 429) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // For other errors, don't retry
      throw error;
    }
  }

  throw lastError;
};

/**
 * Enhanced transcription function with better error handling
 */
const transcribeAudioWithRetry = async (audioBuffer, filename, mimetype) => {
  const transcribeFunction = async () => {
    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("file", audioBuffer, {
      filename: filename || "audio.webm",
      contentType: mimetype || "audio/webm",
    });
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    const axios = require("axios");
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return openaiResponse.data;
  };

  return retryWithBackoff(transcribeFunction, 3, 2000);
};

/**
 * Get structured questions for relationship profiling
 */
exports.getStructuredQuestions = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;

    // Check relationship exists
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId,
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found",
      });
    }

    // Replace {contactName} with actual contact name
    const questions = STRUCTURED_QUESTIONS.map((question) =>
      question.replace("{contactName}", relationship.contactName)
    );

    // Check if user has already answered any structured questions
    const existingAnswers = await RelationshipQuestion.find({
      user: userId,
      relationship: relationshipId,
      isStructured: true,
    }).sort({ questionIndex: 1 });

    res.json({
      success: true,
      questions,
      contactName: relationship.contactName,
      currentIndex: existingAnswers.length,
      totalQuestions: questions.length,
      existingAnswers: existingAnswers.map((q) => ({
        questionIndex: q.questionIndex,
        question: q.question,
        answer: q.answer,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting structured questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get structured questions",
      error: error.message,
    });
  }
};

/**
 * Submit structured question answer
 */
exports.submitStructuredAnswer = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { questionIndex, question, answer, transcription } = req.body;
    const userId = req.user.id;

    // Input validation
    if (typeof questionIndex !== "number" || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question index, question, and answer are required",
      });
    }

    // Check relationship
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId,
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found",
      });
    }

    // Safety check on answer
    const safetyCheck = checkMessage(answer, relationship);
    if (safetyCheck.flagged) {
      return res.status(200).json({
        success: true,
        flagged: true,
        flagType: safetyCheck.type,
        message: safetyCheck.response,
      });
    }

    // Save the structured answer
    const relationshipQuestion = new RelationshipQuestion({
      user: userId,
      relationship: relationshipId,
      question,
      answer,
      transcription: transcription || null,
      isStructured: true,
      questionIndex,
      createdAt: new Date(),
    });

    await relationshipQuestion.save();

    // Save as memory for AI context
    await saveStructuredMemory(
      userId,
      relationshipId,
      question,
      answer,
      questionIndex
    );

    // Check if this was the last question
    const totalAnswered = await RelationshipQuestion.countDocuments({
      user: userId,
      relationship: relationshipId,
      isStructured: true,
    });

    const isComplete = totalAnswered >= STRUCTURED_QUESTIONS.length;

    res.json({
      success: true,
      questionIndex,
      totalAnswered,
      isComplete,
      nextQuestionIndex: isComplete ? null : totalAnswered,
      _id: relationshipQuestion._id,
    });
  } catch (error) {
    console.error("Error submitting structured answer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit answer",
      error: error.message,
    });
  }
};

/**
 * Get relationship profile status
 */
exports.getProfileStatus = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;

    // Check if conversations exist
    const hasConversations =
      (await Conversation.countDocuments({
        relationship: relationshipId,
        status: "analyzed",
      })) > 0;

    // Check structured questions progress
    const structuredAnswers = await RelationshipQuestion.countDocuments({
      user: userId,
      relationship: relationshipId,
      isStructured: true,
    });

    const hasStructuredProfile =
      structuredAnswers >= STRUCTURED_QUESTIONS.length;

    res.json({
      success: true,
      hasConversations,
      hasStructuredProfile,
      structuredAnswersCount: structuredAnswers,
      totalStructuredQuestions: STRUCTURED_QUESTIONS.length,
      canAskOpenQuestions: hasConversations || hasStructuredProfile,
    });
  } catch (error) {
    console.error("Error getting profile status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile status",
      error: error.message,
    });
  }
};

/**
 * Save structured answer as memory for AI context
 */
const saveStructuredMemory = async (
  userId,
  relationshipId,
  question,
  answer,
  questionIndex
) => {
  try {
    // Determine emotion and weight based on question type
    let emotion = "Neutral";
    let weight = 0.8; // High weight for structured questions

    // Analyze answer content for emotion
    if (/love|appreciate|enjoy|happy|great|wonderful/i.test(answer)) {
      emotion = "Joy";
    } else if (/bother|frustrate|annoy|upset|angry|difficult/i.test(answer)) {
      emotion = "Anger";
    } else if (/sad|hurt|disappointed|lonely|miss/i.test(answer)) {
      emotion = "Sadness";
    }

    // Create memory node
    const memoryNode = new MemoryNode({
      user: userId,
      relationship: relationshipId,
      content: `Structured Q${questionIndex + 1}: ${question.substring(0, 100)}... A: ${answer.substring(0, 200)}...`,
      type: "structured_profile",
      emotion: emotion,
      keywords: extractKeywords(question + " " + answer),
      weight: weight,
      decayFactor: 0.01, // Slower decay for structured answers
      createdAt: new Date(),
      metadata: {
        questionIndex,
        isStructured: true,
      },
    });

    await memoryNode.save();
    return true;
  } catch (error) {
    console.error("Error saving structured memory:", error);
    return false;
  }
};

/**
 * Extract insights from structured answers
 */
const extractInsightsFromAnswers = (answers) => {
  const insights = {};

  try {
    // Analyze relationship duration from first answer
    const durationAnswer = answers[0]?.answer || "";
    if (/year/i.test(durationAnswer)) {
      const years = durationAnswer.match(/(\d+)\s*year/i);
      if (years) {
        insights.relationshipDuration = `${years[1]} years`;
      }
    }

    // Analyze communication frequency from third answer
    const commAnswer = answers[2]?.answer || "";
    if (/daily|every day/i.test(commAnswer)) {
      insights.communicationFrequency = "daily";
    } else if (/weekly|week/i.test(commAnswer)) {
      insights.communicationFrequency = "weekly";
    } else if (/monthly|month/i.test(commAnswer)) {
      insights.communicationFrequency = "monthly";
    }

    // Analyze relationship satisfaction from answers
    const positiveAnswers = answers.filter((a) =>
      /love|appreciate|great|wonderful|amazing|good|positive/i.test(a.answer)
    ).length;

    const negativeAnswers = answers.filter((a) =>
      /bother|frustrate|annoy|difficult|problem|issue/i.test(a.answer)
    ).length;

    insights.overallSentiment =
      positiveAnswers > negativeAnswers
        ? "positive"
        : negativeAnswers > positiveAnswers
          ? "mixed"
          : "neutral";

    return insights;
  } catch (error) {
    console.error("Error extracting insights:", error);
    return null;
  }
};

/**
 * Get relevant memories for current conversation context
 */
const getRelevantMemories = async (userId, relationshipId, question) => {
  try {
    // Extract keywords from question
    const keywords = extractKeywords(question);

    // Find relevant memory nodes based on keywords
    const memories = await MemoryNode.find({
      user: userId,
      relationship: relationshipId,
      keywords: { $in: keywords },
    })
      .sort({ weight: -1 })
      .limit(5);

    // Record access to update metrics
    for (const memory of memories) {
      memory.lastAccessed = new Date();
      memory.accessCount += 1;
      await memory.save();
    }

    return memories;
  } catch (error) {
    console.error("Error retrieving memories:", error);
    return [];
  }
};

/**
 * Save conversation as memory for future context
 */
const saveConversationMemory = async (
  userId,
  relationshipId,
  question,
  answer
) => {
  try {
    // Determine emotion based on content
    let emotion = "Neutral";
    if (/positive|happy|great|love/i.test(answer)) {
      emotion = "Joy";
    } else if (/sad|sorry|difficult|challenge/i.test(answer)) {
      emotion = "Sadness";
    } else if (/angry|frustrat|upset/i.test(answer)) {
      emotion = "Anger";
    }

    // Create memory node
    const memoryNode = new MemoryNode({
      user: userId,
      relationship: relationshipId,
      content: `Q: ${question.substring(0, 100)}... A: ${answer.substring(0, 100)}...`,
      type: "conversation",
      emotion: emotion,
      keywords: extractKeywords(question + " " + answer),
      weight: 0.7, // Higher weight for direct Q&A
      decayFactor: 0.03,
      createdAt: new Date(),
    });

    await memoryNode.save();
    return true;
  } catch (error) {
    console.error("Error saving conversation memory:", error);
    return false;
  }
};

/**
 * Format previous conversation context for AI prompt
 */
const buildConversationContext = async (userId, relationshipId, limit = 5) => {
  try {
    // Get recent questions and answers
    const previousQuestions = await RelationshipQuestion.find({
      user: userId,
      relationship: relationshipId,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    if (previousQuestions.length === 0) return "";

    const context = previousQuestions
      .map((q) => `User: ${q.question}\nAI: ${q.answer}`)
      .join("\n\n");

    return `
Previous conversation history (DO NOT reference directly):
${context}

Use this history to maintain conversation continuity without explicitly mentioning previous questions.
`;
  } catch (error) {
    console.error("Error building conversation context:", error);
    return "";
  }
};

/**
 * Create improved AI system prompt
 */
const createEnhancedSystemPrompt = (contactName) => {
  return `You are SoulSync, an emotionally intelligent relationship advisor who specializes in providing genuine, empathetic guidance.

CORE PERSONALITY TRAITS:
1. You're a supportive friend who happens to have relationship wisdom
2. You're compassionate but honest - you don't avoid difficult truths
3. You recognize relationship complexity and avoid black-and-white thinking
4. You blend warmth with practical advice

IMPORTANT GUIDELINES:
1. Keep responses direct, conversational and personal - like talking to a trusted friend
2. DO NOT start responses with "Based on the analysis of your WhatsApp conversations with ${contactName}"
3. NEVER mention metrics, scores, or analysis - use this data internally to inform your answers
4. When discussing emotional struggles, validate feelings first, then offer perspective
5. Balance emotional validation with gentle encouragement to consider new perspectives
6. For concerning topics (harm, depression), keep responses relationship-focused but prioritize wellbeing

CONVERSATION STYLE:
- Use contractions (don't, you're, it's)
- Ask thoughtful questions to deepen understanding
- Reference specific aspects of their relationship with ${contactName}
- Occasionally use phrases like "I understand," "That sounds difficult," "I've seen this pattern before"
- Be succinct - no more than 3-4 sentences per response

Speak naturally, be direct, and maintain a supportive tone throughout.`;
};

/**
 * Extract keywords from text for memory retrieval
 */
const extractKeywords = (text) => {
  if (!text) return [];

  // Convert to lowercase and remove punctuation
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, "");

  // Remove common stop words
  const stopWords = [
    "the",
    "and",
    "is",
    "in",
    "to",
    "i",
    "you",
    "that",
    "it",
    "for",
    "on",
    "with",
    "as",
    "this",
    "of",
  ];
  const words = cleaned
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word));

  // Return unique words
  return [...new Set(words)];
};

/**
 * Enhanced text question handler with memory and safety features
 */
exports.askQuestion = async (req, res) => {
  try {
    const { relationshipId, question } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!question || question.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Question is required" });
    }

    // Check relationship
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId,
    });

    if (!relationship) {
      return res
        .status(404)
        .json({ success: false, message: "Relationship not found" });
    }

    // Safety check
    const safetyCheck = checkMessage(question, relationship);

    if (safetyCheck.flagged) {
      // Save flagged question with safety response
      const relationshipQuestion = new RelationshipQuestion({
        user: userId,
        relationship: relationshipId,
        question,
        answer: safetyCheck.response,
        flagged: true,
        flagType: safetyCheck.type,
        createdAt: new Date(),
      });

      await relationshipQuestion.save();

      return res.status(200).json({
        success: true,
        flagged: true,
        flagType: safetyCheck.type,
        question,
        answer: safetyCheck.response,
        _id: relationshipQuestion._id,
      });
    }

    // Check for imported conversations or structured profile
    const hasConversations =
      (await Conversation.countDocuments({
        relationship: relationshipId,
        status: "analyzed",
      })) > 0;

    const hasStructuredProfile =
      (await RelationshipQuestion.countDocuments({
        user: userId,
        relationship: relationshipId,
        isStructured: true,
      })) >= STRUCTURED_QUESTIONS.length;

    if (!hasConversations && !hasStructuredProfile) {
      return res.status(200).json({
        success: true,
        answer: `I need more information about your relationship with ${relationship.contactName}. Import your chat history so I can provide helpful insights.`,
      });
    }

    // Retrieve relevant memories
    const memories = await getRelevantMemories(
      userId,
      relationshipId,
      question
    );

    // Get previous conversation context
    const conversationContext = await buildConversationContext(
      userId,
      relationshipId
    );

    // Get relationship context data
    const contextData = {
      relationship: {
        name: relationship.contactName,
        type: relationship.relationshipType,
        frequency: relationship.interactionFrequency || "Not specified",
        howWeMet: relationship.howWeMet || "",
        timeKnown: relationship.timeKnown || "Not specified",
      },
      metrics: relationship.metrics || {},
      topicDistribution: relationship.topicDistribution || [],
      insights: relationship.insights || {},
      communicationStyle: relationship.communicationStyle || {},
      sentimentScore: relationship.insights?.sentimentScore || 0,
      communicationBalance:
        relationship.insights?.communicationBalance || "unknown",
    };

    // Format memories for prompt context
    const memoryContext =
      memories.length > 0
        ? `RELEVANT MEMORIES (use this information but DO NOT reference directly):\n` +
          memories.map((m) => `- ${m.content}`).join("\n")
        : "";

    // Create improved system prompt
    const systemPrompt = createEnhancedSystemPrompt(relationship.contactName);

    // Construct user message with context
    const userMessage = `Question about my relationship with ${relationship.contactName}: "${question}"

${memoryContext}

${conversationContext}

Relationship Context: ${JSON.stringify(contextData, null, 2)}`;

    // Generate AI response with retry logic
    let completion;
    try {
      completion = await retryWithBackoff(
        async () => {
          return await openai.chat.completions.create({
            model: "gpt-4-turbo", // Use the latest GPT-4 model
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.7, // Keep this balanced
            presence_penalty: 0.6, // Helps avoid repetitive phrasing
            frequency_penalty: 0.5, // Encourages more varied language
          });
        },
        3,
        1000
      );
    } catch (aiError) {
      console.error("Error with OpenAI API:", aiError);

      // Return a fallback response if OpenAI fails
      const fallbackResponse = `I'm having trouble processing your question right now due to high demand. Please try again in a few moments, or rephrase your question about your relationship with ${relationship.contactName}.`;

      const relationshipQuestion = new RelationshipQuestion({
        user: userId,
        relationship: relationshipId,
        question,
        answer: fallbackResponse,
        error: "OpenAI API error",
        createdAt: new Date(),
      });

      await relationshipQuestion.save();

      return res.json({
        success: true,
        question,
        answer: fallbackResponse,
        _id: relationshipQuestion._id,
        warning: "Response generated using fallback due to API limitations",
      });
    }

    const aiResponse = completion.choices[0].message.content;

    // Save question and answer
    const relationshipQuestion = new RelationshipQuestion({
      user: userId,
      relationship: relationshipId,
      question,
      answer: aiResponse,
      createdAt: new Date(),
    });

    await relationshipQuestion.save();

    // Save as memory for future context
    await saveConversationMemory(userId, relationshipId, question, aiResponse);

    // Return response
    res.json({
      success: true,
      question,
      answer: aiResponse,
      _id: relationshipQuestion._id,
    });
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing question",
      error: error.message,
    });
  }
};

/**
 * Enhanced voice question handler with improved error handling and rate limiting
 */
exports.askQuestionVoice = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { isStructured, questionIndex, currentQuestion } = req.body;
    const userId = req.user.id;

    // Validate file upload
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No audio file received" });
    }

    // Check relationship
    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId,
    });

    if (!relationship) {
      return res
        .status(404)
        .json({ success: false, message: "Relationship not found" });
    }

    // Transcribe audio using enhanced transcription with retry logic
    let transcription;
    try {
      console.log("Starting transcription process...");

      const transcriptionResult = await transcribeAudioWithRetry(
        req.file.buffer,
        req.file.originalname || "audio.webm",
        req.file.mimetype || "audio/webm"
      );

      transcription = { text: transcriptionResult.text };
      console.log("Transcription successful:", transcription.text);
    } catch (transcriptionError) {
      console.error("Error transcribing audio:", transcriptionError);

      // Handle different types of transcription errors
      let errorMessage = "Failed to transcribe audio";
      let statusCode = 500;

      if (transcriptionError.response?.status === 429) {
        errorMessage =
          "Voice transcription is temporarily unavailable due to high demand. Please try again in a few moments.";
        statusCode = 429;
      } else if (transcriptionError.code === "ECONNABORTED") {
        errorMessage =
          "Transcription request timed out. Please try with a shorter audio clip.";
        statusCode = 408;
      } else if (transcriptionError.response?.status === 400) {
        errorMessage =
          "Audio format not supported. Please try again with a different recording.";
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: transcriptionError.message,
        retryable: transcriptionError.response?.status === 429,
      });
    }

    const userInput = transcription.text;

    // Handle empty transcription
    if (!userInput || userInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No speech detected in the audio. Please try speaking more clearly.",
      });
    }

    // Safety check
    const safetyCheck = checkMessage(userInput, relationship);

    if (safetyCheck.flagged) {
      return res.status(200).json({
        success: true,
        transcription: userInput,
        flagged: true,
        flagType: safetyCheck.type,
        answer: safetyCheck.response,
      });
    }

    // Handle structured vs open-ended questions
    if (isStructured && currentQuestion && typeof questionIndex === "number") {
      // This is a structured question answer
      const result = await handleStructuredAnswer(
        userId,
        relationshipId,
        questionIndex,
        currentQuestion,
        userInput
      );

      return res.json({
        success: true,
        transcription: userInput,
        isStructured: true,
        questionIndex,
        totalAnswered: result.totalAnswered,
        isComplete: result.isComplete,
        nextQuestionIndex: result.nextQuestionIndex,
        _id: result._id,
      });
    } else {
      // This is an open-ended question
      // Check if user has sufficient profile data
      const hasConversations =
        (await Conversation.countDocuments({
          relationship: relationshipId,
          status: "analyzed",
        })) > 0;

      const hasStructuredProfile =
        (await RelationshipQuestion.countDocuments({
          user: userId,
          relationship: relationshipId,
          isStructured: true,
        })) >= STRUCTURED_QUESTIONS.length;

      if (!hasConversations && !hasStructuredProfile) {
        return res.status(200).json({
          success: true,
          transcription: userInput,
          answer: `I need more information about your relationship with ${relationship.contactName}. Import your chat history so I can provide helpful insights.`,
        });
      }

      // Process as regular question
      const memories = await getRelevantMemories(
        userId,
        relationshipId,
        userInput
      );
      const conversationContext = await buildConversationContext(
        userId,
        relationshipId
      );

      const contextData = {
        relationship: {
          name: relationship.contactName,
          type: relationship.relationshipType,
          frequency: relationship.interactionFrequency || "Not specified",
          howWeMet: relationship.howWeMet || "",
          timeKnown: relationship.timeKnown || "Not specified",
        },
        metrics: relationship.metrics || {},
        topicDistribution: relationship.topicDistribution || [],
        insights: relationship.insights || {},
        communicationStyle: relationship.communicationStyle || {},
        sentimentScore: relationship.insights?.sentimentScore || 0,
        communicationBalance:
          relationship.insights?.communicationBalance || "unknown",
      };

      const memoryContext =
        memories.length > 0
          ? `RELEVANT MEMORIES (use this information but DO NOT reference directly):\n` +
            memories.map((m) => `- ${m.content}`).join("\n")
          : "";

      const systemPrompt = createEnhancedSystemPrompt(relationship.contactName);

      const userMessage = `Question about my relationship with ${relationship.contactName}: "${userInput}"

${memoryContext}

${conversationContext}

Relationship Context: ${JSON.stringify(contextData, null, 2)}`;

      // Generate AI response with retry logic
      let completion;
      try {
        completion = await retryWithBackoff(
          async () => {
            return await openai.chat.completions.create({
              model: "gpt-4-turbo",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
              temperature: 0.7,
              presence_penalty: 0.6,
              frequency_penalty: 0.5,
            });
          },
          3,
          1000
        );
      } catch (aiError) {
        console.error("Error with OpenAI chat completion:", aiError);

        // Return a fallback response if OpenAI fails
        const fallbackResponse = `I'm having trouble processing your question right now due to high demand. Please try again in a few moments, or rephrase your question about your relationship with ${relationship.contactName}.`;

        const relationshipQuestion = new RelationshipQuestion({
          user: userId,
          relationship: relationshipId,
          question: userInput,
          answer: fallbackResponse,
          transcription: userInput,
          error: "OpenAI API error",
          createdAt: new Date(),
        });

        await relationshipQuestion.save();

        return res.json({
          success: true,
          transcription: userInput,
          question: userInput,
          answer: fallbackResponse,
          _id: relationshipQuestion._id,
          warning: "Response generated using fallback due to API limitations",
        });
      }

      const aiResponse = completion.choices[0].message.content;

      const relationshipQuestion = new RelationshipQuestion({
        user: userId,
        relationship: relationshipId,
        question: userInput,
        answer: aiResponse,
        transcription: userInput,
        createdAt: new Date(),
      });

      await relationshipQuestion.save();
      await saveConversationMemory(
        userId,
        relationshipId,
        userInput,
        aiResponse
      );

      return res.json({
        success: true,
        transcription: userInput,
        question: userInput,
        answer: aiResponse,
        _id: relationshipQuestion._id,
      });
    }
  } catch (error) {
    console.error("Error processing voice question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process voice question",
      error: error.message,
    });
  }
};

/**
 * Handle structured question answer
 */
const handleStructuredAnswer = async (
  userId,
  relationshipId,
  questionIndex,
  question,
  answer
) => {
  // Save the structured answer
  const relationshipQuestion = new RelationshipQuestion({
    user: userId,
    relationship: relationshipId,
    question,
    answer,
    transcription: answer,
    isStructured: true,
    questionIndex,
    createdAt: new Date(),
  });

  await relationshipQuestion.save();

  // Save as memory
  await saveStructuredMemory(
    userId,
    relationshipId,
    question,
    answer,
    questionIndex
  );

  // Check progress
  const totalAnswered = await RelationshipQuestion.countDocuments({
    user: userId,
    relationship: relationshipId,
    isStructured: true,
  });

  const isComplete = totalAnswered >= STRUCTURED_QUESTIONS.length;

  return {
    totalAnswered,
    isComplete,
    nextQuestionIndex: isComplete ? null : totalAnswered,
    _id: relationshipQuestion._id,
  };
};

// Keep the existing getQuestionHistory function
exports.getQuestionHistory = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.id;

    const relationship = await Relationship.findOne({
      _id: relationshipId,
      user: userId,
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found",
      });
    }

    const questions = await RelationshipQuestion.find({
      relationship: relationshipId,
      user: userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Error fetching question history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question history",
      error: error.message,
    });
  }
};

module.exports = exports;
