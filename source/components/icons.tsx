// components/Icon.tsx
import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
      <FontAwesome name={name} size={size} color={color} />
    </Wrapper>
  );
};

export default Icon;
