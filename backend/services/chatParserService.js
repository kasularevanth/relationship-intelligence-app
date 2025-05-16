/**
 * Chat Parser Service
 * Parses different chat export formats into a standardized message array
 */

// Improved date extraction function
// Improved date extraction function
const extractDate = (dateString, format) => {
  console.log(`Attempting to parse date: "${dateString}" with format: ${format}`);
  
  try {
    let formattedDate = "";
    
    if (format === 'whatsapp-standard') {
      // Example: "12/31/20, 11:59 PM" or "12/31/2020, 11:59 PM"
      const [datePart, timePart] = dateString.split(', ');
      
      if (!datePart || !timePart) {
        console.warn(`Invalid date format, missing parts: "${dateString}"`);
        return new Date(); // Fallback
      }
      
      const dateParts = datePart.split('/');
      if (dateParts.length !== 3) {
        console.warn(`Invalid date part format: "${datePart}"`);
        return new Date(); // Fallback
      }
      
      // Handle both YY and YYYY formats
      let year, month, day;
      [month, day, year] = dateParts;
      
      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        year = `20${year}`; // Assuming 21st century
      }
      
      // Parse the time part
      const timeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i;
      const timeMatch = timePart.match(timeRegex);
      
      if (!timeMatch) {
        console.warn(`Invalid time format: "${timePart}"`);
        return new Date(); // Fallback
      }
      
      let hours = timeMatch[1];
      const minutes = timeMatch[2];
      const seconds = timeMatch[3] || '00';
      const meridian = timeMatch[4];
      
      // Convert to 24-hour format if AM/PM specified
      if (meridian) {
        if (meridian.toLowerCase() === 'pm' && hours !== '12') {
          hours = parseInt(hours) + 12;
        } else if (meridian.toLowerCase() === 'am' && hours === '12') {
          hours = '00';
        }
      }
      
      // Use Date constructor with parameters to avoid string parsing issues
      const dateObj = new Date(
        parseInt(year),
        parseInt(month) - 1, // Months are 0-indexed in JS
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );
      
      // Validate date object
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date created from parts: Y=${year}, M=${month}, D=${day}, h=${hours}, m=${minutes}, s=${seconds}`);
        return new Date(); // Fallback
      }
      
      return dateObj;
      
    } else if (format === 'whatsapp-international') {
      // Example: "31/12/20, 11:59" or "31/12/2020, 11:59 pm"
      const [datePart, timePart] = dateString.split(', ');
      
      if (!datePart || !timePart) {
        console.warn(`Invalid international date format, missing parts: "${dateString}"`);
        return new Date(); // Fallback
      }
      
      const dateParts = datePart.split(/[\/\-\.]/);
      if (dateParts.length !== 3) {
        console.warn(`Invalid international date part format: "${datePart}"`);
        return new Date(); // Fallback
      }
      
      // Handle both YY and YYYY formats
      let day, month, year;
      [day, month, year] = dateParts;
      
      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        year = `20${year}`; // Assuming 21st century
      }
      
      // Parse the time part
      const timeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i;
      const timeMatch = timePart.match(timeRegex);
      
      if (!timeMatch) {
        console.warn(`Invalid international time format: "${timePart}"`);
        return new Date(); // Fallback
      }
      
      let hours = timeMatch[1];
      const minutes = timeMatch[2];
      const seconds = timeMatch[3] || '00';
      const meridian = timeMatch[4];
      
      // Convert to 24-hour format if AM/PM specified
      if (meridian) {
        if (meridian.toLowerCase() === 'pm' && hours !== '12') {
          hours = parseInt(hours) + 12;
        } else if (meridian.toLowerCase() === 'am' && hours === '12') {
          hours = '00';
        }
      }
      
      // Use Date constructor with parameters to avoid string parsing issues
      const dateObj = new Date(
        parseInt(year),
        parseInt(month) - 1, // Months are 0-indexed in JS
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );
      
      // Validate date object
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid international date created from parts: Y=${year}, M=${month}, D=${day}, h=${hours}, m=${minutes}, s=${seconds}`);
        return new Date(); // Fallback
      }
      
      return dateObj;
      
    } else if (format === 'imessage') {
      // Example: "2022-05-15 14:23:45"
      try {
        // Let's use a more robust approach to parse this format
        const [datePart, timePart] = dateString.split(' ');
        
        if (!datePart || !timePart) {
          console.warn(`Invalid iMessage date format, missing parts: "${dateString}"`);
          return new Date(); // Fallback
        }
        
        const [year, month, day] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        
        const dateObj = new Date(
          parseInt(year),
          parseInt(month) - 1, // Months are 0-indexed in JS
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds || 0)
        );
        
        // Validate date object
        if (isNaN(dateObj.getTime())) {
          console.warn(`Invalid iMessage date created from parts: Y=${year}, M=${month}, D=${day}, h=${hours}, m=${minutes}, s=${seconds || 0}`);
          return new Date(); // Fallback
        }
        
        return dateObj;
      } catch (err) {
        console.warn(`Error parsing iMessage date "${dateString}":`, err);
        return new Date(); // Fallback
      }
    }
  } catch (err) {
    console.warn(`Error parsing date "${dateString}":`, err);
    return new Date(); // Return current date as fallback
  }
  
  // Default: return current date
  console.warn(`Unsupported format "${format}" for date: ${dateString}`);
  return new Date();
};
/**
 * Parse WhatsApp chat export
 * @param {string} fileContent - Raw text content from the export file
 * @param {string} contactPhone - The contact's phone number to identify their messages (optional)
 * @returns {Array} Array of parsed message objects
 */
