// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXXBma1keoMhiHu97djJyydJHsKiJpinY",
  authDomain: "tinder-2-b3b5a.firebaseapp.com",
  projectId: "tinder-2-b3b5a",
  storageBucket: "tinder-2-b3b5a.appspot.com",
  messagingSenderId: "944471753152",
  appId: "1:944471753152:web:e822bed35580dcde6b8825",
  measurementId: "G-NMJ77W8CYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db }