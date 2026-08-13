// Wave.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface WaveProps {
  height?: number;
  width?: number;
  color?: string;
  opacity?: number;
  amplitude?: number;
  speed?: number;
  style?: any;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Wave({
  height = 120,
  width,
  color = '#ffffff',
  opacity = 0.15,
  amplitude = 40,
  speed = 2000,
  style,
}: WaveProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const waveWidth = width || screenWidth;

  // Single ref for the animated value — never recreated across re-renders
  const waveAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Stop any leftover animation from a previous mount (Fast Refresh safety)
    waveAnim.stopAnimation();
    waveAnim.setValue(0);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false, // path 'd' isn't transform/opacity — must be false
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    animationRef.current = loop;
    loop.start();

    return () => {
      // .stop() is enough — no need to touch React state on unmount,
      // which is what was likely tripping Fast Refresh before
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, [speed, waveAnim]);

  // Memoize interpolation config so it doesn't get rebuilt every render
  const pathData = useMemo(
    () =>
      waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
          `M0 ${height / 2} Q${waveWidth / 4} ${height / 2 - amplitude} ${waveWidth / 2} ${height / 2} Q${(waveWidth * 3) / 4} ${height / 2 + amplitude} ${waveWidth} ${height / 2} V${height} H0 Z`,
          `M0 ${height / 2} Q${waveWidth / 4} ${height / 2 + amplitude} ${waveWidth / 2} ${height / 2} Q${(waveWidth * 3) / 4} ${height / 2 - amplitude} ${waveWidth} ${height / 2} V${height} H0 Z`,
        ],
      }),
    [waveAnim, height, waveWidth, amplitude]
  );

  return (
    <View style={[{ position: 'absolute', pointerEvents: 'none' }, style]}>
      <Svg width={waveWidth} height={height} viewBox={`0 0 ${waveWidth} ${height}`}>
        <Defs>
          <LinearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <AnimatedPath d={pathData} fill="url(#waveGradient)" />
      </Svg>
    </View>
  );
}