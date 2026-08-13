// components/tawidIcon.tsx
import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Animated } from 'react-native';

type IconName = 'house' | 'user';
type IconVariant = 'solid' | 'regular';

interface TawidIconProps {
  name: IconName;
  variant?: IconVariant;
  size?: number;
  color?: string | Animated.AnimatedInterpolation<string>;
}

function HousePath({ variant, color }: { variant: IconVariant; color: string | Animated.AnimatedInterpolation<string> }) {
  const d = 'M12 2.5 2 10.5V21a1 1 0 0 0 1 1h6v-7h6v7h6a1 1 0 0 0 1-1V10.5L12 2.5Z';
  if (variant === 'solid') {
    return <Path d={d} fill={color} />;
  }
  return <Path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />;
}

function UserShape({ variant, color }: { variant: IconVariant; color: string | Animated.AnimatedInterpolation<string> }) {
  const shapeProps =
    variant === 'solid'
      ? { fill: color }
      : { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const };

  return (
    <>
      <Circle cx={12} cy={7.5} r={4} {...shapeProps} />
      <Path d="M4 21c0-4.4 3.58-7 8-7s8 2.6 8 7" {...shapeProps} />
    </>
  );
}

export default function TawidIcon({ name, variant = 'solid', size = 22, color = '#000' }: TawidIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'house' ? (
        <HousePath variant={variant} color={color} />
      ) : (
        <UserShape variant={variant} color={color} />
      )}
    </Svg>
  );
}