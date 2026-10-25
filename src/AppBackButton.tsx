// components/AppBackButton.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from './constants/colors';

interface AppBackButtonProps {
  onPress: () => void;
}

export function AppBackButton({ onPress }: AppBackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={8}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        marginRight:10
      }}
    >
      <FontAwesome6
        name="chevron-left"
        size={16}
        color={colors.brand}
        iconStyle="solid"
        style={{ marginRight: 2 }}
      />
    </TouchableOpacity>
  );
}