const parseWhatsApp = (fileContent, contactPhone = '') => {
  console.log('Parsing WhatsApp chat with content length:', fileContent.length);
  
  const lines = fileContent.split('\n');
  console.log("lines",lines);
  const messages = [];
  let contactName = null;
  let currentMessage = null;
  let username = null;
  
  console.log(`Found ${lines.length} lines in the chat file`);
  
  // Updated regex pattern to match different WhatsApp date formats including "am/pm" without spaces
  // This pattern is more lenient with spacing and handles international formats better
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*([^:]+):\s+(.+)$/i;
  
  let matchCount = 0;
  let nonMatchCount = 0;
  let sampleNonMatches = [];

  for (const line of lines) {
    if (!line.trim()) continue; // Skip empty lines
    
    // Try to match the line against our regex pattern
    const match = line.match(messageRegex);
    
    if (match) {
      
      // If we had a previous message being built, finalize it
      if (currentMessage) {
        console.log("current message",currentMessage);
        messages.push(currentMessage);
        currentMessage = null;
      }
      
      matchCount++;
      const [, date, time, sender, text] = match;

      // Skip system messages like "Messages and calls are end-to-end encrypted"
      if (text.includes("Messages and calls are end-to-end encrypted") || 
          text.includes("<Media omitted>") ||
          text.includes("You blocked this contact") ||
          text.includes("You unblocked this contact")) {
        continue;
      }
      
      // Extract contact name and username if not already determined
      if (sender.trim().toLowerCase() !== 'you') {
        if (!contactName) {
          contactName = sender.trim();
        }
      } else if (!username) {
        username = "You";
      }
      
      // Determine if the message is from the contact
      const isFromContact = 
        sender.trim().toLowerCase() !== 'you' && 
        (
          !contactPhone || 
          sender.includes(contactPhone) || 
          (contactName && sender.includes(contactName))
        );
      
      // Determine date format based on the pattern of date string
      const format = date.includes('/') ? 
        (date.split('/')[0].length === 2 ? 'whatsapp-international' : 'whatsapp-standard') : 
        'whatsapp-international';

      // Parse timestamp using our helper
      const timestamp = extractDate(`${date}, ${time}`, 'whatsapp-standard');
      
      // Validate the timestamp
      if (isNaN(timestamp.getTime())) {
        console.warn(`Skipping message with invalid timestamp: "${date}, ${time}"`);
        continue; // Skip this message
      }
      
      currentMessage = {
        text,
        sender: sender.trim(),
        isFromContact,
        timestamp
      };
    } else {
      nonMatchCount++;
      
      // Store a few non-matching lines for debugging
      if (sampleNonMatches.length < 5) {
        sampleNonMatches.push(line);
      }
      
      // Check if this is a continuation of the previous message
      if (currentMessage) {
        console.log("messages ....",currentMessage);
        // Append this line to the current message being built
        currentMessage.text += '\n' + line;
      } else if (messages.length > 0) {
        // Append to the last message if no current message is being built
        messages[messages.length - 1].text += '\n' + line;
      }
    }
  }
  
  // Add the last message if it exists
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  console.log(`Matched ${matchCount} messages, couldn't match ${nonMatchCount} lines`);
  console.log('Sample non-matching lines:', sampleNonMatches);
  console.log(`Total parsed messages: ${messages.length}`);
  
  if (contactName) {
    console.log(`Detected contact name: ${contactName}`);
  }
  
  return messages;
};

/**
 * Alternative WhatsApp parser specifically for international formats
 * @param {string} fileContent - Raw text content from the export file
 * @param {string} contactPhone - The contact's phone number to identify their messages (optional)
 * @returns {Array} Array of parsed message objects
 */
const parseWhatsAppInternational = (fileContent, contactPhone = '') => {
  console.log('Parsing international WhatsApp chat format');
  
  const lines = fileContent.split('\n');
  const messages = [];
  let contactName = null;
  let username = "You";
  let currentMessage = null;
  
  // Specifically targeting the format seen in the provided sample
  // DD/MM/YY, H:MM pm - Sender: Message
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2}),\s+(\d{1,2}:\d{1,2}\s*(?:am|pm)?)\s*-\s*([^:]+):\s+(.+)$/i;
  
  for (const line of lines) {
    if (!line.trim()) continue; // Skip empty lines
    
    const match = line.match(messageRegex);
    
    if (match) {
      // Finalize previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
        currentMessage = null;
      }
      
      const [, date, time, sender, text] = match;
      
      // Skip system messages
      if (text.includes("Messages and calls are end-to-end encrypted") || 
          text.includes("<Media omitted>") ||
          text.includes("You blocked this contact") ||
          text.includes("You unblocked this contact")) {
        continue;
      }
      
      // Extract contact name if not already determined
      if (!contactName && sender.trim() !== username && !sender.includes("You")) {
        contactName = sender.trim();
      }
      
      // Determine if the message is from the contact
      const isFromContact = sender.trim() !== username && !sender.includes("You");
      
      // Parse timestamp
      const timestamp = extractDate(`${date}, ${time}`, 'whatsapp-international');
      
      currentMessage = {
        text,
        sender: sender.trim(),
        isFromContact,
        timestamp
      };
    } else if (currentMessage) {
      // This is a continuation of the previous message
      currentMessage.text += '\n' + line;
    }
  }
  
  // Add the last message if it exists
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  console.log(`Parsed ${messages.length} messages using international format`);
  
  return messages;
};

/**
 * Parse iMessage chat export (assuming CSV or text format)
 * @param {string} content - Raw text content from the export file
 * @param {string} contactPhone - The contact's phone number/identifier to identify their messages
 * @returns {Array} Array of parsed message objects
 */
const parseIMessage = (content, contactPhone = '') => {
  console.log('Parsing iMessage chat with content length:', content.length);
  
  const lines = content.split('\n');
  const messages = [];
  
  // Skip header if present
  const startIndex = lines[0].includes('date,sender,message') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Assuming CSV format: date,sender,message
    const parts = line.split(',');
    if (parts.length < 3) continue;
    
    const dateStr = parts[0];
    const sender = parts[1];
    const text = parts.slice(2).join(',').trim();
    
    if (!dateStr || !sender || !text) continue;
    
    const timestamp = extractDate(dateStr, 'imessage');
    const isFromContact = sender !== 'Me' && sender !== 'You';
    
    messages.push({
      timestamp,
      text,
      isFromContact,
      sender
    });
  }
  
  console.log(`Parsed ${messages.length} iMessage messages`);
  return messages;
};


/**
 * Parse WhatsApp chat from iOS exports, which use a different format
 * @param {string} fileContent - Raw text content from the export file
 * @param {string} contactPhone - The contact's phone number to identify their messages (optional)
 * @returns {Array} Array of parsed message objects
 */
