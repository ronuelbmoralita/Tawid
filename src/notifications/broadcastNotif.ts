// ============================================================
// notifications/broadcast.ts
// ============================================================
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// MAG-SEND NG NOTIFICATION SA LAHAT (BROADCAST)
// Gamitin ito para sa advisories/announcements — LAHAT ng users na naka-enable
// ang notifications ay makakatanggap. HUWAG gamitin para sa personal messages
// (welcome, feedback reply, atbp.) — gumawa ng hiwalay na single-user sender
// para doon.
export async function broadcastNotif(body: string) {
  try {
    const users = await getDocs(collection(getFirestore(), 'users'));
    const tokens: string[] = [];
    users.forEach(docSnap => {
      const data = docSnap.data();
      // Only get tokens from users with notifications enabled
      if (data.expoToken && data.notificationsEnabled !== false) {
        tokens.push(data.expoToken);
      }
    });

    if (tokens.length > 0) {
      const sendPush = httpsCallable(getFunctions(undefined, 'asia-southeast2'), 'tawidNotification');
      await sendPush({
        tokens,
        title: '📢 Travel Advisory',
        body: body
      });
      console.log(`✅ Push sent to ${tokens.length} users`);
    } else {
      console.log('ℹ️ No users with notifications enabled');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

export default { broadcastNotif };