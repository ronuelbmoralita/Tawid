import React from 'react';
import { Text, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';

interface HeaderProps {
  icon: string;
  title: string;
  subtitle: string;
}

export function Header({ icon, title, subtitle }: HeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: colors.brand + '18',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FontAwesome6 name={icon} size={24} color={colors.brand} iconStyle="solid" />
      </View>

      <View style={{ flex: 1, flexShrink: 1 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#1A1A1A',
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#8A8A8E',
            lineHeight: 18,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}