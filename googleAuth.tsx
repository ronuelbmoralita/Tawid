// googleAuth.ts
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, firestore } from './firebaseConfig';
import { Alert } from 'react-native';

// Configure Google Sign-In (do this once, ideally at app startup)
GoogleSignin.configure({
  webClientId: '982156955950-ffj1sp8239ek30cfon6l5m5anns5kkqi.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

interface LoginResult {
  success: boolean;
  start?: boolean;
  user?: User;
  error?: string;
}

interface LogoutResult {
  success: boolean;
  start?: boolean;
  error?: string;
}

type LoginCallback = (result: LoginResult) => void;
type LogoutCallback = (result: LogoutResult) => void;

/**
 * Google Login – Optimized for instant app entry
 */
export const googleLogin = async (callback?: LoginCallback): Promise<void> => {
  // Notify loading start
  callback?.({ success: false, start: true });

  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      // User cancelled
      callback?.({ success: false, error: 'Sign in cancelled' });
      return;
    }

    const { idToken } = response.data;
    const userInfo = response.data.user;

    if (!idToken) {
      callback?.({ success: false, error: 'No ID token received' });
      return;
    }

    // Sign in to Firebase
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);
    const firebaseUser = userCredential.user;

    // === IMMEDIATELY REPORT SUCCESS ===
    // This triggers onAuthStateChanged → app switches to Tab instantly
    callback?.({ success: true, user: firebaseUser });

    // === BACKGROUND: Sync user data to Firestore ===
    // Fire-and-forget – does not block UI
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);

    function generateUserCode(): string {
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `TAWID-${random}`;
    }

    getDoc(userDocRef)
      .then(async (snap) => {
        const baseData = {
          email: userInfo.email ?? firebaseUser.email,
          name: userInfo.name ?? firebaseUser.displayName ?? 'User',
          photo: userInfo.photo ?? firebaseUser.photoURL ?? '',
          lastLoginAt: serverTimestamp(),
        };

        if (!snap.exists()) {
          // New user - generate code (optimistic, no check)
          const code = generateUserCode();

          return setDoc(userDocRef, {
            ...baseData,
            uid: firebaseUser.uid,
            code,
            role: 'Customer',
            createdAt: serverTimestamp(),
          });
        } else {
          // Existing user – update relevant fields
          return setDoc(userDocRef, baseData, { merge: true });
        }
      })
  } catch (error) {
    console.error('Google login error:', error);

    let errorMessage = 'Failed to sign in. Please try again.';

    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          errorMessage = 'Sign in is already in progress';
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage = 'Google Play Services not available';
          break;
      }
    }

    Alert.alert('Login Error', errorMessage);
    callback?.({ success: false, error: errorMessage });
  }
};

/**
 * Google + Firebase Logout
 */
export const googleLogout = async (callback?: LogoutCallback): Promise<void> => {
  Alert.alert(
    'Confirm Logout',
    'Are you sure you want to log out?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => callback?.({ success: false, error: 'Cancelled' }),
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          callback?.({ success: false, start: true });

          try {
            // Optional: Sign out from Google Signin (clears cached account)
            await GoogleSignin.signOut();

            // Critical: Sign out from Firebase Auth
            await signOut(auth);

            callback?.({ success: true });
          } catch (error) {
            console.error('Logout error:', error);
            const msg = error instanceof Error ? error.message : 'Logout failed';
            Alert.alert('Error', 'Failed to log out. Please try again.');
            callback?.({ success: false, error: msg });
          }
        },
      },
    ],
    { cancelable: false }
  );
};