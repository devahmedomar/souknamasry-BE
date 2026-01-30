import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Firebase Service
 * Handles Firebase Admin SDK initialization and token verification
 * Used for phone authentication via Firebase Phone Auth
 */

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
export function initializeFirebase(): void {
  if (firebaseInitialized) {
    return;
  }

  try {
    // Check if credentials are provided via JSON string or individual fields
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountJson) {
      // Parse JSON credentials from environment variable
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (projectId) {
      // Use individual environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Development mode - initialize without credentials (limited functionality)
      console.warn('Firebase credentials not provided. Running in limited mode.');
      admin.initializeApp({
        projectId: 'demo-project',
      });
    }

    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Verify Firebase ID Token
 * In development mode, accepts test tokens in format: DEV_+201234567890
 * @param idToken - The Firebase ID token from client
 * @returns Decoded token with user info including phone number
 */
export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
  // Development mode: Accept test tokens (DEV_+201234567890)
  if (process.env.NODE_ENV === 'development' && idToken.startsWith('DEV_')) {
    const phone = idToken.replace('DEV_', '');
    console.log(`\n[DEV MODE] Test token accepted for phone: ${phone}\n`);
    return {
      phone_number: phone,
      uid: `dev_${phone}`,
      aud: 'dev',
      auth_time: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      iss: 'dev',
      sub: `dev_${phone}`,
      firebase: {
        identities: { phone: [phone] },
        sign_in_provider: 'phone',
      },
    } as DecodedIdToken;
  }

  if (!firebaseInitialized) {
    initializeFirebase();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    throw new Error(`Firebase token verification failed: ${errorMessage}`);
  }
}

/**
 * Get phone number from Firebase token
 * @param idToken - The Firebase ID token
 * @returns Phone number in E.164 format
 */
export async function getPhoneFromToken(idToken: string): Promise<string> {
  const decodedToken = await verifyFirebaseToken(idToken);

  if (!decodedToken.phone_number) {
    throw new Error('Phone number not found in Firebase token');
  }

  return decodedToken.phone_number;
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth() {
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  return admin.auth();
}

export { admin };
