const mongoose = require('mongoose');
const { modelEvents } = require('../utils/eventEmitter');

const RecordingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  status: {
    type: String,
    enum: ['recording', 'processing', 'completed', 'failed'],
    default: 'recording'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number  // in seconds
  },
  audioFile: {
    type: Buffer  // Store the actual audio data
  },
  audioFileName: {
    type: String  // Store the filename
  },
  audioFileType: {
    type: String  // Store the mime type
  },
  transcript: {
    type: String
  },
  nextQuestion: {
    type: String
  },
  
  askedQuestions: [
    {
      type: String  // Change this to store strings directly
    }
  ],
  error: {
    type: String
  }
}, { timestamps: true });



// NEW - Add Firebase sync hooks
const { syncQuestionToFirebase } = require('../services/syncService');

RecordingSchema.post('save',  function(doc) {
  try {
    // Only sync to Firebase in production
    if (process.env.NODE_ENV === 'production') {
      modelEvents.emit('syncQuestionToFirebase',(doc._id));
    }
  } catch (error) {
    console.error('Error in post-save Firebase sync for relationship question:', error);
  }
});

RecordingSchema.post('findOneAndUpdate',  function(doc) {
  if (doc) {
    try {
      // Only sync to Firebase in production
      if (process.env.NODE_ENV === 'production') {
        modelEvents.emit('syncQuestionToFirebase',(doc._id));
      }
    } catch (error) {
      console.error('Error in post-update Firebase sync for relationship question:', error);
    }
  }
});

module.exports = mongoose.model('Recording', RecordingSchema);