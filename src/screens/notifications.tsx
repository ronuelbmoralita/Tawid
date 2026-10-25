// screens/notifications.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebaseConfig';
import { colors } from '../constants/colors';
import { TawidEmptyState } from '../components/tawidEmptyState';
import { useTransactionCounts, TxnNotification } from '../firebase/useTransactionCounts';

const PAGE_SIZE = 10;

export default function Notifications() {
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState<any>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Own subscription to the user doc so we don't need route params
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsub = onSnapshot(doc(firestore, 'users', uid), (snap) => {
      if (snap.exists()) setUserData({ uid: snap.id, ...snap.data() });
    });

    return unsub;
  }, []);

  const { notifications, isUnread, markAsRead, loading } = useTransactionCounts(userData);

  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMore = visibleCount < notifications.length;

  const handleLoadMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const toggleExpand = (item: TxnNotification) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedId === item.id) {
      setExpandedId(null);
    } else {
      setExpandedId(item.id);
      markAsRead(item);
    }
  };

  const renderItem = ({ item, index }: { item: TxnNotification; index: number }) => {
    const isItemUnread = isUnread(item);
    const isExpanded = expandedId === item.id;

    const titleColor = isItemUnread ? colors.black : '#666';

    const messageText =
      item.type === 'feedback' && !item._isCompanyFeed
        ? item.details?.reply ?? item.title
        : item.details?.message ?? item.title;

    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleExpand(item)}
          style={{ paddingVertical: 14, paddingHorizontal: 4 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Unread dot (naka-reserve ang space para hindi gumalaw ang text) */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginRight: 12,
                backgroundColor: isItemUnread ? colors.brand : 'transparent',
              }}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isItemUnread ? '700' : '500',
                  color: titleColor,
                }}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {messageText}
              </Text>

              <Text style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
                {item._isCompanyFeed && item.details?.reporterName
                  ? `${item.details.reporterName}${item.createdAt ? ' • ' : ''}`
                  : ''}
                {item.createdAt ? item.createdAt.toDate().toLocaleString('en-PH') : ''}
              </Text>
            </View>

            <FontAwesome6
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={12}
              color="#bbb"
              iconStyle="solid"
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>

        {index < visibleNotifications.length - 1 && (
          <View style={{ height: 1, backgroundColor: '#EAEAEA', marginLeft: 20 }} />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {loading || userData === undefined ? (
        <ActivityIndicator
          size="small"
          color={colors.brand}
          style={{ marginVertical: 24 }}
        />
      ) : notifications.length === 0 ? (
        <TawidEmptyState icon="bell" message="Your notifications will appear here." />
      ) : (
        <FlashList
          data={visibleNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          extraData={expandedId}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: insets.bottom + 16,
          }}
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={handleLoadMore}
                activeOpacity={0.7}
                style={{ alignItems: 'center', paddingVertical: 16, marginTop: 4 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.brand }}>
                  Load more ({notifications.length - visibleCount})
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}