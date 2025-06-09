// backend/models/Relationship.js - REMOVED interactionFrequency

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { modelEvents } = require("../utils/eventEmitter");

const growthAreaSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const insightSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "Pattern Recognition",
      "Emotional Insight",
      "Growth Opportunity",
      "Challenge Area",
      "General Observation",
    ],
    default: "General Observation",
  },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "growth", "challenge"],
    default: "neutral",
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  source: {
    type: String,
    enum: ["conversation", "analysis", "user_input"],
    default: "conversation",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const metricsSchema = new Schema({
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    default: 0,
  },
  depthScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  reciprocityRatio: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  emotionalVolatility: {
    type: String,
    enum: ["Stable", "Swingy", "Erratic"],
    default: "Stable",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  professionalTone: {
    type: String,
    enum: ["Very formal", "Formal", "Semi-formal", "Casual", "Very casual"],
    default: "Casual",
  },
  powerDynamic: {
    type: String,
    enum: [
      "You lead",
      "They lead",
      "Balanced",
      "You appear more directive",
      "They appear more directive",
    ],
    default: "Balanced",
  },
  responseTime: {
    type: String,
    default: "N/A",
  },
  taskSocialRatio: {
    type: String,
    default: "50% / 50%",
  },
  clarityIndex: {
    type: String,
    enum: [
      "Very clear",
      "Clear",
      "Average clarity",
      "Somewhat unclear",
      "Unclear",
    ],
    default: "Average clarity",
  },
  boundaryMaintenance: {
    type: String,
    enum: [
      "Very strong boundaries",
      "Strong boundaries",
      "Moderate boundaries",
      "Flexible boundaries",
      "Loose boundaries",
    ],
    default: "Moderate boundaries",
  },
  collaborationStyle: {
    type: String,
    enum: [
      "Highly collaborative",
      "Collaborative",
      "Moderately collaborative",
      "Independent",
      "Highly independent",
    ],
    default: "Moderately collaborative",
  },
});

const topicDistributionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
});

