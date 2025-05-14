// backend/middleware/firebaseAuth.js
const { auth } = require('../config/firebaseAdmin');
const User = require('../models/User');

const firebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user exists in MongoDB
    let user = await User.findOne({ 
      $or: [
        { email: decodedToken.email },
        { firebaseUid: decodedToken.uid }
      ]
    });
    
    // If not, create a new user in MongoDB
    if (!user) {
      user = new User({
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        firebaseUid: decodedToken.uid,
        // No password needed for Firebase auth users
      });
      
      await user.save();
    } else if (!user.firebaseUid) {
      // If user exists but doesn't have Firebase UID, update it
      user.firebaseUid = decodedToken.uid;
      await user.save();
    }
    
    // Attach the user to the request object (matching your auth middleware format)
    req.user = {
      id: user._id,
      _id: user._id, // Some middleware might expect _id instead of id
      email: user.email,
      firebaseUid: decodedToken.uid
    };
    
    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = firebaseAuth;