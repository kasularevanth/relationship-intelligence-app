// backend/models/RelationshipQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { modelEvents } = require('../utils/eventEmitter');

const relationshipQuestionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'mixed'],
    default: 'neutral'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Use events instead of direct function calls
relationshipQuestionSchema.post('save', function(doc) {
  try {
    // Only sync to Firebase in production
    if (process.env.NODE_ENV === 'production') {
      modelEvents.emit('syncQuestionToFirebase', doc._id);
    }
  } catch (error) {
    console.error('Error in post-save Firebase sync for relationship question:', error);
  }
});

relationshipQuestionSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    try {
      // Only sync to Firebase in production
      if (process.env.NODE_ENV === 'production') {
        modelEvents.emit('syncQuestionToFirebase', doc._id);
      }
    } catch (error) {
      console.error('Error in post-update Firebase sync for relationship question:', error);
    }
  }
});

module.exports = mongoose.model('RelationshipQuestion', relationshipQuestionSchema);