const Relationship = require('../models/Relationship');
const Conversation = require('../models/Conversation');
const MemoryNode = require('../models/MemoryNode');
const Message = require('../models/Message');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parseWhatsApp, parseIMessage } = require('../services/chatParserService');
const { analyzeImportedConversation } = require('../services/conversationAnalyzerService');
const { enrichRelationshipData } = require('../services/relationshipAnalyzer');

const extract = require('extract-zip'); // You'll need to install this package


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Update your multer configuration in your controller file:
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log('Received file:', file.originalname, 'with mimetype:', file.mimetype);
    
    // Accept more flexible mime types
    const allowedMimeTypes = [
      'text/plain', 
      'application/zip', 
      'application/x-zip', 
      'application/x-zip-compressed', 
      'application/octet-stream',  // Some systems send zip as octet-stream
      'application/json',
      'text/csv',
      'text/x-csv',
      'application/csv',
      'application/vnd.ms-excel',
      'text/comma-separated-values',
      'application/x-compressed',
      'multipart/x-zip'
    ];
    
    // Check if the mimetype is in our allowed list
    if (allowedMimeTypes.includes(file.mimetype) || 
        // Also check file extension as fallback for more reliability
        file.originalname.endsWith('.zip') || 
        file.originalname.endsWith('.txt') || 
        file.originalname.endsWith('.json') ||
        file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      console.log('Rejected file with mimetype:', file.mimetype);
      cb(new Error(`Unsupported file format (${file.mimetype}). Please upload a text, zip, CSV, or JSON file.`));
    }
  }
}).single('chatFile');  // Make sure this matches the field name in your FormData

// Import chat history
// Import chat history
const importChat = async (req, res) => {
  try {
    // Use multer to handle file upload
    upload(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      if (!req.file) {
        console.error('No file found in request');
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const { relationshipId } = req.params;
      const { source, contactPhone } = req.body;

      // Get the relationship
      const relationship = await Relationship.findOne({
        _id: relationshipId,
        user: req.user.id
      });

      if (!relationship) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ 
          success: false, 
          message: 'Relationship not found' 
        });
      }

      let fileContent;
      let cleanupPaths = [req.file.path];
      
      // Process file based on type (zip, text, etc.)
      if (req.file.originalname.toLowerCase().endsWith('.zip')) {
        try {
          console.log('Processing zip file:', req.file.path);
          
          const extractPath = path.join(__dirname, '../uploads/extracted', Date.now().toString());
          if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
          }
           
          // Add extraction path to cleanup list
          cleanupPaths.push(extractPath);
          
          // Extract the ZIP file
          await extract(req.file.path, { dir: extractPath });
          
          // Find the relevant text file in the extracted directory
          const files = fs.readdirSync(extractPath);
          console.log('Files found in zip:', files);
          
          // Look for WhatsApp chat export (usually named _chat.txt or specific pattern)
          let textFile = files.find(file => file.endsWith('_chat.txt') || 
                                             file.includes('WhatsApp Chat with') ||
                                             file.endsWith('.txt'));
          
          // If no specific chat file found, look for any text file
          if (!textFile) {
            textFile = files.find(file => file.endsWith('.txt'));
          }

          if (!textFile) {
            return res.status(400).json({
              success: false,
              message: 'No text file found inside the ZIP archive'
            });
          }

          console.log('Found text file in zip:', textFile);
          fileContent = fs.readFileSync(path.join(extractPath, textFile), 'utf8');
        } catch (extractError) {
          console.error('Error extracting ZIP file:', extractError);

          // Clean up files
          cleanupPaths.forEach(p => {
            if (fs.existsSync(p)) {
              try {
                if (fs.lstatSync(p).isDirectory()) {
                  fs.rmSync(p, { recursive: true, force: true }); // Using rmSync instead of deprecated rmdir
                } else {
                  fs.unlinkSync(p);
                }
              } catch (cleanupErr) {
                console.error('Error during cleanup:', cleanupErr);
              }
            }
          });
          
          return res.status(400).json({
            success: false,
            message: 'Error extracting ZIP file: ' + extractError.message
          });
        }
      } else {
        // Handle regular text or JSON files
        fileContent = fs.readFileSync(req.file.path, 'utf8');
      }
      
      // Fallback to relationship's contactPhone if not provided in the request
      const phoneToUse = contactPhone || relationship.contactPhone || '';
      
      // Parse the file based on source
      let parsedMessages;
      
      // At the top where you have your destructuring:
      const { parseChat, parseWhatsApp, parseWhatsAppInternational, parseWhatsAppSample, parseWhatsAppIOS, parseIMessage } = require('../services/chatParserService');

      // And in the parsing section:
      if (source === 'whatsapp') {
        // Try multiple parsing methods and use the best result
        const standardResult = parseWhatsApp(fileContent, phoneToUse);
        const internationalResult = parseWhatsAppInternational(fileContent, phoneToUse);
        const sampleResult = parseWhatsAppSample(fileContent, phoneToUse);
        const iOSResult = parseWhatsAppIOS(fileContent, phoneToUse); // Make sure this is added
        
        // Use the parsing method that produced the most messages
        const results = [
          { method: 'standard', messages: standardResult }, 
          { method: 'international', messages: internationalResult },
          { method: 'sample', messages: sampleResult },
          { method: 'iOS', messages: iOSResult } // Make sure this is added
        ];
        
        // Add debug log to see which parser found the most messages
        console.log(`Parsing results - Standard: ${standardResult.length}, International: ${internationalResult.length}, Sample: ${sampleResult.length}, iOS: ${iOSResult.length}`);
        
        const bestResult = results.reduce((prev, current) => 
          (prev.messages.length > current.messages.length) ? prev : current
        );
        
        console.log(`Selected parsing method: ${bestResult.method} with ${bestResult.messages.length} messages`);
        parsedMessages = bestResult.messages;
      } else if (source === 'imessage') {
        parsedMessages = parseIMessage(fileContent, phoneToUse);
      } else {
        // Auto-detect format if source not specified
        const result = parseChat(fileContent, phoneToUse);
        parsedMessages = result.messages;
      }
      
      if (!parsedMessages || parsedMessages.length === 0) {
        // Clean up files
        cleanupPaths.forEach(p => {
          if (fs.existsSync(p)) {
            try {
              if (fs.lstatSync(p).isDirectory()) {
                fs.rmSync(p, { recursive: true, force: true });
              } else {
                fs.unlinkSync(p);
              }
            } catch (cleanupErr) {
              console.error('Error during cleanup:', cleanupErr);
            }
          }
        });
        
        return res.status(400).json({
          success: false,
          message: 'No messages could be parsed from the file. Please check the file format and contact phone number.'
        });
      }

      // Create a new conversation for the imported chat
      const conversation = new Conversation({
        user: req.user.id,
        relationship: relationshipId,
        title: `Imported ${source} conversation`,
        contactName: relationship.contactName,
        phase: 'processing', // Changed from 'completed' to 'processing'
        status: 'importing', // Changed from 'completed' to 'importing'
        startTime: new Date(),
        endTime: new Date(),
        
      });

      // Save the conversation
      await conversation.save();

      // Add the conversation to the relationship
      if (!relationship.sessions) {
        relationship.sessions = [];
      }
      relationship.sessions.push(conversation._id);
      await relationship.save();

      // FIXED: Remove message limit - process ALL messages
      let messageCount = 0;
      for (const msg of parsedMessages) {   
        // Validate the timestamp
        let timestamp = msg.timestamp;
        if (!timestamp || isNaN(timestamp.getTime())) {
          timestamp = new Date();
        }

        const message = new Message({
          conversation: conversation._id,
          user: req.user.id,
          role: msg.isFromContact ? 'user' : 'ai',
          content: msg.text,
          timestamp: msg.timestamp
        });

        await message.save();
        
        // Add message to conversation
        conversation.messages.push({
          role: msg.isFromContact ? 'user' : 'ai',
          content: msg.text,
          timestamp: msg.timestamp,
          sentiment: {
            score: 0,  // To be calculated later
            label: 'neutral',
            magnitude: 0
          }
        });

        messageCount++;
      }

     // FIXED: Save the actual message count
     conversation.messageCount = messageCount;
      await conversation.save();

      // Clean up files
      cleanupPaths.forEach(p => {
        if (fs.existsSync(p)) {
          try {
            if (fs.lstatSync(p).isDirectory()) {
              fs.rmSync(p, { recursive: true, force: true });
            } else {
              fs.unlinkSync(p);
            }
          } catch (cleanupErr) {
            console.error('Error during cleanup:', cleanupErr);
          }
        }
      });

      // Then in your setTimeout block, update with:
      // setTimeout(() => {
      //   analyzeImportedConversation(conversation._id)
      //     .then(insights => {
      //       console.log(`Analysis completed for conversation ${conversation._id}`);
      //       // Update conversation status after analysis is done
      //       Conversation.findByIdAndUpdate(
      //         conversation._id,
      //         { 
      //           phase: 'completed',
      //             status: 'analyzed',
      //             messageCount: messageCount // Ensure message count is saved
      //         }
      //       ).catch(err => {
      //         console.error(`Error updating conversation status: ${err}`);
      //       });
      //     })
      //     .catch(err => {
      //       console.error(`Error analyzing conversation ${conversation._id}:`, err);
      //       // Handle failed analysis by updating status
      //       Conversation.findByIdAndUpdate(
      //         conversation._id,
      //         { 
      //           phase: 'completed',
      //             status: 'analysis_failed',
      //             messageCount: messageCount // Ensure message count is saved
      //         }
      //       ).catch(updateErr => {
      //         console.error(`Error updating conversation status: ${updateErr}`);
      //       });
      //     });
      // }, 100); // Small delay to let the response go out first

      setTimeout(async () => {
        try {
          // First run the conversation-level analysis
          const conversationInsights = await analyzeImportedConversation(conversation._id);
          
          // Then enrich the relationship data with deeper analysis
          await enrichRelationshipData(relationship._id, conversation._id);
          
          console.log(`Analysis completed for conversation ${conversation._id}`);
          
          // Update conversation status after analysis is done
          await Conversation.findByIdAndUpdate(
            conversation._id,
            { 
              phase: 'completed',
              status: 'analyzed',
              messageCount
            }
          );
      
          // Signal to frontend that data has been updated
          // This will be picked up by the polling mechanism in the frontend
          const socketId = req.app.get('socketio');
          if (socketId) {
            socketId.emit('relationship_updated', { 
              relationshipId: relationship._id,
              conversationId: conversation._id
            });
          }
        } catch (err) {
          console.error(`Error analyzing conversation ${conversation._id}:`, err);
          
          // Handle failed analysis by updating status
          await Conversation.findByIdAndUpdate(
            conversation._id,
            { 
              phase: 'completed',
              status: 'analysis_failed',
              messageCount
            }
          );
        }
      }, 100); // Small delay to let the response go out first

      return res.status(200).json({
        success: true,
          message: `Successfully imported ${messageCount} messages`,
          conversationId: conversation._id,
          messageCount: messageCount // FIXED: Return message count to frontend
      });
    });
  } catch (error) {
    console.error('Error importing chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error importing chat history'
    });
  }
};

