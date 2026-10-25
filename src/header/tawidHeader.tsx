// components/tawidHeader.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../constants/colors';
import { useTransactionCounts } from '../firebase/useTransactionCounts';
import { TawidBadge } from '../components/tawidBadge';
import Suspend from './components/suspend'; // Siguraduhing tama ang path nito base sa iyong folder structure

interface TawidHeaderProps {
  userData?: any;
}

export default function TawidHeader({ userData }: TawidHeaderProps) {
  const navigation = useNavigation<any>();

  // Unread count na lang ang kailangan dito para sa badge
  const { unreadCount } = useTransactionCounts(userData);

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
      {/* App Logo */}
      <ExpoImage
        source={require('../../assets/tawid.svg')}
        style={{ width: 90, height: 25, borderRadius: 100 }}
        contentFit="contain"
      />

      {/* Right Controls Container (Emergency Button + Notification Bell) */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* 🚨 Emergency Suspension Control Button */}
        <Suspend userData={userData} />

        {/* 🔔 Notification Bell Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          hitSlop={10}
          style={{ position: 'relative' }}
        >
          <FontAwesome6 name="bell" size={24} color={colors.brand} iconStyle="solid" />
          <TawidBadge
            count={unreadCount}
            max={10}
            badgeStyle={{ backgroundColor: colors.red }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}