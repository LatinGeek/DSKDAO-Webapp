'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
function initializeFirebase() {
  try {
    if (!getApps().length) {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

      // Connect to auth emulator in development
      if (process.env.NODE_ENV === 'development') {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }

      return { app, auth, db };
    }

    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

const { db, auth } = initializeFirebase();

export { db, auth }; 