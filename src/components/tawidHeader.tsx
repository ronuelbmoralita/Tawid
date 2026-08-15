import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { colors } from '../constants/colors';
import TawidModal from './tawidModal';
import { TawidEmptyState } from './tawidEmptyState';

interface TawidHeaderProps {
  userData?: any;
}

interface Notification {
  id: string;
  uid: string;
  type: 'welcome' | 'advisory';
  status: 'unread' | 'read';
  title: string;
  details?: {
    message?: string;
    [key: string]: unknown;
  };
  readBy?: string[];
  createdAt?: { toDate: () => Date };
}

const TYPE_ICON: Record<string, string> = {
  welcome: 'hand-sparkles',
  advisory: 'triangle-exclamation',
};

export default function TawidHeader({ userData }: TawidHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const uid = userData?.uid;

  // ---------- Unread helper ----------
  const isUnread = useCallback(
    (n: Notification) => {
      if (n.uid === 'ALL') {
        return !(n.readBy ?? []).includes(uid);
      }
      return n.status === 'unread';
    },
    [uid]
  );

  const unreadCount = notifications.filter(isUnread).length;

  // ---------- Firestore listener ----------
  useEffect(() => {
    if (!uid) return;

    setLoading(true);

    // Bagong users ay hindi dapat makakita ng advisories na nilikha BAGO
    // sila mag-sign up — kailangan ng lower-bound sa createdAt ng account.
    // userData.createdAt ay isang Firestore Timestamp galing sa users doc.
    const accountCreatedAt = userData?.createdAt;

    const constraints = [
      where('uid', 'in', [uid, 'ALL']),
      where('type', 'in', ['welcome', 'advisory']),
    ];

    if (accountCreatedAt) {
      constraints.push(where('createdAt', '>=', accountCreatedAt));
    }

    const q = query(collection(firestore, 'transactions'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Notification)
        );

        // Newest first
        docs.sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return tb - ta;
        });

        setNotifications(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Notifications listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, userData?.createdAt]);

  // ---------- Mark as read (only when expanded) ----------
  const markAsRead = async (item: Notification) => {
    if (!uid || !isUnread(item)) return;

    try {
      if (item.uid === 'ALL') {
        await updateDoc(doc(firestore, 'transactions', item.id), {
          readBy: arrayUnion(uid),
        });
      } else {
        await updateDoc(doc(firestore, 'transactions', item.id), {
          status: 'read',
        });
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // ---------- Toggle expand ----------
  const toggleExpand = (item: Notification) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedId === item.id) {
      setExpandedId(null); // collapse
    } else {
      setExpandedId(item.id); // expand
      markAsRead(item);       // mark as read only when expanded
    }
  };

  // ---------- Render ----------
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

        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              backgroundColor: '#FF6B6B',
              borderRadius: 9,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: colors.white,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: 'white' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
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
                {/* ===== Main row (always visible) ===== */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Icon */}
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

                  {/* Title + Date (always here) */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isItemUnread ? '700' : '500',
                        color: titleColor,
                      }}
                      numberOfLines={isExpanded ? undefined : 1}
                    >
                      {item.title}
                    </Text>

                    {item.createdAt && (
                      <Text style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
                        {item.createdAt.toDate().toLocaleString('en-PH')}
                      </Text>
                    )}
                  </View>

                  {/* Chevron */}
                  <FontAwesome6
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color="#bbb"
                    iconStyle="solid"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                {/* ===== Extra details (only when expanded) ===== */}
                {isExpanded && item.details?.message && (
                  <View style={{ marginTop: 12, paddingLeft: 48 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#555',
                        lineHeight: 18,
                      }}
                    >
                      {item.details.message}
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