// tab.tsx
import * as React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaxHome from './screens/users/passenger/paxHome';
import Profile from './screens/profile/profile';
import DashboardHome from './screens/users/dashboard/dashboardHome';
import Feedback from './screens/feedback/feedbackHome';
import { auth, firestore } from './firebase/firebaseConfig';
import { useWaving } from './components/waving';
import { updateNearestPort } from './screens/users/passenger/home/seaNearestPort';
import { colors } from './constants/colors';

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

const TAB_ICONS: Record<string, string> = {
  MainTab: 'house',
  Feedback: 'comment-dots',
  Profile: 'user',
};

function Tabs({ userData }: { userData: UserData | null }) {
  const HomeComponent = HOME_BY_ROLE[userData?.role ?? ''];
  const insets = useSafeAreaInsets();

  if (!HomeComponent) return null;

  // Base height ng tab bar content (icons + labels), hiwalay sa bottom inset.
  const TAB_BAR_CONTENT_HEIGHT = 60;

  // Dynamic bottom padding — umaadjust sa gesture bar o button nav ng device.
  // insets.bottom = 0 sa mga device na walang on-screen nav (physical buttons),
  // at may tamang value sa mga device na may gesture bar / nav bar.
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: 'rgba(60,60,60,0.6)',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: TAB_BAR_CONTENT_HEIGHT + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.1)',
        },
        tabBarIcon: ({ focused, color, size }) => (
          <FontAwesome6
            name={TAB_ICONS[route.name] ?? 'circle'}
            iconStyle="solid"
            size={focused ? 25 : 18}
            color={color}
          />
        ),
      })}
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