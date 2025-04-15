// backend/models/Conversation.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
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
  insights: [{
    type: {
      type: String,
      enum: ['Pattern Recognition', 'Emotional Insight', 'Growth Opportunity', 'Challenge Area', 'General Observation'],
      default: 'General Observation'
    },
    category: {
      type: String,
      enum: ['pattern', 'emotion', 'growth', 'challenge', 'neutral'],
      default: 'neutral'
    },
    text: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  }],
  memories: [{
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['event', 'conversation', 'gift', 'support', 'general'],
      default: 'general'
    },
    emotion: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    saved: {
      type: Boolean,
      default: false
    }
  }],
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['very negative', 'negative', 'neutral', 'positive', 'very positive'],
      default: 'neutral'
    },
    magnitude: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  phase: {
    type: String,
    enum: ['onboarding', 'emotional_mapping', 'dynamics_tensions', 'dual_lens_reflection'],
    default: 'onboarding'
  }
});

const conversationSchema = new Schema({
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
  title: {
    type: String,
    default: function() {
      return `Conversation on ${new Date().toLocaleDateString()}`;
    }
  },
  messages: [messageSchema],
  summary: {
    text: {
      type: String
    },
    insights: [{
      type: {
        type: String
      },
      category: {
        type: String
      },
      text: {
        type: String
      }
    }],
    emotionalTone: {
      type: String
    },
    sentimentScore: {
      type: Number
    },
    topics: [{
      name: {
        type: String
      },
      strength: {
        type: Number
      }
    }],
    memories: [{
      content: {
        type: String
      },
      type: {
        type: String
      },
      emotion: {
        type: String
      }
    }],
    nextSteps: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  sentimentAnalysis: {
    overall: {
      type: Number,
      min: -1,
      max: 1
    },
    progression: [{
      messageIndex: Number,
      score: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for message count
conversationSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Pre-save middleware to update updatedAt
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate duration if conversation is completed
  if (this.status === 'completed' && this.endTime && !this.duration) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  
  next();
});

// Method to add a new message
conversationSchema.methods.addMessage = async function(messageData) {
  this.messages.push(messageData);
  this.updatedAt = Date.now();
  
  // Update conversation status if needed
  if (this.messages.length >= 20 || 
     (this.messages.length > 0 && this.messages[this.messages.length - 1].phase === 'dual_lens_reflection')) {
    this.status = 'completed';
    this.endTime = Date.now();
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  
  return this.save();
};

// Method to generate and save summary
conversationSchema.methods.generateSummary = async function(aiEngine) {
  if (this.messages.length === 0) {
    return null;
  }
  
  try {
    // Get relationship data
    await this.populate('relationship');
    
    // Generate summary using AI engine
    const summary = await aiEngine.generateConversationSummary(this, this.relationship);
    
    // Save summary to conversation
    this.summary = summary;
    this.updatedAt = Date.now();
    
    // If conversation is complete, extract relationship insights
    if (this.status === 'completed') {
      // Calculate overall sentiment for the conversation
      this.sentimentAnalysis = {
        overall: summary.sentimentScore || 0,
        progression: this.messages.map((msg, index) => ({
          messageIndex: index,
          score: msg.sentiment?.score || 0
        }))
      };
    }
    
    await this.save();
    return summary;
  } catch (error) {
    console.error('Error generating conversation summary:', error);
    return null;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);