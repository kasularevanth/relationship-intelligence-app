// backend/models/RelationshipQuestion.js
const mongoose = require("mongoose");

const relationshipQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Relationship",
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  transcription: {
    type: String,
    default: null, // For voice questions
  },
  // NEW FIELDS FOR STRUCTURED QUESTIONS
  isStructured: {
    type: Boolean,
    default: false,
    index: true,
  },
  questionIndex: {
    type: Number,
    default: null, // Index in structured question sequence (0-6)
  },
  // END NEW FIELDS
  flagged: {
    type: Boolean,
    default: false,
  },
  flagType: {
    type: String,
    enum: ["harmful", "inappropriate", "spam"],
    default: null,
  },
  sentiment: {
    type: Number,
    default: 0, // -1 to 1 scale
  },
  emotions: {
    type: [String],
    default: [],
  },
  topics: {
    type: [String],
    default: [],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for efficient queries
relationshipQuestionSchema.index({ user: 1, relationship: 1, createdAt: -1 });
relationshipQuestionSchema.index({
  user: 1,
  relationship: 1,
  isStructured: 1,
  questionIndex: 1,
});

// Update the updatedAt field before saving
relationshipQuestionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted creation date
relationshipQuestionSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString();
});

// Method to check if this is part of a structured questionnaire
relationshipQuestionSchema.methods.isPartOfStructuredFlow = function () {
  return this.isStructured && typeof this.questionIndex === "number";
};

// Static method to get structured questions progress for a relationship
relationshipQuestionSchema.statics.getStructuredProgress = async function (
  userId,
  relationshipId
) {
  const totalStructuredQuestions = 7; // We have 7 structured questions

  const answeredCount = await this.countDocuments({
    user: userId,
    relationship: relationshipId,
    isStructured: true,
  });

  const answers = await this.find({
    user: userId,
    relationship: relationshipId,
    isStructured: true,
  }).sort({ questionIndex: 1 });

  return {
    totalQuestions: totalStructuredQuestions,
    answeredCount,
    isComplete: answeredCount >= totalStructuredQuestions,
    answers,
    nextQuestionIndex:
      answeredCount < totalStructuredQuestions ? answeredCount : null,
  };
};

// Static method to get question history (non-structured)
relationshipQuestionSchema.statics.getQuestionHistory = async function (
  userId,
  relationshipId,
  limit = 20
) {
  return await this.find({
    user: userId,
    relationship: relationshipId,
    isStructured: { $ne: true }, // Exclude structured questions
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Ensure virtual fields are serialized
relationshipQuestionSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model(
  "RelationshipQuestion",
  relationshipQuestionSchema
);
