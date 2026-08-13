// App.js - Gamitin ang WavingProvider loading state
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/login';
import MyTab from './tab';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { WavingProvider, useWaving } from './components/waving';
import tawidNotif from './firebase/tawidNotification';

const Stack = createNativeStackNavigator();

function RootStack() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { showWaving, hideWaving } = useWaving();

  React.useEffect(() => {
    tawidNotif.setupNotifications();

    // Ipakita agad ang waving loader
    showWaving();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        tawidNotif.saveToken();
      }
      // Itago ang waving loader pagkatapos ng auth check
      hideWaving();
    });
    return unsubscribe;
  }, []);

  // HUWAG mag-render ng kahit ano habang naglo-load - 
  // WavingProvider na ang bahala sa loading screen
  if (loading) {
    return null; // or <View /> - basta wag magpakita ng iba
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
  return (
    <NavigationContainer>
      <WavingProvider>
        <StatusBar style="dark" />
        <RootStack />
      </WavingProvider>
    </NavigationContainer>
  );
}