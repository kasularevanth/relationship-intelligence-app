// backend/config/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');
const config = require('./index');

// Path to service account file - you'll need to download this from Firebase console
let serviceAccount;
if (process.env.NODE_ENV === 'production') {
  // In production, use environment variables
  serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
  };
} else {
  // In development, use the local file if it exists
  try {
    serviceAccount = require('./firebase-service-account.json');
  } catch (error) {
    console.error("Error loading Firebase service account file:", error);
    console.error("Make sure to create this file or provide environment variables");
    process.exit(1);
  }
}

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || config.firebaseConfig?.databaseURL || "https://your-project-id.firebaseio.com"
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error; // Re-throw to ensure server doesn't start with invalid Firebase config
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };