// backend/services/conversationFlow.js

const promptTemplates = require('../utils/promptTemplates');

exports.getInitialMessage = async (contactName) => {
  // Get the template for the onboarding phase
  const template = promptTemplates.getPhaseTemplate('onboarding', contactName);
  
  // Return an initial greeting message
  return `Hi there! I'd love to help you reflect on your relationship with ${contactName}. Let's start with something simple - Hi How are you?`;
};

exports.getNextQuestion = async (phase, contactName, previousMessages) => {
  // Ensure contactName is defined
  if (!contactName) {
    console.error('Missing contactName in getNextQuestion');
    contactName = 'your contact';
  }
  
  const questions = getPhaseQuestions(phase, contactName);
  console.log(`Questions for phase ${phase}:`, questions);
  
  // More sophisticated question tracking
  const aiMessages = previousMessages.filter(msg => msg.role === 'ai');
  console.log(`AI messages in phase ${phase}:`, aiMessages.length);
  const askedQuestions = new Set(); // Use a Set for better tracking
  
  // Track questions that have been asked
  aiMessages.forEach(msg => {
    questions.forEach(question => {
      if (msg.content === question) {
        askedQuestions.add(question);
      }
    });
  });


  console.log("Already asked questions:", Array.from(askedQuestions));

  const remainingQuestions = questions.filter(q => !askedQuestions.has(q));
  if (remainingQuestions.length > 0) {
    // Choose a random question from the remaining questions for variety
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    return remainingQuestions[randomIndex];
  }
  
  // If all questions have been asked, return a generic follow-up
  // If all questions have been asked, return a generic follow-up that's not been used
  const genericFollowUp = getGenericFollowUp(phase, contactName);
  
  // Check if this follow-up has been asked before
  const followUpAsked = aiMessages.some(msg => msg.content === genericFollowUp);
  
  if (!followUpAsked) {
    // If the follow-up hasn't been asked yet, use it once
    return genericFollowUp;
  }
  
  // Last resort - create a unique follow-up
  return `Tell me more about your relationship with ${contactName}. What aspects would you like to explore further?`;
};


function getPhaseQuestions(phase, contactName) {
  // Return predefined questions for each phase
  switch (phase) {
    case 'onboarding':
      return [
        `How did you and ${contactName} meet?`,
        `What's your favorite memory with ${contactName}?`,
        `How often do you talk or see each other?`,
        `What do you usually talk about?`
      ];
    case 'emotionalMapping':
      return [
        `What do you love or appreciate most about ${contactName}?`,
        `What role does ${contactName} play in your life?`,
        `How do you feel after talking to ${contactName}?`,
        `Have they been there for you during hard times?`
      ];
    case 'dynamics':
      return [
        `When was the last time you felt disconnected or misunderstood by ${contactName}?`,
        `What's something ${contactName} does that triggers or annoys you?`,
        `Have you ever argued or had a conflict with ${contactName}? What happened?`,
        `Do you feel like your relationship with ${contactName} is balanced?`
      ];
    case 'dualLens':
      return [
        `How do you think ${contactName} would describe this relationship?`,
        `How do you think ${contactName} views you?`,
        `What might ${contactName} say you bring to their life?`,
        `What's something you wish ${contactName} knew about you?`
      ];
    default:
      return [
        `Tell me more about your relationship with ${contactName}.`
      ];
  }
}

function getGenericFollowUp(phase, contactName) {
  // Generic follow-up questions for each phase
  switch (phase) {
    case 'onboarding':
      return `Is there anything else about how your relationship with ${contactName} began that you'd like to share?`;
    case 'emotionalMapping':
      return `What other feelings come up for you when you think about ${contactName}?`;
    case 'dynamics':
      return `Are there any other patterns or dynamics in your relationship with ${contactName} that you've noticed?`;
    case 'dualLens':
      return `Is there anything else you think ${contactName} might say about your relationship that we haven't covered?`;
    default:
      return `Would you like to share anything else about ${contactName}?`;
  }
}

// Update determineNextPhase function in conversationFlow.js
exports.determineNextPhase = (phase, messageCount, conversationData) => {

  

  console.log("determineNextPhase called with:", { phase, messageCount, conversationData });

  if (!phase) {
    console.warn("Phase is undefined, defaulting to onboarding");
    phase = 'onboarding';
  }
  // Validate the conversationData has contactName
  if (!conversationData || !conversationData.contactName) {
    console.error('Missing contactName in determineNextPhase:', conversationData);
    // Provide a fallback
    conversationData = conversationData || {};
    conversationData.contactName = conversationData.contactName || 'your contact';
  }

  // Define phase sequence for consistent reference
  const phases = ['onboarding', 'emotionalMapping', 'dynamics', 'dualLens', 'completed'];
  
   // Find the current phase index
   let currentPhaseIndex = phases.indexOf(phase);
   if (currentPhaseIndex === -1) {
     console.warn(`Unknown phase "${phase}", defaulting to onboarding`);
     currentPhaseIndex = 0;
   }
   
  //  // Stay in current phase if it's the last one
  //  if (currentPhaseIndex >= phases.length - 1) {
  //    return phases[currentPhaseIndex];
  //  }

   // Determine message threshold for phase advancement
  // Each phase requires progressively more messages before advancing
  const phaseThresholds = {
    'onboarding': 6,          // 3 questions + 3 answers
    'emotionalMapping': 10,   // 5 questions + 5 answers
    'dynamics': 14,           // 7 questions + 7 answers
    'dualLens': 18            // 9 questions + 9 answers
  };

  if (messageCount >= phaseThresholds[phase]) {
    const nextPhase = phases[currentPhaseIndex + 1];
    console.log(`Moving from ${phase} to ${nextPhase} based on message count ${messageCount}`);
    return nextPhase;
  }

  console.log(`Phase decision: ${phase} → ${phases[currentPhaseIndex + 1] || phase}`);
  
  return phase;
};