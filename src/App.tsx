// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import Login from './screens/login/login';
import Notifications from './screens/notification/notifications';
import MyTab from './screens/tab';
import { StatusBar } from 'expo-status-bar';
import { auth, firestore } from './firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { TawidWavingProvider } from './components/tawidWaving';
import TawidOffline from './components/tawidOffline';
import { AppBackButton } from './AppBackButton';
import setupNotif from './notifications/setupNotif';
import NetInfo from '@react-native-community/netinfo';
import Request from './screens/request/request';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Shared header para sa lahat ng screen na may back button
const backScreenOptions = ({ navigation }: { navigation: any }) => ({
  headerShown: true,
  headerBackVisible: false,
  headerShadowVisible: false,
  headerTitleAlign: 'left' as const,
  headerStyle: { backgroundColor: '#fff' },
  headerTitleStyle: { fontSize: 18, fontWeight: '700' as const },
  headerLeft: () => <AppBackButton onPress={() => navigation.goBack()} />,
});

function RootStack() {
  const [user, setUser] = React.useState<User | null>(null);
  const [hasRole, setHasRole] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [splashDone, setSplashDone] = React.useState(false);

  React.useEffect(() => {
    setupNotif.setupNotifications();

    let unsubscribeDoc: (() => void) | null = null;
    const hardTimeout = setTimeout(() => setLoading(false), 6000);

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      setUser(currentUser);

      if (!currentUser) {
        setHasRole(false);
        setLoading(false);
        clearTimeout(hardTimeout);
        return;
      }

      setupNotif.saveToken();

      unsubscribeDoc = onSnapshot(
        doc(firestore, 'users', currentUser.uid),
        (snap) => {
          if (snap.data()?.role) {
            setHasRole(true);
            setLoading(false);
            clearTimeout(hardTimeout);
          } else {
            setHasRole(false);
          }
        },
        (err) => {
          if (err.code !== 'permission-denied') {
            setLoading(false);
            clearTimeout(hardTimeout);
          }
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      clearTimeout(hardTimeout);
    };
  }, []);

  React.useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().then(() => {
        setTimeout(() => setSplashDone(true), 250);
      });
    }
  }, [loading]);

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      {user && hasRole ? (
        <>
          <Stack.Screen name="Tab">
            {() => <MyTab splashDone={splashDone} />}
          </Stack.Screen>

          {/* Lahat ng screen dito may uniform na back button */}
          <Stack.Group screenOptions={backScreenOptions}>
            <Stack.Screen
              name="Notifications"
              component={Notifications}
              options={{ title: 'Notifications', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Request"
              component={Request}
              options={{ title: 'Request Activation', animation: 'slide_from_right' }}
            />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const netTimeout = setTimeout(() => setIsConnected(true), 4000);

    NetInfo.fetch()
      .then((state) => {
        setIsConnected(state.isConnected ?? true);
        clearTimeout(netTimeout);
      })
      .catch(() => {
        setIsConnected(true);
        clearTimeout(netTimeout);
      });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
      clearTimeout(netTimeout);
    };
  }, []);

  React.useEffect(() => {
    if (isConnected === false) SplashScreen.hideAsync();
  }, [isConnected]);

  if (isConnected === null) return null;
  if (isConnected === false) return <TawidOffline />;

  return (
    <NavigationContainer>
      <TawidWavingProvider>
        <StatusBar style="dark" />
        <RootStack />
      </TawidWavingProvider>
    </NavigationContainer>
  );
}