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
  getAdditionalUserInfo,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, firestore } from '../firebase/firebaseConfig';
import { saveTransactionSilently } from '../firebase/tawidTransaction';
import { Alert } from 'react-native';
import { waving } from '../components/waving';
import { welcomeNotif } from '../notifications/welcomeNotif';
import notifyCompany from '../notifications/notifyCompany';

// Configure Google Sign-In (do this once, ideally at app startup)
GoogleSignin.configure({
  webClientId: '19479591711-g3mdv7p70i62efpc01qk2tsetg6fin45.apps.googleusercontent.com',
  iosClientId: '19479591711-pkk5t18ocmkvgktco6fgc40p7j2reup9.apps.googleusercontent.com',
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
 * Ensures the user has a complete profile (role, code, etc.)
 * Calls the Gen2 callable `tawidCreateUser` if the Firestore doc
 * is missing or has no `role` field. Works for both new and existing users.
 */
async function ensureProfileComplete(uid: string): Promise<void> {
  try {
    const userDocRef = doc(firestore, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (!snap.exists() || !snap.data()?.role) {
      const functions = getFunctions(undefined, 'asia-southeast2');
      const tawidCreateUser = httpsCallable(functions, 'tawidCreateUser');
      await tawidCreateUser();
    }
  } catch (err) {
    console.error('ensureProfileComplete failed:', err);
    // Hindi tayo mag-throw para hindi masira ang login flow
  }
}

/**
 * Google Login – Optimized for instant app entry
 *
 * Architecture note:
 * - role / code / uid / createdAt are handled by the Gen2 callable
 *   `tawidCreateUser` (client-triggered fallback + backfill).
 * - We no longer rely on an Auth onCreate trigger.
 * - RootStack (App.tsx) still waits for `role` via onSnapshot before
 *   switching to the Tab stack as a safety net.
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

    // Authoritative "is this the user's first ever sign-in" flag
    const isNewUser = getAdditionalUserInfo(userCredential)?.isNewUser ?? false;
    const displayName = userInfo.name ?? firebaseUser.displayName ?? 'User';

    // === Ensure profile is complete (role/code) ===
    // Important for existing accounts that don't have a full doc yet
    // and as a safety net for new users.
    await ensureProfileComplete(firebaseUser.uid);

    // === IMMEDIATELY REPORT SUCCESS ===
    // This triggers onAuthStateChanged → app switches to Tab
    // (App.tsx's RootStack additionally waits for `role` on the user doc)
    callback?.({ success: true, user: firebaseUser });

    // === BACKGROUND: Sync non-critical profile fields ===
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);

    setDoc(
      userDocRef,
      {
        email: userInfo.email ?? firebaseUser.email,
        name: displayName,
        photo: userInfo.photo ?? firebaseUser.photoURL ?? '',
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    )
      .then(() => {
        if (isNewUser) {
          // Fire-and-forget welcome transaction
          saveTransactionSilently({
            uid: firebaseUser.uid,
            type: 'welcome',
            status: 'unread',
            title: `Welcome to Tawid, ${displayName}!`,
            details: {
              message:
                'Thanks for downloading Tawid! View available trips and schedules, get notified of sea advisories before you travel, and check real-time port updates.',
            },
          });

          welcomeNotif(firebaseUser.uid, displayName);

          notifyCompany({
            title: 'New Signup',
            body: `${displayName} just signed up. Email: ${userInfo.email ?? firebaseUser.email}`,
          });
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
            await GoogleSignin.signOut();
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