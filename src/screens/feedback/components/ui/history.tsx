import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import { EmptyState } from './emptyState';

interface HistoryProps {
  loading: boolean;
  children: React.ReactNode;
  emptyMessage?: string;
  title?: string;
}

export function History({
  loading,
  children,
  emptyMessage = "You haven't submitted any feedback yet.",
  title = 'YOUR FEEDBACKS',
}: HistoryProps) {
  if (loading) {
    return <ActivityIndicator color={colors.brand} style={{ marginTop: 12 }} />;
  }

  const hasChildren = React.Children.count(children) > 0;

  return (
    <View style={{ marginTop: 36 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <FontAwesome6 name="clock-rotate-left" size={13} color="#8A8A8E" iconStyle="solid" />
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#8A8A8E', letterSpacing: 0.3 }}>
          {title}
        </Text>
      </View>

      {!hasChildren ? (
        <EmptyState icon="inbox" message={emptyMessage} />
      ) : (
        <View style={{ gap: 16 }}>{children}</View>
      )}
    </View>
  );
}