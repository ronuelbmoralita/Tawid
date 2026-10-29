import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';

type BreathingDotProps = {
  /** Base color. Every layer (core, glow, ripple) is derived from this one color. */
  color: string;
  /** Diameter of the core dot. Halo and ripple extend outside this without affecting layout. */
  size?: number;
  /** Set to false to stop the animation and rest the dot as a calm, static core. */
  active?: boolean;
  /** Duration of one inhale (and one exhale) in ms. Full breath = 2x this. */
  duration?: number;
  /** Scale range of the core breath. */
  minScale?: number;
  maxScale?: number;
  style?: StyleProp<ViewStyle>;
};

const BreathingDot = memo(function BreathingDot({
  color,
  size = 10,
  active = true,
  duration = 1400,
  minScale = 0.88,
  maxScale = 1.12,
  style,
}: BreathingDotProps) {
  const breath = useRef(new Animated.Value(0)).current; // core + glow
  const ripple = useRef(new Animated.Value(0)).current; // expanding ring

  useEffect(() => {
    if (!active) {
      breath.setValue(0);
      ripple.setValue(0);
      return;
    }

    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration, // inhale
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration, // exhale
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // One ripple per full breath, released as the dot starts to inhale.
    const rippleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ripple, {
          toValue: 1,
          duration: duration * 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ripple, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    breathLoop.start();
    rippleLoop.start();
    return () => {
      breathLoop.stop();
      rippleLoop.stop();
    };
  }, [active, duration, breath, ripple]);

  const coreScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [minScale, maxScale],
  });

  const glowScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2.1],
  });
  const glowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.28],
  });

  const rippleScale = ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });
  const rippleOpacity = ripple.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.45, 0],
  });

  const fill = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View
      style={[
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      {/* Soft ambient glow */}
      <Animated.View
        style={[
          fill,
          {
            backgroundColor: color,
            opacity: active ? glowOpacity : 0,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Expanding ripple ring */}
      <Animated.View
        style={[
          fill,
          {
            borderWidth: Math.max(1, size * 0.1),
            borderColor: color,
            opacity: active ? rippleOpacity : 0,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />

      {/* Core dot */}
      <Animated.View
        style={[
          fill,
          {
            backgroundColor: color,
            transform: [{ scale: coreScale }],
          },
        ]}
      />
    </View>
  );
});

export default BreathingDot;