// backend/models/RelationshipQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = mongoose.model('RelationshipQuestion', relationshipQuestionSchema);