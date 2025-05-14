// backend/server.js - UPDATED
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
// NEW Firebase routes
const firebaseApiRoutes = require('./routes/firebaseApiRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
// NEW Setup Firebase listeners


const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));



// After MongoDB connection is established
const { setupModelEventListeners, setupFirebaseListeners } = require('./services/syncService');
setupModelEventListeners(); // Set up model event listeners
setupFirebaseListeners();   // Set up Firebase listeners

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
// NEW Firebase routes
app.use('/api/firebase', firebaseApiRoutes);
app.use('/webhooks', webhookRoutes);

// Initialize Firebase listeners in production only to avoid duplicates in development


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});