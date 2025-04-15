// backend/config/index.js
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
  }
};