import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "***REMOVED_SECRET***",
  authDomain: "virtual-lab-15183.firebaseapp.com",
  projectId: "virtual-lab-15183",
  storageBucket: "virtual-lab-15183.firebasestorage.app",
  messagingSenderId: "97152054638",
  appId: "1:97152054638:web:fd828bdbd371df024b3d7f",
  measurementId: "G-STQFHJ13KS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);

export default app;
