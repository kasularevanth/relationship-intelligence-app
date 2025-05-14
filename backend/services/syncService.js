// backend/services/syncService.js
const { db } = require('../config/firebaseAdmin');
const User = require('../models/User');
const Relationship = require('../models/Relationship');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const MemoryNode = require('../models/MemoryNode');
const RelationshipQuestion = require('../models/RelationshipQuestion');
const Recording = require('../models/Recording');
const { modelEvents } = require('../utils/eventEmitter');

// Helper function to convert MongoDB documents to Firebase-friendly objects
const convertToFirebaseDoc = (doc) => {
  if (!doc) return null;
  
  // If it's a Mongoose document, convert to plain object
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  
  // Convert _id to string for Firebase
  if (obj._id) {
    obj._id = obj._id.toString();
  }
  
  // Convert reference IDs to strings
  ['user', 'relationship', 'conversation'].forEach(field => {
    if (obj[field] && typeof obj[field] !== 'string' && obj[field].toString) {
      obj[field] = obj[field].toString();
    }
  });
  
  // Handle arrays of ObjectIDs (like sessions in Relationship)
  ['sessions', 'memoryNodes'].forEach(field => {
    if (Array.isArray(obj[field])) {
      obj[field] = obj[field].map(item => {
        return typeof item === 'string' ? item : item.toString();
      });
    }
  });
  
  // Convert dates to timestamps for Firestore
  Object.keys(obj).forEach(key => {
    if (obj[key] instanceof Date) {
      obj[key] = obj[key].toISOString();
    }
  });
  
  return obj;
};

// Sync a user to Firebase
const syncUserToFirebase = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found in MongoDB`);
      return false;
    }
    
    // Transform user for Firebase - exclude password and sensitive fields
    const userData = convertToFirebaseDoc({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || new Date()
    });
    
    // Use the MongoDB _id as the document ID in Firebase
    await db.collection('users').doc(userId.toString()).set(userData, { merge: true });
    console.log(`User ${userId} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('Error syncing user to Firebase:', error);
    return false;
  }
};

// Sync a relationship to Firebase
const syncRelationshipToFirebase = async (relationshipId) => {
  try {
    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      console.error(`Relationship ${relationshipId} not found in MongoDB`);
      return false;
    }
    
    // Transform the relationship for Firebase
    const relationshipData = convertToFirebaseDoc(relationship);
    
    // Use the MongoDB _id as the document ID in Firebase
    await db.collection('relationships').doc(relationshipId.toString()).set(relationshipData, { merge: true });
    console.log(`Relationship ${relationshipId} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('Error syncing relationship to Firebase:', error);
    return false;
  }
};

// Sync a conversation to Firebase
const syncConversationToFirebase = async (conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.error(`Conversation ${conversationId} not found in MongoDB`);
      return false;
    }
    
    // Transform the conversation for Firebase
    const conversationData = convertToFirebaseDoc(conversation);
    
    // Store messages in a separate collection in Firebase
    if (conversation.messages && conversation.messages.length > 0) {
      const batch = db.batch();
      
      // Delete existing messages to avoid duplicates
      const existingMessages = await db.collection('messages')
        .where('conversation', '==', conversationId.toString())
        .get();
      
      existingMessages.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add new messages
      conversation.messages.forEach((message, index) => {
        const messageData = convertToFirebaseDoc({
          ...message,
          conversation: conversationId,
          index: index
        });
        
        const messageId = message._id ? 
          message._id.toString() : 
          `${conversationId.toString()}-${index}`;
        
        const messageRef = db.collection('messages').doc(messageId);
        batch.set(messageRef, messageData);
      });
      
      await batch.commit();
      
      // Remove messages from the conversation document to avoid data duplication
      delete conversationData.messages;
    }
    
    // Store the conversation data (without messages) in Firebase
    await db.collection('conversations').doc(conversationId.toString()).set(conversationData, { merge: true });
    console.log(`Conversation ${conversationId} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('Error syncing conversation to Firebase:', error);
    return false;
  }
};

