// ============================================================
// services/welcomeNotif.tsx
// ============================================================
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Notify a newly signed-up user with a welcome push notification
 */
export async function welcomeNotif(uid: string, name: string) {
  try {
    const userDoc = await getDoc(doc(getFirestore(), 'users', uid));
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    if (!data?.expoToken || data.notificationsEnabled === false) return;

    const sendPush = httpsCallable(
      getFunctions(undefined, 'asia-southeast2'),
      'tawidNotification'
    );

    await sendPush({
      tokens: [data.expoToken],
      title: `Welcome to Tawid, ${name}!`,
      body: 'Thanks for downloading Tawid! View available trips and schedules, get notified of sea advisories before you travel, and check real-time port updates.',
    });

    console.log('✅ Welcome notification sent');
  } catch (error) {
    console.error('❌ welcomeNotif error:', error);
  }
}

export default { welcomeNotif };