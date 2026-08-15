import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBRHqsnrkqtsnDKYcgEokQ-m48jFW1U_xY",
    authDomain: "tawid-6f253.firebaseapp.com",
    projectId: "tawid-6f253",
    storageBucket: "tawid-6f253.firebasestorage.app",
    messagingSenderId: "19479591711",
    appId: "1:19479591711:web:6d3de8f4da2f99d1990e2a",
    measurementId: "G-09Z0B8CG0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Functions — region must match the `onCall({ region: ... })`
// declared in functions/src/tawidTransactions.ts
const functions = getFunctions(app, 'asia-southeast2');

export { auth, firestore, functions };