// backend/models/Message.js - UPDATED
const mongoose = require('mongoose');
const { modelEvents } = require('../utils/eventEmitter');
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  recordingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recording'
  }
});

// NEW - Add Firebase sync hooks
// For messages, we sync the parent conversation since messages
// are stored as sub-documents in Firebase


messageSchema.post('save',  function(doc) {
  try {
    // Only sync to Firebase in production
    if (process.env.NODE_ENV === 'production') {
      // Sync the parent conversation
      if (doc.conversation) {
        modelEvents.emit('syncConversationToFirebase',(doc.conversation));
      }
    }
  } catch (error) {
    console.error('Error in post-save Firebase sync for message:', error);
  }
});

messageSchema.post('findOneAndUpdate',  function(doc) {
  if (doc) {
    try {
      // Only sync to Firebase in production
      if (process.env.NODE_ENV === 'production') {
        // Sync the parent conversation
        if (doc.conversation) {
          modelEvents.emit('syncConversationToFirebase',(doc.conversation));
        }
      }
    } catch (error) {
      console.error('Error in post-update Firebase sync for message:', error);
    }
  }
});

module.exports = mongoose.model('Message', messageSchema);