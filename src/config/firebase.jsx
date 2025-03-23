// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDr5b-4e9qu-sMnXTpnh39CQwlaQkZwAWg",
  authDomain: "todolist-stefen.firebaseapp.com",
  projectId: "todolist-stefen",
  storageBucket: "todolist-stefen.firebasestorage.app",
  messagingSenderId: "214708515315",
  appId: "1:214708515315:web:5308687b30aa1ecf2b6286",
  measurementId: "G-R2SB2KYL2Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);