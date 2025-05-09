// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Received Authorization header:', authHeader);
   
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Invalid Authorization header format. Expected "Bearer [token]"' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Check JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with the id in the token
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token, user not found' });
    }
    
    // Add user to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: `Token validation failed: ${err.message}` });
  }
};