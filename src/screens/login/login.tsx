// login.tsx
import React from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import { colors } from '../../constants/colors';
import TawidWave from '../../components/tawidWave';
import TawidCard from '../../components/tawidCard';
import LoginPermission from './loginPermission';
import { useLoginLogic, getItemLayout, OnboardingItemType } from './loginFunctions';

const { width } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Interpolates a scroll value around slide `index`: [previous, current, next]
const lerp = (scroll: Animated.Value, index: number, outputRange: number[] | string[]) =>
  scroll.interpolate({
    inputRange: [(index - 1) * width, index * width, (index + 1) * width],
    outputRange,
    extrapolate: 'clamp',
  });

const AnimatedGraphic = ({ icon, scrollX, index }: { icon: any; scrollX: Animated.Value; index: number }) => (
  <TawidCard
    color={colors.brand}
    animatedStyle={{
      transform: [
        { scale: lerp(scrollX, index, [0.85, 1, 0.85]) },
        { rotate: lerp(scrollX, index, ['-4deg', '0deg', '4deg']) },
        { translateY: lerp(scrollX, index, [15, 0, 15]) },
      ],
      opacity: lerp(scrollX, index, [0.4, 1, 0.4]),
    }}
    style={{ width: 300, height: 300, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}>
    <Image source={icon} style={{ width: 300, height: 300 }} contentFit="contain" />
  </TawidCard>
);

const PaginationDot = ({ scrollXJS, index }: { scrollXJS: Animated.Value; index: number }) => (
  <Animated.View
    style={{
      height: 6,
      borderRadius: 3,
      marginHorizontal: 3,
      backgroundColor: colors.brand,
      width: lerp(scrollXJS, index, [8, 24, 8]),
      opacity: lerp(scrollXJS, index, [0.3, 1, 0.3]),
    }}
  />
);

export default function Login() {
  const {
    isReady, slides, isFinalSlide, scrollX, scrollXJS, slidesRef, buttonWidth, opacity, transform,
    scrollToNext, skipToLogin, onScrollListener,
    ...permission // hasLocation, hasNotif, isPermissionsGranted, request*Permission
  } = useLoginLogic();

  const renderOnboardingItem = ({ item, index }: { item: OnboardingItemType; index: number }) => {
    const isFirstSlide = item.id === '1';

    return (
      <View style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <AnimatedGraphic icon={item.icon} scrollX={scrollX} index={index} />
        <Animated.View
          style={{
            alignItems: 'center',
            marginTop: 16,
            gap: 8,
            width: '100%',
            opacity: lerp(scrollX, index, [0.2, 1, 0.2]),
            transform: [{ translateX: lerp(scrollX, index, [40, 0, -40]) }],
          }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.black, textAlign: 'center', letterSpacing: 0.3 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', lineHeight: 21, textAlign: 'center', paddingHorizontal: 8 }}>
            {isFirstSlide && permission.isPermissionsGranted
              ? 'A community-first digital port platform by LOOKAL bridging local port operations and passengers.'
              : item.desc}
          </Text>
          {isFirstSlide && <LoginPermission {...permission} />}
        </Animated.View>
      </View>
    );
  };

  // Avoid flashing slide 1 while the saved flag is being read
  if (!isReady) return <View style={{ flex: 1, backgroundColor: colors.white }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Skip button, hidden on the final slide */}
      <View style={{ height: 48, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'flex-end', zIndex: 10 }}>
        {!isFinalSlide && (
          <TouchableOpacity onPress={skipToLogin} activeOpacity={0.7} style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.brand }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <TawidWave height={200} color={colors.brand} opacity={0.2} amplitude={40} speed={4000} style={{ bottom: 20, left: 0 }} />

      <Animated.View style={{ flex: 1, opacity, transform }}>
        <AnimatedFlatList
          ref={slidesRef}
          data={slides}
          renderItem={renderOnboardingItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          scrollEnabled={slides.length > 1}
          getItemLayout={getItemLayout}
          keyExtractor={(item: any) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: true,
            listener: onScrollListener,
          })}
          scrollEventThrottle={16}
        />

        {/* Footer controls. Dots View stays rendered so the button stays on the right */}
        <View style={{ paddingVertical: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {slides.length > 1 && slides.map((_, i) => <PaginationDot key={i} scrollXJS={scrollXJS} index={i} />)}
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={scrollToNext}>
            <Animated.View
              style={{
                width: buttonWidth,
                height: 50,
                borderRadius: 28,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.brand,
                shadowColor: colors.brand,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}>
              {isFinalSlide ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <FontAwesome6 name="google" size={18} color={colors.white} iconStyle="brand" />
                  <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700', letterSpacing: 0.2 }}>Continue with Google</Text>
                </View>
              ) : (
                <FontAwesome6 name="chevron-right" size={20} color={colors.white} iconStyle="solid" />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}