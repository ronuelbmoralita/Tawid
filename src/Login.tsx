// Login.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { colors } from './components/colors';
import { googleLogin } from '../googleAuth';
import { useLoading } from '../loading';
import { shadowStyles } from './components/shadow';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Welcome to Tawid',
    desc: 'Ang pinakaunang smart maritime app para sa Port of Real, Infanta, Polillo Group of Islands, at nearby routes — para mas safe, mabilis, at reliable ang biyahe sa dagat.',
    icon: 'compass',
    color: colors.primary,
  },
  {
    id: '2',
    title: 'For Passengers',
    desc: 'Hindi mo na kailangan mag-check sa Facebook o magtanong kung anong schedule today. Makikita mo agad ang boat schedules, operators, routes, availability, ticket prices, at real-time status. May weather updates at advisories pa.',
    icon: 'user',
    color: colors.medium,
  },
  {
    id: '3',
    title: 'For LGU & Port Staff',
    desc: 'Hindi na kailangan mag-manual post sa social media o sagutin lagi ang same questions. Sa Tawid, puwede niyo agad i-update ang schedules, boat status, mag-send ng advisories, at kontrolin ang app visibility — lahat sa isang click lang.',
    icon: 'shield',
    color: colors.dark,
  },
  {
    id: '4',
    title: 'Easy Google Login',
    desc: 'Secure at mabilis na access gamit ang Google account — para sa passengers o port staff, instant na makikita ang schedules o dashboard.',
    icon: 'right-to-bracket',
    color: colors.primary,
  },
];

const Graphic = ({ isLast, iconName }) => (
  <View style={{
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <View style={{
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    }}>
      <View style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <FontAwesome6 name={iconName} size={48} color={isLast ? colors.white : colors.primary} />
      </View>
    </View>
  </View>
);

export default function Login() {
  const { showLoading, hideLoading } = useLoading();
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

  const handleGoogleLogin = () => {
    googleLogin((result) => {
      if (result.start) {
        showLoading();
      } else if (result.success) {
        //hideLoading();
        console.log('Login successful!', result.user);
      } else {
        hideLoading();
        console.log('Login failed:', result.error);
      }
    });
  };

  const scrollTo = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGoogleLogin();
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={{ width }}>
      <View style={{
        height: '60%',
        padding: 24,
        paddingTop: 32,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 24,
        marginTop: 32,
        backgroundColor: index % 2 === 0 ? colors.light : colors.white,
      }}>
        <Graphic isLast={index === ONBOARDING_DATA.length - 1} iconName={item.icon} />
      </View>
      <View style={{
        padding: 24,
        paddingTop: 32,
      }}>
        <Text style={{
          fontSize: 32,
          fontWeight: '800',
          color: colors.dark,
          marginBottom: 16,
          textAlign:'center',
        }}>
          {item.title}
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.dark,
          lineHeight: 24,
          opacity: 0.8,
        }}>
          {item.desc}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.light }}>
      <FlatList
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={({ viewableItems }) => 
          viewableItems[0] && setCurrentIndex(viewableItems[0].index)
        }
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        ref={slidesRef}
        scrollEventThrottle={32}
      />

      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 20,
        backgroundColor: colors.light,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          flexDirection: 'row',
          flex: 1,
          marginRight: 16,
        }}>
          {ONBOARDING_DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            return (
              <Animated.View
                key={i}
                style={[
                  {
                    height: 6,
                    borderRadius: 50,
                    marginHorizontal: 2,
                    backgroundColor: colors.primary,
                  },
                  {
                    width: scrollX.interpolate({
                      inputRange,
                      outputRange: [8, 20, 8],
                      extrapolate: 'clamp',
                    }),
                    opacity: scrollX.interpolate({
                      inputRange,
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={scrollTo}>
          <Animated.View style={[
            {
              height: 56,
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.primary,
              elevation: 3,
            },
            { width: buttonWidth },
            shadowStyles.softShadow,
          ]}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 8,
              }}>
                <FontAwesome6 name="google" size={20} color={colors.white} />
                <Text style={{
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                  Login with Google
                </Text>
              </View>
            ) : (
              <FontAwesome6 name="chevron-right" size={24} color={colors.white} />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}