import React from 'react';
import { Text, View } from 'react-native';

interface StatusBadgeProps {
  status: string;
  label: string;
  color: string;
}

export function StatusBadge({ status, label, color }: StatusBadgeProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: color + '18',
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}