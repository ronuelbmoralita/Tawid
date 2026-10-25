// loginAuth.ts
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
import { auth, firestore } from '../firebase/firebaseConfig';
import { saveTransactionSilently } from '../firebase/tawidTransaction';
import { Alert } from 'react-native';
import { waving } from '../components/waving';
import * as Notifications from 'expo-notifications';
import { loginCode } from './loginCode';
import { welcomeNotif } from '../notifications/welcomeNotif';
import notifyCompany from '../notifications/notifyCompany';

// Configure Google Sign-In (do this once, ideally at app startup)
GoogleSignin.configure({
  webClientId: '19479591711-g3mdv7p70i62efpc01qk2tsetg6fin45.apps.googleusercontent.com',
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

    waving.show();

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

    getDoc(userDocRef)
      .then(async (snap) => {
        const baseData = {
          email: userInfo.email ?? firebaseUser.email,
          name: userInfo.name ?? firebaseUser.displayName ?? 'User',
          photo: userInfo.photo ?? firebaseUser.photoURL ?? '',
          lastLoginAt: serverTimestamp(),
        };

        if (!snap.exists()) {
          // New user - generate code (checked against Firestore for uniqueness)
          const code = await loginCode();

          // Check current push notification permission status (hindi ito
          // humihingi ng permission — check lang; ang paghingi ay trabaho
          // ng saveToken() sa notifications/setupNotif.ts)
          const { status } = await Notifications.getPermissionsAsync();
          const notificationsEnabled = status === 'granted';

          const newUserData = {
            ...baseData,
            uid: firebaseUser.uid,
            code,
            role: 'Passenger',
            notificationsEnabled,
            createdAt: serverTimestamp(),
          };

          return setDoc(userDocRef, newUserData).then(() => {
            // Fire-and-forget welcome transaction — hindi dapat maka-block sa sign-in flow
            saveTransactionSilently({
              uid: firebaseUser.uid,
              type: 'welcome',
              status: 'unread',
              title: `Welcome to Tawid, ${newUserData.name}!`,
              details: {
                message:
                  'Thanks for downloading Tawid! View available trips and schedules, get notified of sea advisories before you travel, and check real-time port updates.',
              },
            });

            // NOTE: sa puntong ito, malamang WALA pang `expoToken` yung
            // bagong user doc kung saveToken() ay tinatawag lang sa
            // splash/home screen pagkatapos ng sign-in (hindi kasabay
            // nito). Kung ganun, itong welcomeNotif() call ay walang
            // maidadalang push dahil wala pang token sa oras na ito —
            // babalik lang siya nang tahimik (see welcomeNotif.tsx).
            // Kailangan malaman muna kung kailan ta-trigger si
            // saveToken() para malaman kung dapat ba dito i-trigger ito,
            // o sa ibang lugar (e.g. pagkatapos ma-save ang token).
            welcomeNotif(firebaseUser.uid, newUserData.name);

            // Fire-and-forget: notify Company accounts of the new signup
            notifyCompany({
              title: 'New Signup',
              body: `${newUserData.name} just signed up. Email: ${newUserData.email}`,
            });
          });
        } else {
          // Existing user – update relevant fields
          return setDoc(userDocRef, baseData, { merge: true });
        }
      })
      .catch((err) => {
        console.error('Background Firestore sync failed:', err);
      })
      .finally(() => {
        waving.hide();
      });
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

    waving.hide();
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
          waving.show();

          try {
            // Optional: Sign out from Google Signin (clears cached account)
            await GoogleSignin.signOut();

            // Critical: Sign out from Firebase Auth
            await signOut(auth);

            callback?.({ success: true });
          } catch (error) {
            console.error('Logout error:', error);
            const msg = error instanceof Error ? error.message : 'Logout failed';
            Alert.alert('Error', msg);
            callback?.({ success: false, error: msg });
          } finally {
            waving.hide();
          }
        },
      },
    ],
    { cancelable: false }
  );
};