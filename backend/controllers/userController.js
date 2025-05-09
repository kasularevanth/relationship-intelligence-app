// backend/controllers/userController.js
const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    user = new User({
      name,
      email,
      password // Will be hashed in the model's pre-save hook
    });
    
    await user.save();
    
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: err.message });
  }
};