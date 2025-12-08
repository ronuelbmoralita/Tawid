import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from './components/colors';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Welcome to Tawid',
    desc: 'Ang pinakaunang smart maritime app para sa Port of Real, Infanta, Polillo Group of Islands, at nearby routes — para mas safe, mabilis, at reliable ang biyahe sa dagat.',
    icon: 'navigation',
    color: colors.primary,
  },
  {
    id: '2',
    title: 'For Passengers',
    desc: 'Hindi mo na kailangan mag-check sa Facebook o magtanong kung anong schedule today. Makikita mo agad ang boat schedules, operators, routes, availability, ticket prices, at real-time status. May weather updates at advisories pa.',
    icon: 'user',
    color: colors.secondary,
  },
  {
    id: '3',
    title: 'For LGU & Port Staff',
    desc: 'Hindi na kailangan mag-manual post sa social media o sagutin lagi ang same questions. Sa Tawid, puwede niyo agad i-update ang schedules, boat status, mag-send ng advisories, at kontrolin ang app visibility — lahat sa isang click lang.',
    icon: 'shield',
    color: colors.accent,
  },
  {
    id: '4',
    title: 'Easy Google Login',
    desc: 'Secure at mabilis na access gamit ang Google account — para sa passengers o port staff, instant na makikita ang schedules o dashboard.',
    icon: 'log-in',
    color: colors.success,
  },
];

const Graphic = ({ isLast, iconName }) => (
  <View style={styles.graphicWrapper}>
    <View style={styles.graphicCircle}>
      <View style={styles.graphicInnerCircle}>
        <Feather name={iconName} size={48} color={isLast ? colors.white : colors.primary} />
      </View>
    </View>
  </View>
);

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const buttonWidth = useRef(new Animated.Value(56)).current;

  useEffect(() => {
    const toValue = currentIndex === ONBOARDING_DATA.length - 1 ? 200 : 56;
    Animated.spring(buttonWidth, {
      toValue,
      useNativeDriver: false,
      friction: 5,
      tension: 120,
    }).start();
  }, [currentIndex]);

  const handleLogin = () =>
    Alert.alert('Login with Google', 'Connect your Google account to Tawid?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: () => console.log('Google login initiated') },
    ]);

  const scrollTo = () => {
    currentIndex < ONBOARDING_DATA.length - 1
      ? slidesRef.current.scrollToIndex({ index: currentIndex + 1 })
      : handleLogin();
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.slide}>
      <View style={[styles.graphicContainer, { backgroundColor: index % 2 === 0 ? colors.light : colors.white }]}>
        <Graphic isLast={index === ONBOARDING_DATA.length - 1} iconName={item.icon} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={({ viewableItems }) => viewableItems[0] && setCurrentIndex(viewableItems[0].index)}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        ref={slidesRef}
        scrollEventThrottle={32}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {ONBOARDING_DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            return (
              <Animated.View
                key={i}
                style={[
                  styles.indicator,
                  {
                    width: scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' }),
                    opacity: scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' }),
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={scrollTo}>
          <Animated.View style={[styles.nextButton, { width: buttonWidth }]}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? (
              <View style={styles.loginButtonContent}>
                <FontAwesome5 name="google" size={20} color={colors.white} />
                <Text style={styles.loginButtonText}>Login with Google</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={24} color={colors.white} />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  slide: { width },
  graphicWrapper: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  graphicCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  graphicInnerCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  graphicContainer: { height: '60%', padding: 24, paddingTop: 32, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.medium + '40', marginHorizontal: 24, marginTop: 32, elevation: 2 },
  contentContainer: { padding: 24, paddingTop: 32 },
  title: { fontSize: 32, fontWeight: '800', color: colors.dark, marginBottom: 16 },
  description: { fontSize: 16, color: colors.dark, lineHeight: 24, opacity: 0.8 },
  bottomContainer: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 20, backgroundColor: colors.light, justifyContent: 'center', alignItems: 'center' },
  indicatorContainer: { flexDirection: 'row', flex: 1, marginRight: 16 },
  indicator: { height: 4, borderRadius: 2, marginHorizontal: 2 },
  nextButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, elevation: 3 },
  loginButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8 },
  loginButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
