// database/schema.js

const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  relationships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship'
  }]
});

// Relationship Schema
const RelationshipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  relationshipType: {
    type: String,
    enum: ['friend', 'family', 'romantic', 'professional', 'other'],
    required: true
  },
  timeKnown: {
    type: String
  },
  interactionFrequency: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  memoryNodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemoryNode'
  }],
  metrics: {
    sentimentScore: { type: Number, default: 0 },  // -1 to 1
    depthScore: { type: Number, default: 1 },      // 1 to 5
    reciprocityRatio: { type: Number, default: 0.5 }, // 0 to 1
    emotionalVolatility: { type: String, default: 'Stable' },
    topicDistribution: {
      conflict: { type: Number, default: 0 },
      support: { type: Number, default: 0 },
      humor: { type: Number, default: 0 },
      values: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  }
});

// Conversation Schema
const ConversationSchema = new mongoose.Schema({
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  phase: {
    type: String,
    enum: ['onboarding', 'emotionalMapping', 'dynamics', 'dualLens', 'completed'],
    default: 'onboarding'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  messages: [{
    role: { type: String, enum: ['user', 'ai'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
    sentiment: { type: Number, default: 0 }, // -1 to 1
    depth: { type: Number, default: 1 }      // 1 to 5
  }],
  summary: {
    type: String
  }
});

// Memory Node Schema
const MemoryNodeSchema = new mongoose.Schema({
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  type: {
    type: String,
    enum: ['memory', 'emotion', 'conflict', 'support', 'joy', 'other'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation'
    },
    messageIndex: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  emotionalIntensity: {
    type: Number, // 1-10
    default: 5
  },
  sentiment: {
    type: Number, // -1 to 1
    default: 0
  },
  weight: {
    type: Number, // Used for memory relevance
    default: 1
  },
  tags: [String]
});

const User = mongoose.model('User', UserSchema);
const Relationship = mongoose.model('Relationship', RelationshipSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);
const MemoryNode = mongoose.model('MemoryNode', MemoryNodeSchema);

module.exports = {
  User,
  Relationship,
  Conversation,
  MemoryNode
};