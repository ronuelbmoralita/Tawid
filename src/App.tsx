// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import Login from './screens/login';
import Offline from './screens/offline';
import MyTab from './tab';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { WavingProvider } from './components/waving';
import setupNotif from './notifications/setupNotif';
import NetInfo from '@react-native-community/netinfo';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

function RootStack() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [splashDone, setSplashDone] = React.useState(false);

  React.useEffect(() => {
    setupNotif.setupNotifications(); // config lang ito, safe na tumakbo agad
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setupNotif.saveToken();
      }
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().then(() => {
        setTimeout(() => {
          setSplashDone(true);
        }, 300); // adjust ms depende sa gusto mong delay
      });
    }
  }, [loading]);

  if (loading) {
    // Native splash screen ang nakadisplay pa dito, walang ipapakitang kahit ano
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Tab">
          {() => <MyTab splashDone={splashDone} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  if (!isConnected) {
    return <Offline />;
  }

  return (
    <NavigationContainer>
      <WavingProvider>
        <StatusBar style="dark" />
        <RootStack />
      </WavingProvider>
    </NavigationContainer>
  );
}