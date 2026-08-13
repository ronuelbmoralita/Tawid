// components/tawidCard.tsx
import React from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

interface TawidCardProps {
  color?: string; // drives border tint and bg tint
  animatedStyle?: any; // pass through opacity/transform from your animation hooks
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const TawidCard: React.FC<TawidCardProps> = ({
  color = colors.brand,
  animatedStyle,
  style,
  children,
}) => {
  return (
    <Animated.View
      style={[
        {
          borderWidth: 1,
          borderColor: color + '30',
          borderRadius: 8,
          padding: 8,
          backgroundColor: color + '20',
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default TawidCard;