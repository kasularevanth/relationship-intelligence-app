// scripts/migrateRelationshipData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Relationship = require('../models/Relationship');

const migrateData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all conversations with summaries
    const conversations = await Conversation.find({ 
      summary: { $exists: true, $ne: null }
    }).populate('relationship');
    
    console.log(`Found ${conversations.length} conversations with summaries`);
    
    for (const conversation of conversations) {
      if (!conversation.relationship) continue;
      
      const summary = conversation.summary;
      const relationship = conversation.relationship;
      
      // Transfer fields if they exist in the summary
      let updated = false;
      
      if (summary.loveLanguage && !relationship.loveLanguage) {
        relationship.loveLanguage = summary.loveLanguage;
        updated = true;
      }
      
      if (summary.theirValues && Array.isArray(summary.theirValues) && 
          (!relationship.theirValues || relationship.theirValues.length === 0)) {
        relationship.theirValues = summary.theirValues;
        updated = true;
      }
      
      if (summary.theirInterests && Array.isArray(summary.theirInterests) && 
          (!relationship.theirInterests || relationship.theirInterests.length === 0)) {
        relationship.theirInterests = summary.theirInterests;
        updated = true;
      }
      
      if (summary.communicationPreferences && !relationship.theirCommunicationPreferences) {
        relationship.theirCommunicationPreferences = summary.communicationPreferences;
        updated = true;
      }
      
      if (summary.importantDates && Array.isArray(summary.importantDates) && 
          (!relationship.importantDates || relationship.importantDates.length === 0)) {
        relationship.importantDates = summary.importantDates;
        updated = true;
      }
      
      if (updated) {
        await relationship.save();
        console.log(`Updated relationship ${relationship._id} with data from conversation ${conversation._id}`);
      }
    }
    
    console.log('Migration completed');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateData();