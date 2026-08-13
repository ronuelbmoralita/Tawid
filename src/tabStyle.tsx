// components/TabStyle.tsx
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from './constants/colors';
import TawidCard from './components/tawidCard';
import TawidIcon from './components/tawidIcon';

const AnimatedIcon = Animated.createAnimatedComponent(TawidIcon);

const ICONS: Record<string, string> = {
  MainTab: 'house',
  Profile: 'user',
};

const LABELS: Record<string, string> = {
  MainTab: 'Home',
  Profile: 'Profile',
};

export default function TabStyle({ state, navigation }: BottomTabBarProps) {
  // Initialize animations with correct initial values based on current index
  const anims = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(
      state.routes.map((route, index) => [
        route.key,
        new Animated.Value(state.index === index ? 1 : 0),
      ])
    )
  ).current;

  const containerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    state.routes.forEach((route, index) => {
      Animated.spring(anims[route.key], {
        toValue: state.index === index ? 1 : 0,
        useNativeDriver: false,
        tension: 320,
        friction: 14,
        velocity: 8,
      }).start();
    });

    // Container bounce, same feel as SwitchRole
    containerScale.setValue(1);
    Animated.sequence([
      Animated.spring(containerScale, {
        toValue: 1.04,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.spring(containerScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 12,
      }),
    ]).start();
  }, [state.index]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 15,
        right: 15,
        bottom: 15,
        transform: [{ scale: containerScale }],
      }}
    >
      <TawidCard
        color={colors.brand}
        style={{
          borderRadius: 100,
          flexDirection: 'row',
          height: 64,
          alignItems: 'center',
          paddingHorizontal: 6,
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icon = ICONS[route.name] ?? 'circle';
          const label = LABELS[route.name] ?? route.name;
          const anim = anims[route.key];

          const backgroundColor = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', colors.brand],
          });

          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.94, 1],
          });

          // Fix: Use proper color values for initial render
          const textColor = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(60,60,60,0.6)', colors.white],
          });

          const labelOpacity = anim.interpolate({
            inputRange: [0, 0.4, 1],
            outputRange: [0.7, 0.7, 1],
          });

          const labelWidth = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [60, 60],
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          // Fix: Check if this is the active tab for initial render
          const isInitialActive = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.85}
              style={{ flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' }}
            >
              <Animated.View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 100,
                  backgroundColor,
                  transform: [{ scale }],
                  elevation: isFocused ? 4 : 0,
                  shadowColor: colors.brand,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isFocused ? 0.25 : 0,
                  shadowRadius: 3.5,
                }}
              >
                {/* Use direct color for initial render to avoid interpolation issues */}
                {isInitialActive ? (
                  <>
                    <TawidIcon 
                      name={icon as 'house' | 'user'} 
                      variant="solid" 
                      size={18} 
                      color={colors.white}
                    />
                    <View style={{ width: 60, overflow: 'hidden' }}>
                      <Animated.Text
                        numberOfLines={1}
                        style={{
                          color: colors.white,
                          fontWeight: '600',
                          fontSize: 14,
                          opacity: 1,
                        }}
                      >
                        {label}
                      </Animated.Text>
                    </View>
                  </>
                ) : (
                  <>
                    <AnimatedIcon 
                      name={icon as 'house' | 'user'} 
                      variant="solid" 
                      size={18} 
                      color={textColor}
                    />
                    <Animated.View style={{ width: labelWidth, overflow: 'hidden' }}>
                      <Animated.Text
                        numberOfLines={1}
                        style={{
                          color: textColor,
                          fontWeight: '500',
                          fontSize: 14,
                          opacity: labelOpacity,
                        }}
                      >
                        {label}
                      </Animated.Text>
                    </Animated.View>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </TawidCard>
    </Animated.View>
  );
}