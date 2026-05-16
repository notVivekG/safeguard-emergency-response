import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

let isInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let serviceAccount;
    const envValue = process.env.FIREBASE_SERVICE_ACCOUNT.trim();

    // 1. Check if it's a raw JSON string
    if (envValue.startsWith('{')) {
      serviceAccount = JSON.parse(envValue);
    } 
    // 2. Otherwise treat it as a file path
    else {
      // Resolve path relative to the server directory
      const filePath = path.resolve(process.cwd(), envValue);
      
      if (fs.existsSync(filePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } else {
        console.warn(`Firebase file not found at: ${filePath}`);
      }
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      isInitialized = true;
      console.log('Firebase Admin Initialized');
    } else {
      console.warn('Firebase Service Account could not be loaded. Firebase not initialized.');
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