const parseWhatsAppIOS = (fileContent, contactPhone = '') => {
  console.log('Parsing iOS WhatsApp chat format');
  
  const lines = fileContent.split('\n');
  const messages = [];
  let contactName = null;
  let currentMessage = null;
  
  // Updated regex to be more lenient and handle the specific format better
  // The key change is making the message part optional with (.*) instead of (.+)
  const messageRegex = /^\[(\d{2}\/\d{2}\/\d{2}),\s+(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM|am|pm))\]\s+([^:]+):\s*(.*)/;
  
  let matchCount = 0;
  let nonMatchCount = 0;
  let sampleNonMatches = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const match = line.match(messageRegex);
    
    if (match) {
      // Finalize previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
        currentMessage = null;
      }
      
      matchCount++;
      const [, date, time, sender, text] = match;
      
      // Cleaned text - remove trailing \r and other special characters
      const cleanedText = text.replace(/\\r$/, '').replace(/\r$/, '');
      
      // Skip system messages and media markers
      if (cleanedText.includes("Messages and calls are end-to-end encrypted") || 
          cleanedText.includes("‎document omitted") ||
          cleanedText.includes("‎image omitted") ||
          cleanedText.includes("‎Contact card omitted") ||
          cleanedText.includes("You deleted this message")) {
        continue;
      }
      
      // Extract contact name if not already determined
      if (!contactName && sender.trim() !== "You" && !sender.includes("You")) {
        contactName = sender.trim();
      }
      
      // Determine if the message is from the contact
      const isFromContact = sender.trim() !== "You" && !sender.includes("You");
      
      // Parse timestamp - iOS format uses DD/MM/YY
      const [day, month, year] = date.split('/');
      const fullYear = parseInt(`20${year}`);
      
      // Parse time with AM/PM
      let [timePart, period] = time.trim().split(/\s+/);
      let [hours, minutes, seconds] = timePart.split(':');
      
      hours = parseInt(hours);
      if (period && period.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (period && period.toUpperCase() === 'AM' && hours === 12) hours = 0;
      
      const timestamp = new Date(
        fullYear,
        parseInt(month) - 1,
        parseInt(day),
        hours,
        parseInt(minutes),
        parseInt(seconds || 0)
      );
      
      currentMessage = {
        text: cleanedText,
        sender: sender.trim(),
        isFromContact,
        timestamp
      };
    } else {
      nonMatchCount++;
      
      // Store some non-matching lines for debugging
      if (sampleNonMatches.length < 5) {
        sampleNonMatches.push(line);
      }
      
      if (currentMessage) {
        // This is a continuation of the previous message
        currentMessage.text += '\n' + line.replace(/\\r$/, '').replace(/\r$/, '');
      }
    }
  }
  
  // Add the last message if it exists
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  console.log(`Parsed ${messages.length} messages using iOS format (matched ${matchCount}, continuation lines ${nonMatchCount})`);
  console.log('Sample non-matching lines:', sampleNonMatches);
  
  return messages;
};

/**
 * Analyze sentiment of a message
 * Basic implementation - can be replaced with more sophisticated NLP
 * @param {string} text - The message text to analyze
 * @returns {number} Sentiment score between -1 (negative) and 1 (positive)
 */
const analyzeSentiment = (text) => {
  const positiveWords = ['happy', 'love', 'great', 'thanks', 'good', 'awesome', 'excellent'];
  const negativeWords = ['sad', 'angry', 'sorry', 'bad', 'hate', 'terrible', 'awful'];
  
  let score = 0;
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.2;
    if (negativeWords.includes(word)) score -= 0.2;
  });
  
  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, score));
};

/**
 * Auto-detect the chat format type and parse using the appropriate method
 * @param {string} content - Raw text content from the export file
 * @param {string} contactPhone - The contact's phone number (optional)
 * @returns {Object} Object containing format type and parsed messages
 */
