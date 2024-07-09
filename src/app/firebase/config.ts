import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GithubAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://practicecraftai-default-rtdb.firebaseio.com",
};

const firebase_app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

const auth = getAuth(firebase_app);
const provider = new GithubAuthProvider();
const db = getFirestore(firebase_app);
const realtimeDB = getDatabase(firebase_app);

export { firebase_app, db, auth, provider, realtimeDB };
