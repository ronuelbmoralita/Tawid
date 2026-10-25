// tab.tsx
import * as React from 'react';
import { Alert, View } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import PaxHome from './screens/users/passenger/paxHome';
import Profile from './screens/profile/profile';
import DashboardHome from './screens/users/dashboard/dashboardHome';
import Feedback from './screens/feedback/feedbackHome';
import { auth, firestore } from './firebase/firebaseConfig';
import { useWaving } from './components/waving';
import { updateNearestPort } from './screens/users/passenger/home/seaNearestPort';
import { useTransactionCounts } from './firebase/useTransactionCounts';
import { TawidTabBar, TabBarBridge, BarSnapshot } from './tabStyle';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface UserData {
  name?: string;
  email?: string;
  photo?: string;
  role?: 'Company' | 'LGU' | 'Passenger' | string;
  createdAt?: any;
  lastLoginAt?: any;
}

const HOME_BY_ROLE: Record<string, React.ComponentType<{ userData: UserData | null }>> = {
  Company: DashboardHome,
  LGU: DashboardHome,
  Passenger: PaxHome,
};

function Tabs({ userData }: { userData: UserData | null }) {
  const HomeComponent = HOME_BY_ROLE[userData?.role ?? ''];
  const { feedbackBadgeCount } = useTransactionCounts(userData);
  const blurTarget = React.useRef<View>(null);
  const [bar, setBar] = React.useState<BarSnapshot | null>(null);

  if (!HomeComponent) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Ito ang "background" na ibo-blur ng pill. Dapat nasa labas nito ang BlurView. */}
      <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
        <Tab.Navigator
          tabBar={(props) => (
            <TabBarBridge state={props.state} navigation={props.navigation} onChange={setBar} />
          )}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen name="MainTab" options={{ title: 'Home' }}>
            {() => <HomeComponent userData={userData} />}
          </Tab.Screen>
          <Tab.Screen name="Feedback" options={{ title: 'Feedback' }}>
            {() => <Feedback userData={userData} />}
          </Tab.Screen>
          <Tab.Screen name="Profile" options={{ title: 'Profile' }}>
            {() => <Profile userData={userData} />}
          </Tab.Screen>
        </Tab.Navigator>
      </BlurTargetView>

      {bar && (
        <TawidTabBar
          state={bar.state}
          navigation={bar.navigation}
          blurTarget={blurTarget}
          badges={{ Feedback: feedbackBadgeCount }}
        />
      )}
    </View>
  );
}

export default function AppNavigator({ splashDone }: { splashDone: boolean }) {
  const [authUser, setAuthUser] = React.useState<User | null>(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const { showWaving, hideWaving } = useWaving();
  const nearestPortRequested = React.useRef(false);

  React.useEffect(() => onAuthStateChanged(auth, (user) => {
    setAuthUser(user);
    setAuthReady(true);
  }), []);

  React.useEffect(() => {
    if (!authReady || !splashDone) return;

    if (!authUser?.uid) {
      Alert.alert('Not Logged In', 'Please log in to view your profile.');
      setUserData(null);
      return;
    }

    showWaving();

    const unsubscribe = onSnapshot(
      doc(firestore, 'users', authUser.uid),
      (snapshot) => {
        hideWaving();
        setUserData(snapshot.exists() ? (snapshot.data() as UserData) : null);
      },
      (error) => {
        hideWaving();
        console.error('Error fetching user data:', error);
        if (error.code !== 'permission-denied') Alert.alert('Error', 'Failed to load profile data.');
      }
    );

    return () => {
      hideWaving();
      unsubscribe();
    };
  }, [authReady, authUser?.uid, splashDone]);

  React.useEffect(() => {
    if (userData?.role !== 'Passenger' || nearestPortRequested.current) return;
    nearestPortRequested.current = true;
    updateNearestPort();
  }, [userData?.role]);

  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => <Tabs userData={userData} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}