const parseChat = (content, contactPhone = '') => {
  const format = detectChatFormat(content);
  let messages = [];
  
  console.log(`Detected chat format: ${format}`);
  
  if (format === 'whatsapp') {
    // Try all parsers and use the one that produces more messages
    const standardMessages = parseWhatsApp(content, contactPhone);
    const internationalMessages = parseWhatsAppInternational(content, contactPhone);
    const sampleMessages = parseWhatsAppSample(content, contactPhone);
    const iOSMessages = parseWhatsAppIOS(content, contactPhone); // Add this line
    
    // Use the parser that found the most messages
    const results = [
      { method: 'standard', messages: standardMessages },
      { method: 'international', messages: internationalMessages },
      { method: 'sample', messages: sampleMessages },
      { method: 'iOS', messages: iOSMessages } // Add this line
    ];
    
    const bestResult = results.reduce((prev, current) => 
      (prev.messages.length > current.messages.length) ? prev : current
    );
    
    console.log(`Selected parsing method: ${bestResult.method} with ${bestResult.messages.length} messages`);
    messages = bestResult.messages;
  } else if (format === 'imessage') {
    messages = parseIMessage(content, contactPhone);
  }
  
  return {
    format,
    messages
  };
};

/**
 * Parse WhatsApp chat specific to the format seen in the sample data
 * @param {string} fileContent - Raw text content from the export file
 * @param {string} contactPhone - The contact's phone number to identify their messages (optional)
 * @returns {Array} Array of parsed message objects
 */
const parseWhatsAppSample = (fileContent, contactPhone = '') => {
  console.log('Trying specific WhatsApp format for sample data');
  
  const lines = fileContent.split('\n');
  const messages = [];
  let contactName = null;
  let currentMessage = null;
  
  // Specifically for the format: "DD/MM/YY, H:MM pm - SenderName: Message"
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2}),\s+(\d{1,2}:\d{1,2}\s+(?:am|pm))\s+-\s+([^:]+):\s+(.+)$/i;
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const match = line.match(messageRegex);
    
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
        currentMessage = null;
      }
      
      const [, date, time, sender, text] = match;
      
      // Skip system messages and media
      if (text.includes("Messages and calls are end-to-end encrypted") || 
          text.includes("<Media omitted>") ||
          text.includes("You blocked this contact") ||
          text.includes("You unblocked this contact")) {
        continue;
      }
      
      // Check for contact name
      if (!contactName && sender.trim() !== "You" && !sender.toLowerCase().includes("you")) {
        contactName = sender.trim();
      }
      
      // Sender logic
      const isFromContact = sender.trim() !== "You" && !sender.toLowerCase().includes("you");
      
      const timestamp = extractDate(`${date}, ${time}`, 'whatsapp-international');
      
      currentMessage = {
        text,
        sender: sender.trim(),
        isFromContact,
        timestamp
      };
    } else if (currentMessage) {
      currentMessage.text += '\n' + line;
    }
  }
  
  // Add the last message
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  console.log(`Parsed ${messages.length} messages using sample-specific format`);
  
  return messages;
};

/**
 * Auto-detect the chat format type based on content
 * @param {string} content - Raw text content from the export file
 * @returns {string} The detected format: 'whatsapp', 'imessage', or 'unknown'
 */
const detectChatFormat = (content) => {
  // First 1000 characters for format detection
  const sample = content.slice(0, 1000);
  
  // Check for iOS WhatsApp format with square brackets
  if (sample.match(/\[\d{1,2}\/\d{1,2}\/\d{2},\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M\]/i)) {
    return 'whatsapp';
  }
  
  // Check for standard WhatsApp format patterns
  if (sample.match(/\d{1,2}\/\d{1,2}\/\d{2,4},\s+\d{1,2}:\d{2}\s+-/) ||
      sample.match(/\d{1,2}\/\d{1,2}\/\d{2,4},\s+\d{1,2}:\d{2}\s+[ap]m\s+-/i)) {
    return 'whatsapp';
  }
  
  // Check for iMessage format (assuming CSV-like)
  if (sample.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},/)) {
    return 'imessage';
  }
  
  return 'unknown';
};

module.exports = {
  parseWhatsApp,
  parseWhatsAppInternational,
  parseWhatsAppSample,
  parseWhatsAppIOS, // Add this line
  parseIMessage,
  analyzeSentiment,
  detectChatFormat,
  parseChat
};