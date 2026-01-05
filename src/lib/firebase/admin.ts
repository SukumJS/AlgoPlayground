import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// ===========================================
// Firebase Admin Configuration (Server-side)
// ===========================================

function getFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check for service account credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    // Parse the service account JSON from environment variable
    const serviceAccountKey = JSON.parse(serviceAccount);
    
    return initializeApp({
      credential: cert(serviceAccountKey),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  // Fallback: Initialize with project ID only (for local development with emulators)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminApp = getFirebaseAdmin();

// Admin Auth instance
export const adminAuth = getAuth(adminApp);

// Admin Firestore instance
export const adminDb = getFirestore(adminApp);

export default adminApp;
