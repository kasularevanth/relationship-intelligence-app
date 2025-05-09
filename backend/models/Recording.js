const mongoose = require('mongoose');

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

module.exports = mongoose.model('Recording', RecordingSchema);