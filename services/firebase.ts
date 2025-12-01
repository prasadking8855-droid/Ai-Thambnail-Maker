import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDHYCQSphCcJFXPYuH9qF_PQJdUrfTygqA",
  authDomain: "ai-thambnail-maker.firebaseapp.com",
  projectId: "ai-thambnail-maker",
  storageBucket: "ai-thambnail-maker.firebasestorage.app",
  messagingSenderId: "1074088704296",
  appId: "1:1074088704296:web:7dfca702eca365c84ab81d",
  measurementId: "G-C1VY1SCN52"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);