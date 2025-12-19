import * as React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import Home from './home/home';
import Profile from './profile/profile';
import { colors } from '../components/colors';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebaseConfig';
import { useLoading } from '../../loading';

const Tab = createBottomTabNavigator();

function AnimatedTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(64, 224, 208, 1)', // turquoise
      marginHorizontal: 20,
      margin: 20,
      height: 80,
      borderRadius: 100,
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 10,
      position: 'absolute',
      bottom: 0,
      width: '90%'
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Icon & Label logic
        const iconName =
          route.name === 'Main' ? 'home-outline' : 'person-outline';
        const displayLabel = route.name === 'Main' ? 'Home' : 'Profile';

        // Animated values (one set per tab)
        const widthAnim = React.useRef(new Animated.Value(isFocused ? 140 : 50)).current;
        const bgAnim = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current;
        const iconX = React.useRef(new Animated.Value(isFocused ? -35 : 0)).current;
        const textOpacity = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current;
        const textX = React.useRef(new Animated.Value(isFocused ? 10 : 30)).current;

        React.useEffect(() => {
          Animated.parallel([
            Animated.spring(widthAnim, { toValue: isFocused ? 140 : 50, useNativeDriver: false }),
            Animated.spring(bgAnim, { toValue: isFocused ? 1 : 0, useNativeDriver: false }),
            Animated.spring(iconX, { toValue: isFocused ? 0 : 20, useNativeDriver: true }),
            Animated.spring(textOpacity, { toValue: isFocused ? 1 : 0, useNativeDriver: true }),
            Animated.spring(textX, { toValue: isFocused ? 1 : 5, useNativeDriver: true }),
          ]).start();
        }, [isFocused]);

        const backgroundColor = bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['transparent', 'rgba(0,0,0,0.1)'],
        });

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={onPress}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Animated.View style={{
              width: widthAnim,
              backgroundColor,
              height: 50,
              borderRadius: 100,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
              overflow: 'hidden',
            }}>
              {/* Icon */}
              <Animated.View style={{ transform: [{ translateX: iconX }] }}>
                <Ionicons name={iconName} size={24} color={isFocused ? '#000' : '#888'} />
              </Animated.View>

              {/* Label */}
              <Animated.Text
                style={{
                  opacity: textOpacity,
                  transform: [{ translateX: textX }],
                  color: isFocused ? '#000' : '#888',
                  marginLeft: 8,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                {displayLabel}
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface UserData {
  name?: string;
  email?: string;
  photo?: string;
  role?: string;
  createdAt?: any;
  lastLoginAt?: any;
}

export default function MyTabs() {
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const currentUser = auth.currentUser;
  const { showLoading, hideLoading } = useLoading();

  React.useEffect(() => {
    // Don't proceed if no user is logged in
    if (!currentUser?.uid) {
      Alert.alert('Not Logged In', 'Please log in to view your profile.');
      return;
    }

    showLoading();

    // Create user document reference
    const userDocRef = doc(firestore, 'users', currentUser.uid);

    // Set up real-time listener with onSnapshot
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        hideLoading();

        if (snapshot.exists()) {
          // Document exists, update state with data
          setUserData(snapshot.data() as UserData);
        } else {
          // Document doesn't exist, create it
          return;
        }
      },
      (error) => {
        hideLoading();
        console.error('Error fetching user data:', error);

        // Handle specific errors
        if (error.code === 'permission-denied') {
          // Silently handle permission errors
          console.warn('Permission denied for user data');
        } else {
          Alert.alert('Error', 'Failed to load profile data.');
        }
      }
    );
    // Cleanup function - unsubscribe from the listener
    return () => {
      hideLoading();
      unsubscribe();
    };
  }, [currentUser?.uid]); // Only re-run when uid changes

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}>
      <Tab.Screen name="Main" options={{ headerShown: false }}>
        {() => <Home userData={userData} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          headerShown: true,
          headerTitle: 'My Profile',
          headerStyle: { backgroundColor: colors.light },
          headerShadowVisible: false,
          headerTintColor: '#333',
        }}>
        {() => <Profile userData={userData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}