import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMvqJAWLrbd3QpAjB6IrZBdLuA4qmtFOE",
  authDomain: "vybezmadethis-94698.firebaseapp.com",
  projectId: "vybezmadethis-94698",
  storageBucket: "vybezmadethis-94698.firebasestorage.app",
  messagingSenderId: "725737186519",
  appId: "1:725737186519:web:263ea26dfb293c38bafc92",
  measurementId: "G-TV8F5FR43E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
