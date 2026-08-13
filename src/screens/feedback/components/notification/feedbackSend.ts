// ============================================================
// services/feedbackSend.tsx
// ============================================================
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
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

/**
 * Notify all Company accounts when a user submits new feedback
 */
export async function feedbackNotifCompany(
  category: string,
  message: string,
  senderName?: string | null
) {
  try {
    const q = query(
      collection(getFirestore(), 'users'),
      where('roleDual', '==', 'Company')
    );

    const snapshot = await getDocs(q);
    const tokens: string[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.expoToken && data.notificationsEnabled !== false) {
        tokens.push(data.expoToken);
      }
    });

    if (tokens.length === 0) {
      console.log('ℹ️ No company tokens found');
      return;
    }

    const sendPush = httpsCallable(
      getFunctions(undefined, 'asia-southeast2'),
      'tawidNotification'
    );

    const preview =
      message.length > 80 ? message.slice(0, 80) + '...' : message;

    await sendPush({
      tokens,
      title: `New Feedback • ${category}`,
      body: senderName ? `${senderName}: ${preview}` : preview,
    });

    console.log(`✅ New feedback notification sent to ${tokens.length} company account(s)`);
  } catch (error) {
    console.error('❌ feedbackNotifCompany error:', error);
  }
}

export default { feedbackNotif, feedbackNotifCompany };