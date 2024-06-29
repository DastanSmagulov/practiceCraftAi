import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwXJ1LQxMDkR3zfzcnL2EVwp6WivOplLg",
  authDomain: "practicecraftai.firebaseapp.com",
  projectId: "practicecraftai",
  storageBucket: "practicecraftai.appspot.com",
  messagingSenderId: "664038323496",
  appId: "1:664038323496:web:b7a45cb7a444e5d36f8c1d",
};

let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(firebase_app);

// export default firebase_app;

export default db;