// Sync a memory node to Firebase
const syncMemoryNodeToFirebase = async (memoryId) => {
  try {
    const memory = await MemoryNode.findById(memoryId);
    if (!memory) {
      console.error(`Memory ${memoryId} not found in MongoDB`);
      return false;
    }
    
    // Transform the memory for Firebase
    const memoryData = convertToFirebaseDoc(memory);
    
    // Store the memory in Firebase
    await db.collection('memories').doc(memoryId.toString()).set(memoryData, { merge: true });
    console.log(`Memory ${memoryId} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('Error syncing memory to Firebase:', error);
    return false;
  }
};

// Sync a relationship question to Firebase
const syncQuestionToFirebase = async (questionId) => {
  try {
    const question = await RelationshipQuestion.findById(questionId);
    if (!question) {
      console.error(`Question ${questionId} not found in MongoDB`);
      return false;
    }
    
    // Transform the question for Firebase
    const questionData = convertToFirebaseDoc(question);
    
    // Store the question in Firebase
    await db.collection('questions').doc(questionId.toString()).set(questionData, { merge: true });
    console.log(`Question ${questionId} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('Error syncing question to Firebase:', error);
    return false;
  }
};

// Sync a recording to Firebase
const syncRecordingToFirebase = async (recordingId) => {
  try {
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      console.error(`Recording ${recordingId} not found in MongoDB`);
      return false;
    }
    
    // Transform the recording for Firebase, excluding the actual audio data
    const recordingData = convertToFirebaseDoc({
      _id: recording._id,
      user: recording.user,
      conversation: recording.conversation,
      status: recording.status,
      startTime: recording.startTime,
      endTime: recording.endTime,
      duration: recording.duration,
      audioFileName: recording.audioFileName,
      audioFileType: recording.audioFileType,
      transcript: recording.transcript,
      nextQuestion: recording.nextQuestion,
      askedQuestions: recording.askedQuestions,
      createdAt: recording.createdAt,
      updatedAt: recording.updatedAt
    });
    
    // Store the recording metadata in Firebase (without the audio buffer)
    await db.collection('recordings').doc(recordingId.toString()).set(recordingData, { merge: true });
    console.log(`Recording ${recordingId} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('Error syncing recording to Firebase:', error);
    return false;
  }
};

// Sync from Firebase to MongoDB

// Sync a user from Firebase to MongoDB
const syncUserFromFirebase = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.error(`User ${userId} not found in Firebase`);
      return false;
    }
    
    const userData = userDoc.data();
    
    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: userData.firebaseUid });
    
    if (!user) {
      // Try by ID
      user = await User.findById(userId);
    }
    
    if (user) {
      // Update existing user
      user.name = userData.name;
      user.email = userData.email;
      user.avatar = userData.avatar;
      user.firebaseUid = userData.firebaseUid;
      
      await user.save();
      console.log(`User ${userId} updated in MongoDB`);
    } else {
      // Create new user in MongoDB
      user = new User({
        _id: userId,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        firebaseUid: userData.firebaseUid
      });
      
      await user.save();
      console.log(`User ${userId} created in MongoDB`);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing user from Firebase:', error);
    return false;
  }
};

// Sync a relationship from Firebase to MongoDB
const syncRelationshipFromFirebase = async (relationshipId) => {
  try {
    const relationshipDoc = await db.collection('relationships').doc(relationshipId).get();
    if (!relationshipDoc.exists) {
      console.error(`Relationship ${relationshipId} not found in Firebase`);
      return false;
    }
    
    const relationshipData = relationshipDoc.data();
    
    // Find or create relationship in MongoDB
    let relationship = await Relationship.findById(relationshipId);
    
    if (relationship) {
      // Update core fields
      relationship.contactName = relationshipData.contactName;
      relationship.relationshipType = relationshipData.relationshipType;
      relationship.contactInfo = relationshipData.contactInfo;
      relationship.interactionFrequency = relationshipData.interactionFrequency;
      relationship.howWeMet = relationshipData.howWeMet;
      relationship.photo = relationshipData.photo;
      relationship.timeKnown = relationshipData.timeKnown;
      
      // Handle complex fields
      if (relationshipData.metrics) {
        relationship.metrics = {
          ...relationship.metrics,
          ...relationshipData.metrics
        };
      }
      
      if (relationshipData.topicDistribution) {
        relationship.topicDistribution = relationshipData.topicDistribution;
      }
      
      if (relationshipData.theirValues) {
        relationship.theirValues = relationshipData.theirValues;
      }
      
      if (relationshipData.theirInterests) {
        relationship.theirInterests = relationshipData.theirInterests;
      }
      
      relationship.updatedAt = new Date();
      
      await relationship.save();
      console.log(`Relationship ${relationshipId} updated in MongoDB`);
    } else {
      // Create new relationship in MongoDB
      relationship = new Relationship({
        _id: relationshipId,
        user: relationshipData.user,
        contactName: relationshipData.contactName,
        relationshipType: relationshipData.relationshipType,
        contactInfo: relationshipData.contactInfo,
        interactionFrequency: relationshipData.interactionFrequency,
        howWeMet: relationshipData.howWeMet,
        timeKnown: relationshipData.timeKnown,
        photo: relationshipData.photo,
        metrics: relationshipData.metrics || {},
        topicDistribution: relationshipData.topicDistribution || [],
        theirValues: relationshipData.theirValues || [],
        theirInterests: relationshipData.theirInterests || [],
        sessions: relationshipData.sessions || []
      });
      
      await relationship.save();
      console.log(`Relationship ${relationshipId} created in MongoDB`);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing relationship from Firebase:', error);
    return false;
  }
};

// Sync a conversation from Firebase to MongoDB
const syncConversationFromFirebase = async (conversationId) => {
  try {
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      console.error(`Conversation ${conversationId} not found in Firebase`);
      return false;
    }
    
    const conversationData = conversationDoc.data();
    
    // Get messages from Firebase
    const messagesSnapshot = await db.collection('messages')
      .where('conversation', '==', conversationId)
      .orderBy('index')
      .get();
    
    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push(doc.data());
    });
    
    // Find or create conversation in MongoDB
    let conversation = await Conversation.findById(conversationId);
    
    if (conversation) {
      // Update fields
      conversation.title = conversationData.title;
      conversation.contactName = conversationData.contactName;
      conversation.phase = conversationData.phase;
      conversation.status = conversationData.status;
      conversation.summary = conversationData.summary;
      conversation.askedQuestions = conversationData.askedQuestions;
      conversation.messages = messages;
      
      await conversation.save();
      console.log(`Conversation ${conversationId} updated in MongoDB`);
    } else {
      // Create new conversation
      conversation = new Conversation({
        _id: conversationId,
        user: conversationData.user,
        relationship: conversationData.relationship,
        title: conversationData.title,
        contactName: conversationData.contactName,
        phase: conversationData.phase,
        status: conversationData.status,
        summary: conversationData.summary,
        askedQuestions: conversationData.askedQuestions,
        messages: messages,
        startTime: conversationData.startTime,
        endTime: conversationData.endTime,
        duration: conversationData.duration,
        sentimentAnalysis: conversationData.sentimentAnalysis
      });
      
      await conversation.save();
      console.log(`Conversation ${conversationId} created in MongoDB`);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing conversation from Firebase:', error);
    return false;
  }
};

// Sync a memory node from Firebase to MongoDB
const syncMemoryNodeFromFirebase = async (memoryId) => {
  try {
    const memoryDoc = await db.collection('memories').doc(memoryId).get();
    if (!memoryDoc.exists) {
      console.error(`Memory ${memoryId} not found in Firebase`);
      return false;
    }
    
    const memoryData = memoryDoc.data();
    
    // Find or create memory in MongoDB
    let memory = await MemoryNode.findById(memoryId);
    
    if (memory) {
      // Update fields
      memory.content = memoryData.content;
      memory.type = memoryData.type;
      memory.emotion = memoryData.emotion;
      memory.sentiment = memoryData.sentiment;
      memory.keywords = memoryData.keywords;
      memory.weight = memoryData.weight;
      memory.decayFactor = memoryData.decayFactor;
      
      await memory.save();
      console.log(`Memory ${memoryId} updated in MongoDB`);
    } else {
      // Create new memory
      memory = new MemoryNode({
        _id: memoryId,
        user: memoryData.user,
        relationship: memoryData.relationship,
        conversation: memoryData.conversation,
        content: memoryData.content,
        type: memoryData.type,
        emotion: memoryData.emotion,
        sentiment: memoryData.sentiment,
        keywords: memoryData.keywords || [],
        weight: memoryData.weight,
        decayFactor: memoryData.decayFactor
      });
      
      await memory.save();
      console.log(`Memory ${memoryId} created in MongoDB`);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing memory from Firebase:', error);
    return false;
  }
};

// Setup Firebase listeners
const setupFirebaseListeners = () => {
  try {
    // Listen for changes to users collection
    db.collection('users').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const userId = change.doc.id;
          syncUserFromFirebase(userId)
            .catch(err => console.error(`Error in user listener for ${userId}:`, err));
        }
      });
    }, error => {
      console.error("Error setting up users listener:", error);
    });
    
    // Listen for changes to relationships collection
    db.collection('relationships').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const relationshipId = change.doc.id;
          syncRelationshipFromFirebase(relationshipId)
            .catch(err => console.error(`Error in relationship listener for ${relationshipId}:`, err));
        }
      });
    }, error => {
      console.error("Error setting up relationships listener:", error);
    });
    
    // Listen for changes to conversations collection
    db.collection('conversations').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const conversationId = change.doc.id;
          syncConversationFromFirebase(conversationId)
            .catch(err => console.error(`Error in conversation listener for ${conversationId}:`, err));
        }
      });
    }, error => {
      console.error("Error setting up conversations listener:", error);
    });
    
    // Listen for changes to memories collection
    db.collection('memories').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const memoryId = change.doc.id;
          syncMemoryNodeFromFirebase(memoryId)
            .catch(err => console.error(`Error in memory listener for ${memoryId}:`, err));
        }
      });
    }, error => {
      console.error("Error setting up memories listener:", error);
    });
    
    console.log('Firebase listeners initialized successfully');
  } catch (error) {
    console.error('Error setting up Firebase listeners:', error);
  }
};

// Sync a question from Firebase to MongoDB
const syncQuestionFromFirebase = async (questionId) => {
  try {
    const questionDoc = await db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      console.error(`Question ${questionId} not found in Firebase`);
      return false;
    }
    
    const questionData = questionDoc.data();
    
    // Find or create question in MongoDB
    let question = await RelationshipQuestion.findById(questionId);
    
    if (question) {
      // Update fields
      question.question = questionData.question;
      question.answer = questionData.answer;
      question.sentiment = questionData.sentiment;
      
      await question.save();
      console.log(`Question ${questionId} updated in MongoDB`);
    } else {
      // Create new question
      question = new RelationshipQuestion({
        _id: questionId,
        user: questionData.user,
        relationship: questionData.relationship,
        question: questionData.question,
        answer: questionData.answer,
        sentiment: questionData.sentiment || 'neutral',
        createdAt: questionData.createdAt ? new Date(questionData.createdAt) : new Date()
      });
      
      await question.save();
      console.log(`Question ${questionId} created in MongoDB`);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing question from Firebase:', error);
    return false;
  }
};

const setupModelEventListeners = () => {
  modelEvents.on('syncUserToFirebase', syncUserToFirebase);
  modelEvents.on('syncRelationshipToFirebase', syncRelationshipToFirebase);
  modelEvents.on('syncConversationToFirebase', syncConversationToFirebase);
  modelEvents.on('syncMemoryNodeToFirebase', syncMemoryNodeToFirebase);
  modelEvents.on('syncQuestionToFirebase', syncQuestionToFirebase);
  modelEvents.on('syncRecordingToFirebase', syncRecordingToFirebase);
};

module.exports = {
  syncUserToFirebase,
  syncRelationshipToFirebase,
  syncConversationToFirebase,
  syncMemoryNodeToFirebase,
  syncQuestionToFirebase,
  syncRecordingToFirebase,
  syncUserFromFirebase,
  syncRelationshipFromFirebase,
  syncConversationFromFirebase,
  syncQuestionFromFirebase,
  syncMemoryNodeFromFirebase,
  setupFirebaseListeners,
  setupModelEventListeners  // Export this new function
};