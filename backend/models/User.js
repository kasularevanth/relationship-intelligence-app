// backend/models/User.js - UPDATED
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { modelEvents } = require('../utils/eventEmitter');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        // Only require password if no other auth method is used
        return !this.googleId && !this.firebaseUid;
      },
      minlength: 6,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true // Allows null values while maintaining uniqueness
    },
    // NEW field for Firebase Authentication
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true // Allows null values while maintaining uniqueness
    },
    avatar: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If no password (Google auth or Firebase auth user), always return false
  if (!this.password) return false;
  
  return bcrypt.compare(candidatePassword, this.password);
};

// NEW - Add Firebase sync hook


userSchema.post('save',  function(doc) {
  try {
    // Only sync to Firebase in production
    if (process.env.NODE_ENV === 'production') {
      modelEvents.emit('syncUserToFirebase',(doc._id));
    }
  } catch (error) {
    console.error('Error in post-save Firebase sync:', error);
  }
});

userSchema.post('findOneAndUpdate',  function(doc) {
  if (doc) {
    try {
      // Only sync to Firebase in production
      if (process.env.NODE_ENV === 'production') {
        modelEvents.emit('syncUserToFirebase',(doc._id));
      }
    } catch (error) {
      console.error('Error in post-update Firebase sync:', error);
    }
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;