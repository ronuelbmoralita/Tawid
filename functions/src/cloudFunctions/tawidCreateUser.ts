// functions/src/tawidCreateUser.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

async function generateUniqueCode(): Promise<string> {
  const usersRef = db.collection("users");
  let code: string;
  let isUnique = false;

  do {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `TAWID-${year}${random}`;

    const snap = await usersRef.where("code", "==", code).limit(1).get();
    isUnique = snap.empty;
  } while (!isUnique);

  return code;
}

export const tawidCreateUser = onCall(
  { region: "asia-southeast2" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Kailangan naka-login.");
    }

    const uid = request.auth.uid;
    const userDocRef = db.collection("users").doc(uid);
    const existing = await userDocRef.get();

    // Idempotent — kung meron nang role, wala nang gagawin
    if (existing.exists && existing.data()?.role) {
      return { alreadyExists: true };
    }

    try {
      const code = await generateUniqueCode();
      const authUser = await admin.auth().getUser(uid);

      await userDocRef.set(
        {
          uid,
          email: authUser.email ?? null,
          name: authUser.displayName ?? "User",
          photo: authUser.photoURL ?? "",
          code,
          role: "Passenger",
          notificationsEnabled: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info(`Initialized/backfilled profile for ${uid}`, {
        structuredData: true,
      });
      return { alreadyExists: false };
    } catch (err) {
      logger.error(`Failed to initialize profile for ${uid}`, err);
      throw new HttpsError("internal", "Hindi na-initialize ang profile.");
    }
  }
);
