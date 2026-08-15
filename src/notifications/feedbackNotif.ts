// ============================================================
// services/feedbackSend.tsx
// ============================================================
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Notify a specific user when company replies to their feedback
 */
export async function feedbackNotif(uid: string, replyMessage: string) {
  try {
    const userDoc = await getDoc(doc(getFirestore(), 'users', uid));
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    if (!data?.expoToken || data.notificationsEnabled === false) return;

    const sendPush = httpsCallable(
      getFunctions(undefined, 'asia-southeast2'),
      'tawidNotification'
    );

    const body =
      replyMessage.length > 90
        ? replyMessage.slice(0, 90) + '...'
        : replyMessage;

    await sendPush({
      tokens: [data.expoToken],
      title: 'Tawid Support replied',
      body,
    });

    console.log('✅ Feedback reply notification sent');
  } catch (error) {
    console.error('❌ feedbackNotif error:', error);
  }
}

export default feedbackNotif;