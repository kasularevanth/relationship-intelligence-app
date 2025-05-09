// backend/models/Relationship.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const growthAreaSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const insightSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Pattern Recognition', 'Emotional Insight', 'Growth Opportunity', 'Challenge Area', 'General Observation'],
    default: 'General Observation'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'growth', 'challenge'],
    default: 'neutral'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  source: {
    type: String,
    enum: ['conversation', 'analysis', 'user_input'],
    default: 'conversation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const metricsSchema = new Schema({
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  depthScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  reciprocityRatio: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  emotionalVolatility: {
    type: String,
    enum: ['Stable', 'Swingy', 'Erratic'],
    default: 'Stable'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const topicDistributionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
});

const relationshipSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  relationshipType: {
    type: String,
    enum: ['Family',
      'Friend',
      'Partner',
      'Colleague',
      'Mentor',
      'Mentee',
      'Acquaintance',
      'Other'],
    required: true
  },
  
  photo: {
    type: String,
    default: null
  },

  contactInfo: {
    type: String,
    trim: true
  },
  // Add new fields for enhanced relationship data
  loveLanguage: {
    type: String
  },
  interactionFrequency: {
    type: String
  },
  // Their information - expanded
  theirValues: {
    type: [String],
    default: []
  },
  theirInterests: {
    type: [String],
    default: []
  },
  theirCommunicationPreferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  importantDates: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  events: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  // Communication style - can be string or object
    communicationStyle: {
      type: mongoose.Schema.Types.Mixed
    },
  interactionFrequency: {
    type: String,
    enum: [ 'Daily',
      'Several times a week',
      'Weekly',
      'Monthly',
      'Occasionally',
      'Rarely'],
    default: 'Not specified'
  },
  howWeMet: {
    type: String,
    trim: true
  },
  timeKnown: {
    type: String,
    trim: true
  },
  metrics: {
    type: metricsSchema,
    default: {}
  },
  insights: [insightSchema],
  growthAreas: [growthAreaSchema],
  topicDistribution: [topicDistributionSchema],
  sessions: [{                    // Add this field
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  lastInteraction: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Add these new fields
  connectionScore: {
    type: Number,
    min: 1,
    max: 100,
    default: 50
  },
  trustLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  positiveMemories: [{
    type: String,
    trim: true
  }],
  challengeAreas: [{
    type: String,
    trim: true
  }],
  messageCount: {
    type: Number,
    default: 0
  },
  culturalContext: {
    type: String,
    trim: true
  },
  relationshipLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 1
  },
  challengesBadges: [{
    type: String,
    trim: true
  }],
  nextMilestone: {
    type: String,
    trim: true
  }



},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate conversations
relationshipSchema.virtual('conversations', {
  ref: 'Conversation',
  localField: '_id',
  foreignField: 'relationship'
});

// Virtual populate memoryNodes
relationshipSchema.virtual('memoryNodes', {
  ref: 'MemoryNode',
  localField: '_id',
  foreignField: 'relationship'
});

// Pre-save middleware to update the updatedAt field
relationshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to update metrics based on new data
relationshipSchema.methods.updateMetrics = async function(newMetrics) {
  const { sentimentScore, depthScore, reciprocityRatio, emotionalVolatility } = newMetrics;
  
  // Calculate weighted averages for numeric metrics
  if (sentimentScore !== undefined) {
    // Weight: 30% new score, 70% existing score (if it exists)
    this.metrics.sentimentScore = this.metrics.sentimentScore !== undefined
      ? this.metrics.sentimentScore * 0.7 + sentimentScore * 0.3
      : sentimentScore;
  }
  
  if (depthScore !== undefined) {
    // Weight: 20% new score, 80% existing score (if it exists)
    this.metrics.depthScore = this.metrics.depthScore !== undefined
      ? this.metrics.depthScore * 0.8 + depthScore * 0.2
      : depthScore;
  }
  
  if (reciprocityRatio !== undefined) {
    // Weight: 25% new score, 75% existing score (if it exists)
    this.metrics.reciprocityRatio = this.metrics.reciprocityRatio !== undefined
      ? this.metrics.reciprocityRatio * 0.75 + reciprocityRatio * 0.25
      : reciprocityRatio;
  }
  
  // For categorical metrics, use most recent if confidence is high
  if (emotionalVolatility !== undefined) {
    this.metrics.emotionalVolatility = emotionalVolatility;
  }
  
  this.metrics.lastUpdated = Date.now();
  return this.save();
};

// Method to add a new insight
relationshipSchema.methods.addInsight = async function(insight) {
  // Check if similar insight already exists
  const similarInsights = this.insights.filter(existingInsight => 
    existingInsight.text.toLowerCase().includes(insight.text.toLowerCase()) ||
    insight.text.toLowerCase().includes(existingInsight.text.toLowerCase())
  );
  
  if (similarInsights.length === 0) {
    // No similar insights, add new one
    this.insights.push(insight);
  } else {
    // Update existing insight if new one has higher confidence
    const existingInsight = similarInsights[0];
    if (insight.confidence > existingInsight.confidence) {
      existingInsight.text = insight.text;
      existingInsight.confidence = insight.confidence;
      existingInsight.type = insight.type;
      existingInsight.sentiment = insight.sentiment;
    }
  }
  
  // Limit to top N insights
  if (this.insights.length > 20) {
    this.insights.sort((a, b) => b.confidence - a.confidence);
    this.insights = this.insights.slice(0, 20);
  }
  
  return this.save();
};

// Method to update topic distribution
relationshipSchema.methods.updateTopicDistribution = async function(topics) {
  // Merge new topics with existing ones
  topics.forEach(newTopic => {
    const existingTopic = this.topicDistribution.find(t => t.name === newTopic.name);
    if (existingTopic) {
      // Update existing topic percentage (weighted average)
      existingTopic.percentage = existingTopic.percentage * 0.7 + newTopic.percentage * 0.3;
    } else {
      // Add new topic
      this.topicDistribution.push(newTopic);
    }
  });
  
  // Normalize percentages to sum to 100%
  const total = this.topicDistribution.reduce((sum, topic) => sum + topic.percentage, 0);
  if (total > 0) {
    this.topicDistribution.forEach(topic => {
      topic.percentage = (topic.percentage / total) * 100;
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Relationship', relationshipSchema);