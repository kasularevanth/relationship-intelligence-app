// backend/config/index.js - UPDATED

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/relationship-intelligence-app',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  openaiApiKey: process.env.OPENAI_API_KEY,
  jwtExpiresIn: '7d', // Token expires in 7 days
  environment: process.env.NODE_ENV || 'development',
  
  // Claude API config (if you decide to use Claude instead of OpenAI)
  claudeApiKey: process.env.CLAUDE_API_KEY,
  
  // Application settings
  memorySettings: {
    defaultDecayFactor: 0.05,
    defaultWeight: 0.5,
  },
  
  // Firebase configuration - NEW
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  }
};