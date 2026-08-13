// ============================================================
// services/tawidNotification.tsx (FIXED)
// ============================================================
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

// 👇 FIXED: Remove "shouldShowAlert" and use "shouldShowBanner" & "shouldShowList"
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // ✅ Show as banner
    shouldShowList: true,     // ✅ Show in notification center
    shouldPlaySound: true,    // ✅ Play sound
    shouldSetBadge: false,    // ✅ Don't set badge
  }),
});

// SAVE TOKEN
export async function saveToken() {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const token = await Notifications.getExpoPushTokenAsync({ projectId });

    const user = getAuth().currentUser;
    if (user) {
      await updateDoc(doc(getFirestore(), 'users', user.uid), {
        expoToken: token.data
      });
      console.log('✅ Token saved');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// MAG-SEND NG NOTIFICATION
export async function tawidNotif(body: string) {
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

// SETUP
export function setupNotifications() {
  Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
  });
}

export default { saveToken, tawidNotif, setupNotifications };