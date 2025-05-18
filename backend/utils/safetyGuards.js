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

exports.checkMessage = (message, relationship = null) => {
  // Convert to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();
  const contactName = relationship?.contactName || "them";
  
  // Check for immediate safety concerns (high severity)
  if (lowerMessage.includes('suicide') || 
      lowerMessage.includes('kill myself') || 
      lowerMessage.includes('end my life') ||
      (lowerMessage.includes('hurt') && lowerMessage.includes('myself'))) {
    return {
      flagged: true,
      type: 'critical_safety',
      response: `I can see you're in a lot of pain right now. Your life matters, and there are people who can help with these feelings. Please reach out to a crisis line right away (988 in the US, or text HOME to 741741). They're available 24/7 and can provide immediate support.

In terms of your relationship with ${contactName}, intense emotions can sometimes cloud our perspective. When you're feeling more stable, we can explore your relationship dynamics together.`
    };
  }
  
  // Check for other safety concerns (medium severity)
  const safetyMatches = SAFETY_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  if (safetyMatches.length > 0) {
    return {
      flagged: true,
      type: 'safety',
      response: `It sounds like this situation with ${contactName} is really difficult. Relationships should feel safe and supportive. When you mention ${safetyMatches[0]}, I want to make sure you're okay.

Sometimes taking a step back from an intense situation can give us clarity. What's one small thing you could do today to create some emotional safety for yourself?

If you ever feel unsafe, remember there are resources available like the National Domestic Violence Hotline (1-800-799-7233).`
    };
  }
  
  // Check for emotional distress (mild to moderate severity)
  const distressMatches = DISTRESS_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  if (distressMatches.length > 0) {
    // Check if this is about ending the relationship specifically
    if ((lowerMessage.includes('end it all') || lowerMessage.includes('giving up')) && 
        (lowerMessage.includes('relationship') || lowerMessage.includes('talking') || lowerMessage.includes('conversation'))) {
      
      return {
        flagged: true,
        type: 'relationship_distress',
        response: `I hear that you're feeling really hopeless about your connection with ${contactName} right now. That's a really tough place to be emotionally.

Sometimes relationships go through difficult periods where communication breaks down. Taking a break to reflect can be healthy, but making permanent decisions during intense emotional moments isn't always best.

What specific aspect of your relationship with ${contactName} has been most challenging lately? And is there anything that still feels worth preserving?`
      };
    }
    
    // More general emotional distress
    return {
      flagged: true,
      type: 'distress',
      response: `I hear that you're having a really difficult time with ${contactName} right now. When relationships get painful, those feelings can be overwhelming.

These intense emotions are telling you something important about your needs and boundaries. What do you think your feelings are trying to tell you?

If you're finding these feelings hard to manage alone, talking with a friend you trust or a counselor can really help gain perspective. Would it help to explore some specific strategies for dealing with your feelings about ${contactName}?`
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