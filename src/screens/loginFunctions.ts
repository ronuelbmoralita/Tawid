// loginFunctions.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Dimensions, FlatList, Animated, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { googleLogin } from '../firebase/googleAuth';
import { useSlideUpFadeIn } from '../constants/animation';
import type { SeaCondition } from './users/passenger/home/seaCondition';

const { width } = Dimensions.get('window');

export type OnboardingItemType = {
  id: string;
  title: string;
  desc: string;
  icon?: any;
  component?: 'seaAdvisory';
  previewCondition?: SeaCondition;
};

export const ONBOARDING_DATA: OnboardingItemType[] = [
  {
    id: '1',
    title: 'Introducing Tawid',
    desc: 'A community-first digital port platform by LOOKAL bridging local port operations and passengers. To check vessel schedules and travel updates in your area, please allow the permissions below:',
    icon: require('../../assets/welcome.svg'),
  },
  {
    id: '2',
    title: 'Real-Time Trip Updates',
    desc: 'View vessel schedules, sea advisories, and instant trip updates. Get notified about delays and schedule changes.',
    icon: require('../../assets/passenger.svg'),
  },
  {
    id: '3',
    title: 'Sea Condition Advisory',
    desc: 'Check sea conditions at a glance — see live wave height and advisory levels from the port nearest you, and refresh anytime for the latest updates.',
    icon: require('../../assets/seaCondition.svg'),
  },
  {
    id: '4',
    title: 'Connecting Local Ports',
    desc: 'Connecting ports, routes, and island communities to make every crossing easier to plan.',
    icon: require('../../assets/port.svg'),
  },
  {
    id: '5',
    title: 'Fast & Secure Login',
    desc: 'Sign in with your Google account — no long forms, no unnecessary data, just one tap.',
    icon: require('../../assets/login.svg'),
  },
];

export function useLoginLogic() {

  const [currentIndex, setCurrentIndex] = useState(0);

  // Permission States
  const [hasLocation, setHasLocation] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);

  // Requirement Check: Must be BOTH granted to proceed
  const isPermissionsGranted = hasLocation && hasNotif;

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollXJS = useRef(new Animated.Value(0)).current;

  const slidesRef = useRef<FlatList>(null);
  const buttonWidth = useRef(new Animated.Value(56)).current;

  const { opacity, transform } = useSlideUpFadeIn(200, 800, 30);

  const isFinalSlide = currentIndex === ONBOARDING_DATA.length - 1;

  // Check initial permissions on mount
  useEffect(() => {
    (async () => {
      const locationPerm = await Location.getForegroundPermissionsAsync();
      const notifPerm = await Notifications.getPermissionsAsync();

      setHasLocation(locationPerm.status === 'granted');
      setHasNotif(notifPerm.status === 'granted');
    })();
  }, []);

  // Morph main CTA button width
  useEffect(() => {
    Animated.spring(buttonWidth, {
      toValue: isFinalSlide ? 220 : 56,
      useNativeDriver: false,
      friction: 6,
      tension: 110,
    }).start();
  }, [currentIndex]);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    []
  );

  const handleGoogleLogin = () => {
    googleLogin((result) => {
      if (result.start) {
      } else if (result.success) {
      } else {
        Alert.alert('Login Failed', result.error || 'Something went wrong. Please try again.');
      }
    });
  };

  const scrollToNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleGoogleLogin();
    }
  };

  const skipToLogin = () => {
    slidesRef.current?.scrollToIndex({ index: ONBOARDING_DATA.length - 1, animated: true });
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setHasLocation(true);
    } else {
      Alert.alert('Location Access Needed', 'Kailangan ang location access para mahanap ang mga daungan malapit sa iyo.');
    }
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setHasNotif(true);
    } else {
      Alert.alert('Notifications Needed', 'Kailangan ang notifications para sa real-time trip alerts at sea condition advisories.');
    }
  };

  const onScrollListener = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    scrollXJS.setValue(xOffset);
    const newIndex = Math.round(xOffset / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < ONBOARDING_DATA.length) {
      setCurrentIndex(newIndex);
    }
  };

  return {
    currentIndex,
    hasLocation,
    hasNotif,
    isPermissionsGranted,
    isFinalSlide,
    scrollX,
    scrollXJS,
    slidesRef,
    buttonWidth,
    opacity,
    transform,
    getItemLayout,
    handleGoogleLogin,
    scrollToNext,
    skipToLogin,
    requestLocationPermission,
    requestNotificationPermission,
    onScrollListener,
  };
}