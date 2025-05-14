// backend/config/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');
const config = require('./index');

// Path to service account file - you'll need to download this from Firebase console
const serviceAccountPath = path.join(__dirname, './firebase-service-account.json');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
      databaseURL: config.firebaseConfig.databaseURL || "https://your-project-id.firebaseio.com"
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };