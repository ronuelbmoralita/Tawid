import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import Login from './screens/login';
import Offline from './screens/offline';
import MyTab from './tab';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { colors } from './constants/colors';
import { WavingProvider } from './components/waving';
import { Image } from 'expo-image';
import tawidNotif from './firebase/tawidNotification';
import NetInfo from '@react-native-community/netinfo';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

function RootStack() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    tawidNotif.setupNotifications(); // config lang ito, safe na tumakbo agad
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        tawidNotif.saveToken();
      }
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    // Native splash screen ang nakadisplay pa dito, walang ipapakitang kahit ano
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Tab" component={MyTab} />
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