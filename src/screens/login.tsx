// login.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import { colors } from '../constants/colors';
import Wave from '../components/wave';
import TawidCard from '../components/tawidCard';
import LoginPermission from './loginPermission'; // Import the new component
import { useLoginLogic, ONBOARDING_DATA, OnboardingItemType } from './loginFunctions';

const { width } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const AnimatedGraphic = ({ icon, scrollX, index }: { icon: any; scrollX: Animated.Value; index: number }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  return (
    <TawidCard
      color={colors.brand}
      animatedStyle={{
        transform: [
          { scale: scrollX.interpolate({ inputRange, outputRange: [0.85, 1, 0.85], extrapolate: 'clamp' }) },
          { rotate: scrollX.interpolate({ inputRange, outputRange: ['-4deg', '0deg', '4deg'], extrapolate: 'clamp' }) },
          { translateY: scrollX.interpolate({ inputRange, outputRange: [15, 0, 15], extrapolate: 'clamp' }) },
        ],
        opacity: scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' }),
      }}
      style={{
        width: 300,
        height: 300,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
      }}>
      <Image source={icon} style={{ width: 300, height: 300 }} contentFit="contain" />
    </TawidCard>
  );
};

const PaginationDot = ({ scrollXJS, index }: { scrollXJS: Animated.Value; index: number }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const dotWidth = scrollXJS.interpolate({
    inputRange,
    outputRange: [8, 24, 8],
    extrapolate: 'clamp',
  });

  const opacity = scrollXJS.interpolate({
    inputRange,
    outputRange: [0.3, 1, 0.3],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
        backgroundColor: colors.brand,
        width: dotWidth,
        opacity,
      }}
    />
  );
};

export default function Login() {
  const {
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
    scrollToNext,
    skipToLogin,
    requestLocationPermission,
    requestNotificationPermission,
    onScrollListener,
  } = useLoginLogic();

  const renderOnboardingItem = ({ item, index }: { item: OnboardingItemType; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const textStyle = {
      opacity: scrollX.interpolate({ inputRange, outputRange: [0.2, 1, 0.2], extrapolate: 'clamp' }),
      transform: [
        { translateX: scrollX.interpolate({ inputRange, outputRange: [40, 0, -40], extrapolate: 'clamp' }) },
      ],
    };

    const isFirstSlide = item.id === '1';

    // Dynamic Description for Slide 1
    const slideDesc = isFirstSlide
      ? isPermissionsGranted
        ? 'A community-first digital port platform by LOOKAL bridging local port operations and passengers.'
        : item.desc
      : item.desc;

    return (
      <View style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <AnimatedGraphic icon={item.icon} scrollX={scrollX} index={index} />
        <Animated.View style={[{ alignItems: 'center', marginTop: 16, gap: 8, width: '100%' }, textStyle]}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.black, textAlign: 'center', letterSpacing: 0.3 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', lineHeight: 21, textAlign: 'center', paddingHorizontal: 8 }}>
            {slideDesc}
          </Text>
          {isFirstSlide && (
            <LoginPermission
              hasLocation={hasLocation}
              hasNotif={hasNotif}
              isPermissionsGranted={isPermissionsGranted}
              requestLocationPermission={requestLocationPermission}
              requestNotificationPermission={requestNotificationPermission}
            />
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

        {/* Top Header: Skip Button - Always available (except final slide) */}
        <View style={{ height: 48, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'flex-end', zIndex: 10 }}>
          {!isFinalSlide ? (
            <TouchableOpacity onPress={skipToLogin} activeOpacity={0.7} style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.brand }}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ height: 32 }} />
          )}
        </View>

        <Wave
          height={200}
          color={colors.brand}
          opacity={0.2}
          amplitude={40}
          speed={4000}
          style={{ bottom: 20, left: 0 }}
        />

        <Animated.View style={{ flex: 1, opacity, transform }}>
          <AnimatedFlatList
            ref={slidesRef}
            data={ONBOARDING_DATA}
            renderItem={renderOnboardingItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            scrollEnabled={true}
            getItemLayout={getItemLayout}
            keyExtractor={(item: any) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: true,
                listener: onScrollListener,
              }
            )}
            scrollEventThrottle={16}
          />

          {/* Bottom Footer Controls - Always visible */}
          <View style={{ paddingVertical: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {ONBOARDING_DATA.map((_, i) => (
                <PaginationDot key={i} scrollXJS={scrollXJS} index={i} />
              ))}
            </View>

            <TouchableOpacity activeOpacity={0.85} onPress={scrollToNext}>
              <Animated.View
                style={{
                  height: 56,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.brand,
                  shadowColor: colors.brand,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  width: buttonWidth,
                }}>
                {isFinalSlide ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
                    <FontAwesome6 name="google" size={18} color={colors.white} iconStyle="brand" />
                    <Text style={{ color: colors.white, fontSize: 15, fontWeight: '700', letterSpacing: 0.2 }}>
                      Continue with Google
                    </Text>
                  </View>
                ) : (
                  <FontAwesome6 name="chevron-right" size={20} color={colors.white} iconStyle="solid" />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}