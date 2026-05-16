import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

let isInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let serviceAccount;
    // Check if it's a valid JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT.startsWith('{')) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
      // Otherwise treat as a path
      serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, 'utf8'));
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      isInitialized = true;
      console.log('Firebase Admin Initialized');
    } else {
      console.warn('Firebase Service Account not valid. Firebase not initialized.');
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT missing. Firebase not initialized.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const sendNotification = async (token, title, body, data = {}) => {
  if (!isInitialized) return;
  try {
    const message = {
      notification: { title, body },
      data: data,
      token: token
    };
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const sendTopicNotification = async (topic, title, body, data = {}) => {
    if (!isInitialized) return;
    try {
      const message = {
        notification: { title, body },
        data: data,
        topic: topic
      };
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
    }
  };

export default admin;
