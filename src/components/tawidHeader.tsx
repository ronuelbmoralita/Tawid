import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, LayoutAnimation } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../constants/colors';
import TawidModal from './tawidModal';
import { TawidEmptyState } from './tawidEmptyState';
import { useTransactionCounts, TxnNotification } from '../firebase/useTransactionCounts';
import { TawidBadge } from './tawidBadge';

interface TawidHeaderProps {
  userData?: any;
}

const TYPE_ICON: Record<string, string> = {
  welcome: 'hand-sparkles',
  advisory: 'triangle-exclamation',
  feedback: 'comment-dots',
};

export default function TawidHeader({ userData }: TawidHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { notifications, isUnread, unreadCount, markAsRead, loading } =
    useTransactionCounts(userData);

  const toggleExpand = (item: TxnNotification) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedId === item.id) {
      setExpandedId(null);
    } else {
      setExpandedId(item.id);
      markAsRead(item);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
      }}
    >
      <ExpoImage
        source={require('../../assets/tawid.svg')}
        style={{ width: 90, height: 25, borderRadius: 100 }}
        contentFit="contain"
      />

      <TouchableOpacity
        onPress={() => setShowNotifications(true)}
        hitSlop={10}
        style={{ position: 'relative' }}
      >
        <FontAwesome6 name="bell" size={24} color={colors.brand} iconStyle="solid" />
        <TawidBadge count={unreadCount} />
      </TouchableOpacity>

      <TawidModal
        visible={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          setExpandedId(null);
        }}
        title="Notifications"
        height={'85%'}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.brand}
            style={{ marginVertical: 24 }}
          />
        ) : notifications.length === 0 ? (
          <TawidEmptyState icon="bell" message="Your notifications will appear here." />
        ) : (
          notifications.map((item) => {
            const isItemUnread = isUnread(item);
            const isExpanded = expandedId === item.id;

            const bgColor = isItemUnread ? colors.brand + 20 : colors.gray + 15;
            const titleColor = isItemUnread ? colors.black : '#666';
            const iconBg = isItemUnread ? `${colors.brand}22` : '#E8E8E8';
            const iconColor = isItemUnread ? colors.brand : '#999';

            let displayTitle = item.title;
            let bodyText = item.details?.message;

            if (item.type === 'feedback') {
              if (item._isCompanyFeed) {
                displayTitle = `New Feedback • ${item.details?.category ?? 'General'}`;
                bodyText = item.details?.message;
              } else {
                displayTitle = 'Tawid Support replied';
                bodyText = item.details?.reply;
              }
            }

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => toggleExpand(item)}
                style={{
                  backgroundColor: bgColor,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: iconBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome6
                      name={TYPE_ICON[item.type] ?? 'bell'}
                      size={15}
                      color={iconColor}
                      iconStyle="solid"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isItemUnread ? '700' : '500',
                        color: titleColor,
                      }}
                      numberOfLines={isExpanded ? undefined : 1}
                    >
                      {item._isCompanyFeed && item.details?.reporterName
                        ? `${displayTitle} — ${item.details.reporterName}`
                        : displayTitle}
                    </Text>

                    {item.createdAt && (
                      <Text style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
                        {item.createdAt.toDate().toLocaleString('en-PH')}
                      </Text>
                    )}
                  </View>

                  <FontAwesome6
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color="#bbb"
                    iconStyle="solid"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                {isExpanded && bodyText && (
                  <View style={{ marginTop: 12, paddingLeft: 48 }}>
                    <Text style={{ fontSize: 13, color: '#555', lineHeight: 18 }}>
                      {bodyText}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </TawidModal>
    </View>
  );
}