const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Make sure this directory exists or create it
const UPLOAD_DIR = path.join(__dirname, '../public/uploads/avatars');

// Create directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const downloadAndSaveImage = async (url, userId) => {
  try {
    // Get file extension from URL or default to .jpg
    const fileExtension = url.split('?')[0].split('.').pop() || 'jpg';
    const fileName = `${userId}_avatar.${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Download image
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    // Save to file
    fs.writeFileSync(filePath, response.data);
    
    // Return the relative path to be stored in DB (this will be appended to your API base URL)
    return `/uploads/avatars/${fileName}`;
  } catch (error) {
    console.error('Error downloading avatar image:', error);
    return null;
  }
};

module.exports = {
  downloadAndSaveImage
};