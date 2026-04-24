import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

// Only initialize if required env vars are present and valid
const hasValidConfig =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (hasValidConfig) {
  try {
    // Initialize app only once (works both server and client)
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      app = (getApps() as any)[0];
    }
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (e) {
    // Firebase initialization failed; keep exports as undefined.
    // Consumers must check if db/auth/storage are defined before using.
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('Firebase initialization failed. Using demo mode.', e);
    }
    db = undefined;
    auth = undefined;
    storage = undefined;
  }
} else {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.info('Firebase env vars not configured. Running in demo mode.');
  }
}

export { db, auth, storage };
export default app;
