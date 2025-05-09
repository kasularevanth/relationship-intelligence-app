const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { downloadAndSaveImage } = require('../utils/imageUtils'); // Add this line
require('dotenv').config();


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Check if Google credentials are defined
const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientID || !googleClientSecret) {
  console.error('Missing Google OAuth credentials in environment variables!');
  console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
} else {
  // Only set up Google strategy if credentials are available
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: "/api/auth/google/callback",
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });
 
        // Download and save avatar if it exists
        let avatarPath = null;
        if (profile.photos && profile.photos[0]) {
          avatarPath = await downloadAndSaveImage(profile.photos[0].value, profile.id);
        }          
          if (user) {
            // If user exists but doesn't have Google ID, update it
            if (!user.googleId) {
              user.googleId = profile.id;
               // Update avatar if we have a new one
              if (avatarPath) {
                user.avatar = avatarPath;
              }
              await user.save();
            } else if (avatarPath && user.avatar !== avatarPath) {
              // Update avatar if it changed
              user.avatar = avatarPath;
                await user.save();
            }
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: avatarPath,
              // No password for Google auth users
            });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;