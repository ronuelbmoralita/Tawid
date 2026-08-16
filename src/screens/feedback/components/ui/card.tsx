import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../../../../constants/colors';
import { StatusBadge } from './statusBadge';

interface CardProps {
  id: string;
  name: string;
  email?: string;
  date: string;
  category: string;
  categoryIcon: string;
  message: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  isClosed: boolean;
  isReplying?: boolean;
  onPress?: () => void;
  showReplyHint?: boolean;
  disabled?: boolean;
  showEmail?: boolean;
  onEditPress?: () => void;
}

export function Card({
  id,
  name,
  email,
  date,
  category,
  categoryIcon,
  message,
  status,
  statusLabel,
  statusColor,
  isClosed,
  isReplying = false,
  onPress,
  showReplyHint = false,
  disabled = false,
  showEmail = false,
  onEditPress,
}: CardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      key={id}
    >
      <View
        style={{
          backgroundColor: isClosed ? '#F8F8F8' : '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: isReplying ? colors.brand : isClosed ? '#E5E5EA' : '#F0F0F2',
          padding: 16,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.brand + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesome6 name="user" size={14} color={colors.brand} iconStyle="solid" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }} numberOfLines={1}>
                {name}
              </Text>
              <Text style={{ fontSize: 11, color: '#8A8A8E' }} numberOfLines={1}>
                {showEmail && email ? `${email} • ` : ''}
              </Text>
              <Text style={{ fontSize: 11, color: '#8A8A8E' }} numberOfLines={1}>
                {date}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {onEditPress && (
              <TouchableOpacity onPress={onEditPress} hitSlop={8} style={{ padding: 2 }}>
                <FontAwesome6 name="pen" size={12} color="#8A8A8E" iconStyle="solid" />
              </TouchableOpacity>
            )}
            <StatusBadge
              status={status}
              label={statusLabel}
              color={statusColor}
            />
          </View>
        </View>

        {/* Category */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <FontAwesome6
            name={categoryIcon}
            size={11}
            color={colors.brand}
            iconStyle="solid"
          />
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.brand }}>
            {category}
          </Text>
        </View>

        {/* Message */}
        <Text style={{ fontSize: 15, color: '#1A1A1A', lineHeight: 22 }}>
          {message}
        </Text>

        {/* Tap to reply hint */}
        {showReplyHint && !isClosed && !isReplying && (
          <View
            style={{
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FontAwesome6 name="reply" size={12} color="#8A8A8E" iconStyle="solid" />
            <Text style={{ fontSize: 12, color: '#8A8A8E' }}>Tap to reply</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}