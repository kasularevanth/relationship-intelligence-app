// backend/services/sentimentAnalysis.js

const { OpenAI } = require('openai');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeSentiment = async (text) => {
  try {
    // For MVP, we'll use a simple prompt to get sentiment score
    const prompt = `
      Analyze the sentiment of the following text and return a single number between -1 and 1.
      -1 represents extremely negative sentiment
      0 represents neutral sentiment
      1 represents extremely positive sentiment
      
      Text: "${text}"
      
      Sentiment score (just the number):
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a sentiment analysis tool. Return only a number between -1 and 1." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 10
    });
    
    const scoreText = response.choices[0].message.content.trim();
    const score = parseFloat(scoreText);
    
    // Handle parsing failures
    if (isNaN(score)) {
      console.warn('Failed to parse sentiment score:', scoreText);
      return 0; // Default to neutral
    }
    
    // Ensure score is within -1 to 1 range
    return Math.max(-1, Math.min(1, score));
  } catch (err) {
    console.error('Error analyzing sentiment:', err);
    return 0; // Default to neutral on error
  }
};

exports.analyzeDepth = async (text) => {
  try {
    // For MVP, we'll use a simple prompt to get depth score
    const prompt = `
      Analyze the emotional depth and vulnerability of the following text and return a single number between 1 and 5.
      1 represents surface-level, casual conversation
      3 represents moderate emotional disclosure
      5 represents deep emotional vulnerability and introspection
      
      Text: "${text}"
      
      Depth score (just the number):
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an emotional depth analysis tool. Return only a number between 1 and 5." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 10
    });
    
    const scoreText = response.choices[0].message.content.trim();
    const score = parseInt(scoreText);
    
    // Handle parsing failures
    if (isNaN(score)) {
      console.warn('Failed to parse depth score:', scoreText);
      return 1; // Default to surface level
    }
    
    // Ensure score is within 1 to 5 range
    return Math.max(1, Math.min(5, score));
  } catch (err) {
    console.error('Error analyzing depth:', err);
    return 1; // Default to surface level on error
  }
};

exports.analyzeTopics = async (text) => {
  try {
    // For MVP, we'll use a simple prompt to identify topics
    const prompt = `
      Analyze the following text and identify which topics are being discussed.
      Return a JSON object with the following format:
      {
        "conflict": 0-1 (how much conflict is discussed),
        "support": 0-1 (how much emotional support is discussed),
        "humor": 0-1 (how much humor/joy is discussed),
        "values": 0-1 (how much personal values are discussed),
        "other": 0-1 (how much other topics are discussed)
      }
      
      Text: "${text}"
      
      Topic distribution (JSON):
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a topic analysis tool. Return only valid JSON with the requested format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 150
    });
    
    const jsonText = response.choices[0].message.content.trim();
    
    // Extract JSON from response (it might include extra text)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
    
    try {
      const topics = JSON.parse(jsonStr);
      
      // Ensure all required fields exist
      const defaultTopics = {
        conflict: 0,
        support: 0,
        humor: 0,
        values: 0,
        other: 0
      };
      
      return { ...defaultTopics, ...topics };
    } catch (jsonErr) {
      console.error('Error parsing topic JSON:', jsonErr);
      return {
        conflict: 0,
        support: 0,
        humor: 0,
        values: 0,
        other: 1  // Default to 'other' if parsing fails
      };
    }
  } catch (err) {
    console.error('Error analyzing topics:', err);
    return {
      conflict: 0,
      support: 0,
      humor: 0,
      values: 0,
      other: 1  // Default to 'other' on error
    };
  }
};