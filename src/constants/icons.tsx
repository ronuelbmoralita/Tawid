// components/Icon.tsx
import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import FontAwesome from '@react-native-vector-icons/material-design-icons';

export type IconProps = {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
  onPress,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={style} onPress={onPress}>
      <FontAwesome
        name={name as any} size={size} color={color}
        iconStyle="solid"  // ← ito ang kulang
      />
    </Wrapper>
  );
};

export default Icon;