const gamificationSchema = new Schema({
  connectionScore: {
    type: Number,
    min: 1,
    max: 100,
    default: 50,
  },
  relationshipLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 1,
  },
  challengesBadges: {
    type: [String],
    default: [],
  },
  nextMilestone: {
    type: String,
    default: "",
  },
  communicationStyle: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const relationshipSchema = new Schema(
  {
    // REQUIRED FIELDS - Only these 4 fields for creation/validation
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    relationshipType: {
      type: String,
      enum: [
        "romantic",
        "friendship",
        "professional",
        "family",
        "mentor",
        "other",
      ],
      required: true,
    },
    photo: {
      type: String,
      default: null, // Optional - maps to photoUrl from frontend
    },

    // OPTIONAL FIELDS - Not used in creation/validation
    contactInfo: {
      type: String,
      trim: true,
    },
    loveLanguage: {
      type: String,
    },
    // REMOVED: interactionFrequency completely
    theirValues: {
      type: [String],
      default: [],
    },
    theirInterests: {
      type: [String],
      default: [],
    },
    theirCommunicationPreferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    importantDates: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    events: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    communicationStyle: {
      type: mongoose.Schema.Types.Mixed,
    },
    howWeMet: {
      type: String,
      trim: true,
    },
    timeKnown: {
      type: String,
      trim: true,
    },
    metrics: {
      type: metricsSchema,
      default: {},
    },
    gamification: {
      type: gamificationSchema,
      default: {},
    },
    insights: [insightSchema],
    growthAreas: [growthAreaSchema],
    topicDistribution: [topicDistributionSchema],
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
      },
    ],
    lastInteraction: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    connectionScore: {
      type: Number,
      min: 1,
      max: 100,
      default: 50,
    },
    trustLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    positiveMemories: [
      {
        type: String,
        trim: true,
      },
    ],
    challengeAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    messageCount: {
      type: Number,
      default: 0,
    },
    culturalContext: {
      type: String,
      trim: true,
    },
    relationshipLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    challengesBadges: [
      {
        type: String,
        trim: true,
      },
    ],
    nextMilestone: {
      type: String,
      trim: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate conversations
relationshipSchema.virtual("conversations", {
  ref: "Conversation",
  localField: "_id",
  foreignField: "relationship",
});

// Virtual populate memoryNodes
relationshipSchema.virtual("memoryNodes", {
  ref: "MemoryNode",
  localField: "_id",
  foreignField: "relationship",
});

// Pre-save middleware to update the updatedAt field
relationshipSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Enhanced updateMetrics method with proper validation
relationshipSchema.methods.updateMetrics = async function (newMetrics) {
  const { sentimentScore, depthScore, reciprocityRatio, emotionalVolatility } =
    newMetrics;

  // Calculate weighted averages for numeric metrics
  if (sentimentScore !== undefined) {
    const validSentimentScore = Math.max(-1, Math.min(1, sentimentScore));
    this.metrics.sentimentScore =
      this.metrics.sentimentScore !== undefined
        ? this.metrics.sentimentScore * 0.7 + validSentimentScore * 0.3
        : validSentimentScore;
  }

  if (depthScore !== undefined) {
    const validDepthScore = Math.max(1, Math.min(5, depthScore));
    this.metrics.depthScore =
      this.metrics.depthScore !== undefined
        ? Math.max(
            1,
            Math.min(5, this.metrics.depthScore * 0.8 + validDepthScore * 0.2)
          )
        : validDepthScore;
  }

  if (reciprocityRatio !== undefined) {
    const validReciprocityRatio = Math.max(0, Math.min(1, reciprocityRatio));
    this.metrics.reciprocityRatio =
      this.metrics.reciprocityRatio !== undefined
        ? this.metrics.reciprocityRatio * 0.75 + validReciprocityRatio * 0.25
        : validReciprocityRatio;
  }

  if (emotionalVolatility !== undefined) {
    if (typeof emotionalVolatility === "number") {
      if (emotionalVolatility <= 0.3) {
        this.metrics.emotionalVolatility = "Stable";
      } else if (emotionalVolatility <= 0.7) {
        this.metrics.emotionalVolatility = "Swingy";
      } else {
        this.metrics.emotionalVolatility = "Erratic";
      }
    } else if (["Stable", "Swingy", "Erratic"].includes(emotionalVolatility)) {
      this.metrics.emotionalVolatility = emotionalVolatility;
    } else {
      this.metrics.emotionalVolatility = "Stable";
    }
  }

  this.metrics.lastUpdated = Date.now();
  return this.save();
};

// Method to add a new insight
relationshipSchema.methods.addInsight = async function (insight) {
  const similarInsights = this.insights.filter(
    (existingInsight) =>
      existingInsight.text.toLowerCase().includes(insight.text.toLowerCase()) ||
      insight.text.toLowerCase().includes(existingInsight.text.toLowerCase())
  );

  if (similarInsights.length === 0) {
    this.insights.push(insight);
  } else {
    const existingInsight = similarInsights[0];
    if (insight.confidence > existingInsight.confidence) {
      existingInsight.text = insight.text;
      existingInsight.confidence = insight.confidence;
      existingInsight.type = insight.type;
      existingInsight.sentiment = insight.sentiment;
    }
  }

  if (this.insights.length > 20) {
    this.insights.sort((a, b) => b.confidence - a.confidence);
    this.insights = this.insights.slice(0, 20);
  }

  return this.save();
};

// Method to update topic distribution
relationshipSchema.methods.updateTopicDistribution = async function (topics) {
  topics.forEach((newTopic) => {
    const existingTopic = this.topicDistribution.find(
      (t) => t.name === newTopic.name
    );
    if (existingTopic) {
      existingTopic.percentage =
        existingTopic.percentage * 0.7 + newTopic.percentage * 0.3;
    } else {
      this.topicDistribution.push(newTopic);
    }
  });

  const total = this.topicDistribution.reduce(
    (sum, topic) => sum + topic.percentage,
    0
  );
  if (total > 0) {
    this.topicDistribution.forEach((topic) => {
      topic.percentage = (topic.percentage / total) * 100;
    });
  }

  return this.save();
};

// Firebase sync hooks
relationshipSchema.post("save", function (doc) {
  try {
    if (process.env.NODE_ENV === "production") {
      modelEvents.emit("syncRelationshipToFirebase", doc._id);
    }
  } catch (error) {
    console.error("Error in post-save Firebase sync for relationship:", error);
  }
});

relationshipSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    try {
      if (process.env.NODE_ENV === "production") {
        modelEvents.emit("syncRelationshipToFirebase", doc._id);
      }
    } catch (error) {
      console.error(
        "Error in post-update Firebase sync for relationship:",
        error
      );
    }
  }
});

module.exports = mongoose.model("Relationship", relationshipSchema);
