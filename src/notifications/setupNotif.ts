// ============================================================
// notifications/setupNotif.ts
// ============================================================
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
      // setDoc + merge instead of updateDoc — safe kahit wala pang
      // document ang bagong user (race condition sa parallel user-doc
      // creation sa googleAuth.ts)
      await setDoc(
        doc(getFirestore(), 'users', user.uid),
        { expoToken: token.data },
        { merge: true }
      );
      console.log('✅ Token saved');
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

export default { saveToken, setupNotifications };