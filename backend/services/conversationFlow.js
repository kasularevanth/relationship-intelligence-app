// backend/services/conversationFlow.js

const promptTemplates = require('../utils/promptTemplates');

exports.getInitialMessage = async (contactName) => {
  // Get the template for the onboarding phase
  const template = promptTemplates.getPhaseTemplate('onboarding', contactName);
  
  // Return an initial greeting message
  return `Hi there! I'd love to help you reflect on your relationship with ${contactName}. Let's start with something simple - how did you and ${contactName} meet?`;
};

exports.getNextQuestion = async (phase, contactName, previousMessages) => {
  const questions = getPhaseQuestions(phase, contactName);
  
  // Check which questions have already been asked (simple implementation)
  const askedQuestions = previousMessages
    .filter(msg => msg.role === 'ai')
    .map(msg => msg.content)
    .join(' ');
  
  // Find the first question that hasn't been asked yet
  for (const question of questions) {
    // Simple heuristic - if the AI message doesn't contain the exact question text
    if (!askedQuestions.includes(question)) {
      return question;
    }
  }
  
  // If all questions have been asked, return a generic follow-up
  return getGenericFollowUp(phase, contactName);
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

exports.determineNextPhase = (currentPhase, messageCount, conversationData) => {
  // Logic to determine when to move to the next phase
  // This is a simple implementation based on message count
  // In a real system, this would be more sophisticated based on content analysis
  
  const phaseSequence = ['onboarding', 'emotionalMapping', 'dynamics', 'dualLens', 'completed'];
  const currentIndex = phaseSequence.indexOf(currentPhase);
  
  // Stay in current phase if it's the last one
  if (currentIndex === phaseSequence.length - 1) {
    return currentPhase;
  }
  
  // Check if we've covered all the core questions for this phase
  const phaseQuestions = getPhaseQuestions(currentPhase, conversationData.contactName);
  const minimumQuestionsAnswered = phaseQuestions.length;
  
  // Check if we've had at least the minimum number of exchanges
  if (messageCount >= minimumQuestionsAnswered * 2) {
    return phaseSequence[currentIndex + 1];
  }
  
  return currentPhase;
};