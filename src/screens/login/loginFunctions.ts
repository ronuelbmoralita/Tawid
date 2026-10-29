// loginFunctions.tsx
import { useState, useRef, useEffect } from 'react';
import { Dimensions, FlatList, Animated, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { googleLogin } from '../../auth/loginAuth';
import { useSlideUpFadeIn } from '../../constants/animation';
import type { SeaCondition } from '../users/passenger/home/seaCondition';

const { width } = Dimensions.get('window');

// Do NOT remove this key on logout. It is only wiped on uninstall / clear app data.
export const ONBOARDING_SEEN_KEY = 'tawid_onboarding_seen';

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
    icon: require('../../../assets/onBoarding/welcome.svg'),
  },
  {
    id: '2',
    title: 'Real-Time Trip Updates',
    desc: 'View vessel schedules, sea advisories, and instant trip updates. Get notified about delays and schedule changes.',
    icon: require('../../../assets/onBoarding/passenger.svg'),
  },
  {
    id: '3',
    title: 'Sea Condition Advisory',
    desc: 'Check sea conditions at a glance — see live wave height and advisory levels from the port nearest you, and refresh anytime for the latest updates.',
    icon: require('../../../assets/onBoarding/seaCondition.svg'),
  },
  {
    id: '4',
    title: 'Connecting Local Ports',
    desc: 'Connecting ports, routes, and island communities to make every crossing easier to plan.',
    icon: require('../../../assets/onBoarding/port.svg'),
  },
  {
    id: '5',
    title: 'Fast & Secure Login',
    desc: 'Sign in with your Google account — no long forms, no unnecessary data, just one tap.',
    icon: require('../../../assets/onBoarding/login.svg'),
  },
];

// Shown after the first run (including after logout): login slide only
export const LOGIN_ONLY_DATA: OnboardingItemType[] = [
  {
    id: 'login-only',
    title: 'Hello, Ka-Tawid!',
    desc: 'Sign in with Google to access ferry schedules, sea conditions, and port updates.',
    icon: require('../../../assets/onBoarding/welcomeBack.svg'),
  },
];

export const getItemLayout = (_: any, index: number) => ({ length: width, offset: width * index, index });

const requestPermission = async (
  request: () => Promise<{ status: string }>,
  setGranted: (granted: boolean) => void,
  title: string,
  message: string
) => {
  const { status } = await request();
  if (status === 'granted') setGranted(true);
  else Alert.alert(title, message);
};

export function useLoginLogic() {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasLocation, setHasLocation] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);

  // Must be BOTH granted to proceed
  const isPermissionsGranted = hasLocation && hasNotif;

  const slides = hasSeenOnboarding ? LOGIN_ONLY_DATA : ONBOARDING_DATA;
  const isFinalSlide = currentIndex === slides.length - 1;

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollXJS = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const buttonWidth = useRef(new Animated.Value(56)).current;

  const { opacity, transform } = useSlideUpFadeIn(200, 800, 30);

  // Check whether onboarding was already seen
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY)
      .catch(() => null)
      .then((seen) => {
        setHasSeenOnboarding(seen === 'true');
        setIsReady(true);
      });
  }, []);

  // Save the flag once the final slide is reached.
  // hasSeenOnboarding is intentionally NOT set here so the slides
  // don't swap out while the user is still on screen.
  useEffect(() => {
    if (isReady && isFinalSlide && !hasSeenOnboarding) {
      AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true').catch(() => { });
    }
  }, [isReady, isFinalSlide, hasSeenOnboarding]);

  // Check initial permissions on mount
  useEffect(() => {
    Promise.all([Location.getForegroundPermissionsAsync(), Notifications.getPermissionsAsync()]).then(
      ([loc, notif]) => {
        setHasLocation(loc.status === 'granted');
        setHasNotif(notif.status === 'granted');
      }
    );
  }, []);

  // Morph main CTA button width
  useEffect(() => {
    Animated.spring(buttonWidth, {
      toValue: isFinalSlide ? 190 : 50,
      useNativeDriver: false,
      friction: 6,
      tension: 110,
    }).start();
  }, [isFinalSlide, isReady]);

  const handleGoogleLogin = () =>
    googleLogin((result) => {
      if (!result.start && !result.success) {
        Alert.alert('Login Failed', result.error || 'Something went wrong. Please try again.');
      }
    });

  const scrollTo = (index: number) => slidesRef.current?.scrollToIndex({ index, animated: true });
  const scrollToNext = () => (isFinalSlide ? handleGoogleLogin() : scrollTo(currentIndex + 1));
  const skipToLogin = () => scrollTo(slides.length - 1);

  const requestLocationPermission = () =>
    requestPermission(
      Location.requestForegroundPermissionsAsync,
      setHasLocation,
      'Location Access Needed',
      'Kailangan ang location access para mahanap ang mga daungan malapit sa iyo.'
    );

  const requestNotificationPermission = () =>
    requestPermission(
      Notifications.requestPermissionsAsync,
      setHasNotif,
      'Notifications Needed',
      'Kailangan ang notifications para sa real-time trip alerts at sea condition advisories.'
    );

  const onScrollListener = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    scrollXJS.setValue(xOffset);
    const newIndex = Math.round(xOffset / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < slides.length) {
      setCurrentIndex(newIndex);
    }
  };

  return {
    isReady,
    slides,
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
    scrollToNext,
    skipToLogin,
    requestLocationPermission,
    requestNotificationPermission,
    onScrollListener,
  };
}