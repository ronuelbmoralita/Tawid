// components/floating.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../../../constants/colors';
import { Icon } from '../../../../constants/icons';
import { broadcastNotif } from '../../../../notifications/broadcastNotif';
import { subscribeToSuspension, toggleSuspension } from '../dashboardFunctions';

const FloatingButton: React.FC = () => {
  const [isSuspended, setIsSuspended] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSuspension(setIsSuspended);
    return () => unsub();
  }, []);

  const handlePress = () => {
    const next = !isSuspended;

    Alert.alert(
      next ? 'Suspend All Trips?' : 'Resume All Trips?',
      next
        ? 'This will mark all trips as cancelled across the app.'
        : 'This will resume normal sailing schedules across the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: next ? 'Suspend' : 'Resume',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              await toggleSuspension(next);

              // 🔔 Send notification in Tagalog
              if (next) {
                await broadcastNotif(
                  'Ka-Tawid, pansamantalang "WALANG BYAHE" sa LAHAT ng ruta hanggang sa bagong abiso. Mangyaring maghintay lamang po ng update.'
                );
              } else {
                await broadcastNotif(
                  'Ka-Tawid, "BUMALIK NA SA NORMAL" ang LAHAT ng iskedyul. I-check po ang Tawid app para sa availability ng mga byahe sa inyong ruta.'
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 30,
        paddingHorizontal: 18,
        height: 52,
        borderRadius: 26,
        backgroundColor: isSuspended ? '#22C55E' : '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          <Icon
            name={isSuspended ? 'play-circle' : 'cancel'}
            size={20}
            color={colors.white}
          />
          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>
            {isSuspended ? 'I-resume ang Trips' : 'I-suspend ang Trips'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default FloatingButton;