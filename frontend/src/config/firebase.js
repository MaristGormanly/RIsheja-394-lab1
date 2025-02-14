import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfe_wRYItsVh0gPvAV9ZFMoQ5g610IuWA",
  authDomain: "taskflow-3477b.firebaseapp.com",
  projectId: "taskflow-3477b",
  storageBucket: "taskflow-3477b.firebasestorage.app",
  messagingSenderId: "181820134227",
  appId: "1:181820134227:web:99ddbc40526c95bad587a6",
  measurementId: "G-PQM5MXNYPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); 