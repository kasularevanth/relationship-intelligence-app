// backend/utils/safetyGuards.js

// Keywords that might indicate safety concerns
const SAFETY_KEYWORDS = [
    'harm', 'hurt', 'kill', 'die', 'suicide', 'abuse', 'violence', 'assault',
    'unsafe', 'scared', 'terrified', 'threatened', 'weapon', 'gun',
    'beat', 'hit', 'punch', 'destroy', 'traumatized'
  ];
  
  // Keywords that might indicate severe emotional distress
  const DISTRESS_KEYWORDS = [
    'depression', 'depressed', 'anxiety', 'panic', 'hopeless', 'suicidal',
    'can\'t cope', 'can\'t handle', 'breaking down', 'crisis', 'emergency',
    'unbearable', 'miserable', 'end it all', 'giving up'
  ];
  
  exports.checkMessage = (message) => {
    // Convert to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();
    
    // Check for safety concerns
    const safetyMatches = SAFETY_KEYWORDS.filter(keyword => 
      lowerMessage.includes(keyword)
    );
    
    if (safetyMatches.length > 0) {
      return {
        flagged: true,
        type: 'safety',
        response: `I notice you mentioned something that sounds concerning. If you're in immediate danger or crisis, please reach out to emergency services (911 in the US) or a crisis helpline right away. While I'm here to help you reflect on relationships, I want to make sure you're safe first and foremost. Would you like to continue our conversation about your relationship, or would you prefer we take a different direction?`
      };
    }
    
    // Check for emotional distress
    const distressMatches = DISTRESS_KEYWORDS.filter(keyword => 
      lowerMessage.includes(keyword)
    );
    
    if (distressMatches.length > 0) {
      return {
        flagged: true,
        type: 'distress',
        response: `It sounds like you're going through something really difficult right now. While I can help you reflect on relationships, I'm not a replacement for professional support. Would it be helpful to talk to someone like a therapist or counselor about what you're experiencing? We can continue our conversation, but I want to make sure you're getting the support you need.`
      };
    }
    
    // No concerns found
    return {
      flagged: false
    };
  };
  
  // Check for one-sided bias in message
  exports.checkForBias = (message) => {
    // Convert to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();
    
    // Check for absolute language
    const absoluteTerms = ['always', 'never', 'everyone', 'nobody', 'all the time', 'not once'];
    const hasAbsolutes = absoluteTerms.some(term => lowerMessage.includes(term));
    
    // Check for emotional heat (simplified for MVP)
    const heatTerms = ['hate', 'despise', 'can\'t stand', 'awful', 'terrible', 'worst'];
    const hasEmotionalHeat = heatTerms.some(term => lowerMessage.includes(term));
    
    // Check for one-sided pronoun usage
    const wordCount = message.split(/\s+/).length;
    const theyCount = (lowerMessage.match(/\bthey\b|\bthem\b|\btheir\b/g) || []).length;
    const iCount = (lowerMessage.match(/\bi\b|\bme\b|\bmy\b|\bmine\b/g) || []).length;
    const weCount = (lowerMessage.match(/\bwe\b|\bus\b|\bour\b/g) || []).length;
    
    // Calculate ratio of "they" vs "we" pronouns if enough words and pronouns
    let pronounBias = false;
    if (wordCount > 20 && (theyCount + weCount) > 3) {
      pronounBias = theyCount > (weCount * 3); // 3:1 ratio as arbitrary threshold
    }
    
    // Determine if there's significant bias
    const biasDetected = (hasAbsolutes && hasEmotionalHeat) || 
                         (hasAbsolutes && pronounBias) ||
                         (hasEmotionalHeat && pronounBias);
    
    if (biasDetected) {
      return {
        biased: true,
        hasAbsolutes,
        hasEmotionalHeat,
        pronounBias
      };
    }
    
    return {
      biased: false
    };
  };