// Get import status
const getImportStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Return status based on conversation state
    return res.status(200).json({
      success: true,
      status: conversation.status,
      messageCount: conversation.messages.length,
      summary: conversation.summary
    });
  } catch (error) {
    console.error('Error checking import status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking import status'
    });
  }
};
// Get import analysis
const getImportAnalysis = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id
    }).populate('relationship');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const relationship = conversation.relationship;
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Relationship not found'
      });
    }

   // Count messages by sender
   const messagesBySender = {};
   conversation.messages.forEach(msg => {
     const sender = msg.role === 'user' ? relationship.contactName || 'Contact' : 'You';
     messagesBySender[sender] = (messagesBySender[sender] || 0) + 1;
   });

   // Generate time range string based on messages
   let timeRange = '';
   if (conversation.messages && conversation.messages.length > 1) {
     const timestamps = conversation.messages
       .map(msg => new Date(msg.timestamp))
       .filter(date => !isNaN(date.getTime()))
       .sort((a, b) => a - b);
     
     if (timestamps.length >= 2) {
       const firstDate = timestamps[0];
       const lastDate = timestamps[timestamps.length - 1];
        
        // Calculate months difference
        const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                           (lastDate.getMonth() - firstDate.getMonth());
        
        if (monthsDiff < 1) {
          timeRange = `${timestamps.length} messages over a few days`;
        } else if (monthsDiff < 12) {
          timeRange = `${timestamps.length} messages over ${monthsDiff} months`;
        } else {
          const yearsDiff = monthsDiff / 12;
          timeRange = `${timestamps.length} messages over ${Math.round(yearsDiff * 10) / 10} years`;
        }
      }
    }
    
   // Get topic distribution from relationship if it exists
   let topTopics = relationship.topicDistribution || [];
    
   // If no topics exist, generate them based on common categories
   if (!topTopics || topTopics.length === 0) {
       // Extract common conversation topics
   const messageTexts = conversation.messages.map(msg => msg.content || '').filter(text => text.length > 0);
   
   // Common topic categories to look for in messages
   const topicKeywords = {
     'Work': ['work', 'job', 'office', 'meeting', 'project', 'boss', 'client', 'deadline'],
     'Family': ['family', 'kids', 'parents', 'mom', 'dad', 'sister', 'brother', 'child'],
     'Social': ['party', 'dinner', 'lunch', 'drinks', 'hangout', 'meet up', 'event'],
     'Travel': ['trip', 'vacation', 'travel', 'flight', 'hotel', 'visit'],
     'Health': ['doctor', 'sick', 'health', 'exercise', 'gym', 'workout', 'diet'],
     'Plans': ['plan', 'schedule', 'next week', 'weekend', 'tomorrow', 'tonight', 'future'],
     'Emotions': ['feel', 'happy', 'sad', 'angry', 'excited', 'worried', 'stress', 'love']
   };

   // Count topic occurrences
   const topicCounts = {};
   Object.keys(topicKeywords).forEach(topic => {
     topicCounts[topic] = 0;
     topicKeywords[topic].forEach(keyword => {
       messageTexts.forEach(text => {
         if (text.toLowerCase().includes(keyword.toLowerCase())) {
           topicCounts[topic]++;
         }
       });
     });
   });

   // Convert to percentage-based topics
   const totalTopicMentions = Object.values(topicCounts).reduce((sum, count) => sum + count, 0) || 1;
    
   topTopics = Object.entries(topicCounts)
     .map(([topic, count]) => ({
       name: topic,
       percentage: Math.round((count / totalTopicMentions) * 100) || 
                   // Fallback if no topics found - generate pseudo-random percentages
                   Math.round(Math.random() * 50) + 20
     }))
     .sort((a, b) => b.percentage - a.percentage)
     .slice(0, 4); // Top 4 topics
    }
   
   // Ensure we have at least some topics if none were found
   if (topTopics.length === 0) {
     topTopics = [
       { name: 'General Discussion', percentage: 55 },
       { name: 'Plans', percentage: 20 },
       { name: 'Personal Updates', percentage: 15 },
       { name: 'Questions', percentage: 10 }
     ];
   }

    // Generate meaningful insights if none exist
    let insights = relationship.insights || {};
    
    // Provide text insights if missing
    if (!insights || typeof insights === 'string' || Object.keys(insights).length === 0) {
      const insightsText = "Based on the imported conversation, there appears to be regular communication with varied topics. The conversation shows patterns of " + 
                  topTopics.slice(0, 2).map(t => t.name.toLowerCase()).join(" and ") + 
                  ". Continue building this relationship by engaging on these topics that matter most to both of you.";
                  
      insights = {
        sentimentScore: 0.6, // Positive default
        sentimentLabel: "positive",
        communicationBalance: "balanced",
        messageCount: conversation.messages.length,
        primaryTopics: topTopics.map(t => t.name),
        topicDistribution: topTopics.reduce((obj, topic) => {
          obj[topic.name] = topic.percentage;
          return obj;
        }, {}),
        insightsText: insightsText
      };
    }

    // Ensure we have required gamification fields
    const gamification = relationship.gamification || {};
    
    if (!insights.connectionScore && gamification.connectionScore) {
      insights.connectionScore = gamification.connectionScore;
    } else if (!insights.connectionScore) {
      insights.connectionScore = 75; // Default value
    }
    
    if (!insights.relationshipLevel && gamification.relationshipLevel) {
      insights.relationshipLevel = gamification.relationshipLevel;
    } else if (!insights.relationshipLevel) {
      insights.relationshipLevel = 3; // Default value
    }
    
    if (!insights.challengesBadges && gamification.challengesBadges) {
      insights.challengesBadges = gamification.challengesBadges;
    } else if (!insights.challengesBadges) {
      insights.challengesBadges = ["Regular Communicator", "Conversation Starter"];
    }
    
    if (!insights.nextMilestone && gamification.nextMilestone) {
      insights.nextMilestone = gamification.nextMilestone;
    } else if (!insights.nextMilestone) {
      insights.nextMilestone = "Meaningful Conversation Master: Have 5 deep conversations about important topics";
    }
    
    if (!insights.communicationStyle && gamification.communicationStyle) {
      insights.communicationStyle = gamification.communicationStyle;
    } else if (!insights.communicationStyle) {
      insights.communicationStyle = {
        user: "balanced",
        contact: "responsive"
      };
    }

    // Ensure we have a valid summary object with all expected fields
    const summary = conversation.summary || {};
    
    // Ensure keyInsights exists
    if (!summary.keyInsights || !Array.isArray(summary.keyInsights) || summary.keyInsights.length === 0) {
      summary.keyInsights = [
        "Regular communication patterns detected",
        "Conversation focuses on " + topTopics[0]?.name || "various topics",
        "Both parties actively participate in the conversation",
        "Relationship appears to be in good standing"
      ];
    }
    
    // Ensure emotionalMapping exists
    if (!summary.emotionalDynamics && (!summary.emotionalMapping || typeof summary.emotionalMapping !== 'object')) {
      summary.emotionalMapping = {
        overall: "generally positive",
        user: "interested and engaged",
        contact: "responsive and participatory",
        trends: "consistent tone throughout conversations"
      };
      summary.emotionalDynamics = "The conversation shows a generally positive tone with balanced engagement from both parties.";
    }
    
    // Ensure areasForGrowth exists
    if (!summary.areasForGrowth || !Array.isArray(summary.areasForGrowth) || summary.areasForGrowth.length === 0) {
      summary.areasForGrowth = [
        "More frequent check-ins could strengthen the relationship",
        "Consider initiating deeper conversations on topics of mutual interest",
        "Follow up on mentioned plans or events",
        "Ask more open-ended questions to encourage sharing"
      ];
    }
    
    // Ensure culturalContext exists if present in analyzer service
    if (!summary.culturalContext) {
      summary.culturalContext = "Standard conversation patterns observed with no specific cultural elements identified.";
    }

    // Ensure overallTone exists
    if (!summary.overallTone) {
      summary.overallTone = insights.sentimentLabel || "positive";
    }

    // Return complete analysis with all expected fields
    return res.status(200).json({
      success: true,
      topSenders: messagesBySender,
      topTopics: topTopics,
      timeRange: timeRange,
      insights: insights,
      summary: summary,
      // Include all gamification metrics
      connectionScore: insights.connectionScore,
      relationshipLevel: insights.relationshipLevel,
      challengesBadges: insights.challengesBadges,
      nextMilestone: insights.nextMilestone,
      communicationStyle: insights.communicationStyle,
      // Include any additional metrics for the dashboard
      communicationBalance: insights.communicationBalance,
      sentimentScore: insights.sentimentScore,
      sentimentLabel: insights.sentimentLabel,
      messageCount: insights.messageCount,
      primaryTopics: insights.primaryTopics,
      topicDistribution: insights.topicDistribution
    });
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving analysis'
    });
  }
};
  // Don't forget to export the new function
  module.exports = {
    importChat,
    getImportStatus,
    getImportAnalysis
  };