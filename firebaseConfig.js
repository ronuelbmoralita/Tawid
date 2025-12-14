import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5eqgc_H88PxC6H2Bngy6_3dyY9i9crGw",
    authDomain: "lookal-f8f2f.firebaseapp.com",
    projectId: "lookal-f8f2f",
    storageBucket: "lookal-f8f2f.firebasestorage.app",
    messagingSenderId: "982156955950",
    appId: "1:982156955950:web:86f57758154d259fc56abf",
    measurementId: "G-3R6XBS3QYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };
