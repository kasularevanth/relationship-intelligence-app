// backend/models/MemoryNode.js - UPDATED
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { modelEvents } = require('../utils/eventEmitter');

const memoryNodeSchema = new Schema({
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
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'conversation', 'gift', 'support', 'conflict', 'habit', 'emotion', 'general'],
    default: 'general'
  },
  emotion: {
    type: String,
    enum: ['Joy', 'Love', 'Gratitude', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Neutral'],
    default: 'Neutral'
  },
  sentiment: {
    type: Number, // Range from -1 (negative) to 1 (positive)
    min: -1,
    max: 1,
    default: 0
  },
  keywords: [{
    type: String,
    trim: true
  }],
  weight: {
    type: Number, // Importance/relevance weight
    min: 0,
    max: 1,
    default: 0.5
  },
  decayFactor: {
    type: Number, // How quickly this memory decays in relevance (0-1)
    min: 0,
    max: 1,
    default: 0.05 // Default slow decay
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster querying
memoryNodeSchema.index({ user: 1, relationship: 1 });
memoryNodeSchema.index({ keywords: 1 });

// Method to update lastAccessed and increment accessCount
memoryNodeSchema.methods.recordAccess = function() {
  this.lastAccessed = Date.now();
  this.accessCount += 1;
  return this.save();
};

// Calculate current relevance based on decay over time
memoryNodeSchema.methods.getCurrentRelevance = function() {
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  const decayedWeight = this.weight * Math.exp(-this.decayFactor * daysSinceCreation);
  return Math.max(0, decayedWeight);
};



memoryNodeSchema.post('save',  function(doc) {
  try {
    // Only sync to Firebase in production
    if (process.env.NODE_ENV === 'production') {
      modelEvents.emit('syncMemoryNodeToFirebase',(doc._id));
    }
  } catch (error) {
    console.error('Error in post-save Firebase sync for memory node:', error);
  }
});

memoryNodeSchema.post('findOneAndUpdate',  function(doc) {
  if (doc) {
    try {
      // Only sync to Firebase in production
      if (process.env.NODE_ENV === 'production') {
        modelEvents.emit('syncMemoryNodeToFirebase',(doc._id));
      }
    } catch (error) {
      console.error('Error in post-update Firebase sync for memory node:', error);
    }
  }
});

const MemoryNode = mongoose.model('MemoryNode', memoryNodeSchema);

module.exports = MemoryNode;