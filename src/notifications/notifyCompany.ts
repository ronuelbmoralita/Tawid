// ============================================================
// services/notifyCompany.tsx
// ============================================================
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

export interface NotifyCompanyParams {
  /** Push notification title, already fully composed by the caller. */
  title: string;
  /** Push notification body, already fully composed by the caller. Gets truncated to 80 chars. */
  body: string;
}

/**
 * Generic push notification to all Company accounts. Caller composes
 * title/body however fits their event (feedback, signup, etc.) —
 * this function only handles fetching tokens and sending.
 */
export async function notifyCompany({ title, body }: NotifyCompanyParams) {
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

    const preview = body.length > 80 ? body.slice(0, 80) + '...' : body;

    await sendPush({
      tokens,
      title,
      body: preview,
    });

    console.log(`✅ "${title}" notification sent to ${tokens.length} company account(s)`);
  } catch (error) {
    console.error('❌ notifyCompany error:', error);
  }
}

export default notifyCompany;