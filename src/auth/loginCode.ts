// ============================================================
// loginCode.ts
// ============================================================
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';

/**
 * Generates a year-prefixed random user code (e.g. TAWID-26K9F2) and
 * verifies against Firestore that it isn't already taken before
 * returning it. Loops until a unique code is found (collision chance
 * is low, but not zero).
 */
export async function loginCode(): Promise<string> {
  const usersRef = collection(firestore, 'users');

  let code: string;
  let isUnique = false;

  do {
    const year = new Date().getFullYear().toString().slice(-2); // "26"
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `TAWID-${year}${random}`; // TAWID-26K9F2

    const q = query(usersRef, where('code', '==', code));
    const snap = await getDocs(q);
    isUnique = snap.empty;
  } while (!isUnique);

  return code;
}