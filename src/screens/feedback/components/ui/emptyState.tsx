import React from 'react';
import { Text, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface EmptyStateProps {
  icon?: string;
  message?: string;
}

export function EmptyState({
  icon = 'inbox',
  message = 'No feedbacks found.',
}: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 40,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
        borderRadius: 14,
      }}
    >
      <FontAwesome6 name={icon} size={24} color="#D1D1D6" iconStyle="solid" />
      <Text style={{ color: '#B0B0B5', fontSize: 13, marginTop: 10 }}>
        {message}
      </Text>
    </View>
  );
}