import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import Customer from './customer/customer';
import Profile from './profile/profile';
import { colors } from '../components/colors';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebaseConfig';

const Tab = createBottomTabNavigator();

function AnimatedTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBar}>
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
            style={styles.tabButtonContainer}>
            <Animated.View style={[styles.pill, { width: widthAnim, backgroundColor }]}>
              {/* Icon */}
              <Animated.View style={{ transform: [{ translateX: iconX }] }}>
                <Ionicons name={iconName} size={24} color={isFocused ? '#000' : '#888'} />
              </Animated.View>

              {/* Label */}
              <Animated.Text
                style={[
                  styles.label,
                  {
                    opacity: textOpacity,
                    transform: [{ translateX: textX }],
                    color: isFocused ? '#000' : '#888',
                  },
                ]}
              >
                {displayLabel}
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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
  },
  tabButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    height: 50,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

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

  React.useEffect(() => {
    if (!currentUser) {
      Alert.alert('Not Logged In', 'Please log in to view your profile.');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          setUserData({
            name: currentUser.displayName ?? 'User',
            email: currentUser.email ?? '',
            photo: currentUser.photoURL ?? '',
            role: 'Passenger',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
       return;
      }
    };

    fetchUserData();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen name="Main" options={{ headerShown: false }}>
        {() => <Customer userData={userData} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          headerShown: true,
          headerTitle: 'My Profile',
          headerStyle: { backgroundColor: colors.light },
          headerShadowVisible: false,
          headerTintColor: '#333',
        }}
      >
        {() => <Profile userData={userData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}