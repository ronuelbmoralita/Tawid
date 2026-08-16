import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

interface TawidBadgeProps {
  count: number;
  max?: number;
  badgeStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function TawidBadge({ count, max = 9, badgeStyle, textStyle }: TawidBadgeProps) {
  if (count <= 0) return null;

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: -4,
          right: -6,
          backgroundColor: colors.red,
          borderRadius: 9,
          minWidth: 18,
          height: 18,
          paddingHorizontal: 4,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: colors.white,
        },
        badgeStyle,
      ]}
    >
      <Text style={[{ fontSize: 10, fontWeight: '700', color: 'white' }, textStyle]}>
        {count > max ? `${max}+` : count}
      </Text>
    </View>
  );
}